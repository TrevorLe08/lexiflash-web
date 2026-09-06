import React, { useState, useEffect } from "react";
import { BannerNotificationConfig, BannerColor } from "../../../types/system.types";
import { BANNER_COLOR_MAP } from "../../../components/layout/bannerColors";
import { Button } from "../../../components/common/Button";
import {
  Megaphone,
  Palette,
  RotateCcw,
  Save,
  Eye,
  Check,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";

export const COLOR_PRESETS: Array<{
  id: BannerColor;
  label: string;
  sub: string;
  previewClass: string;
}> = [
  {
    id: "red",
    label: "Đỏ",
    sub: "Bảo trì / Cảnh báo khẩn cấp",
    previewClass: "from-rose-700 via-red-600 to-rose-700",
  },
  {
    id: "amber",
    label: "Vàng",
    sub: "Lưu ý quan trọng / Nhắc nhở",
    previewClass: "from-amber-600 via-orange-600 to-amber-700",
  },
  {
    id: "emerald",
    label: "Xanh lá",
    sub: "Sự kiện / Tin vui / Khuyến mãi",
    previewClass: "from-emerald-600 via-teal-600 to-emerald-700",
  },
  {
    id: "blue",
    label: "Xanh dương",
    sub: "Thông tin chung / Cập nhật hệ thống",
    previewClass: "from-blue-600 via-indigo-600 to-blue-700",
  },
  {
    id: "purple",
    label: "Tím",
    sub: "Ưu đãi VIP / Sự kiện đặc quyền",
    previewClass: "from-purple-700 via-fuchsia-600 to-purple-700",
  },
  {
    id: "cyan",
    label: "Xanh ngọc",
    sub: "Công nghệ AI / Tính năng mới",
    previewClass: "from-cyan-600 via-sky-600 to-blue-600",
  },
  {
    id: "dark",
    label: "Tối giản",
    sub: "Dark-mode thanh lịch & tinh tế",
    previewClass: "from-[#171b2e] via-[#222845] to-[#171b2e]",
  },
];

export const EMOJI_QUICK_LIST = ["🔥", "📢", "🚀", "✨", "⚡", "🎉", "💎", "⚠️", "🔔"];

export interface AdminBannerTabProps {
  banner: BannerNotificationConfig | null;
  onSave: (
    data: Omit<BannerNotificationConfig, "id" | "updatedAt">,
  ) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

export const AdminBannerTab: React.FC<AdminBannerTabProps> = React.memo(
  ({ banner, onSave, isLoading, isSaving }) => {
    const [isEnabled, setIsEnabled] = useState(banner?.isEnabled ?? false);
    const [message, setMessage] = useState(banner?.message ?? "");
    const [color, setColor] = useState<BannerColor>(banner?.color ?? "blue");
    const [linkUrl, setLinkUrl] = useState(banner?.linkUrl ?? "");
    const [linkText, setLinkText] = useState(banner?.linkText ?? "");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
      if (banner) {
        setIsEnabled(banner.isEnabled);
        setMessage(banner.message || "");
        setColor(banner.color || "blue");
        setLinkUrl(banner.linkUrl || "");
        setLinkText(banner.linkText || "");
      }
    }, [banner]);

    const handleEmojiClick = (emoji: string) => {
      setMessage((prev) => (prev ? `${prev} ${emoji}` : emoji));
      setValidationError(null);
    };

    const handleReset = () => {
      setIsEnabled(false);
      setMessage("");
      setColor("blue");
      setLinkUrl("");
      setLinkText("");
      setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isEnabled && !message.trim()) {
        setValidationError(
          "Vui lòng nhập nội dung thông báo khi đang bật hiển thị.",
        );
        return;
      }
      setValidationError(null);
      await onSave({
        isEnabled,
        message: message.trim(),
        color,
        linkUrl: linkUrl.trim(),
        linkText: linkText.trim(),
      });
    };

    const activeStyle = BANNER_COLOR_MAP[color] || BANNER_COLOR_MAP.blue;

    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[#9cb1ff] text-xs font-bold uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Banner Thông Báo Đầu Trang (Top Notification Banner)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Tùy chỉnh thông báo xuất hiện ở đầu website
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] max-w-2xl">
                Thông báo sẽ hiển thị ở vị trí cao nhất trên toàn bộ website khi
                người dùng truy cập. Người dùng có thể nhấn nút "X" để tắt (hệ
                thống sẽ ghi nhớ không hiển thị lại cho đến khi có thông báo
                mới).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={handleReset}
                icon={<RotateCcw className="w-4 h-4 text-[#939bb4]" />}
                className="cursor-pointer"
              >
                Làm mới
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={isSaving || isLoading}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {isSaving ? "Đang lưu..." : "Lưu thông báo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-[#0f111a] border border-[#2e3856] rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>Xem trước giao diện (Live Website Preview)</span>
            </div>
            {isEnabled ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Đang bật hiển thị
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#939bb4] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Đang tắt (Ẩn)
              </span>
            )}
          </div>

          {/* Rendered Preview Box */}
          <div className="p-1 rounded-2xl border border-dashed border-[#2e3856] bg-[#0a092d]">
            <div
              className={`rounded-xl py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 overflow-hidden select-none ${activeStyle.container}`}
            >
              {/* Fixed Left Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activeStyle.icon}
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${activeStyle.badge}`}
                >
                  Thông báo
                </span>
                <span className="w-px h-3.5 bg-white/25 mx-1 hidden sm:inline-block" />
              </div>

              {/* Marquee Running Text */}
              <div
                className="overflow-hidden relative flex-1 min-w-0 flex items-center"
                title="Chạm hoặc rê chuột để dừng chữ chạy"
              >
                <div
                  className="animate-marquee inline-flex items-center gap-6 hover:[animation-play-state:paused]"
                  style={{
                    animationDuration: `${Math.max(
                      16,
                      Math.min(45, Math.round((message.length || 30) * 0.3)),
                    )}s`,
                  }}
                >
                  <span className="font-semibold tracking-wide drop-shadow-xs whitespace-nowrap">
                    {message.trim() || (
                      <span className="opacity-75 italic font-normal">
                        Nội dung thông báo sẽ chạy chữ từ phải sang trái như thế này...
                      </span>
                    )}
                  </span>
                  {linkUrl && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${activeStyle.button}`}
                    >
                      <span>{linkText || "Khám phá ngay"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button Preview */}
              <button
                type="button"
                className="p-1 rounded-full hover:bg-black/20 text-white/80 shrink-0 cursor-default"
                title="Nút đóng của người dùng"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Form Grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column: Switch, Message & Action Link (7 cols) */}
          <div className="lg:col-span-7 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-[#2e3856] pb-3">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span>Nội Dung & Trạng Thái</span>
            </h3>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a092d] border border-[#2e3856]">
              <div>
                <label
                  htmlFor="enable-banner-switch"
                  className="font-bold text-white text-sm cursor-pointer block"
                >
                  Bật thông báo đầu trang
                </label>
                <p className="text-xs text-[#939bb4] mt-0.5">
                  Khi bật, người dùng truy cập website sẽ thấy banner này trên
                  cùng
                </p>
              </div>
              <button
                type="button"
                id="enable-banner-switch"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? "bg-emerald-500" : "bg-[#2e3856]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Nội dung thông báo</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-xs text-[#939bb4] font-mono">
                  {message.length} / 500 ký tự
                </span>
              </div>

              {/* Emoji quick bar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-1">
                <span className="text-[11px] text-[#939bb4] mr-1">
                  Chèn biểu tượng:
                </span>
                {EMOJI_QUICK_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="px-2 py-0.5 rounded-lg bg-[#0a092d] border border-[#2e3856] hover:border-cyan-400 text-xs hover:scale-110 transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                maxLength={500}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ví dụ: 🎉 Chào mừng năm học mới! Giảm giá 50% gói VIP năm cho tất cả thành viên..."
                className={`w-full p-3 rounded-xl bg-[#0a092d] border text-sm text-white placeholder-[#545d78] focus:outline-none transition-colors ${
                  validationError
                    ? "border-rose-500 focus:border-rose-400"
                    : "border-[#2e3856] focus:border-cyan-400"
                }`}
              />
              {validationError && (
                <p className="text-xs text-rose-400 font-semibold">
                  {validationError}
                </p>
              )}
            </div>

            {/* Optional Action Link */}
            <div className="space-y-4 pt-2 border-t border-[#2e3856]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <LinkIcon className="w-4 h-4 text-[#9cb1ff]" />
                <span>Nút bấm điều hướng (Tùy chọn)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#939bb4] font-semibold">
                    Đường dẫn liên kết (URL / Đường dẫn)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Ví dụ: /vip hoặc /study-room"
                    className="w-full px-3 py-2 rounded-xl bg-[#0a092d] border border-[#2e3856] text-sm text-white placeholder-[#545d78] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#939bb4] font-semibold">
                    Nhãn nút hành động
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Ví dụ: Xem ngay, Nâng cấp VIP"
                    className="w-full px-3 py-2 rounded-xl bg-[#0a092d] border border-[#2e3856] text-sm text-white placeholder-[#545d78] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Color Swatches & Presets (5 cols) */}
          <div className="lg:col-span-5 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-[#2e3856] pb-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Bảng Màu Thông Báo ({COLOR_PRESETS.length} màu)</span>
            </h3>

            <p className="text-xs text-[#939bb4]">
              Chọn tông màu phù hợp với mục đích thông báo để tạo ấn tượng tốt
              nhất:
            </p>

            <div className="space-y-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = color === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setColor(preset.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#252b48] border-cyan-400 shadow-md shadow-cyan-900/30 scale-[1.01]"
                        : "bg-[#0a092d] border-[#2e3856] hover:bg-[#15192e] hover:border-[#4257B2]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${preset.previewClass} border border-white/20 shadow-sm shrink-0 flex items-center justify-center`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">
                            {preset.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#939bb4] truncate">
                          {preset.sub}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500 text-black"
                          : "border-[#4b5580] bg-[#1a1d36]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    );
  },
);
