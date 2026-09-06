import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setSidebarOpen, toggleLanguage } from "../../store/slices/uiSlice";
import {
  Home,
  Sparkles,
  BookOpen,
  Folder,
  Users,
  User,
  PlusCircle,
  X,
  Crown,
  Timer,
  ShieldCheck,
  LogIn,
  UserPlus,
  Globe,
  Volume2,
} from "lucide-react";
import { StreakBadge } from "../common/StreakBadge";
import { cn } from "../../utils/cn";
import { useTranslation } from "../../i18n";
import { UserRole } from "../../types";
import {
  getVoiceAccent,
  toggleVoiceAccent,
  subscribeVoiceAccent,
  VoiceAccent,
} from "../../utils/speech";

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dueReviews = useAppSelector((state) => state.study.dueReviews);
  const user = useAppSelector((state) => state.auth.user);
  const language = useAppSelector((state) => state.ui.language);
  const { t } = useTranslation();

  const [voiceAccent, setVoiceAccent] = useState<VoiceAccent>(getVoiceAccent());

  useEffect(() => {
    return subscribeVoiceAccent(setVoiceAccent);
  }, []);

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  const isVipUser = Boolean(
    user?.isVip ||
    (user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now()),
  );
  const isDiamondUser = isVipUser && user?.vipPlan === "1_YEAR";

  const navItems = [
    {
      to: "/",
      label: t("sidebar.home", undefined, "Home / Explore"),
      icon: Home,
    },
    {
      to: "/study-room",
      label: t("sidebar.studyRoom", undefined, "Study Room"),
      icon: Timer,
    },
    {
      to: "/vip",
      label: t("sidebar.vipUpgrade", undefined, "VIP Membership"),
      icon: Crown,
      isVipNav: true,
    },
    {
      to: "/reviews",
      label: t("sidebar.dueReviews", undefined, "SRS Reviews & Mistakes"),
      icon: BookOpen,
      badge: dueReviews.length ? (dueReviews.length > 99 ? "99+" : dueReviews.length) : null,
    },
    {
      to: "/ai-generator",
      label: t("sidebar.aiGenerator", undefined, "AI Flashcards Assistant"),
      icon: Sparkles,
      isNew: true,
    },
    {
      to: "/folders",
      label: t("sidebar.folders", undefined, "Folders"),
      icon: Folder,
    },
    {
      to: "/classes",
      label: t("sidebar.studyGroups", undefined, "Study Groups"),
      icon: Users,
    },
    {
      to: "/profile",
      label: t("sidebar.profile", undefined, "Profile & Streak"),
      icon: User,
      isStreak: true,
    },
  ];

  return (
    <>
      {/* Backdrop for screens < 1280px (mobile, tablet, half-screen desktop) */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 bg-black/70 z-30 xl:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container: overlay drawer on mobile/tablet/half-screen (<1280px), sticky on wide desktop (>=1280px) */}
      <aside
        className={cn(
          "top-16 left-0 z-40 bg-[#131722] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 h-[calc(100vh-4rem)]",
          "fixed xl:sticky",
          isOpen
            ? "w-64 translate-x-0 opacity-100 shadow-[8px_0_24px_rgba(0,0,0,0.5)] xl:shadow-none"
            : "-translate-x-full xl:translate-x-0 xl:w-0 xl:opacity-0 xl:pointer-events-none xl:border-r-0 overflow-hidden",
        )}
      >
        {/* Navigation list */}
        <div className="p-3.5 space-y-1 overflow-y-auto w-64 pb-32 xl:pb-8 flex-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-2 border-b border-white/[0.06] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#545d78]">
              {t("common.navigation", undefined, "Navigation")}
            </span>
            <button
              onClick={closeSidebar}
              className="p-1 rounded-lg text-[#8e98b0] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer xl:hidden"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card at Top of Sidebar for mobile & quick access */}
          {user && (
            <Link
              to="/profile"
              onClick={() => {
                if (window.innerWidth < 1280) closeSidebar();
              }}
              className="flex items-center gap-3 p-2.5 mb-3 bg-[#121420] hover:bg-[#161926] border border-white/[0.08] rounded-xl transition-all group cursor-pointer"
            >
              <div className="relative shrink-0">
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      user.username,
                    )}`
                  }
                  alt={user.name}
                  className={cn(
                    "w-9 h-9 rounded-full object-cover bg-[#08090f] transition-all",
                    user.role === UserRole.ADMIN
                      ? "border-2 border-purple-400 ring-2 ring-purple-500/40"
                      : isDiamondUser
                        ? "border-2 border-cyan-400 ring-2 ring-cyan-400/50 shadow-sm shadow-cyan-500/25"
                        : isVipUser
                          ? "border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-sm shadow-amber-500/25"
                          : "border border-white/[0.14] group-hover:border-[#4f5fd8]",
                  )}
                />
                {user.role === UserRole.ADMIN ? (
                  <span
                    className="absolute -top-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full ring-2 ring-[#121420] shadow-xs"
                    title={t("sidebar.adminBadge", undefined, "Quản trị viên (ADMIN)")}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
                ) : isDiamondUser ? (
                  <span
                    className="absolute -top-1 -right-1 bg-cyan-400 text-black p-0.5 rounded-full ring-2 ring-[#121420] shadow-xs animate-pulse"
                    title={t("sidebar.diamondBadge", undefined, "VIP Diamond Elite")}
                  >
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                  </span>
                ) : isVipUser ? (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-400 text-black p-0.5 rounded-full ring-2 ring-[#121420] shadow-xs"
                    title={t("sidebar.goldBadge", undefined, "VIP Gold Member")}
                  >
                    <Crown className="w-2.5 h-2.5 fill-current" />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#9cb1ff] transition-colors leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  <p className="text-[11px] text-[#8e98b0] truncate min-w-0">
                    @{user.username}
                  </p>
                  {user.role === UserRole.ADMIN ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  ) : isDiamondUser ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> VIP 💎
                    </span>
                  ) : isVipUser ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 shrink-0">
                      <Crown className="w-2.5 h-2.5" /> VIP 👑
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          )}

          {/* Guest Auth Card at Top of Sidebar */}
          {!user && (
            <div className="p-3 mb-3 bg-[#121420] border border-white/[0.08] rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-[#9cb1ff] text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#4f5fd8]" />
                <span>{t("sidebar.guestWelcome", undefined, "Học tập cùng LexiFlash")}</span>
              </div>
              <p className="text-[11px] text-[#8e98b0] leading-relaxed">
                {t("sidebar.guestPrompt", undefined, "Đăng nhập để lưu tiến độ ôn tập và đồng bộ thẻ ghi nhớ.")}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Link
                  to="/login"
                  onClick={() => {
                    if (window.innerWidth < 1280) closeSidebar();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-all cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#9cb1ff]" />
                  <span>{t("nav.login", undefined, "Đăng nhập")}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => {
                    if (window.innerWidth < 1280) closeSidebar();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#4f5fd8] hover:bg-[#4352c2] border border-[#6978f8]/40 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t("nav.signup", undefined, "Đăng ký")}</span>
                </Link>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1280) closeSidebar();
                }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-[#4f5fd8]/15 text-white font-semibold border border-[#4f5fd8]/30 shadow-xs"
                      : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent",
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                    {item.badge}
                  </span>
                ) : item.isVipNav ? (
                  <span className="bg-amber-500/15 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/25">
                    VIP
                  </span>
                ) : item.isNew ? (
                  <span className="bg-[#4f5fd8]/20 text-[#9cb1ff] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#4f5fd8]/30">
                    AI
                  </span>
                ) : item.isStreak && user ? (
                  <StreakBadge
                    size="sm"
                    streakCount={user.streakCount}
                    isStreakActiveToday={user.isStreakActiveToday}
                    isStreakAtRisk={user.isStreakAtRisk}
                    streakStatus={user.streakStatus}
                    lastStudyDate={user.lastStudyDate}
                  />
                ) : null}
              </NavLink>
            );
          })}

          <div className="pt-3 mt-3 border-t border-white/[0.06]">
            <NavLink
              to="/sets/create"
              onClick={() => {
                if (window.innerWidth < 1280) closeSidebar();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] hover:border-white/[0.14] transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#4f5fd8]" />
              <span>
                {t("home.heroCreateBtn", undefined, "Create Study Set")}
              </span>
            </NavLink>
          </div>

          {/* Quick Language & Voice Accent Toggles */}
          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8e98b0]">
            <button
              type="button"
              onClick={() => dispatch(toggleLanguage())}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/[0.04]"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#4f5fd8]" />
              <span className="text-[11px] font-semibold">{language === "vi" ? "Tiếng Việt" : "English"}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleVoiceAccent()}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/[0.04]"
              title="Toggle Voice Accent"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#4f5fd8]" />
              <span className="text-[11px] font-semibold">{voiceAccent === "en-GB" ? "Giọng UK 🇬🇧" : "Giọng US 🇺🇸"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
