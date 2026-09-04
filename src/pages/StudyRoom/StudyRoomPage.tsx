import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { studyRoomApi } from "../../api/studyRoomApi";
import { StudyRoomDashboardData, TimerMode } from "../../types/studyRoom.types";
import { useStudyTimer } from "../../hooks/useStudyTimer";
import { FocusTimerCard } from "../../components/studyRoom/FocusTimerCard";
import { DailyQuestsCard } from "../../components/studyRoom/DailyQuestsCard";
import { SRSForecastCard } from "../../components/studyRoom/SRSForecastCard";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { useTranslation } from "../../i18n";
import { Clock, Sparkles, BrainCircuit, Plus } from "lucide-react";

export const StudyRoomPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [dashboard, setDashboard] = useState<StudyRoomDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studyRoomApi.getDailyDashboard();
      setDashboard(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadDashboard]);

  // Handle Focus Session Completion
  const handleSessionComplete = useCallback(
    async (sessionData: {
      mode: TimerMode;
      durationSeconds: number;
      deckId?: string;
    }) => {
      try {
        const startedAt = new Date(
          Date.now() - sessionData.durationSeconds * 1000,
        ).toISOString();
        const completedAt = new Date().toISOString();

        await studyRoomApi.recordSession({
          mode: sessionData.mode,
          durationSeconds: sessionData.durationSeconds,
          deckId: sessionData.deckId,
          startedAt,
          completedAt,
        });

        const mins = Math.round(sessionData.durationSeconds / 60);
        dispatch(
          addToast({
            message: t(
              "studyRoom.sessionCompletedToast",
              { mins },
              `Xuất sắc! Bạn đã hoàn thành ${mins} phút tập trung học tập 🎉`,
            ),
            type: "success",
          }),
        );

        // Refresh dashboard data to reflect newly recorded focus minutes
        loadDashboard();
      } catch {
        // ignore
      }
    },
    [dispatch, loadDashboard, t],
  );

  const timer = useStudyTimer(handleSessionComplete);

  // Toggle Quest Status
  const handleToggleQuest = async (questId: string) => {
    if (!dashboard) return;

    // Optimistic update
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quests: prev.quests.map((q) => {
          if (q.id === questId) {
            const isCompleted = !q.isCompleted;
            return {
              ...q,
              isCompleted,
              currentCount: isCompleted ? q.targetCount : 0,
            };
          }
          return q;
        }),
      };
    });

    try {
      await studyRoomApi.toggleQuest(questId);
    } catch {
      // Revert if error
      loadDashboard();
    }
  };

  // Create Custom Quest
  const handleCreateCustomQuest = async (title: string) => {
    try {
      const res = await studyRoomApi.createCustomQuest({ title });
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          quests: [...prev.quests, res.data],
        };
      });
      dispatch(
        addToast({
          message: t(
            "studyRoom.questAddedToast",
            undefined,
            "Đã thêm nhiệm vụ học tập mới!",
          ),
          type: "success",
        }),
      );
    } catch {
      dispatch(
        addToast({
          message: "Failed to create task",
          type: "error",
        }),
      );
    }
  };

  // Delete Custom Quest
  const handleDeleteCustomQuest = async (questId: string) => {
    // Optimistic deletion
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quests: prev.quests.filter((q) => q.id !== questId),
      };
    });

    try {
      await studyRoomApi.deleteCustomQuest(questId);
      dispatch(
        addToast({
          message: t(
            "studyRoom.questDeletedToast",
            undefined,
            "Đã xóa nhiệm vụ học tập!",
          ),
          type: "info",
        }),
      );
    } catch {
      // Revert if error
      loadDashboard();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Clock className="w-12 h-12 text-[#586380] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("studyRoom.title", undefined, "Góc Học Tập & Bàn Tập Trung")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "studyRoom.loginRequired",
            undefined,
            "Đăng nhập để vào Góc học tập, theo dõi nhiệm vụ hàng ngày và đồng hồ Pomodoro.",
          )}
        </p>
        <Link to="/login">
          <Button variant="primary" size="lg">
            {t("nav.login", undefined, "Đăng nhập ngay")}
          </Button>
        </Link>
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Đang tải Góc học tập...")}
        className="py-24"
      />
    );
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t("studyRoom.greetingMorning", undefined, "Chào buổi sáng")
      : currentHour < 18
        ? t("studyRoom.greetingAfternoon", undefined, "Chào buổi chiều")
        : t("studyRoom.greetingEvening", undefined, "Chào buổi tối");

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-[#0f111a] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {t(
                  "studyRoom.badge",
                  undefined,
                  "Không Gian Học Tập Tập Trung",
                )}
              </span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {greeting}, {user?.name || "Học viên"}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-[#8e98b0] max-w-xl leading-relaxed">
            {t(
              "studyRoom.headerDesc",
              undefined,
              "Hoàn thành các nhiệm vụ hôm nay, bật Pomodoro để tập trung sâu và duy trì chuỗi học tập của bạn.",
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <Link to="/reviews">
            <Button
              variant="primary"
              size="md"
              icon={<BrainCircuit className="w-4 h-4" />}
            >
              {t("studyRoom.startReviewBtn", undefined, "Ôn tập SRS 🚀")}
            </Button>
          </Link>
          <Link to="/sets/create">
            <Button
              variant="outline"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              {t("studyRoom.createSetBtn", undefined, "Tạo bộ thẻ")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Module A: Focus Timer Card */}
          <FocusTimerCard
            mode={timer.mode}
            isRunning={timer.isRunning}
            timeLeft={timer.timeLeft}
            stopwatchSeconds={timer.stopwatchSeconds}
            progressPercent={timer.progressPercent}
            startTimer={timer.startTimer}
            pauseTimer={timer.pauseTimer}
            resetTimer={timer.resetTimer}
            switchMode={timer.switchMode}
            skipTimer={timer.skipTimer}
          />

          {/* Module B: Daily Quests Card */}
          <DailyQuestsCard
            quests={dashboard.quests}
            onToggleQuest={handleToggleQuest}
            onCreateCustomQuest={handleCreateCustomQuest}
            onDeleteCustomQuest={handleDeleteCustomQuest}
          />
        </div>
      )}

      {/* Module C: SRS 7-Day Forecast & Habit Streak Summary */}
      {dashboard && (
        <div className="w-full">
          <SRSForecastCard
            srsForecast={dashboard.srsForecast}
            streak={dashboard.streak}
            todayStats={dashboard.todayStats}
          />
        </div>
      )}
    </div>
  );
};
