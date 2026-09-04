import React from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n";
import { TimerMode } from "../../types/studyRoom.types";
import { cn } from "../../utils/cn";

interface FocusTimerCardProps {
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number;
  stopwatchSeconds: number;
  progressPercent: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  skipTimer: () => void;
}

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({
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
}) => {
  const { t } = useTranslation();

  // Format MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const displaySeconds =
    mode === "CUSTOM_STOPWATCH" ? stopwatchSeconds : timeLeft;

  // SVG Circular parameters
  const size = 260;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-[#161926] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden flex flex-col items-center justify-between h-full space-y-6">
      {/* Mode Selector Tabs */}
      <div className="w-full flex items-center justify-center p-1 bg-[#141824] border border-white/[0.08] rounded-xl max-w-md">
        <button
          onClick={() => switchMode("POMODORO")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === "POMODORO"
              ? "bg-[#4f5fd8] text-white shadow-xs"
              : "text-[#8e98b0] hover:text-white"
          }`}
        >
          {t("studyRoom.modePomodoro", undefined, "Pomodoro (25m)")}
        </button>
        <button
          onClick={() => switchMode("SHORT_BREAK")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === "SHORT_BREAK"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#8e98b0] hover:text-white"
          }`}
        >
          {t("studyRoom.modeShortBreak", undefined, "Nghỉ ngắn (5m)")}
        </button>
        <button
          onClick={() => switchMode("LONG_BREAK")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === "LONG_BREAK"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-[#8e98b0] hover:text-white"
          }`}
        >
          {t("studyRoom.modeLongBreak", undefined, "Nghỉ dài (15m)")}
        </button>
        <button
          onClick={() => switchMode("CUSTOM_STOPWATCH")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === "CUSTOM_STOPWATCH"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-[#8e98b0] hover:text-white"
          }`}
        >
          {t("studyRoom.modeStopwatch", undefined, "Bấm giờ")}
        </button>
      </div>

      {/* Circular Progress Gauge & Timer Display */}
      <div className="relative flex flex-col items-center justify-center my-auto py-4 flex-1">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e2438"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={
              mode === "POMODORO"
                ? "#4f5fd8"
                : mode === "SHORT_BREAK"
                  ? "#059669"
                  : mode === "LONG_BREAK"
                    ? "#0d9488"
                    : "#9333ea"
            }
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Timer Numeric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter">
            {formatTime(displaySeconds)}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e98b0] mt-1.5 flex items-center gap-1.5">
            {isRunning ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {mode === "CUSTOM_STOPWATCH"
                  ? t("studyRoom.countingUp", undefined, "Đang bấm giờ")
                  : t("studyRoom.focusingStatus", undefined, "Đang tập trung")}
              </span>
            ) : (
              t("studyRoom.pausedStatus", undefined, "Đã tạm dừng")
            )}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-4 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={resetTimer}
          icon={<RotateCcw className="w-4 h-4" />}
          title={t("studyRoom.resetBtn", undefined, "Đặt lại")}
          className="rounded-full w-11 h-11 p-0 justify-center cursor-pointer"
        />

        <Button
          variant="primary"
          size="lg"
          onClick={isRunning ? pauseTimer : startTimer}
          icon={
            isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )
          }
          className={cn(
            "rounded-full w-16 h-16 p-0 justify-center", 
            "shadow-lg cursor-pointer active:scale-95 transition-transform text-white shadow-[#4f5fd8]/30" , 
            {
              "bg-[#4f5fd8] hover:bg-[#4352c2]": mode === "POMODORO",
              "bg-[#059669] hover:bg-[#0b7e59] focus:ring-[#059669]": mode === "SHORT_BREAK",
              "bg-[#0d9488] hover:bg-[#0f857b] focus:ring-[#0d9488]": mode === "LONG_BREAK",
              "bg-[#9333ea] hover:bg-[#7827c4] focus:ring-[#9333ea]": mode === "CUSTOM_STOPWATCH",
            }
          )}
        />

        <Button
          variant="outline"
          size="md"
          onClick={skipTimer}
          icon={<SkipForward className="w-4 h-4" />}
          title={t("studyRoom.skipBtn", undefined, "Bỏ qua / Hoàn thành")}
          className="rounded-full w-11 h-11 p-0 justify-center cursor-pointer"
        />
      </div>
    </div>
  );
};
