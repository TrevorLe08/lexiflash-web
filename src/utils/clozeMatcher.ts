import nlp from "compromise";
import irregularPlurals from "irregular-plurals";

/**
 * Intelligent & Optimized Cloze Matcher for LexiFlash
 * Powered by Compromise NLP, irregular-plurals, LRU variants caching, and flexible collocation analysis.
 */

export interface ClozeMatchResult {
  prefix: string;
  suffix: string;
  targetWord: string;
  matchedWord: string;
  hasRealExample: boolean;
  acceptableAnswers: string[];
}

// Pre-computed bidirectional lookup for irregular plurals (plural -> singular)
const PLURAL_TO_SINGULAR = new Map<string, string>();
for (const [singular, plural] of irregularPlurals) {
  PLURAL_TO_SINGULAR.set(plural.toLowerCase(), singular.toLowerCase());
}

// Bounded in-memory caches to guarantee O(1) lookups during study sessions
const MAX_CACHE_SIZE = 500;
const VARIANTS_CACHE = new Map<string, string[]>();
const REGEX_CACHE = new Map<string, RegExp>();

/**
 * Normalizes text for comparison (lowercased, stripped of punctuation and redundant spaces)
 */
export function normalizeText(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"’“”]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Escapes special characters for regular expression construction
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates all grammatical variants of a single English word
 * Uses LRU cache + compromise NLP engine + irregular-plurals dictionary
 */
function getWordVariants(word: string): string[] {
  const cleanWord = word.toLowerCase().replace(/['’]s$/, "").trim();
  if (!cleanWord) return [];

  const cached = VARIANTS_CACHE.get(cleanWord);
  if (cached) return cached;

  const variants = new Set<string>([cleanWord]);

  // 1. Regular English inflection patterns
  variants.add(cleanWord + "s");
  variants.add(cleanWord + "es");
  variants.add(cleanWord + "ed");
  variants.add(cleanWord + "ing");
  variants.add(cleanWord.replace(/e$/, "") + "ing");
  variants.add(cleanWord.replace(/y$/, "ies"));
  variants.add(cleanWord.replace(/y$/, "ied"));

  // 2. High-speed irregular plurals dictionary (both singular and plural)
  const irregularPlural = irregularPlurals.get(cleanWord);
  if (irregularPlural) {
    variants.add(irregularPlural.toLowerCase());
  }
  const irregularSingular = PLURAL_TO_SINGULAR.get(cleanWord);
  if (irregularSingular) {
    variants.add(irregularSingular.toLowerCase());
  }

  // 3. Compromise NLP engine: verb conjugation (all tenses) and noun transformations
  try {
    const doc = nlp(cleanWord);
    const verbs = doc.verbs().conjugate() as Array<Record<string, string>>;
    if (verbs && verbs.length > 0) {
      for (const conj of verbs) {
        if (conj.Infinitive) variants.add(conj.Infinitive.toLowerCase());
        if (conj.PastTense) variants.add(conj.PastTense.toLowerCase());
        if (conj.PresentTense) variants.add(conj.PresentTense.toLowerCase());
        if (conj.Gerund) variants.add(conj.Gerund.toLowerCase());
        if (conj.Participle) variants.add(conj.Participle.toLowerCase());
      }
    }
    const pluralNoun = doc.nouns().toPlural().text();
    if (pluralNoun && pluralNoun !== cleanWord) {
      variants.add(pluralNoun.toLowerCase());
    }
    const singularNoun = doc.nouns().toSingular().text();
    if (singularNoun && singularNoun !== cleanWord) {
      variants.add(singularNoun.toLowerCase());
    }
  } catch {
    // Gracefully preserve standard variants if NLP parsing encounters edge-cases
  }

  const result = Array.from(variants).filter(Boolean);

  // FIFO eviction to avoid memory leaks
  if (VARIANTS_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = VARIANTS_CACHE.keys().next().value;
    if (oldestKey) VARIANTS_CACHE.delete(oldestKey);
  }
  VARIANTS_CACHE.set(cleanWord, result);

  return result;
}

/**
 * Builds or retrieves a cached flexible Regular Expression for collocations or single words.
 * Supports irregular verbs and 0-2 intervening words between phrase tokens.
 */
function getCachedFlexibleRegex(term: string): RegExp {
  const cleanTerm = term.trim().toLowerCase();
  const cached = REGEX_CACHE.get(cleanTerm);
  if (cached) return cached;

  const rawWords = cleanTerm.split(/\s+/);
  let regex: RegExp;

  if (rawWords.length === 1) {
    const variants = getWordVariants(rawWords[0]);
    const pattern = variants.map(escapeRegex).join("|");
    regex = new RegExp(`\\b(${pattern})\\b`, "i");
  } else {
    // Multi-word collocation: allow 0 to 2 intervening words between tokens
    const wordPatterns = rawWords.map((w) => {
      const variants = getWordVariants(w);
      return `(?:${variants.map(escapeRegex).join("|")})`;
    });

    // Intervening gap between words (e.g. "project", "employees'", "all critical")
    const gap = `(?:\\s+[\\w'’]+){0,2}\\s+`;
    const fullPattern = `\\b(${wordPatterns.join(gap)})\\b`;
    regex = new RegExp(fullPattern, "i");
  }

  if (REGEX_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = REGEX_CACHE.keys().next().value;
    if (oldestKey) REGEX_CACHE.delete(oldestKey);
  }
  REGEX_CACHE.set(cleanTerm, regex);

  return regex;
}

/**
 * Generates cloze test data for a card with multi-tiered matching
 */
export function generateClozeQuestion(
  term: string,
  example: string | undefined,
  definition: string,
  t: (key: string, options?: any, fallback?: string) => string
): ClozeMatchResult {
  const cleanTerm = term.trim();
  const cleanExample = example?.trim() || "";

  if (cleanExample) {
    // 1. Fast path: Direct match with common word boundaries and suffix
    const escaped = escapeRegex(cleanTerm);
    const directRegex = new RegExp(`\\b(${escaped}(?:s|es|ed|ing|d)?)\\b`, "i");
    let match = cleanExample.match(directRegex);

    // 2. Fallback path: Cached flexible collocation / irregular verb matcher
    if (!match || match.index === undefined) {
      const flexibleRegex = getCachedFlexibleRegex(cleanTerm);
      match = cleanExample.match(flexibleRegex);
    }

    if (match && match.index !== undefined) {
      const matched = match[0];
      const matchIdx = match.index;
      const prefix = cleanExample.slice(0, matchIdx);
      const suffix = cleanExample.slice(matchIdx + matched.length);

      // Build comprehensive acceptable answers set
      const acceptable = new Set<string>();
      acceptable.add(normalizeText(cleanTerm));
      acceptable.add(normalizeText(matched));

      // Add conjugated forms of the base term (e.g. "met the deadline" for "meet the deadline")
      const firstWord = cleanTerm.split(/\s+/)[0];
      const restOfTerm = cleanTerm.slice(firstWord.length);
      const variants = getWordVariants(firstWord);
      for (const v of variants) {
        acceptable.add(normalizeText(v + restOfTerm));
      }

      // If matched has interleaved words, accept the base verb applied to the matched phrase
      const matchedFirstWord = matched.split(/\s+/)[0];
      const restOfMatched = matched.slice(matchedFirstWord.length);
      const matchedVariants = getWordVariants(matchedFirstWord);
      for (const mv of matchedVariants) {
        acceptable.add(normalizeText(mv + restOfMatched));
      }

      return {
        prefix,
        suffix,
        targetWord: cleanTerm,
        matchedWord: matched,
        hasRealExample: true,
        acceptableAnswers: Array.from(acceptable),
      };
    }
  }

  // Fallback when card has no example or no match is possible
  const fallbackPrefix =
    t("modes.clozeMeaningPrefix", undefined, 'Từ có nghĩa: "') +
    definition +
    t("modes.clozeMeaningSuffix", undefined, '" là ');

  return {
    prefix: fallbackPrefix,
    suffix: ".",
    targetWord: cleanTerm,
    matchedWord: cleanTerm,
    hasRealExample: false,
    acceptableAnswers: [normalizeText(cleanTerm)],
  };
}

/**
 * Validates a user's answer against the cloze match result in O(N) where N is acceptable answers count (~5-10)
 */
export function checkClozeAnswer(
  userAnswer: string,
  questionData: ClozeMatchResult
): boolean {
  const userNorm = normalizeText(userAnswer);
  if (!userNorm) return false;

  return questionData.acceptableAnswers.includes(userNorm);
}
