/**
 * Text-to-Speech Engine with Piper TTS Web architecture and UK / US accent selection.
 */

export type VoiceAccent = "en-US" | "en-GB";

const ACCENT_STORAGE_KEY = "lexiflash_voice_accent";
const SPEED_STORAGE_KEY = "lexiflash_voice_speed";
const AUTOPLAY_STORAGE_KEY = "lexiflash_voice_autoplay";

let currentAccent: VoiceAccent = (() => {
  try {
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (saved === "en-GB" || saved === "en-US") return saved;
  } catch {
    // ignore
  }
  return "en-US";
})();

let currentSpeed: number = (() => {
  try {
    const saved = localStorage.getItem(SPEED_STORAGE_KEY);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0.5 && val <= 2.0) return val;
    }
  } catch {
    // ignore
  }
  return 1.0;
})();

let currentAutoPlay: boolean = (() => {
  try {
    const saved = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    if (saved !== null) return saved === "true";
  } catch {
    // ignore
  }
  return true;
})();

const listeners = new Set<(accent: VoiceAccent) => void>();
const speedListeners = new Set<(speed: number) => void>();

/**
 * Get currently selected voice accent ('en-US' or 'en-GB')
 */
export function getVoiceAccent(): VoiceAccent {
  return currentAccent;
}

/**
 * Set voice accent and notify subscribers
 */
export function setVoiceAccent(accent: VoiceAccent): void {
  currentAccent = accent;
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn(accent));
}

/**
 * Get current voice playback speed (e.g. 0.8, 1.0, 1.2)
 */
export function getVoiceSpeed(): number {
  return currentSpeed;
}

/**
 * Set voice playback speed
 */
export function setVoiceSpeed(speed: number): void {
  currentSpeed = speed;
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, speed.toString());
  } catch {
    // ignore
  }
  speedListeners.forEach((fn) => fn(speed));
}

/**
 * Get auto-play pronunciation setting
 */
export function getAutoPlayPronunciation(): boolean {
  return currentAutoPlay;
}

/**
 * Set auto-play pronunciation setting
 */
export function setAutoPlayPronunciation(enabled: boolean): void {
  currentAutoPlay = enabled;
  try {
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, enabled.toString());
  } catch {
    // ignore
  }
}

/**
 * Toggle between US and UK accent
 */
export function toggleVoiceAccent(): VoiceAccent {
  const next: VoiceAccent = currentAccent === "en-US" ? "en-GB" : "en-US";
  setVoiceAccent(next);
  return next;
}

/**
 * Subscribe to accent changes
 */
export function subscribeVoiceAccent(
  fn: (accent: VoiceAccent) => void,
): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Piper TTS Web Interface definition
 */
interface PiperTTSWebModule {
  predict?: (options: { text: string; voiceId: string }) => Promise<Blob>;
}

// Global reference for Piper TTS if registered
let piperInstance: PiperTTSWebModule | null = null;

export function registerPiperTTS(instance: PiperTTSWebModule) {
  piperInstance = instance;
}

/**
 * Speaks text using Piper TTS Web if available, with seamless fallback
 * to high-fidelity Web Speech API configured for US or UK English.
 */
export function speakText(text: string, overrideAccent?: VoiceAccent): void {
  const accent = overrideAccent || currentAccent;

  // 1. Try Piper TTS Web Engine if loaded
  if (piperInstance && typeof piperInstance.predict === "function") {
    const voiceId =
      accent === "en-GB" ? "en_GB-alan-medium" : "en_US-hfc_female-medium";

    piperInstance
      .predict({ text, voiceId })
      .then((blob) => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.play().catch(() => {
          fallbackWebSpeech(text, accent);
        });
      })
      .catch(() => {
        fallbackWebSpeech(text, accent);
      });
    return;
  }

  // 2. High-fidelity Web Speech API with Accent Selection
  fallbackWebSpeech(text, accent);
}

function fallbackWebSpeech(text: string, accent: VoiceAccent) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  // Cancel any currently playing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = accent;
  utterance.rate = currentSpeed || 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();

  if (accent === "en-GB") {
    // Prioritize UK English voices
    const ukVoice =
      voices.find(
        (v) =>
          v.lang === "en-GB" &&
          (v.name.includes("Google") ||
            v.name.includes("Daniel") ||
            v.name.includes("Oliver") ||
            v.name.includes("George") ||
            v.name.includes("Natural")),
      ) ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en"));

    if (ukVoice) {
      utterance.voice = ukVoice;
    }
  } else {
    // Prioritize US English voices
    const usVoice =
      voices.find(
        (v) =>
          (v.lang === "en-US" || v.lang === "en_US") &&
          (v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Natural") ||
            v.name.includes("Jenny")),
      ) ||
      voices.find((v) => v.lang === "en-US" || v.lang === "en_US") ||
      voices.find((v) => v.lang.startsWith("en"));

    if (usVoice) {
      utterance.voice = usVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

export const speakWord = speakText;
