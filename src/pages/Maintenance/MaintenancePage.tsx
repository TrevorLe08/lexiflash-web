import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MaintenanceConfig } from "../../types/system.types";
import { Logo } from "../../components/common/Logo";
import {
  Wrench,
  Clock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface MaintenancePageProps {
  config: MaintenanceConfig | null;
  onRefresh?: () => Promise<void> | void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  config,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  } | null>(null);

  const title =
    config?.title?.trim() || "Hệ thống đang được bảo trì và nâng cấp";
  const message =
    config?.message?.trim() ||
    "LexiFlash đang được cập nhật và tối ưu hóa hệ thống để mang lại trải nghiệm học tập tốt nhất cho bạn. Xin vui lòng quay lại sau ít phút!";
  const estimatedEndTime = config?.estimatedEndTime;

  // Live countdown timer if estimated end time is available
  useEffect(() => {
    if (!estimatedEndTime) {
      setTimeLeft(null);
      return;
    }

    const calcTime = () => {
      const now = Date.now();
      const end = new Date(estimatedEndTime).getTime();
      const diff = end - now;

      if (isNaN(end) || diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isPast: false });
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [estimatedEndTime]);

  const handleReload = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#f1f3f9] flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Subtle glowing background orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[300px] h-[250px] bg-amber-500/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Top Brand Logo */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 py-2">
        <Logo size="sm" showSlogan={false} />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>System Maintenance</span>
        </div>
      </header>

      {/* Center Main Card */}
      <main className="w-full max-w-2xl my-auto z-10 flex flex-col items-center text-center py-8 sm:py-12">
        {/* Animated Maintenance Icon with Glowing Rings */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-[#1f243d] to-[#121528] border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-2xl shadow-amber-950/40">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 animate-[spin_6s_linear_infinite]" />
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <span>Hệ thống đang tạm bảo trì để nâng cấp</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight max-w-xl leading-tight sm:leading-snug">
          {title}
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-[#939bb4] max-w-lg mt-4 leading-relaxed">
          {message}
        </p>

        {/* Countdown & Schedule Card if available */}
        {estimatedEndTime && (
          <div className="mt-8 w-full max-w-md p-5 rounded-2xl bg-[#141829]/80 border border-[#272e4d] backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-[#939bb4]">
              <span className="flex items-center gap-1.5 font-semibold text-[#9cb1ff]">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Thời gian dự kiến hoàn thành:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {new Date(estimatedEndTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {new Date(estimatedEndTime).toLocaleDateString("vi-VN")}
              </span>
            </div>

            {timeLeft && !timeLeft.isPast && (
              <div className="pt-2 border-t border-[#272e4d] flex items-center justify-center gap-3 font-mono">
                <div className="flex flex-col items-center bg-[#0b0e1c] px-3 py-1.5 rounded-xl border border-white/5 min-w-[56px]">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-[#939bb4] uppercase tracking-wider">
                    Giờ
                  </span>
                </div>
                <span className="text-xl font-bold text-amber-500/60">:</span>
                <div className="flex flex-col items-center bg-[#0b0e1c] px-3 py-1.5 rounded-xl border border-white/5 min-w-[56px]">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-[#939bb4] uppercase tracking-wider">
                    Phút
                  </span>
                </div>
                <span className="text-xl font-bold text-amber-500/60">:</span>
                <div className="flex flex-col items-center bg-[#0b0e1c] px-3 py-1.5 rounded-xl border border-white/5 min-w-[56px]">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-[#939bb4] uppercase tracking-wider">
                    Giây
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4f5fd8] to-[#6366f1] hover:from-[#5a6be8] hover:to-[#7073f8] text-white text-sm font-bold shadow-lg shadow-indigo-900/40 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>
              {isRefreshing ? "Đang kiểm tra..." : "Kiểm tra lại hệ thống"}
            </span>
          </button>
        </div>
      </main>

      {/* Footer with Administrator Link */}
      <footer className="w-full max-w-4xl pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#67708a] z-10">
        <p>© {new Date().getFullYear()} LexiFlash. Mọi quyền được bảo lưu.</p>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-[#939bb4] hover:text-white transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Đăng nhập Quản trị viên</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default MaintenancePage;
