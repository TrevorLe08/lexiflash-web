import React, { useState, useMemo } from "react";
import { AdminOverviewStats } from "../../../api/adminApi";
import { UserRole } from "../../../types";
import { Spinner } from "../../../components/common/Spinner";
import { cn } from "../../../utils/cn";
import {
  Users,
  Layers,
  GraduationCap,
  Star,
  Award,
  Flame,
  Sparkles,
  Crown,
  BookOpen,
  BrainCircuit,
  Headphones,
  FileCheck2,
  Gamepad2,
  PenLine,
} from "lucide-react";

// ==========================================
// Pure SVG Interactive Donut Chart for Study Modes
// Zero external libraries, maximum render performance
// ==========================================
interface StudyModesDonutSectionProps {
  modeDistribution?: Record<string, { count: number; percentage: number }>;
  totalSessions: number;
}

const STUDY_MODES_CONFIG = [
  {
    key: "FLASHCARDS",
    label: "Flashcards Mode",
    subLabel: "Basic memorization",
    shortLabel: "Flashcards",
    color: "#6366F1", // Indigo
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Icon: BookOpen,
  },
  {
    key: "LEARN",
    label: "Learn Mode (SRS)",
    subLabel: "Spaced repetition (SRS)",
    shortLabel: "Learn SRS",
    color: "#8B5CF6", // Purple
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Icon: BrainCircuit,
  },
  {
    key: "WRITE",
    label: "Listening & Dictation",
    subLabel: "Audio listening & spelling",
    shortLabel: "Dictation",
    color: "#10B981", // Emerald Green
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Icon: Headphones,
  },
  {
    key: "CLOZE",
    label: "Fill in the Blanks",
    subLabel: "Contextual cloze sentences",
    shortLabel: "Cloze",
    color: "#06B6D4", // Cyan
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Icon: PenLine,
  },
  {
    key: "TEST",
    label: "Practice Test",
    subLabel: "Exam simulation",
    shortLabel: "Test",
    color: "#F59E0B", // Amber
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Icon: FileCheck2,
  },
  {
    key: "MATCH",
    label: "Match Speed Game",
    subLabel: "Timed tile pairing",
    shortLabel: "Match",
    color: "#EC4899", // Pink
    badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Icon: Gamepad2,
  },
];

const CIRCUMFERENCE = 2 * Math.PI * 56; // Radius = 56, circumference ≈ 351.86

export const StudyModesDonutSection: React.FC<StudyModesDonutSectionProps> = React.memo(
  ({ modeDistribution = {}, totalSessions = 0 }) => {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    // Calculate arc slices
    const { slices, totalCount } = useMemo(() => {
      let sum = 0;
      STUDY_MODES_CONFIG.forEach((m) => {
        sum += modeDistribution[m.key]?.count || 0;
      });

      const effectiveTotal = sum > 0 ? sum : totalSessions;
      let runningOffset = 0;
      const computed = [];
      for (const m of STUDY_MODES_CONFIG) {
        const item = modeDistribution[m.key];
        const count = item?.count || 0;
        const percentage =
          effectiveTotal > 0
            ? Math.round((count / effectiveTotal) * 1000) / 10
            : 0;
        const ratio = effectiveTotal > 0 ? count / effectiveTotal : 0;
        const arcLength = ratio * CIRCUMFERENCE;
        const offset = -runningOffset;
        runningOffset += arcLength;

        computed.push({
          ...m,
          count,
          percentage,
          arcLength,
          offset,
        });
      }

      return { slices: computed, totalCount: effectiveTotal };
    }, [modeDistribution, totalSessions]);

    const activeHoveredSlice = useMemo(
      () => slices.find((s) => s.key === hoveredKey) || null,
      [slices, hoveredKey],
    );

    const nonZeroSlices = useMemo(
      () => slices.filter((s) => s.count > 0),
      [slices],
    );

    return (
      <div className="lg:col-span-2 bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Study Modes Activity Distribution
            </h3>
            <p className="text-xs text-[#939bb4]">
              Interactive breakdown of student sessions across all 6 learning modalities
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {totalCount} Total Runs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          {/* Donut Chart SVG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full transform -rotate-90 origin-center select-none"
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#232a45"
                  strokeWidth="14"
                />

                {/* Slices */}
                {totalCount > 0 &&
                  slices.map((slice) => {
                    if (slice.count <= 0) return null;
                    const isHovered = hoveredKey === slice.key;
                    const gap = nonZeroSlices.length > 1 ? 2 : 0;
                    const strokeDash = Math.max(0, slice.arcLength - gap);

                    return (
                      <circle
                        key={slice.key}
                        cx="80"
                        cy="80"
                        r="56"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 18 : 14}
                        strokeDasharray={`${strokeDash} ${CIRCUMFERENCE - strokeDash}`}
                        strokeDashoffset={slice.offset}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          opacity: hoveredKey ? (isHovered ? 1 : 0.35) : 1,
                          filter: isHovered
                            ? `drop-shadow(0 0 6px ${slice.color}90)`
                            : "none",
                        }}
                        onMouseEnter={() => setHoveredKey(slice.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                      />
                    );
                  })}
              </svg>

              {/* Central Hole Info Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                {activeHoveredSlice ? (
                  <div className="flex flex-col items-center px-2 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#939bb4] truncate max-w-[85px]">
                      {activeHoveredSlice.shortLabel}
                    </span>
                    <span className="text-2xl font-black text-white leading-tight">
                      {activeHoveredSlice.count}
                    </span>
                    <span
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 border"
                      style={{
                        color: activeHoveredSlice.color,
                        backgroundColor: `${activeHoveredSlice.color}15`,
                        borderColor: `${activeHoveredSlice.color}30`,
                      }}
                    >
                      {activeHoveredSlice.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white tracking-tight leading-none">
                      {totalCount}
                    </span>
                    <span className="text-[11px] font-semibold text-[#939bb4] uppercase tracking-wider mt-1">
                      Runs
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#939bb4] text-center mt-2">
              Di chuột để xem chi tiết
            </p>
          </div>

          {/* Interactive Legend List */}
          <div className="md:col-span-7 space-y-2">
            {slices.map((item) => {
              const isHovered = hoveredKey === item.key;
              const IconComp = item.Icon;

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredKey(item.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className={cn(
                    "p-2.5 rounded-xl border transition-all duration-200 cursor-pointer space-y-1.5",
                    isHovered
                      ? "bg-[#252b47] border-[#4b5580] shadow-md translate-x-1"
                      : "bg-[#14172b]/60 border-[#252c48] hover:bg-[#1e233d]",
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <IconComp
                        className="w-4 h-4 shrink-0"
                        style={{ color: item.color }}
                      />
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="font-bold text-white">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#939bb4] hidden sm:inline">
                          • {item.subLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-white">
                        {item.count}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                          item.badgeBg,
                        )}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#0a092d] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

// ==========================================
// Admin Overview Tab Component
// ==========================================
export interface AdminOverviewTabProps {
  stats: AdminOverviewStats | null;
  loadingStats: boolean;
  onViewAllUsers: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = React.memo(
  ({ stats, loadingStats, onViewAllUsers }) => {
    if (loadingStats && !stats) {
      return (
        <Spinner
          size="lg"
          label="Loading system metrics..."
          className="py-20"
        />
      );
    }

    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* Primary KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Users Metric */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#4257B2]/20 border border-[#4257B2]/40 text-[#6366F1] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {stats.users.activeTodayCount} Active Today
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Total Accounts
              </span>
              <div className="text-3xl font-black text-white mt-0.5">
                {stats.users.totalUsers}
              </div>
              <div className="mt-2 pt-2 border-t border-[#2e3856]/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-cyan-300 font-bold">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>VIP Diamond:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {stats.users.vipDiamondCount ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>VIP Gold:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {stats.users.vipGoldCount ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#939bb4]">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Active Streaks:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {stats.users.activeStreakCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Study Sets Metric */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" />
                {stats.content.featuredSets} Featured
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Study Sets
              </span>
              <div className="text-3xl font-black text-white mt-0.5">
                {stats.content.totalStudySets}
              </div>
              <p className="text-[11px] text-[#939bb4] mt-1">
                {stats.content.publicSets} Public • {stats.content.privateSets} Private
              </p>
            </div>
          </div>

          {/* Vocabulary Cards Metric */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-md">
                {stats.content.totalFolders} Folders
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Vocabulary Cards
              </span>
              <div className="text-3xl font-black text-white mt-0.5">
                {stats.content.totalCards}
              </div>
              <p className="text-[11px] text-[#939bb4] mt-1">
                Average ~
                {stats.content.totalStudySets > 0
                  ? Math.round(stats.content.totalCards / stats.content.totalStudySets)
                  : 0}{" "}
                cards/set
              </p>
            </div>
          </div>

          {/* Study Sessions Metric */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md">
                Avg Score {stats.activity.averageTestScore}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Study Sessions
              </span>
              <div className="text-3xl font-black text-white mt-0.5">
                {stats.activity.totalStudySessions}
              </div>
              <p className="text-[11px] text-[#939bb4] mt-1">
                {stats.activity.totalTestsTaken} tests completed
              </p>
            </div>
          </div>
        </div>

        {/* Mode Distribution & Recent Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 6 Study Modes Usage Breakdown */}
          <StudyModesDonutSection
            modeDistribution={stats.activity.modeDistribution}
            totalSessions={stats.activity.totalStudySessions}
          />

          {/* Recent Registrations Quick Card */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Recent Signups
              </h3>
              <button
                type="button"
                onClick={onViewAllUsers}
                className="text-xs text-[#6366F1] hover:underline font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a092d] border border-[#2e3856]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        u.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          u.username,
                        )}`
                      }
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#2e3856]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-[#939bb4] truncate">
                        @{u.username}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      u.role === UserRole.ADMIN
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
