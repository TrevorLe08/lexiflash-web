import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Bot,
  Copy,
} from "lucide-react";
import { UserRole } from "../../types";
import { useTranslation } from "../../i18n";

export const VIPPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [selectedPlan, setSelectedPlan] = useState<"1_MONTH" | "1_YEAR" | null>(
    null,
  );
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const isSystemAdmin = user?.role === UserRole.ADMIN;
  const isVipActive = Boolean(
    isSystemAdmin ||
    user?.isVip ||
    (user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now()),
  );

  const currentActivePlan = isSystemAdmin
    ? "ADMIN"
    : isVipActive
      ? user?.vipPlan || "1_MONTH"
      : "FREE";

  const handleSelectPlan = (plan: "1_MONTH" | "1_YEAR") => {
    if (!user) {
      dispatch(
        addToast({
          message: "Vui lòng đăng nhập để nâng cấp tài khoản VIP!",
          type: "info",
        }),
      );
      navigate("/login");
      return;
    }
    setSelectedPlan(plan);
    setContactModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    dispatch(
      addToast({
        message: `Đã sao chép ${label}!`,
        type: "success",
      }),
    );
  };

  const transferSyntax = user
    ? `VIP ${user.username} ${selectedPlan === "1_YEAR" ? "1NAM" : "1THANG"}`
    : "VIP [USERNAME]";

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase shadow-lg shadow-amber-500/5 animate-pulse">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>
            {t("vip.badgeTitle", undefined, "Nâng Cấp Tài Khoản VIP")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("vip.heroTitle", undefined, "Mở Khóa Giới Hạn, Bứt Phá")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            {t("vip.heroHighlight", undefined, "Tiếng Anh Cùng AI")}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#939bb4] max-w-2xl mx-auto leading-relaxed">
          {t(
            "vip.heroDesc",
            undefined,
            "Tạo không giới hạn học phần, học từ vựng siêu tốc với trí tuệ nhân tạo AI và tận hưởng mọi đặc quyền cao cấp nhất.",
          )}
        </p>

        {/* Current User Status Alert */}
        {user && (
          <div className="inline-block mt-2">
            {isSystemAdmin ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold shadow-sm shadow-purple-500/10">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>
                  Bạn là <strong>Quản trị viên (ADMIN)</strong>: Sở hữu toàn bộ
                  tính năng VIP vĩnh viễn (Không giới hạn thứ gì)!
                </span>
              </div>
            ) : isVipActive ? (
              user.vipPlan === "1_YEAR" ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm font-semibold shadow-sm shadow-cyan-500/10">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>
                    Bạn đang là <strong>Thành viên VIP Diamond Elite</strong>{" "}
                    (Gói 1 Năm • Hạn dùng:{" "}
                    {user.vipExpiresAt
                      ? new Date(user.vipExpiresAt).toLocaleDateString("vi-VN")
                      : "Đang hoạt động"}
                    )
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-semibold shadow-sm shadow-amber-500/10">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>
                    Bạn đang là <strong>Thành viên VIP Gold</strong> (Gói 1
                    Tháng • Hạn dùng:{" "}
                    {user.vipExpiresAt
                      ? new Date(user.vipExpiresAt).toLocaleDateString("vi-VN")
                      : "Đang hoạt động"}
                    )
                  </span>
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1a1d36] border border-[#2e3856] text-[#939bb4] text-xs">
                <span>
                  Trạng thái hiện tại: <strong>Gói Miễn Phí</strong> (Giới hạn
                  300 từ, 20 lỗi Mistake Bank & không có AI)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
        {/* 1. FREE PLAN */}
        <div
          className={`bg-[#161a29] border ${currentActivePlan === "FREE" ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : "border-[#262e48]"} rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative transition-all duration-300 hover:border-[#4257B2]/60`}
        >
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#939bb4] block mb-1">
                {t("vip.freePlanBadge", undefined, "Gói Cơ Bản")}
              </span>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-2xl font-black text-white whitespace-nowrap">
                  {t("vip.freePlanTitle", undefined, "Miễn Phí")}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#262e48] text-[#939bb4] font-bold tracking-wider shrink-0">
                  STARTER
                </span>
              </div>
              <p className="text-xs text-[#939bb4] min-h-[36px] pt-1 leading-relaxed">
                {t(
                  "vip.freePlanDesc",
                  undefined,
                  "Dành cho người mới bắt đầu học tiếng Anh cơ bản.",
                )}
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl font-black text-white">0đ</span>
                <span className="text-xs text-[#939bb4] whitespace-nowrap">
                  {t("vip.freePerpetual", undefined, "/ vĩnh viễn")}
                </span>
              </div>
              <p className="text-[11px] text-[#586380] font-semibold pt-1 min-h-[22px]">
                Miễn phí trọn đời cho mọi tài khoản
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#262e48]/80 text-xs">
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Học SRS: <strong>Không giới hạn</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Từ vựng: <strong>Tối đa 300 từ</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Mistake Bank: <strong>Tối đa 20 lỗi sai</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Study Group: <strong>Tối đa 5 nhóm</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {t(
                    "vip.featModes",
                    undefined,
                    "5 Chế độ học (Flashcard, Test, Match...)",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#6c7289]">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="line-through">
                  {t(
                    "vip.featAiGen",
                    undefined,
                    "Tạo học phần tự động bằng AI",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#6c7289]">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="line-through">
                  {t(
                    "vip.featAiExplain",
                    undefined,
                    "Giải nghĩa từ vựng với AI",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#6c7289]">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="line-through">
                  {t("vip.featBadge", undefined, "Huy hiệu VIP Vương miện")}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {currentActivePlan === "FREE" ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center opacity-70"
                disabled
              >
                {t("vip.currentPlan", undefined, "Gói Hiện Tại")}
              </Button>
            ) : (
              <div className="text-center py-2.5 text-xs text-[#939bb4]">
                {t("vip.freePlanTitle", undefined, "Gói Miễn Phí")}
              </div>
            )}
          </div>
        </div>

        {/* 2. VIP 1 MONTH */}
        <div
          className={`bg-[#171b2d] border ${currentActivePlan === "1_MONTH" ? "border-amber-400 ring-2 ring-amber-400/20" : "border-amber-500/40"} rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative transition-all duration-300 hover:border-amber-400 hover:shadow-amber-500/10 hover:-translate-y-1`}
        >
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                {t("vip.vipMonthBadge", undefined, "Gói Linh Hoạt")}
              </span>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-2xl font-black text-white whitespace-nowrap">
                  {t("vip.vipMonthTitle", undefined, "VIP 1 Tháng")}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black tracking-wider">
                    GOLD
                  </span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-[#939bb4] min-h-[36px] pt-1 leading-relaxed">
                {t(
                  "vip.vipMonthDesc",
                  undefined,
                  "Thử nghiệm toàn bộ sức mạnh AI & tạo thẻ không giới hạn trong 30 ngày.",
                )}
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl font-black text-amber-300">
                  {t("vip.vipMonthPrice", undefined, "49.000đ")}
                </span>
                <span className="text-xs text-[#939bb4] whitespace-nowrap">
                  {t("vip.vipMonthDuration", undefined, "/ 30 ngày")}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-semibold pt-1 min-h-[22px]">
                Linh hoạt gia hạn theo từng tháng
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#262e48]/80 text-xs">
              <div className="flex items-center gap-2.5 text-white font-medium">
                <InfinityIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Học SRS: <strong>KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <InfinityIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Từ vựng: <strong>KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <InfinityIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Mistake Bank: <strong>KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  AI Generator:{" "}
                  <strong className="text-amber-300">
                    20 lượt / ngày
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  AI Explainer: <strong>KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <InfinityIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Study Group:{" "}
                  <strong>KHÔNG GIỚI HẠN + Chia sẻ riêng tư</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Huy hiệu VIP Gold Member trên Profile & Nhóm 👑
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#d9dde8]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {t(
                    "vip.featSupport",
                    undefined,
                    "Hỗ trợ kỹ thuật ưu tiên từ Quản trị viên",
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {currentActivePlan === "ADMIN" ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center border-purple-500/50 text-purple-300 font-bold bg-purple-500/10"
                disabled
                icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
              >
                Quản trị viên (Không giới hạn)
              </Button>
            ) : currentActivePlan === "1_MONTH" ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center border-amber-500/50 text-amber-300 font-bold bg-amber-500/10"
                disabled
                icon={<Crown className="w-4 h-4 text-amber-400" />}
              >
                {t("vip.currentPlan", undefined, "Gói Hiện Tại")}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleSelectPlan("1_MONTH")}
                className="w-full justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black shadow-lg shadow-amber-500/20"
                icon={<Zap className="w-4 h-4" />}
              >
                {t("vip.vipMonthBtn", undefined, "Nâng Cấp 1 Tháng")}
              </Button>
            )}
          </div>
        </div>

        {/* 3. VIP 1 YEAR (BEST VALUE - DIAMOND ELITE) */}
        <div
          className={`bg-gradient-to-b from-[#13233c] via-[#0d1a2e] to-[#091220] border-2 ${
            currentActivePlan === "1_YEAR"
              ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-500/25"
              : currentActivePlan === "ADMIN"
                ? "border-purple-400 ring-2 ring-purple-400/40"
                : "border-cyan-400/80 hover:border-cyan-300 shadow-cyan-500/20"
          } rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-cyan-950/40 relative transition-all duration-300 hover:-translate-y-1.5`}
        >
          {/* Floating Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30 z-10">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>
              {t(
                "vip.vipYearBestValue",
                undefined,
                "Tiết Kiệm 32% • Phổ Biến Nhất",
              )}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Gói Tiết Kiệm Nhất
              </span>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-2xl font-black text-white whitespace-nowrap">
                  {t("vip.vipYearTitle", undefined, "VIP 1 Năm")}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black tracking-wider">
                    DIAMOND
                  </span>
                  <Sparkles className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                </div>
              </div>
              <p className="text-xs text-[#d9dde8] min-h-[36px] pt-1 leading-relaxed">
                {t(
                  "vip.vipYearDesc",
                  undefined,
                  "Cam kết dài hạn cho hành trình làm chủ tiếng Anh đỉnh cao.",
                )}
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl font-black text-cyan-300">
                  {t("vip.vipYearPrice", undefined, "399.000đ")}
                </span>
                <span className="text-xs text-[#939bb4] whitespace-nowrap">
                  {t("vip.vipYearDuration", undefined, "/ 365 ngày")}
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-semibold pt-1 min-h-[22px]">
                {t(
                  "vip.vipYearSubprice",
                  undefined,
                  "Chỉ ~33.000đ / tháng (Rẻ hơn 32%)",
                )}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-cyan-400/30 text-xs">
              <div className="flex items-center gap-2.5 text-white font-bold">
                <InfinityIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  Học SRS:{" "}
                  <strong className="text-cyan-300">KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <InfinityIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  Từ vựng:{" "}
                  <strong className="text-cyan-300">KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <InfinityIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  Mistake Bank:{" "}
                  <strong className="text-cyan-300">KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <Bot className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  AI Generator:{" "}
                  <strong className="text-cyan-300">
                    40 lượt / ngày
                  </strong>{" "}
                  <span className="text-[10px] text-cyan-300 font-normal">
                    (x2 quota)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  AI Explainer:{" "}
                  <strong className="text-cyan-300">KHÔNG GIỚI HẠN</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <InfinityIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  Study Group:{" "}
                  <strong className="text-cyan-300">
                    KHÔNG GIỚI HẠN + Riêng tư
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Huy hiệu VIP Diamond Elite đặc biệt 💎
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-bold">
                <Zap className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  {t(
                    "vip.featBetaAccess",
                    undefined,
                    "Trải nghiệm sớm tính năng & Chế độ Beta 🚀",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {t(
                    "vip.featSupport",
                    undefined,
                    "Hỗ trợ kỹ thuật ưu tiên từ Quản trị viên",
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {currentActivePlan === "ADMIN" ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center border-purple-500/50 text-purple-300 font-bold bg-purple-500/10"
                disabled
                icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
              >
                Quản trị viên (Không giới hạn)
              </Button>
            ) : currentActivePlan === "1_YEAR" ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10"
                disabled
                icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              >
                {t("vip.currentPlan", undefined, "Gói Hiện Tại (Diamond)")}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleSelectPlan("1_YEAR")}
                className="w-full justify-center bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-600 text-black font-black text-sm shadow-xl shadow-cyan-500/30"
                icon={<Sparkles className="w-4 h-4 fill-black" />}
              >
                {t("vip.vipYearBtn", undefined, "Nâng Cấp 1 Năm")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>
            {t(
              "vip.compareTitle",
              undefined,
              "So Sánh Chi Tiết Quyền Lợi Gói Học",
            )}
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2e3856] text-[#939bb4] uppercase tracking-wider font-bold">
                <th className="p-3.5">
                  {t("vip.featureCol", undefined, "Tính Năng")}
                </th>
                <th className="p-3.5 text-center">
                  {t("vip.freeCol", undefined, "Gói Miễn Phí")}
                </th>
                <th className="p-3.5 text-center text-amber-400">
                  {t("vip.colVipMonth", undefined, "VIP 1 Tháng")}
                </th>
                <th className="p-3.5 text-center text-cyan-300 bg-cyan-500/5 rounded-t-xl border-x border-t border-cyan-500/20">
                  {t("vip.colVipYear", undefined, "VIP 1 Năm (Đặc Quyền 💎)")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3856]/60 text-[#d9dde8]">
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t("vip.featSrs", undefined, "Học Spaced Repetition (SRS)")}
                </td>
                <td className="p-3.5 text-center text-emerald-400 font-bold">
                  {t("vip.featSrsVal", undefined, "Không giới hạn")}
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400">
                  {t("vip.featSrsVal", undefined, "Không giới hạn")}
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t("vip.featSrsVal", undefined, "Không giới hạn")}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t("vip.featCards", undefined, "Số lượng từ vựng tối đa")}
                </td>
                <td className="p-3.5 text-center text-[#939bb4]">
                  {t("vip.featCardsFree", undefined, "Tối đa 300 từ")}
                </td>
                <td className="p-3.5 text-center font-bold text-amber-300">
                  {t("vip.featCardsVip", undefined, "Không giới hạn (∞)")}
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t("vip.featCardsVip", undefined, "Không giới hạn (∞)")}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t(
                    "vip.featMistakes",
                    undefined,
                    "Mistake Bank (Ngân hàng lỗi sai)",
                  )}
                </td>
                <td className="p-3.5 text-center text-[#939bb4]">
                  {t("vip.featMistakesFree", undefined, "Tối đa 20 lỗi")}
                </td>
                <td className="p-3.5 text-center font-bold text-amber-300">
                  {t("vip.featMistakesVip", undefined, "Không giới hạn (∞)")}
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t("vip.featMistakesVip", undefined, "Không giới hạn (∞)")}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t(
                    "vip.featAiGen",
                    undefined,
                    "Tạo học phần tự động bằng AI",
                  )}
                </td>
                <td className="p-3.5 text-center text-[#6c7289]">
                  <X className="w-4 h-4 text-rose-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-amber-400">
                  {t(
                    "vip.featAiGenVipMonth",
                    undefined,
                    "20 lần / ngày (~600/tháng)",
                  )}
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t(
                    "vip.featAiGenVipYear",
                    undefined,
                    "40 lần / ngày (~1.200/tháng)",
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t(
                    "vip.featAiExplain",
                    undefined,
                    "AI Word Explainer (Giải thích từ)",
                  )}
                </td>
                <td className="p-3.5 text-center text-[#6c7289]">
                  <X className="w-4 h-4 text-rose-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400">
                  {t("vip.featAiExplainVip", undefined, "Không giới hạn")}
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t("vip.featAiExplainVip", undefined, "Không giới hạn")}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t("vip.featGroups", undefined, "Study Group (Nhóm học tập)")}
                </td>
                <td className="p-3.5 text-center text-[#939bb4]">
                  {t(
                    "vip.featGroupsFree",
                    undefined,
                    "Tổng 5 nhóm (tạo tối đa 2 nhóm)",
                  )}
                </td>
                <td className="p-3.5 text-center font-bold text-amber-300">
                  {t(
                    "vip.featGroupsVip",
                    undefined,
                    "Không giới hạn + Chia sẻ riêng tư",
                  )}
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  {t(
                    "vip.featGroupsVip",
                    undefined,
                    "Không giới hạn + Chia sẻ riêng tư",
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t(
                    "vip.featModes",
                    undefined,
                    "5 Chế độ học (Flashcard, Test, Match...)",
                  )}
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400 bg-cyan-500/5 border-x border-cyan-500/20">
                  <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t("vip.featBadge", undefined, "Huy hiệu VIP Profile & Nhóm")}
                </td>
                <td className="p-3.5 text-center text-[#6c7289]">
                  <X className="w-4 h-4 text-rose-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-amber-400">
                  👑 VIP Gold
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  💎 VIP Diamond
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t(
                    "vip.featBetaAccess",
                    undefined,
                    "Trải nghiệm sớm tính năng Beta",
                  )}
                </td>
                <td className="p-3.5 text-center text-[#6c7289]">
                  <X className="w-4 h-4 text-rose-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center text-[#6c7289]">
                  <X className="w-4 h-4 text-rose-400 mx-auto" />
                </td>
                <td className="p-3.5 text-center font-bold text-cyan-300 bg-cyan-500/5 border-x border-cyan-500/20">
                  <Check className="w-4 h-4 text-cyan-300 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">
                  {t("vip.featSupport", undefined, "Hỗ trợ kỹ thuật")}
                </td>
                <td className="p-3.5 text-center text-[#939bb4]">Cộng đồng</td>
                <td className="p-3.5 text-center font-bold text-emerald-400">
                  Ưu tiên Admin
                </td>
                <td className="p-3.5 text-center font-bold text-emerald-400 bg-cyan-500/5 border-x border-cyan-500/20">
                  Ưu tiên Admin
                </td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="p-3.5 font-black text-white">
                  Chi phí tương đương
                </td>
                <td className="p-3.5 text-center font-mono font-bold text-[#8e98b0]">
                  0đ
                </td>
                <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                  49.000đ / tháng
                </td>
                <td className="p-3.5 text-center font-mono font-black text-cyan-300 bg-cyan-500/5 border-x border-b border-cyan-500/20">
                  ~33.000đ / tháng (-32%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONTACT ADMIN MODAL --- */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={t(
          "vip.modalTitle",
          undefined,
          "Liên hệ Admin để kích hoạt gói VIP",
        )}
      >
        <div className="space-y-3.5 sm:space-y-5 pt-1">
          {/* Plan Summary Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase text-amber-400">
                {t("vip.modalSubtitle", undefined, "Gói Nâng Cấp Đã Chọn")}
              </span>
              <h4 className="text-sm sm:text-base font-black text-white">
                {selectedPlan === "1_YEAR"
                  ? `🌟 ${t("vip.vipYearTitle", undefined, "Gói VIP 1 Năm")} (365 ${t("sidebar.days", undefined, "Ngày")})`
                  : `👑 ${t("vip.vipMonthTitle", undefined, "Gói VIP 1 Tháng")} (30 ${t("sidebar.days", undefined, "Ngày")})`}
              </h4>
              <p className="text-xs text-amber-300/90 font-bold">
                {t("vip.vipMonthPrice", undefined, "Số tiền:")}{" "}
                {selectedPlan === "1_YEAR" ? "399.000 VNĐ" : "49.000 VNĐ"}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Account Details */}
          {user && (
            <div className="bg-[#0a092d] border border-[#2e3856] rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#939bb4]">
                <span>
                  {t("vip.modalYourAccount", undefined, "Tài khoản của bạn:")}
                </span>
                <strong className="text-white">
                  {user.name} (@{user.username})
                </strong>
              </div>
              <div className="flex justify-between text-[#939bb4]">
                <span>
                  {t("vip.modalRegisteredEmail", undefined, "Email đăng ký:")}
                </span>
                <strong className="text-white">{user.email}</strong>
              </div>
            </div>
          )}

          {/* Step Instructions */}
          <div className="space-y-2">
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#939bb4]">
              {t("vip.modalStepsTitle", undefined, "Các bước kích hoạt nhanh:")}
            </h5>
            <ol className="space-y-1.5 sm:space-y-2 text-xs text-[#d9dde8] list-decimal list-inside leading-relaxed">
              <li>
                {t(
                  "vip.modalStep1",
                  undefined,
                  "Chuyển khoản theo thông tin bên dưới hoặc liên hệ trực tiếp với Admin.",
                )}
              </li>
              <li>
                {t(
                  "vip.modalStep2",
                  undefined,
                  "Sao chép Cú pháp chuyển khoản để Admin kích hoạt ngay trong 1 - 5 phút.",
                )}
              </li>
              <li>
                {t(
                  "vip.modalStep3",
                  undefined,
                  "Tài khoản của bạn sẽ tự động mở khóa toàn bộ quyền lợi VIP ngay khi duyệt!",
                )}
              </li>
            </ol>
          </div>

          {/* Bank / Contact Info Box */}
          <div className="bg-[#0a092d] border border-[#2e3856] rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#2e3856]/60">
              <span className="text-[#939bb4]">
                {t("vip.modalBankName", undefined, "Ngân hàng:")}
              </span>
              <strong className="text-white">Banking</strong>
            </div>

            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#2e3856]/60">
              <span className="text-[#939bb4]">
                {t("vip.modalAccountNo", undefined, "Số tài khoản:")}
              </span>
              <span className="font-mono font-bold text-amber-300 flex items-center gap-2">
                <span>XXXX XXXX XXXX</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      "109881089021",
                      t("vip.modalAccountNo", undefined, "Số tài khoản"),
                    )
                  }
                  className="p-1 hover:text-white text-[#939bb4] cursor-pointer"
                  title="Copy STK"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#2e3856]/60">
              <span className="text-[#939bb4]">
                {t("vip.modalAccountName", undefined, "Chủ tài khoản:")}
              </span>
              <strong className="text-white">LexiFlash Support</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#939bb4]">
                {t("vip.modalSyntax", undefined, "Cú pháp chuyển khoản:")}
              </span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-2">
                <span>{transferSyntax}</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      transferSyntax,
                      t("vip.modalSyntax", undefined, "Cú pháp"),
                    )
                  }
                  className="p-1 hover:text-white text-[#939bb4] cursor-pointer"
                  title="Copy cú pháp"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          </div>

          {/* Direct Support Channels */}
          <div className="p-2.5 sm:p-3 bg-[#1a1d36] rounded-xl border border-[#2e3856] text-xs text-[#939bb4] space-y-1">
            <p className="font-semibold text-white">
              {t(
                "vip.modalHotline",
                undefined,
                "Kênh liên hệ hỗ trợ trực tiếp Admin:",
              )}
            </p>
            <p>• Zalo / Hotline: 0772 656 047</p>
            <p>
              • Facebook:
              <Link to={"https://www.facebook.com/minhtrietle237"}>
                {" "}
                Trevor Le
              </Link>
            </p>
            <p>• Email: trietlegaming2306@gmail.com</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setContactModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("common.close", undefined, "Đóng")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                copyToClipboard(
                  transferSyntax,
                  t("vip.modalSyntax", undefined, "Cú pháp"),
                );
                setContactModalOpen(false);
              }}
              icon={<Copy className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {t("vip.modalCopyBtn", undefined, "Sao chép cú pháp & hoàn tất")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
