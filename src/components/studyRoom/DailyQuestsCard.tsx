import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock,
  Sparkles,
  Target,
  Trash2,
  Zap,
  Compass,
  Award,
  Flame,
} from "lucide-react";
import { DailyQuest, QuestType } from "../../types/studyRoom.types";
import { useTranslation } from "../../i18n";
import { Button } from "../common/Button";

interface DailyQuestsCardProps {
  quests: DailyQuest[];
  onToggleQuest: (id: string) => Promise<void>;
  onCreateCustomQuest: (title: string) => Promise<void>;
  onDeleteCustomQuest: (id: string) => Promise<void>;
}

export const DailyQuestsCard: React.FC<DailyQuestsCardProps> = ({
  quests,
  onToggleQuest,
  onCreateCustomQuest,
  onDeleteCustomQuest,
}) => {
  const { t } = useTranslation();
  const [customTitle, setCustomTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalCount = quests.length;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsAdding(true);
    try {
      await onCreateCustomQuest(customTitle.trim());
      setCustomTitle("");
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteCustomQuest(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getQuestIcon = (type: QuestType) => {
    switch (type) {
      case "REVIEW_DUE_CARDS":
        return <BrainCircuit className="w-4 h-4 text-[#6366F1]" />;
      case "FOCUS_TIME_TARGET":
      case "FOCUS_45M_TARGET":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "UNBROKEN_POMODORO_25M":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "PERFECT_TEST_EXAM":
        return <Award className="w-4 h-4 text-yellow-400" />;
      case "FLAWLESS_SM2_LEARN":
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case "CREATE_STUDY_SET":
        return <Plus className="w-4 h-4 text-indigo-400" />;
      case "STUDY_ANY_SET":
      case "COMPLETE_STUDY_MODE":
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case "EXPLORE_COMMUNITY_SET":
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case "TAKE_PRACTICE_QUIZ":
        return <Target className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-[#161926] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between h-full">
      {/* Header & Progress Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {t("studyRoom.questsTitle", undefined, "Nhiệm vụ hôm nay")}
              </h2>
              <p className="text-xs text-[#8e98b0]">
                {t(
                  "studyRoom.questsSubtitle",
                  undefined,
                  "Mục tiêu học tập hàng ngày của bạn",
                )}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-sm font-black text-amber-300">
              {completedCount} / {totalCount}
            </span>
            <span className="text-xs text-[#8e98b0] block font-sans">
              {completionPercent}%{" "}
              {t("studyRoom.completed", undefined, "hoàn thành")}
            </span>
          </div>
        </div>

        {/* Global Quests Progress Bar */}
        <div className="w-full h-1.5 bg-[#141824] rounded-full overflow-hidden border border-white/[0.08]">
          <div
            className="h-full bg-[#4f5fd8] transition-all duration-500 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {quests.map((quest) => {
          const percent = Math.min(
            100,
            Math.round((quest.currentCount / (quest.targetCount || 1)) * 100),
          );

          return (
            <div
              key={quest.id}
              className={`border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 ${
                quest.isCompleted
                  ? "bg-[#141824]/50 border-emerald-500/20 opacity-80"
                  : "bg-[#141824] border-white/[0.08] hover:border-[#4f5fd8]/40"
              }`}
            >
              {/* Top: Checkbox/Status, Icon, Full Title, Badge & Delete */}
              <div className="flex items-start gap-3">
                {/* Status Indicator */}
                {quest.isAutoGenerated ? (
                  <div
                    className="mt-0.5 shrink-0"
                    title={
                      quest.isCompleted
                        ? t(
                            "studyRoom.autoCompleted",
                            undefined,
                            "Đã hoàn thành qua hoạt động học tập",
                          )
                        : t(
                            "studyRoom.autoTracked",
                            undefined,
                            "Hệ thống tự động theo dõi tiến độ",
                          )
                    }
                  >
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#4f5fd8]/40 bg-[#0f111a] flex items-center justify-center text-[#9cb1ff]">
                        <Zap className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onToggleQuest(quest.id)}
                    className="mt-0.5 text-[#545d78] hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    title={t(
                      "studyRoom.toggleCustomTask",
                      undefined,
                      "Đánh dấu hoàn thành",
                    )}
                  >
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#545d78] hover:text-emerald-400" />
                    )}
                  </button>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1 rounded-md bg-[#0f111a] border border-white/[0.08]">
                      {getQuestIcon(quest.type)}
                    </span>
                    <span
                      className={`text-sm font-bold leading-snug break-words ${
                        quest.isCompleted
                          ? "line-through text-[#8e98b0]"
                          : "text-white"
                      }`}
                    >
                      {quest.title}
                    </span>

                    {quest.isAutoGenerated ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#4f5fd8]/15 text-[#9cb1ff] border border-[#4f5fd8]/30">
                        {t("studyRoom.autoBadge", undefined, "Tự động")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {t("studyRoom.customBadge", undefined, "Tự đặt")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button for custom tasks */}
                {!quest.isAutoGenerated && (
                  <button
                    onClick={() => handleDelete(quest.id)}
                    disabled={deletingId === quest.id}
                    className="p-1.5 rounded-xl text-[#545d78] hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer shrink-0"
                    title={t(
                      "studyRoom.deleteQuest",
                      undefined,
                      "Xóa nhiệm vụ",
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress bar per quest */}
              {!quest.isCompleted && quest.targetCount > 1 && (
                <div className="w-full h-1.5 bg-[#0f111a] rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className="h-full bg-[#4f5fd8] transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}

              {/* Bottom row: Progress details + Action Button "Do Now" moved down */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8e98b0]">
                  <span>
                    {quest.currentCount} / {quest.targetCount}
                  </span>
                  <span>•</span>
                  <span>{percent}%</span>
                </div>

                {/* Custom nút do now xuống dưới */}
                {quest.actionUrl && !quest.isCompleted && (
                  <Link
                    to={quest.actionUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9cb1ff] hover:text-white bg-[#4f5fd8]/15 hover:bg-[#4f5fd8] px-3 py-1.5 rounded-xl border border-[#4f5fd8]/30 hover:border-[#4f5fd8] transition-all cursor-pointer active:scale-95 ml-auto"
                  >
                    <span>
                      {t("studyRoom.doQuestBtn", undefined, "Làm ngay")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Task Form */}
      <form
        onSubmit={handleAddCustom}
        className="pt-3 border-t border-white/[0.08] flex items-center gap-2"
      >
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder={t(
            "studyRoom.addCustomPlaceholder",
            undefined,
            "+ Thêm nhiệm vụ tự đặt cho hôm nay...",
          )}
          maxLength={80}
          className="flex-1 bg-[#141824] border border-white/[0.08] focus:border-[#4f5fd8] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none placeholder-[#545d78] transition-colors"
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={!customTitle.trim() || isAdding}
          loading={isAdding}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          {t("common.add", undefined, "Thêm")}
        </Button>
      </form>
    </div>
  );
};
