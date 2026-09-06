import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Flame, Clock, ArrowRight } from "lucide-react";
import { SRSForecastDay } from "../../types/studyRoom.types";
import { useTranslation } from "../../i18n";

interface SRSForecastCardProps {
  srsForecast: SRSForecastDay[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    hasStudiedToday: boolean;
  };
  todayStats: {
    focusedMinutes: number;
    cardsReviewed: number;
    dailyTargetMinutes: number;
  };
}

export const SRSForecastCard: React.FC<SRSForecastCardProps> = ({
  srsForecast,
  streak,
  todayStats,
}) => {
  const { t } = useTranslation();

  // Find max cards due in the 7-day window to scale bar chart
  const maxDue = Math.max(1, ...srsForecast.map((f) => f.dueCardsCount));

  const formatDayLabel = (dateStr: string, isToday: boolean) => {
    if (isToday) return t("studyRoom.today", undefined, "Hôm nay");
    const d = new Date(dateStr);
    const dayIndex = d.getDay();
    const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysVi = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const isEn = t("studyRoom.today", undefined, "Hôm nay") === "Today";
    return isEn ? daysEn[dayIndex] || "" : daysVi[dayIndex] || "";
  };

  const formatDateShort = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  return (
    <div className="bg-[#161926] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-white leading-tight">
              {t(
                "studyRoom.forecastTitle",
                undefined,
                "Dự báo ôn tập SRS (7 ngày)",
              )}
            </h2>
            <p className="text-xs text-[#8e98b0] line-clamp-1">
              {t(
                "studyRoom.forecastSubtitle",
                undefined,
                "Lượng thẻ cần ôn tập theo thuật toán SuperMemo-2",
              )}
            </p>
          </div>
        </div>

        <Link
          to="/reviews"
          className="self-end sm:self-center text-xs font-bold text-[#9cb1ff] hover:text-white flex items-center gap-1 hover:translate-x-0.5 transition-all shrink-0"
        >
          <span>{t("studyRoom.allReviewsLink", undefined, "Xem toàn bộ")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="bg-[#141824] border border-white/[0.08] rounded-xl p-3 sm:p-5">
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-4 pt-6 pb-2">
          {srsForecast.map((day) => {
            const heightPercent = Math.max(
              8,
              Math.round((day.dueCardsCount / maxDue) * 100),
            );

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Count Badge on Hover / Active */}
                <div
                  className={`text-[10px] sm:text-[11px] font-black font-mono mb-1.5 transition-transform ${
                    day.isToday
                      ? "text-amber-400 scale-110"
                      : "text-[#8e98b0] group-hover:text-white"
                  }`}
                >
                  {day.dueCardsCount}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] h-full flex items-end justify-center">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      day.isToday
                        ? "bg-amber-400 shadow-xs shadow-amber-500/20"
                        : day.dueCardsCount > 0
                          ? "bg-[#4f5fd8] group-hover:bg-[#6978f8]"
                          : "bg-white/[0.05]"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day Labels */}
                <div className="text-center mt-2.5 space-y-0.5">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold block whitespace-nowrap ${
                      day.isToday ? "text-amber-300" : "text-[#8e98b0]"
                    }`}
                  >
                    {formatDayLabel(day.date, day.isToday)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-[#545d78] block font-mono whitespace-nowrap">
                    {formatDateShort(day.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak & Today Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Streak card */}
        <div className="bg-[#141824] border border-amber-500/20 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white flex items-center gap-1 font-mono">
              <span>{streak.currentStreak}</span>
              <span className="text-xs font-normal text-amber-300 font-sans">
                {t("studyRoom.daysUnit", undefined, "ngày")}
              </span>
            </div>
            <span className="text-[11px] text-[#8e98b0] block font-medium">
              {streak.hasStudiedToday
                ? t(
                    "studyRoom.streakActiveToday",
                    undefined,
                    "Chuỗi hôm nay 🔥",
                  )
                : t(
                    "studyRoom.streakKeepGoing",
                    undefined,
                    "Học ngay để giữ chuỗi",
                  )}
            </span>
          </div>
        </div>

        {/* Focus time card */}
        <div className="bg-[#141824] border border-indigo-500/20 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 text-[#9cb1ff] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white flex items-center gap-1 font-mono">
              <span>{todayStats.focusedMinutes}</span>
              <span className="text-xs font-normal text-[#9cb1ff] font-sans">
                / {todayStats.dailyTargetMinutes}m
              </span>
            </div>
            <span className="text-[11px] text-[#8e98b0] block font-medium">
              {t("studyRoom.focusedToday", undefined, "Tập trung hôm nay")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
