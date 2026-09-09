import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { authApi } from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { Badge } from "../../components/common/Badge";
import {
  Flame,
  Layers,
  Award,
  Clock,
  Plus,
  Sparkles,
  Folder as FolderIcon,
  ShieldCheck,
  UserCheck,
  Crown,
  Calendar,
  ArrowRight,
  Bookmark,
  Settings,
  Camera,
} from "lucide-react";
import { Pagination } from "../../components/common/Pagination";
import { UserProfile, UserRole } from "../../types";
import { useTranslation } from "../../i18n";
import {
  SettingsModal,
  SettingsTab,
} from "../../components/settings/SettingsModal";

const getDisplayAvatar = (
  url?: string | null,
  name?: string | null,
  username?: string | null,
) => {
  if (url && url.trim()) return url.trim();
  const seed = encodeURIComponent(name?.trim() || username?.trim() || "User");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,4f46e5,3b82f6,06b6d4,10b981`;
};

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sets" | "folders" | "bookmarks">(
    "sets",
  );

  const [setsPage, setSetsPage] = useState(1);
  const [foldersPage, setFoldersPage] = useState(1);
  const [bookmarksPage, setBookmarksPage] = useState(1);

  useEffect(() => {
    setSetsPage(1);
    setFoldersPage(1);
    setBookmarksPage(1);
  }, [activeTab]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] =
    useState<SettingsTab>("profile");

  const openSettings = (tab: SettingsTab = "profile") => {
    setSettingsInitialTab(tab);
    setIsSettingsModalOpen(true);
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        authApi.getMe(),
        authApi.getStats().catch(() => ({ data: null })),
      ]);
      setProfile(profileRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 bg-[#1a1d36] rounded-3xl border border-[#2e3856] p-8">
        <h2 className="text-2xl font-bold text-white">
          {t(
            "profile.pleaseLogin",
            undefined,
            "Please log in to view your profile",
          )}
        </h2>
        <Link to="/login">
          <Button variant="primary" size="lg">
            {t("nav.login", undefined, "Log in")}
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <Spinner size="lg" label="Loading profile & stats..." className="py-24" />
    );
  }

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{t("common.admin", undefined, "ADMIN")}</span>
          </span>
        );
      default: {
        const isVip = Boolean(
          user?.isVip ||
          profile?.isVip ||
          (user?.vipExpiresAt &&
            new Date(user.vipExpiresAt).getTime() > Date.now()) ||
          (profile?.vipExpiresAt &&
            new Date(profile.vipExpiresAt).getTime() > Date.now()),
        );
        if (isVip) {
          const isDiamond =
            user?.vipPlan === "1_YEAR" || profile?.vipPlan === "1_YEAR";
          if (isDiamond) {
            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("common.vipDiamond", undefined, "VIP DIAMOND")}</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10 animate-pulse">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("common.vipGold", undefined, "VIP GOLD")}</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("common.learner", undefined, "LEARNER")}</span>
          </span>
        );
      }
    }
  };

  const createdSets = profile?.createdSets || [];
  const createdFolders = profile?.createdFolders || [];
  const bookmarkedSets = profile?.bookmarkedSets || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={getDisplayAvatar(user.avatarUrl, user.name, user.username)}
              alt={user.name}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover bg-[#2e3856] border-4 shadow-2xl group-hover:scale-105 transition-all ${
                user.role === UserRole.ADMIN
                  ? "border-purple-500 shadow-purple-500/30"
                  : (user.isVip ||
                        (user.vipExpiresAt &&
                          new Date(user.vipExpiresAt).getTime() >
                            Date.now())) &&
                      user.vipPlan === "1_YEAR"
                    ? "border-cyan-400 shadow-cyan-500/30"
                    : user.isVip ||
                        (user.vipExpiresAt &&
                          new Date(user.vipExpiresAt).getTime() > Date.now())
                      ? "border-amber-400 shadow-amber-500/30"
                      : "border-[#4257B2]"
              }`}
            />
            {/* Top-right VIP / Admin badge on avatar */}
            {user.role === UserRole.ADMIN ? (
              <div
                className="absolute -top-1 -right-1 bg-purple-600 text-white p-1.5 rounded-full ring-2 ring-[#121420] shadow-md"
                title="Quản trị viên (ADMIN)"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            ) : (user.isVip ||
                (user.vipExpiresAt &&
                  new Date(user.vipExpiresAt).getTime() > Date.now())) &&
              user.vipPlan === "1_YEAR" ? (
              <div
                className="absolute -top-1 -right-1 bg-cyan-400 text-black p-1.5 rounded-full ring-2 ring-[#121420] shadow-md shadow-cyan-500/30 animate-pulse"
                title="VIP Diamond Elite"
              >
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
            ) : user.isVip ||
              (user.vipExpiresAt &&
                new Date(user.vipExpiresAt).getTime() > Date.now()) ? (
              <div
                className="absolute -top-1 -right-1 bg-amber-400 text-black p-1.5 rounded-full ring-2 ring-[#121420] shadow-md shadow-amber-500/30"
                title="VIP Gold Member"
              >
                <Crown className="w-4 h-4 fill-current" />
              </div>
            ) : null}

            {/* Hover Camera overlay to change avatar / open settings */}
            <button
              type="button"
              onClick={() => openSettings("profile")}
              title="Nhấn để đổi ảnh đại diện và chỉnh sửa hồ sơ"
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-[2px]"
            >
              <Camera className="w-6 h-6 text-indigo-300 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-200">
                Đổi ảnh
              </span>
            </button>

            {user.streakCount > 0 && (
              <div
                className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border-2 border-[#1a1d36]"
                title={`${user.streakCount} day streak`}
              >
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{user.streakCount}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {user.name}
              </h1>
              {renderRoleBadge(user.role)}
            </div>

            <p className="text-sm text-[#939bb4]">@{user.username}</p>

            {user.bio ? (
              <p className="text-sm text-[#d9dde8] leading-relaxed max-w-xl pt-1">
                {user.bio}
              </p>
            ) : (
              <p className="text-xs text-[#586380] italic pt-1">
                {t(
                  "profile.noBioYet",
                  undefined,
                  "No bio added yet. Tell others about your learning goals!",
                )}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#939bb4] pt-1">
              <Calendar className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>
                {t("profile.joinedDate", {
                  date: new Date(user.createdAt).toLocaleDateString(),
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openSettings("profile")}
            icon={<Settings className="w-4 h-4" />}
          >
            {t("common.settings", undefined, "Cài đặt")}
          </Button>
        </div>
      </div>

      {/* 2. STATS & STREAK CARDS GRID */}
      {(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        const isStreakActiveToday =
          Boolean(user.isStreakActiveToday) &&
          (!user.lastStudyDate || user.lastStudyDate === todayStr);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Streak */}
            <div
              className={`border rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-2 shadow-xs relative overflow-hidden transition-all ${
                isStreakActiveToday && (user.streakCount || 0) > 0
                  ? "bg-[#0f111a] border-amber-500/30"
                  : user.isStreakAtRisk && (user.streakCount || 0) > 0
                    ? "bg-[#0f111a] border-slate-600/50"
                    : "bg-[#0f111a] border-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isStreakActiveToday && (user.streakCount || 0) > 0
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      : user.isStreakAtRisk && (user.streakCount || 0) > 0
                        ? "bg-slate-700/40 border-slate-600/50 text-slate-400"
                        : "bg-[#121420] border-white/[0.08] text-gray-500"
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isStreakActiveToday && (user.streakCount || 0) > 0
                        ? "fill-amber-400"
                        : user.isStreakAtRisk && (user.streakCount || 0) > 0
                          ? "fill-slate-500/30"
                          : "fill-gray-600/20"
                    }`}
                  />
                </div>
                {isStreakActiveToday && (user.streakCount || 0) > 0 ? (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {t("profile.streakActiveToday", undefined, "Đã giữ 🔥")}
                  </span>
                ) : user.isStreakAtRisk && (user.streakCount || 0) > 0 ? (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50 whitespace-nowrap">
                    {t("profile.streakAtRisk", undefined, "Đang nguội ❄️")}
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-white/[0.06] text-[#8e98b0] whitespace-nowrap">
                    {t("profile.streakStartNow", undefined, "Chưa có ⚪")}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[#8e98b0] uppercase tracking-wider block truncate">
                  {t("profile.studyStreak", undefined, "Study Streak")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                  {stats?.streakDays || user.streakCount || 0}{" "}
                  <span className="text-xs font-normal text-[#8e98b0] font-sans">
                    {t("sidebar.days", undefined, "days")}
                  </span>
                </div>
              </div>
            </div>

            {/* Mastered Cards */}
            <div className="bg-[#0f111a] border border-white/[0.08] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-2 shadow-xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[#8e98b0] uppercase tracking-wider block truncate">
                  {t("profile.cardsMastered", undefined, "Cards Mastered")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                  {stats?.totalCardsMastered ||
                    profile?.stats?.totalCardsMastered ||
                    0}
                </div>
              </div>
            </div>

            {/* Sets Created */}
            <div className="bg-[#0f111a] border border-white/[0.08] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-2 shadow-xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 text-[#9cb1ff] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[#8e98b0] uppercase tracking-wider block truncate">
                  {t("profile.setsCreated", undefined, "Sets Created")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                  {stats?.totalSetsCreated || createdSets.length}
                </div>
              </div>
            </div>

            {/* Study Sessions */}
            <div className="bg-[#0f111a] border border-white/[0.08] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-2 shadow-xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[#8e98b0] uppercase tracking-wider block truncate">
                  {t("profile.studySessions", undefined, "Study Sessions")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                  {stats?.totalStudySessions ||
                    profile?.stats?.totalStudySessions ||
                    0}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. YOUR STUDY SETS, FOLDERS & BOOKMARKS TABS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1">
            <button
              onClick={() => setActiveTab("sets")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "sets"
                  ? "bg-[#4f5fd8]/15 text-[#9cb1ff] border border-[#4f5fd8]/30 shadow-xs"
                  : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>
                {t("profile.createdSetsTab", { count: createdSets.length })}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "bookmarks"
                  ? "bg-[#4f5fd8]/15 text-[#9cb1ff] border border-[#4f5fd8]/30 shadow-xs"
                  : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>
                {t("profile.bookmarksTab", { count: bookmarkedSets.length })}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("folders")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "folders"
                  ? "bg-[#4f5fd8]/15 text-[#9cb1ff] border border-[#4f5fd8]/30 shadow-xs"
                  : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <FolderIcon className="w-4 h-4" />
              <span>
                {t("profile.foldersTab", { count: createdFolders.length })}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "sets" && (
              <>
                <Link to="/ai-generator">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Sparkles className="w-4 h-4 text-pink-400" />}
                  >
                    {t("sidebar.aiGenerator", undefined, "AI Generator")}
                  </Button>
                </Link>
                <Link to="/sets/create">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    {t("profile.createSetBtn", undefined, "Create Set")}
                  </Button>
                </Link>
              </>
            )}

            {activeTab === "folders" && (
              <Link to="/folders">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  {t("profile.manageFolders", undefined, "Manage Folders")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Created Study Sets Grid */}
        {activeTab === "sets" && (
          <div>
            {createdSets.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d36]/50 rounded-3xl border border-[#2e3856] p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t("profile.noSets", undefined, "No study sets created yet")}
                </h3>
                <p className="text-sm text-[#939bb4] max-w-md mx-auto">
                  {t(
                    "profile.noSetsDesc",
                    undefined,
                    "Create your first English study set or use our AI Generator to create flashcards instantly!",
                  )}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link to="/sets/create">
                    <Button variant="primary" size="md">
                      {t("profile.createSetBtn", undefined, "Create Study Set")}
                    </Button>
                  </Link>
                  <Link to="/ai-generator">
                    <Button variant="gradient" size="md">
                      {t(
                        "profile.generateAiBtn",
                        undefined,
                        "Generate with AI 🚀",
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdSets
                    .slice((setsPage - 1) * 8, setsPage * 8)
                    .map((set) => (
                      <Link
                        key={set.id}
                        to={`/sets/${set.id}`}
                        className="bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <Badge variant="blue" size="sm">
                              {set.cardCount || set.cards?.length || 0}{" "}
                              {t("common.terms", undefined, "terms")}
                            </Badge>
                            <span className="text-[11px] text-[#939bb4] uppercase font-bold">
                              {set.sourceLanguage} → {set.targetLanguage}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-white group-hover:text-[#6366F1] transition-colors line-clamp-2">
                            {set.title}
                          </h3>

                          {set.description && (
                            <p className="text-xs text-[#939bb4] line-clamp-2 leading-relaxed">
                              {set.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#2e3856]/60 mt-4 flex items-center justify-between text-xs text-[#939bb4]">
                          <span>
                            {new Date(set.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-semibold text-[#6366F1] group-hover:underline flex items-center gap-1">
                            {t("common.studyNow", undefined, "Study Now")}{" "}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
                {Math.ceil(createdSets.length / 8) > 1 && (
                  <Pagination
                    currentPage={setsPage}
                    totalPages={Math.ceil(createdSets.length / 8)}
                    totalItems={createdSets.length}
                    onPageChange={setSetsPage}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Bookmarked Sets Grid */}
        {activeTab === "bookmarks" && (
          <div>
            {bookmarkedSets.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d36]/50 rounded-3xl border border-[#2e3856] p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t(
                    "profile.noBookmarks",
                    undefined,
                    "No bookmarked sets yet",
                  )}
                </h3>
                <p className="text-sm text-[#939bb4] max-w-md mx-auto">
                  {t(
                    "profile.noBookmarksDesc",
                    undefined,
                    "Click the bookmark icon on any study set in Explore to save it here for quick access!",
                  )}
                </p>
                <Link to="/">
                  <Button variant="primary" size="md">
                    {t("profile.exploreSetsBtn", undefined, "Explore Sets")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bookmarkedSets
                    .slice((bookmarksPage - 1) * 8, bookmarksPage * 8)
                    .map((set) => (
                      <Link
                        key={set.id}
                        to={`/sets/${set.id}`}
                        className="bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <Badge variant="blue" size="sm">
                              {set.cardCount || set.cards?.length || 0}{" "}
                              {t("common.terms", undefined, "terms")}
                            </Badge>
                            <span className="text-[11px] text-indigo-400 font-bold flex items-center gap-1">
                              <Bookmark className="w-3 h-3 fill-indigo-400" />{" "}
                              {t("profile.bookmarksTab", { count: "" })
                                .replace("()", "")
                                .trim()}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-white group-hover:text-[#6366F1] transition-colors line-clamp-2">
                            {set.title}
                          </h3>

                          {set.description && (
                            <p className="text-xs text-[#939bb4] line-clamp-2 leading-relaxed">
                              {set.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#2e3856]/60 mt-4 flex items-center justify-between text-xs text-[#939bb4]">
                          <span>
                            {t("common.by", undefined, "By")}{" "}
                            {set.creator?.name}
                          </span>
                          <span className="font-semibold text-[#6366F1] group-hover:underline flex items-center gap-1">
                            {t("common.studyNow", undefined, "Study Now")}{" "}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
                {Math.ceil(bookmarkedSets.length / 8) > 1 && (
                  <Pagination
                    currentPage={bookmarksPage}
                    totalPages={Math.ceil(bookmarkedSets.length / 8)}
                    totalItems={bookmarkedSets.length}
                    onPageChange={setBookmarksPage}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Folders Grid */}
        {activeTab === "folders" && (
          <div>
            {createdFolders.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d36]/50 rounded-3xl border border-[#2e3856] p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <FolderIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t("profile.noFolders", undefined, "No folders created yet")}
                </h3>
                <p className="text-sm text-[#939bb4] max-w-md mx-auto">
                  {t(
                    "profile.noFoldersDesc",
                    undefined,
                    "Group your study sets into organized subjects, levels, or exam categories.",
                  )}
                </p>
                <Link to="/folders">
                  <Button variant="primary" size="md">
                    {t("profile.goToFoldersBtn", undefined, "Go to Folders")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdFolders
                    .slice((foldersPage - 1) * 8, foldersPage * 8)
                    .map((f) => (
                      <Link
                        key={f.id}
                        to={`/folders/${f.id}`}
                        className="bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group"
                      >
                        <div className="space-y-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                            <FolderIcon className="w-5 h-5" />
                          </div>

                          <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {f.title}
                          </h3>

                          {f.description && (
                            <p className="text-xs text-[#939bb4] line-clamp-2">
                              {f.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#2e3856]/60 mt-4 flex items-center justify-between text-xs text-[#939bb4]">
                          <span>
                            {t("folders.setsCount", { count: f.setCount })}
                          </span>
                          <span className="font-semibold text-emerald-400 group-hover:underline flex items-center gap-1">
                            {t("common.studyNow", undefined, "Study Now")}{" "}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
                {Math.ceil(createdFolders.length / 8) > 1 && (
                  <Pagination
                    currentPage={foldersPage}
                    totalPages={Math.ceil(createdFolders.length / 8)}
                    totalItems={createdFolders.length}
                    onPageChange={setFoldersPage}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* MASTER ALL-IN-ONE SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        onProfileUpdated={(updated) => {
          setProfile(updated);
        }}
      />
    </div>
  );
};
