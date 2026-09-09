import React from "react";
import { Link } from "react-router-dom";
import { X, SlidersHorizontal } from "lucide-react";

export interface StudyHeaderBarProps {
  current: number;
  total: number;
  backUrl?: string;
  onClose?: () => void;
  onSettings?: () => void;
  percent?: number;
  counterText?: string;
  className?: string;
  barColorClassName?: string;
}

/**
 * Reusable Modern Study Header Bar
 * Displays an exit (X) button, a center rounded progress bar, and a current/total counter (e.g. 1/6)
 */
export const StudyHeaderBar: React.FC<StudyHeaderBarProps> = ({
  current,
  total,
  backUrl,
  onClose,
  onSettings,
  percent,
  counterText,
  className = "",
  barColorClassName = "bg-gradient-to-r from-[#06b6d4] to-[#6366f1]",
}) => {
  const calculatedPercent =
    percent !== undefined
      ? Math.min(100, Math.max(0, percent))
      : total > 0
        ? Math.min(100, Math.max(0, Math.round((current / total) * 100)))
        : 0;

  const displayCounter = counterText ?? `${current}/${total}`;

  const closeIcon = (
    <div
      onClick={onClose}
      className="text-[#7c8ba1] hover:text-white transition-colors p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 shrink-0 flex items-center justify-center cursor-pointer select-none"
      title="Thoát"
      aria-label="Thoát"
      role="button"
      tabIndex={0}
    >
      <X className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  );

  return (
    <div
      className={`flex items-center gap-3 sm:gap-5 w-full select-none ${className}`}
    >
      {/* Exit Button */}
      {backUrl ? (
        <Link
          to={backUrl}
          onClick={onClose}
          className="shrink-0 flex items-center"
        >
          {closeIcon}
        </Link>
      ) : (
        closeIcon
      )}

      {/* Center Progress Bar */}
      <div className="flex-1 min-w-0">
        <div className="w-full bg-[#12162a] h-2.5 sm:h-3 rounded-full overflow-hidden border border-[#252b48] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${barColorClassName}`}
            style={{ width: `${calculatedPercent}%` }}
          />
        </div>
      </div>

      {/* Right Progress Counter (e.g. 1/6) & Optional Settings Button */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="text-xs sm:text-sm font-bold font-mono text-[#38bdf8] min-w-[2.5rem] text-right">
          {displayCounter}
        </div>
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className="text-[#7c8ba1] hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 shrink-0 flex items-center justify-center cursor-pointer select-none border border-transparent hover:border-white/10"
            title="Tùy chỉnh số câu / bài học"
            aria-label="Tùy chỉnh số câu / bài học"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
};
