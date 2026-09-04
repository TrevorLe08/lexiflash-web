import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { UserProfile, UserRole } from "../../types";
import { Spinner } from "../../components/common/Spinner";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useAppSelector } from "../../store/store";
import {
  Flame,
  Layers,
  Award,
  Calendar,
  Folder as FolderIcon,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Crown,
  Sparkles,
} from "lucide-react";
import { Pagination } from "../../components/common/Pagination";
import { StreakBadge } from "../../components/common/StreakBadge";
import { useTranslation } from "../../i18n";

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sets" | "folders">("sets");

  const [setsPage, setSetsPage] = useState(1);
  const [foldersPage, setFoldersPage] = useState(1);

  useEffect(() => {
    setSetsPage(1);
    setFoldersPage(1);
  }, [activeTab]);

  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;

  useEffect(() => {
    if (!id) return;
    // If the viewed user is the logged in user, redirect straight to /profile
    if (currentUserId && (id === currentUserId || id === currentUsername)) {
      navigate("/profile", { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    authApi
      .getUserProfile(id)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "User not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, currentUserId, currentUsername, navigate]);

  if (loading) {
    return (
      <Spinner size="lg" label="Loading user profile..." className="py-24" />
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-[#1a1d36] rounded-3xl border border-[#2e3856] p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {t("profile.userNotFound", undefined, "User Not Found")}
        </h2>
        <p className="text-[#939bb4]">
          {error ||
            t(
              "profile.userNotFoundDesc",
              undefined,
              "The user you are looking for doesn't exist or is unavailable.",
            )}
        </p>
        <Link to="/">
          <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
            {t("profile.backToExplore", undefined, "Back to Explore")}
          </Button>
        </Link>
      </div>
    );
  }

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{t("common.admin", undefined, "ADMIN")}</span>
          </span>
        );
      default: {
        const isVip = Boolean(
          profile.isVip ||
          (profile.vipExpiresAt &&
            new Date(profile.vipExpiresAt).getTime() > Date.now()),
        );
        if (isVip) {
          const isDiamond = profile.vipPlan === "1_YEAR";
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("common.learner", undefined, "LEARNER")}</span>
          </span>
        );
      }
    }
  };

  const createdSets = profile.createdSets || [];
  const createdFolders = profile.createdFolders || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Back Button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {t("profile.backToExplore", undefined, "Back to Explore")}
          </span>
        </Link>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with glow effect and VIP badge */}
          <div className="relative group">
            <img
              src={
                profile.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                  profile.username,
                )}`
              }
              alt={profile.name}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover bg-[#2e3856] border-4 shadow-2xl group-hover:scale-105 transition-all ${
                profile.role === UserRole.ADMIN
                  ? "border-purple-500 shadow-purple-500/30"
                  : (profile.isVip ||
                        (profile.vipExpiresAt &&
                          new Date(profile.vipExpiresAt).getTime() >
                            Date.now())) &&
                      profile.vipPlan === "1_YEAR"
                    ? "border-cyan-400 shadow-cyan-500/30"
                    : profile.isVip ||
                        (profile.vipExpiresAt &&
                          new Date(profile.vipExpiresAt).getTime() > Date.now())
                      ? "border-amber-400 shadow-amber-500/30"
                      : "border-[#3c476c]"
              }`}
            />
            {/* Top-right VIP / Admin badge on avatar */}
            {profile.role === UserRole.ADMIN ? (
              <div
                className="absolute -top-1 -right-1 bg-purple-600 text-white p-1.5 rounded-full ring-2 ring-[#1a1d36] shadow-md"
                title="Quản trị viên (ADMIN)"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            ) : (profile.isVip ||
                (profile.vipExpiresAt &&
                  new Date(profile.vipExpiresAt).getTime() > Date.now())) &&
              profile.vipPlan === "1_YEAR" ? (
              <div
                className="absolute -top-1 -right-1 bg-cyan-400 text-black p-1.5 rounded-full ring-2 ring-[#1a1d36] shadow-md shadow-cyan-500/30 animate-pulse"
                title="VIP Diamond Elite"
              >
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
            ) : profile.isVip ||
              (profile.vipExpiresAt &&
                new Date(profile.vipExpiresAt).getTime() > Date.now()) ? (
              <div
                className="absolute -top-1 -right-1 bg-amber-400 text-black p-1.5 rounded-full ring-2 ring-[#1a1d36] shadow-md shadow-amber-500/30"
                title="VIP Gold Member"
              >
                <Crown className="w-4 h-4 fill-current" />
              </div>
            ) : null}

            <div className="absolute -bottom-2 -right-2">
              <StreakBadge
                size="sm"
                streakCount={profile.streakCount}
                isStreakActiveToday={profile.isStreakActiveToday}
                isStreakAtRisk={profile.isStreakAtRisk}
                streakStatus={profile.streakStatus}
                lastStudyDate={profile.lastStudyDate}
              />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {profile.name}
              </h1>
              {renderRoleBadge(profile.role)}
            </div>

            <p className="text-sm font-medium text-[#939bb4]">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="text-sm text-[#d9dde8] max-w-2xl leading-relaxed pt-1">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#939bb4] pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>
                  {t("profile.joinedDate", {
                    date: new Date(profile.createdAt).toLocaleDateString(),
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {profile.stats?.totalSetsCreated || createdSets.length}{" "}
                  {t("nav.searchFilterSets", undefined, "Sets")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {profile.stats?.totalCardsMastered || 0}{" "}
                  {t("profile.cardsMastered", undefined, "Cards Mastered")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all ${
            profile.isStreakActiveToday && (profile.streakCount || 0) > 0
              ? "bg-gradient-to-br from-[#1a1d36] to-amber-950/20 border-amber-500/40"
              : profile.isStreakAtRisk && (profile.streakCount || 0) > 0
                ? "bg-[#1a1d36] border-slate-600/70"
                : "bg-[#1a1d36] border-[#2e3856]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              profile.isStreakActiveToday && (profile.streakCount || 0) > 0
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : profile.isStreakAtRisk && (profile.streakCount || 0) > 0
                  ? "bg-slate-700/40 text-slate-400 border-slate-600/50"
                  : "bg-[#14162e] text-gray-500 border-[#2e3856]"
            }`}
          >
            <Flame
              className={`w-6 h-6 ${
                profile.isStreakActiveToday && (profile.streakCount || 0) > 0
                  ? "fill-amber-400 animate-pulse"
                  : profile.isStreakAtRisk && (profile.streakCount || 0) > 0
                    ? "fill-slate-500/30"
                    : "fill-gray-600/20"
              }`}
            />
          </div>
          <div>
            <span className="text-2xl font-black text-white">
              {profile.streakCount || 0}
            </span>
            <p className="text-xs text-[#939bb4] font-medium">
              {t("profile.studyStreak", undefined, "Day Streak")}
            </p>
          </div>
        </div>

        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4257B2]/20 text-[#6366F1] flex items-center justify-center shrink-0 border border-[#4257B2]/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">
              {profile.stats?.totalSetsCreated || createdSets.length}
            </span>
            <p className="text-xs text-[#939bb4] font-medium">
              {t("profile.setsCreated", undefined, "Study Sets")}
            </p>
          </div>
        </div>

        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">
              {profile.stats?.totalCardsMastered || 0}
            </span>
            <p className="text-xs text-[#939bb4] font-medium">
              {t("profile.cardsMastered", undefined, "Mastered Cards")}
            </p>
          </div>
        </div>

        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">
              {profile.stats?.totalStudySessions || 0}
            </span>
            <p className="text-xs text-[#939bb4] font-medium">
              {t("profile.studySessions", undefined, "Study Sessions")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: Sets & Folders */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-[#2e3856] pb-3">
          <button
            onClick={() => setActiveTab("sets")}
            className={`flex items-center gap-2 pb-1 font-bold text-sm transition-colors cursor-pointer ${
              activeTab === "sets"
                ? "text-[#6366F1] border-b-2 border-[#6366F1]"
                : "text-[#939bb4] hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>
              {t("profile.createdSetsTab", { count: createdSets.length })}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("folders")}
            className={`flex items-center gap-2 pb-1 font-bold text-sm transition-colors cursor-pointer ${
              activeTab === "folders"
                ? "text-[#6366F1] border-b-2 border-[#6366F1]"
                : "text-[#939bb4] hover:text-white"
            }`}
          >
            <FolderIcon className="w-4 h-4" />
            <span>
              {t("profile.foldersTab", { count: createdFolders.length })}
            </span>
          </button>
        </div>

        {/* Study Sets Grid */}
        {activeTab === "sets" && (
          <div>
            {createdSets.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d36] rounded-2xl border border-[#2e3856] p-6 text-[#939bb4]">
                {t(
                  "profile.noSets",
                  undefined,
                  "This user has not published any public study sets yet.",
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              {set.cardCount}{" "}
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
                          <span className="font-semibold text-[#6366F1] group-hover:underline">
                            {t("common.studyNow", undefined, "Study Now")} →
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

        {/* Folders Grid */}
        {activeTab === "folders" && (
          <div>
            {createdFolders.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d36] rounded-2xl border border-[#2e3856] p-6 text-[#939bb4]">
                {t(
                  "profile.noFolders",
                  undefined,
                  "This user has not created any public folders yet.",
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <span className="font-semibold text-emerald-400 group-hover:underline">
                            {t("common.studyNow", undefined, "Open Folder")} →
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
    </div>
  );
};
