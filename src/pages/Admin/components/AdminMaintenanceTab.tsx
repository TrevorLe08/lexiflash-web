import React, { useState, useEffect } from "react";
import { MaintenanceConfig } from "../../../types/system.types";
import { Button } from "../../../components/common/Button";
import {
  Wrench,
  AlertTriangle,
  RotateCcw,
  Save,
  Eye,
  Clock,
  Calendar,
  Info,
} from "lucide-react";

export interface AdminMaintenanceTabProps {
  config: MaintenanceConfig | null;
  onSave: (data: Omit<MaintenanceConfig, "updatedAt">) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

export const AdminMaintenanceTab: React.FC<AdminMaintenanceTabProps> =
  React.memo(({ config, onSave, isLoading, isSaving }) => {
    const [isActive, setIsActive] = useState(config?.isActive ?? false);
    const [title, setTitle] = useState(
      config?.title ?? "Hệ thống đang được bảo trì và nâng cấp",
    );
    const [message, setMessage] = useState(
      config?.message ??
        "LexiFlash đang được cập nhật và tối ưu hóa hệ thống để mang lại trải nghiệm học tập tốt nhất. Xin vui lòng quay lại sau ít phút!",
    );
    const [estimatedEndTime, setEstimatedEndTime] = useState(
      config?.estimatedEndTime
        ? new Date(config.estimatedEndTime).toISOString().slice(0, 16)
        : "",
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
      if (config) {
        setIsActive(config.isActive);
        setTitle(config.title || "Hệ thống đang được bảo trì và nâng cấp");
        setMessage(
          config.message ||
            "LexiFlash đang được cập nhật và tối ưu hóa hệ thống để mang lại trải nghiệm học tập tốt nhất. Xin vui lòng quay lại sau ít phút!",
        );
        setEstimatedEndTime(
          config.estimatedEndTime
            ? new Date(config.estimatedEndTime).toISOString().slice(0, 16)
            : "",
        );
      }
    }, [config]);

    const handleAddMinutes = (minutes: number) => {
      const target = new Date(Date.now() + minutes * 60 * 1000);
      // Format to YYYY-MM-DDTHH:mm in local time
      const offsetMs = target.getTimezoneOffset() * 60000;
      const localTarget = new Date(target.getTime() - offsetMs);
      setEstimatedEndTime(localTarget.toISOString().slice(0, 16));
    };

    const handleClearEndTime = () => {
      setEstimatedEndTime("");
    };

    const handleReset = () => {
      setIsActive(false);
      setTitle("Hệ thống đang được bảo trì và nâng cấp");
      setMessage(
        "LexiFlash đang được cập nhật và tối ưu hóa hệ thống để mang lại trải nghiệm học tập tốt nhất. Xin vui lòng quay lại sau ít phút!",
      );
      setEstimatedEndTime("");
      setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isActive && !title.trim()) {
        setValidationError("Vui lòng nhập tiêu đề thông báo bảo trì.");
        return;
      }
      setValidationError(null);

      const endIso = estimatedEndTime
        ? new Date(estimatedEndTime).toISOString()
        : undefined;

      await onSave({
        isActive,
        title: title.trim(),
        message: message.trim(),
        estimatedEndTime: endIso,
      });
    };

    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Chế Độ Bảo Trì Hệ Thống (Maintenance Mode)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Quản lý trạng thái bảo trì toàn hệ thống
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] max-w-2xl">
                Khi kích hoạt, tất cả người dùng thông thường và khách vãng lai
                sẽ chỉ nhìn thấy màn hình bảo trì chuyên biệt (không có thanh
                điều hướng, menu hay các trang học). Quản trị viên (Admin) vẫn
                có thể đăng nhập và kiểm thử bình thường.
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
                Đặt lại mặc định
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={isSaving || isLoading}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-[#0f111a] border border-[#2e3856] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>
                Xem trước giao diện người dùng thấy (Live Maintenance Preview)
              </span>
            </div>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Đang bật chế độ bảo trì
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hệ thống hoạt động bình thường
              </span>
            )}
          </div>

          {/* Rendered Preview Box */}
          <div className="rounded-2xl border border-dashed border-[#2e3856] bg-[#0c0e17] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
              <Wrench className="w-8 h-8 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hệ thống đang bảo trì định kỳ</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white max-w-xl">
              {title.trim() || "Hệ thống đang được bảo trì và nâng cấp"}
            </h3>

            <p className="text-sm text-[#939bb4] max-w-lg mt-2 leading-relaxed">
              {message.trim() ||
                "LexiFlash đang được cập nhật và tối ưu hóa hệ thống để mang lại trải nghiệm học tập tốt nhất. Xin vui lòng quay lại sau ít phút!"}
            </p>

            {estimatedEndTime && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1d36] border border-[#2e3856] text-xs font-semibold text-[#9cb1ff]">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>
                  Dự kiến hoàn thành:{" "}
                  <strong className="text-white font-mono">
                    {new Date(estimatedEndTime).toLocaleString("vi-VN")}
                  </strong>
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#4f5fd8] text-white text-xs font-bold shadow-lg shadow-[#4f5fd8]/25 hover:bg-[#5a6be8] transition-all cursor-default"
              >
                Tải lại trang (F5)
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Form Grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column: Toggle & Texts (7 cols) */}
          <div className="lg:col-span-7 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-[#2e3856] pb-3">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Trạng Thái & Nội Dung Bảo Trì</span>
            </h3>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a092d] border border-[#2e3856]">
              <div>
                <label
                  htmlFor="enable-maintenance-switch"
                  className="font-bold text-white text-sm cursor-pointer block"
                >
                  Bật chế độ bảo trì toàn trang
                </label>
                <p className="text-xs text-[#939bb4] mt-0.5">
                  {isActive
                    ? "⚠️ Đang bật: Người dùng thông thường sẽ bị chuyển sang trang bảo trì"
                    : "Đang tắt: Người dùng có thể học tập và truy cập bình thường"}
                </p>
              </div>
              <button
                type="button"
                id="enable-maintenance-switch"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? "bg-rose-500" : "bg-[#2e3856]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Tiêu đề bảo trì</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ví dụ: Hệ thống đang được bảo trì và nâng cấp"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0a092d] border text-sm text-white placeholder-[#545d78] focus:outline-none transition-colors ${
                  validationError
                    ? "border-rose-500 focus:border-rose-400"
                    : "border-[#2e3856] focus:border-amber-400"
                }`}
              />
              {validationError && (
                <p className="text-xs text-rose-400 font-semibold">
                  {validationError}
                </p>
              )}
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-white">
                Nội dung chi tiết / Lý do
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả công việc nâng cấp hoặc gửi lời nhắn đến người học..."
                className="w-full p-3 rounded-xl bg-[#0a092d] border border-[#2e3856] text-sm text-white placeholder-[#545d78] focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Time Planning & Guidance (5 cols) */}
          <div className="lg:col-span-5 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-[#2e3856] pb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Thời Gian Dự Kiến Kết Thúc</span>
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#939bb4] block">
                Chọn mốc thời gian hoàn thành (Tùy chọn)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                  className="w-full bg-[#0a092d] text-white border border-[#2e3856] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors scheme-dark"
                />
              </div>

              {/* Quick addition buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#939bb4] block">
                  Cộng nhanh thời gian dự kiến:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMinutes(30)}
                    className="px-2.5 py-1 rounded-lg bg-[#0a092d] hover:bg-[#202547] text-[#9cb1ff] text-xs font-semibold border border-[#2e3856] hover:border-[#4257b2] transition-colors cursor-pointer"
                  >
                    +30 Phút
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMinutes(60)}
                    className="px-2.5 py-1 rounded-lg bg-[#0a092d] hover:bg-[#202547] text-[#9cb1ff] text-xs font-semibold border border-[#2e3856] hover:border-[#4257b2] transition-colors cursor-pointer"
                  >
                    +1 Giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMinutes(120)}
                    className="px-2.5 py-1 rounded-lg bg-[#0a092d] hover:bg-[#202547] text-[#9cb1ff] text-xs font-semibold border border-[#2e3856] hover:border-[#4257b2] transition-colors cursor-pointer"
                  >
                    +2 Giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMinutes(240)}
                    className="px-2.5 py-1 rounded-lg bg-[#0a092d] hover:bg-[#202547] text-[#9cb1ff] text-xs font-semibold border border-[#2e3856] hover:border-[#4257b2] transition-colors cursor-pointer"
                  >
                    +4 Giờ
                  </button>
                  {estimatedEndTime && (
                    <button
                      type="button"
                      onClick={handleClearEndTime}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      Xóa mốc giờ
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Policy Notice */}
            <div className="p-4 rounded-xl bg-[#0a092d] border border-[#2e3856] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Quyền hạn Quản Trị Viên</span>
              </div>
              <ul className="text-xs text-[#939bb4] space-y-1.5 list-disc list-inside">
                <li>
                  Admin vẫn có thể truy cập toàn bộ hệ thống để bảo trì, sửa lỗi
                  và kiểm tra chức năng.
                </li>
                <li>
                  Trang đăng nhập <code className="text-white">/login</code>{" "}
                  luôn mở cho tài khoản Admin đăng nhập khi cần.
                </li>
                <li>
                  Khi chế độ bảo trì bật, Admin sẽ thấy thanh cảnh báo màu cam ở
                  trên đầu website.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    );
  });
