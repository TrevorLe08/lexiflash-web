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
  const cleanWord = word
    .toLowerCase()
    .replace(/['’]s$/, "")
    .trim();
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

// Placeholder dictionary for collocations and idioms
const POSSESSIVE_PLACEHOLDERS = new Set([
  "one's",
  "ones",
  "someone's",
  "someones",
  "somebody's",
  "somebodys",
  "sb's",
  "sbs",
  "sth's",
  "sths",
  "person's",
  "persons",
]);

const PERSON_PLACEHOLDERS = new Set([
  "someone",
  "somebody",
  "sb",
  "so",
  "person",
]);

const THING_PLACEHOLDERS = new Set(["something", "sth", "thing"]);

const REFLEXIVE_PLACEHOLDERS = new Set([
  "oneself",
  "himself/herself",
  "themselves",
]);

const POSSESSIVE_PRONOUNS = [
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "one's",
  "someone's",
];
const OBJECT_PRONOUNS = [
  "me",
  "you",
  "him",
  "her",
  "us",
  "them",
  "someone",
  "somebody",
];

/**
 * Returns regex pattern for placeholder tokens (e.g. "one's" -> my/your/his/her..., "someone" -> me/you/him...)
 */
function getPlaceholderPattern(token: string): string | null {
  const norm = token.toLowerCase().replace(/[’]/g, "'").trim();
  const unquoted = norm.replace(/^\((.*)\)$/, "$1");

  if (
    POSSESSIVE_PLACEHOLDERS.has(norm) ||
    POSSESSIVE_PLACEHOLDERS.has(unquoted) ||
    (norm.endsWith("'s") &&
      (norm.startsWith("one") ||
        norm.startsWith("some") ||
        norm.startsWith("sb")))
  ) {
    return `(?:my|your|his|her|its|our|their|one['’]s|ones|someone['’]s|somebody['’]s|anybody['’]s|everyone['’]s|nobody['’]s|[a-zA-Z]+['’]s|[a-zA-Z]+')`;
  }

  if (PERSON_PLACEHOLDERS.has(norm) || PERSON_PLACEHOLDERS.has(unquoted)) {
    return `(?:me|you|him|her|us|them|someone|somebody|anybody|anyone|everyone|everybody|nobody|no\\s+one|[a-zA-Z]+)`;
  }

  if (THING_PLACEHOLDERS.has(norm) || THING_PLACEHOLDERS.has(unquoted)) {
    return `(?:it|this|that|these|those|something|anything|everything|nothing|[a-zA-Z]+)`;
  }

  if (
    REFLEXIVE_PLACEHOLDERS.has(norm) ||
    REFLEXIVE_PLACEHOLDERS.has(unquoted)
  ) {
    return `(?:myself|yourself|himself|herself|itself|ourselves|yourselves|themselves|oneself)`;
  }

  return null;
}

/**
 * Strips metadata tags like (v), (n), (adj), (idiom), (phr v) from the end of a term
 */
function cleanTermMetadata(term: string): string {
  return term
    .replace(
      /\s*\((?:v|n|adj|adv|idiom|phr\s*v|phrasal\s*verb|formal|informal|slang)\)\s*$/i,
      "",
    )
    .trim();
}

/**
 * Builds or retrieves a cached flexible Regular Expression for collocations or single words.
 * Supports placeholders (one's, someone, something), irregular verbs, and 0-2 intervening words between tokens.
 */
function getCachedFlexibleRegex(term: string): RegExp {
  let cleanTerm = cleanTermMetadata(term)
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'");
  const cached = REGEX_CACHE.get(cleanTerm);
  if (cached) return cached;

  let optionalTo = false;
  if (/^(\(to\)|to)\s+/i.test(cleanTerm)) {
    cleanTerm = cleanTerm.replace(/^(\(to\)|to)\s+/i, "");
    optionalTo = true;
  }

  const rawWords = cleanTerm.split(/\s+/).filter(Boolean);
  let regex: RegExp;

  if (rawWords.length === 1) {
    const placeholder = getPlaceholderPattern(rawWords[0]);
    if (placeholder) {
      regex = new RegExp(`\\b(${placeholder})\\b`, "i");
    } else {
      const variants = getWordVariants(rawWords[0]);
      const pattern = variants.map(escapeRegex).join("|");
      regex = new RegExp(`\\b(${pattern})\\b`, "i");
    }
  } else {
    // Multi-word collocation: allow placeholders & 0 to 2 intervening words between tokens
    const wordPatterns = rawWords.map((w) => {
      const isOptional = w.startsWith("(") && w.endsWith(")");
      const inner = isOptional ? w.slice(1, -1) : w;

      const placeholderPattern = getPlaceholderPattern(inner);
      if (placeholderPattern) {
        return isOptional
          ? `(?:${placeholderPattern})?`
          : `(?:${placeholderPattern})`;
      }

      const variants = getWordVariants(inner);
      const escaped = variants.map(escapeRegex).join("|");
      return isOptional ? `(?:${escaped})?` : `(?:${escaped})`;
    });

    // Intervening gap between words (e.g. "project", "employees'", "all critical")
    const gap = `(?:\\s+[\\w'’]+){0,2}\\s+`;
    let fullPattern = wordPatterns.join(gap);
    if (optionalTo) {
      fullPattern = `(?:to\\s+)?` + fullPattern;
    }
    regex = new RegExp(`\\b(${fullPattern})\\b`, "i");
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
  t: (key: string, options?: any, fallback?: string) => string,
): ClozeMatchResult {
  const cleanTerm = cleanTermMetadata(term).trim();
  const cleanExample = example?.trim() || "";

  if (cleanExample) {
    // 1. Fast path: Direct match with common word boundaries and suffix
    const escaped = escapeRegex(cleanTerm);
    const directRegex = new RegExp(`\\b(${escaped}(?:s|es|ed|ing|d)?)\\b`, "i");
    let match = cleanExample.match(directRegex);

    // 2. Fallback path: Cached flexible collocation / irregular verb / placeholder matcher
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

      // If cleanTerm started with "to " or "(to) ", also add form without "to"
      const strippedTo = cleanTerm.replace(/^(\(to\)|to)\s+/i, "").trim();
      if (strippedTo !== cleanTerm) {
        acceptable.add(normalizeText(strippedTo));
      }

      // Add conjugated forms of base term (first word)
      const firstWord = strippedTo.split(/\s+/)[0];
      const restOfTerm = strippedTo.slice(firstWord.length);
      const termVariants = getWordVariants(firstWord);
      for (const v of termVariants) {
        acceptable.add(normalizeText(v + restOfTerm));
      }

      // Add conjugated forms of matched phrase (first word)
      const matchedFirstWord = matched.split(/\s+/)[0];
      const restOfMatched = matched.slice(matchedFirstWord.length);
      const matchedVariants = getWordVariants(matchedFirstWord);
      for (const mv of matchedVariants) {
        acceptable.add(normalizeText(mv + restOfMatched));
      }

      // If term has possessive placeholder (e.g. "one's"), expand with all standard possessives
      const hasPossessivePlaceholder =
        /(\bone's\b|\bones\b|\bsomeone's\b|\bsomeones\b|\bsb's\b)/i.test(
          cleanTerm,
        ) ||
        /(\bmy\b|\byour\b|\bhis\b|\bher\b|\bits\b|\bour\b|\btheir\b)/i.test(
          matched,
        );

      if (hasPossessivePlaceholder) {
        for (const p of POSSESSIVE_PRONOUNS) {
          const baseReplaced = cleanTerm.replace(
            /(\bone's\b|\bones\b|\bsomeone's\b|\bsomeones\b|\bsb's\b)/gi,
            p,
          );
          acceptable.add(normalizeText(baseReplaced));
          for (const v of termVariants) {
            acceptable.add(
              normalizeText(v + baseReplaced.slice(firstWord.length)),
            );
          }

          const matchedReplaced = matched.replace(
            /(\bmy\b|\byour\b|\bhis\b|\bher\b|\bits\b|\bour\b|\btheir\b|\bone's\b|\bones\b)/gi,
            p,
          );
          acceptable.add(normalizeText(matchedReplaced));
          for (const mv of matchedVariants) {
            acceptable.add(
              normalizeText(
                mv + matchedReplaced.slice(matchedFirstWord.length),
              ),
            );
          }
        }
      }

      // If term has person placeholder (e.g. "someone", "sb"), expand with object pronouns
      const hasPersonPlaceholder =
        /(\bsomeone\b|\bsomebody\b|\bsb\b)/i.test(cleanTerm) ||
        /(\bme\b|\byour\b|\bhim\b|\bher\b|\bus\b|\bthem\b)/i.test(matched);

      if (hasPersonPlaceholder) {
        for (const obj of OBJECT_PRONOUNS) {
          const baseReplaced = cleanTerm.replace(
            /(\bsomeone\b|\bsomebody\b|\bsb\b)/gi,
            obj,
          );
          acceptable.add(normalizeText(baseReplaced));
          for (const v of termVariants) {
            acceptable.add(
              normalizeText(v + baseReplaced.slice(firstWord.length)),
            );
          }

          const matchedReplaced = matched.replace(
            /(\bme\b|\byou\b|\bhim\b|\bher\b|\bus\b|\bthem\b|\bsomeone\b|\bsomebody\b)/gi,
            obj,
          );
          acceptable.add(normalizeText(matchedReplaced));
          for (const mv of matchedVariants) {
            acceptable.add(
              normalizeText(
                mv + matchedReplaced.slice(matchedFirstWord.length),
              ),
            );
          }
        }
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
  questionData: ClozeMatchResult,
): boolean {
  const userNorm = normalizeText(userAnswer);
  if (!userNorm) return false;

  return questionData.acceptableAnswers.includes(userNorm);
}
