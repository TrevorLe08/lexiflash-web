import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode } from "../types/studyRoom.types";

export const TIMER_STORAGE_KEY = "lexiflash_study_timer_v2";
const TIMER_CHANNEL_NAME = "lexiflash_timer_sync";

export type AmbientSoundType = "NONE" | "RAIN" | "WAVES" | "WHITE_NOISE";

export interface TimerConfig {
  POMODORO: number; // 25 min = 1500s
  SHORT_BREAK: number; // 5 min = 300s
  LONG_BREAK: number; // 15 min = 900s
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  POMODORO: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

interface StoredTimerState {
  mode: TimerMode;
  isRunning: boolean;
  targetEndTime: number | null;
  startTimestamp: number | null;
  remainingSeconds: number;
  stopwatchElapsed: number;
  lastUpdated: number;
}

interface TimerSyncMessage {
  type: "SYNC" | "START" | "PAUSE" | "RESET" | "MODE_CHANGE" | "COMPLETE";
  state: StoredTimerState;
}

export const clearStoredTimer = () => {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    localStorage.removeItem("lexiflash_study_timer_v1");
  } catch {
    // ignore
  }
};

export const resetStudyTimerAcrossTabs = () => {
  clearStoredTimer();
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(TIMER_CHANNEL_NAME);
      const defaultState: StoredTimerState = {
        mode: "POMODORO",
        isRunning: false,
        targetEndTime: null,
        startTimestamp: null,
        remainingSeconds: DEFAULT_TIMER_CONFIG.POMODORO,
        stopwatchElapsed: 0,
        lastUpdated: Date.now(),
      };
      channel.postMessage({ type: "RESET", state: defaultState });
      channel.close();
    }
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent("lexiflash_logout"));
  } catch {
    // ignore
  }
};

export function useStudyTimer(
  onSessionComplete?: (session: {
    mode: TimerMode;
    durationSeconds: number;
  }) => void,
) {
  const [mode, setModeState] = useState<TimerMode>("POMODORO");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_CONFIG.POMODORO);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Ambience Audio State
  const [ambientType, setAmbientType] = useState<AmbientSoundType>("NONE");
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{
    source?: AudioBufferSourceNode;
    gain?: GainNode;
    filter?: BiquadFilterNode;
    lfo?: OscillatorNode;
    lfoGain?: GainNode;
  } | null>(null);

  const targetEndTimeRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef<number>(DEFAULT_TIMER_CONFIG.POMODORO);
  const stopwatchElapsedRef = useRef<number>(0);
  const modeRef = useRef<TimerMode>(mode);
  const isRunningRef = useRef<boolean>(isRunning);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const volumeRef = useRef<number>(volume);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    modeRef.current = mode;
    isRunningRef.current = isRunning;
    onSessionCompleteRef.current = onSessionComplete;
    volumeRef.current = volume;
  }, [mode, isRunning, onSessionComplete, volume]);

  // Read current state from LocalStorage or Default
  const readStateFromStorage = useCallback((): StoredTimerState => {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) {
        const parsed: StoredTimerState = JSON.parse(raw);
        if (parsed && typeof parsed.mode === "string") {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      mode: "POMODORO",
      isRunning: false,
      targetEndTime: null,
      startTimestamp: null,
      remainingSeconds: DEFAULT_TIMER_CONFIG.POMODORO,
      stopwatchElapsed: 0,
      lastUpdated: Date.now(),
    };
  }, []);

  // Save current state to LocalStorage and broadcast to other tabs
  const persistAndBroadcast = useCallback(
    (type: TimerSyncMessage["type"], state: StoredTimerState) => {
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({ type, state });
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  // Apply parsed state to React state and refs
  const applyState = useCallback((state: StoredTimerState) => {
    const now = Date.now();
    setModeState(state.mode);
    modeRef.current = state.mode;

    if (state.mode === "CUSTOM_STOPWATCH") {
      stopwatchElapsedRef.current = state.stopwatchElapsed || 0;
      if (state.isRunning && state.startTimestamp) {
        startTimestampRef.current = state.startTimestamp;
        const currentElapsed =
          (state.stopwatchElapsed || 0) +
          Math.floor((now - state.startTimestamp) / 1000);
        setStopwatchSeconds(currentElapsed);
        setIsRunning(true);
        isRunningRef.current = true;
      } else {
        startTimestampRef.current = null;
        setStopwatchSeconds(state.stopwatchElapsed || 0);
        setIsRunning(false);
        isRunningRef.current = false;
      }
      targetEndTimeRef.current = null;
    } else {
      stopwatchElapsedRef.current = 0;
      startTimestampRef.current = null;

      if (state.isRunning && state.targetEndTime) {
        targetEndTimeRef.current = state.targetEndTime;
        const remaining = Math.max(
          0,
          Math.round((state.targetEndTime - now) / 1000),
        );
        remainingSecondsRef.current = remaining;
        setTimeLeft(remaining);
        setIsRunning(true);
        isRunningRef.current = true;
      } else {
        targetEndTimeRef.current = null;
        const remaining =
          typeof state.remainingSeconds === "number"
            ? state.remainingSeconds
            : DEFAULT_TIMER_CONFIG[state.mode];
        remainingSecondsRef.current = remaining;
        setTimeLeft(remaining);
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }
  }, []);

  // Initialize BroadcastChannel and Storage Listener for Multi-Tab Sync
  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel(TIMER_CHANNEL_NAME);
        channelRef.current = channel;
        channel.onmessage = (event: MessageEvent<TimerSyncMessage>) => {
          if (event.data && event.data.state) {
            applyState(event.data.state);
          }
        };
      } catch {
        // Fallback
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TIMER_STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed: StoredTimerState = JSON.parse(e.newValue);
            applyState(parsed);
          } catch {
            // ignore
          }
        } else {
          // Key was removed (e.g. on logout) -> reset to clean default state
          const defaultState: StoredTimerState = {
            mode: "POMODORO",
            isRunning: false,
            targetEndTime: null,
            startTimestamp: null,
            remainingSeconds: DEFAULT_TIMER_CONFIG.POMODORO,
            stopwatchElapsed: 0,
            lastUpdated: Date.now(),
          };
          applyState(defaultState);
        }
      }
    };

    const handleLogoutReset = () => {
      const defaultState: StoredTimerState = {
        mode: "POMODORO",
        isRunning: false,
        targetEndTime: null,
        startTimestamp: null,
        remainingSeconds: DEFAULT_TIMER_CONFIG.POMODORO,
        stopwatchElapsed: 0,
        lastUpdated: Date.now(),
      };
      applyState(defaultState);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("lexiflash_logout", handleLogoutReset);

    // Initial load on mount
    const initialState = readStateFromStorage();
    applyState(initialState);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("lexiflash_logout", handleLogoutReset);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [applyState, readStateFromStorage]);

  // --------------------------------------------------------------------------
  // Web Audio Synthesis for Ambient Sounds & Chime
  // --------------------------------------------------------------------------
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Completion chime: Harmonic 3-note chime (C5, E5, G5)
  const playCompletionChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.15);
        gain.gain.linearRampToValueAtTime(
          0.3 * volumeRef.current,
          ctx.currentTime + idx * 0.15 + 0.05,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + idx * 0.15 + 1.2,
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 1.3);
      });
    } catch {
      // ignore
    }
  }, [getAudioContext]);

  // Stop current ambient nodes immediately (synchronous, no timer race condition)
  const stopAmbientSound = useCallback(() => {
    if (ambientNodesRef.current) {
      try {
        const { source, lfo, gain } = ambientNodesRef.current;
        if (gain) {
          gain.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
        }
        if (source) {
          source.stop();
          source.disconnect();
        }
        if (lfo) {
          lfo.stop();
          lfo.disconnect();
        }
      } catch {
        // ignore
      }
      ambientNodesRef.current = null;
    }
  }, []);

  // Start synthesizing ambient audio
  const startAmbientSound = useCallback(
    (type: AmbientSoundType) => {
      stopAmbientSound();
      if (type === "NONE") return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Generate 6-second noise buffer
        const bufferSize = ctx.sampleRate * 6;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === "RAIN") {
            // Pink noise for soft rainfall
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else if (type === "WAVES") {
            // Pink noise for ocean swell
            output[i] = (lastOut + 0.015 * white) / 1.015;
            lastOut = output[i];
            output[i] *= 4.0;
          } else {
            // Smooth White Noise
            output[i] = white * 0.18;
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        const mainGain = ctx.createGain();

        let lfo: OscillatorNode | undefined;
        let lfoGain: GainNode | undefined;

        if (type === "RAIN") {
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1400, ctx.currentTime);
          mainGain.gain.setValueAtTime(0.35 * volumeRef.current, ctx.currentTime);

          source.connect(filter);
          filter.connect(mainGain);
          mainGain.connect(ctx.destination);
        } else if (type === "WAVES") {
          // Ocean waves: Lowpass filter + LFO gain oscillation (~6.5-second wave cycle)
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(900, ctx.currentTime);

          // Base gain
          const baseGain = 0.25 * volumeRef.current;
          mainGain.gain.setValueAtTime(baseGain, ctx.currentTime);

          // LFO to modulate wave surge & retreat
          lfo = ctx.createOscillator();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // ~6.7s per wave

          lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(baseGain * 0.7, ctx.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(mainGain.gain);

          source.connect(filter);
          filter.connect(mainGain);
          mainGain.connect(ctx.destination);

          lfo.start();
        } else {
          // White noise
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(2600, ctx.currentTime);
          mainGain.gain.setValueAtTime(0.2 * volumeRef.current, ctx.currentTime);

          source.connect(filter);
          filter.connect(mainGain);
          mainGain.connect(ctx.destination);
        }

        source.start();
        ambientNodesRef.current = { source, gain: mainGain, filter, lfo, lfoGain };
      } catch {
        // audio fail safe
      }
    },
    [getAudioContext, stopAmbientSound],
  );

  // Toggle or switch ambient sound (strictly independent from timer)
  const setAmbientSound = useCallback(
    (type: AmbientSoundType) => {
      if (type === ambientType) {
        // Toggle off if clicking the active sound again
        setAmbientType("NONE");
        stopAmbientSound();
      } else {
        setAmbientType(type);
        if (type === "NONE") {
          stopAmbientSound();
        } else {
          startAmbientSound(type);
        }
      }
    },
    [ambientType, startAmbientSound, stopAmbientSound],
  );

  // Update volume
  const setAudioVolume = useCallback((vol: number) => {
    setVolume(vol);
    volumeRef.current = vol;
    if (ambientNodesRef.current?.gain && audioCtxRef.current) {
      try {
        ambientNodesRef.current.gain.gain.setValueAtTime(
          vol * 0.35,
          audioCtxRef.current.currentTime,
        );
      } catch {
        // ignore
      }
    }
  }, []);

  // Main Timer Tick Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentMode = modeRef.current;

        if (currentMode === "CUSTOM_STOPWATCH") {
          const start = startTimestampRef.current || now;
          const totalElapsed =
            stopwatchElapsedRef.current + Math.floor((now - start) / 1000);
          setStopwatchSeconds(totalElapsed);
        } else {
          const targetEnd = targetEndTimeRef.current;
          if (!targetEnd) return;

          const remaining = Math.max(0, Math.round((targetEnd - now) / 1000));
          setTimeLeft(remaining);

          if (remaining === 0) {
            // Timer Complete
            setIsRunning(false);
            isRunningRef.current = false;
            targetEndTimeRef.current = null;
            remainingSecondsRef.current = DEFAULT_TIMER_CONFIG[currentMode];

            playCompletionChime();

            const completedState: StoredTimerState = {
              mode: currentMode,
              isRunning: false,
              targetEndTime: null,
              startTimestamp: null,
              remainingSeconds: DEFAULT_TIMER_CONFIG[currentMode],
              stopwatchElapsed: 0,
              lastUpdated: now,
            };
            persistAndBroadcast("COMPLETE", completedState);

            if (onSessionCompleteRef.current) {
              onSessionCompleteRef.current({
                mode: currentMode,
                durationSeconds: DEFAULT_TIMER_CONFIG[currentMode],
              });
            }
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, persistAndBroadcast, playCompletionChime]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  // Timer Controls (strictly independent from ambient audio)
  const startTimer = useCallback(() => {
    const now = Date.now();
    const currentMode = modeRef.current;
    let nextState: StoredTimerState;

    if (currentMode === "CUSTOM_STOPWATCH") {
      startTimestampRef.current = now;
      nextState = {
        mode: currentMode,
        isRunning: true,
        targetEndTime: null,
        startTimestamp: now,
        remainingSeconds: 0,
        stopwatchElapsed: stopwatchElapsedRef.current,
        lastUpdated: now,
      };
    } else {
      const currentRemaining =
        remainingSecondsRef.current > 0
          ? remainingSecondsRef.current
          : DEFAULT_TIMER_CONFIG[currentMode];
      const targetEnd = now + currentRemaining * 1000;

      targetEndTimeRef.current = targetEnd;
      remainingSecondsRef.current = currentRemaining;

      nextState = {
        mode: currentMode,
        isRunning: true,
        targetEndTime: targetEnd,
        startTimestamp: null,
        remainingSeconds: currentRemaining,
        stopwatchElapsed: 0,
        lastUpdated: now,
      };
    }

    setIsRunning(true);
    isRunningRef.current = true;
    persistAndBroadcast("START", nextState);
  }, [persistAndBroadcast]);

  const pauseTimer = useCallback(() => {
    const now = Date.now();
    const currentMode = modeRef.current;
    let nextState: StoredTimerState;

    if (currentMode === "CUSTOM_STOPWATCH") {
      if (startTimestampRef.current) {
        const sessionElapsed = Math.floor(
          (now - startTimestampRef.current) / 1000,
        );
        stopwatchElapsedRef.current += sessionElapsed;
      }
      startTimestampRef.current = null;

      nextState = {
        mode: currentMode,
        isRunning: false,
        targetEndTime: null,
        startTimestamp: null,
        remainingSeconds: 0,
        stopwatchElapsed: stopwatchElapsedRef.current,
        lastUpdated: now,
      };
    } else {
      const targetEnd = targetEndTimeRef.current;
      const remaining = targetEnd
        ? Math.max(0, Math.round((targetEnd - now) / 1000))
        : remainingSecondsRef.current;

      remainingSecondsRef.current = remaining;
      targetEndTimeRef.current = null;

      nextState = {
        mode: currentMode,
        isRunning: false,
        targetEndTime: null,
        startTimestamp: null,
        remainingSeconds: remaining,
        stopwatchElapsed: 0,
        lastUpdated: now,
      };
    }

    setIsRunning(false);
    isRunningRef.current = false;
    persistAndBroadcast("PAUSE", nextState);
  }, [persistAndBroadcast]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    const currentMode = modeRef.current;

    targetEndTimeRef.current = null;
    startTimestampRef.current = null;
    remainingSecondsRef.current =
      currentMode === "CUSTOM_STOPWATCH" ? 0 : DEFAULT_TIMER_CONFIG[currentMode];
    stopwatchElapsedRef.current = 0;

    setIsRunning(false);
    isRunningRef.current = false;

    if (currentMode === "CUSTOM_STOPWATCH") {
      setStopwatchSeconds(0);
    } else {
      setTimeLeft(DEFAULT_TIMER_CONFIG[currentMode]);
    }

    const nextState: StoredTimerState = {
      mode: currentMode,
      isRunning: false,
      targetEndTime: null,
      startTimestamp: null,
      remainingSeconds:
        currentMode === "CUSTOM_STOPWATCH"
          ? 0
          : DEFAULT_TIMER_CONFIG[currentMode],
      stopwatchElapsed: 0,
      lastUpdated: now,
    };
    persistAndBroadcast("RESET", nextState);
  }, [persistAndBroadcast]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      const now = Date.now();
      modeRef.current = newMode;
      setModeState(newMode);

      targetEndTimeRef.current = null;
      startTimestampRef.current = null;
      remainingSecondsRef.current =
        newMode === "CUSTOM_STOPWATCH" ? 0 : DEFAULT_TIMER_CONFIG[newMode];
      stopwatchElapsedRef.current = 0;

      setIsRunning(false);
      isRunningRef.current = false;

      if (newMode === "CUSTOM_STOPWATCH") {
        setStopwatchSeconds(0);
      } else {
        setTimeLeft(DEFAULT_TIMER_CONFIG[newMode]);
      }

      const nextState: StoredTimerState = {
        mode: newMode,
        isRunning: false,
        targetEndTime: null,
        startTimestamp: null,
        remainingSeconds:
          newMode === "CUSTOM_STOPWATCH"
            ? 0
            : DEFAULT_TIMER_CONFIG[newMode],
        stopwatchElapsed: 0,
        lastUpdated: now,
      };
      persistAndBroadcast("MODE_CHANGE", nextState);
    },
    [persistAndBroadcast],
  );

  const skipTimer = useCallback(() => {
    const currentMode = modeRef.current;
    if (currentMode !== "CUSTOM_STOPWATCH") {
      const totalDuration = DEFAULT_TIMER_CONFIG[currentMode];
      const timeSpent = totalDuration - timeLeft;
      if (timeSpent > 30 && onSessionCompleteRef.current) {
        onSessionCompleteRef.current({
          mode: currentMode,
          durationSeconds: timeSpent,
        });
      }
    }
    resetTimer();
  }, [timeLeft, resetTimer]);

  const totalDuration =
    mode === "CUSTOM_STOPWATCH" ? stopwatchSeconds : DEFAULT_TIMER_CONFIG[mode];
  const progressPercent =
    mode === "CUSTOM_STOPWATCH"
      ? 100
      : Math.min(
          100,
          Math.max(0, ((totalDuration - timeLeft) / (totalDuration || 1)) * 100),
        );

  return {
    mode,
    isRunning,
    timeLeft,
    stopwatchSeconds,
    progressPercent,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    skipTimer,
    ambientType,
    setAmbientSound,
    volume,
    setAudioVolume,
  };
}
