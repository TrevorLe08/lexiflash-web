import React from "react";
import { Flame } from "lucide-react";
import { StreakStatus } from "../../types";

interface StreakBadgeProps {
  streakCount?: number;
  isStreakActiveToday?: boolean;
  isStreakAtRisk?: boolean;
  streakStatus?: StreakStatus;
  lastStudyDate?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakCount = 0,
  isStreakActiveToday = false,
  isStreakAtRisk = false,
  streakStatus,
  lastStudyDate,
  size = "md",
  showTooltip = true,
  className = "",
}) => {
  // Calendar day validation: Ensure streak is only considered active today if lastStudyDate is today
  const todayStr = new Date().toISOString().split("T")[0];
  const isStudiedToday =
    isStreakActiveToday && (!lastStudyDate || lastStudyDate === todayStr);

  // Determine computed status
  const effectiveStatus: StreakStatus =
    streakStatus && (!lastStudyDate || lastStudyDate === todayStr)
      ? streakStatus
      : isStudiedToday
        ? "ACTIVE"
        : isStreakAtRisk || streakCount > 0
          ? "COOLED"
          : "INACTIVE";

  const isActive = effectiveStatus === "ACTIVE" && streakCount > 0;
  const isCooled = effectiveStatus === "COOLED" && streakCount > 0;

  const tooltipText = isActive
    ? `🔥 Chuỗi ${streakCount} ngày — Đã giữ chuỗi hôm nay!`
    : isCooled
      ? `❄️ Chuỗi ${streakCount} ngày đang nguội! Học ngay một bài hôm nay để giữ chuỗi.`
      : `⚪ Chưa có chuỗi (0 ngày) — Học 1 bài để bắt đầu chuỗi!`;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (isActive) {
    return (
      <div
        title={showTooltip ? tooltipText : undefined}
        className={`inline-flex items-center rounded-xl font-bold transition-all duration-200 cursor-pointer ${sizeClasses[size]} bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20 hover:border-amber-400 hover:scale-105 ${className}`}
      >
        <Flame
          className={`${iconSizes[size]} text-amber-400 fill-amber-400 animate-pulse`}
        />
        <span>{streakCount}</span>
      </div>
    );
  }

  if (isCooled) {
    return (
      <div
        title={showTooltip ? tooltipText : undefined}
        className={`relative inline-flex items-center rounded-xl font-bold transition-all duration-200 cursor-pointer ${sizeClasses[size]} bg-slate-700/30 border border-slate-600/60 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 hover:scale-105 ${className}`}
      >
        <Flame
          className={`${iconSizes[size]} text-slate-400 fill-slate-500/30`}
        />
        <span>{streakCount}</span>
        {/* Warning indicator pulse for cooling streak */}
        <span
          className="absolute -top-1 -right-1 flex h-2 w-2"
          title="Chuỗi đang nguội!"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      </div>
    );
  }

  // Broken or Inactive (0 days, gray)
  return (
    <div
      title={showTooltip ? tooltipText : undefined}
      className={`inline-flex items-center rounded-xl font-bold transition-all duration-200 cursor-pointer ${sizeClasses[size]} bg-[#1a1d36] border border-[#2e3856] text-[#6b7280] hover:border-[#3c476c] ${className}`}
    >
      <Flame className={`${iconSizes[size]} text-gray-500 fill-gray-600/20`} />
      <span>0</span>
    </div>
  );
};
