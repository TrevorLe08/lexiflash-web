import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { studyApi } from "../../api/studyApi";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import { StudyHeaderBar } from "../../components/study/StudyHeaderBar";
import { triggerConfetti } from "../../utils/confetti";
import { BrainCircuit, RotateCcw, Trophy, CheckCircle2 } from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Card, SetStudyProgressSummary, StudyMode } from "../../types";
import {
  updateUserStreak,
  recordStudyStreak,
} from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

export const LearnMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDueOnly = searchParams.get("dueOnly") === "true";
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { currentSet, loading } = useAppSelector((state) => state.studySets);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [cards, setCards] = useState<Card[]>([]);
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);
  const [loadingDue, setLoadingDue] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progressSummary, setProgressSummary] =
    useState<SetStudyProgressSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastIntervalFeedback, setLastIntervalFeedback] = useState<
    string | null
  >(null);
  const hasHardOrForgotRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
      studyApi.getProgress(id).then((res) => {
        if (res.data) setProgressSummary(res.data);
      });

      if (isDueOnly) {
        setLoadingDue(true);
        studyApi
          .getDueReviews(id)
          .then((res) => {
            const dueList = res.data || [];
            setCards(dueList);
            setDueCardsCount(dueList.length);
            setCurrentIndex(0);
            setShowAnswer(false);
            setIsCompleted(false);
          })
          .catch(() => {})
          .finally(() => {
            setLoadingDue(false);
          });
      } else {
        studyApi
          .getDueReviews(id)
          .then((res) => {
            const dueList = res.data || [];
            setDueCardsCount(dueList.length);
          })
          .catch(() => {});
      }
    }
  }, [dispatch, id, isDueOnly]);

  useEffect(() => {
    if (!isDueOnly && currentSet?.cards) {
      setCards(currentSet.cards);
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsCompleted(false);
    }
  }, [currentSet, isDueOnly]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <BrainCircuit className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("auth.loginTitle", undefined, "Log in to use Learn Mode")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "srs.subtitle",
            undefined,
            "Learn Mode uses SuperMemo-2 Spaced Repetition algorithms to personalize your review schedule and track long-term memory.",
          )}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to={`/sets/${id}/flashcards`}>
            <Button variant="secondary" size="md">
              {t("modes.flashcardsTitle", undefined, "Try Flashcards Free")}
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="md">
              {t("nav.login", undefined, "Log In Now")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleRateQuality = async (quality: number) => {
    if (!currentCard || !id) return;
    setIsSubmitting(true);

    if (quality <= 2) {
      hasHardOrForgotRef.current = true;
    }

    try {
      if (isAuthenticated) {
        const response = await studyApi.submitLearnAnswer(id, {
          cardId: currentCard.id,
          quality,
        });
        const { progress } = response.data;
        if ((response.data as any).streak) {
          dispatch(updateUserStreak((response.data as any).streak));
        }
        setLastIntervalFeedback(
          t("modes.nextReviewIn", {
            days: progress.intervalDays,
            status: progress.status,
          }),
        );
      }

      // Move to next card or complete round
      if (currentIndex < cards.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setShowAnswer(false);
          setLastIntervalFeedback(null);
          setIsSubmitting(false);
        }, 400);
      } else {
        setIsCompleted(true);
        setIsSubmitting(false);
        triggerConfetti();
        if (isAuthenticated) {
          dispatch(recordStudyStreak());
          const timeSpentSeconds = Math.max(
            1,
            Math.round((Date.now() - startTimeRef.current) / 1000),
          );
          studyApi
            .recordSession({
              studySetId: id,
              mode: StudyMode.LEARN,
              cardsTotal: cards.length,
              cardsCorrect: cards.length,
              cardsIncorrect: hasHardOrForgotRef.current ? 1 : 0,
              timeSpentSeconds,
            })
            .catch(() => {});
        }
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsCompleted(false);
    hasHardOrForgotRef.current = false;
    startTimeRef.current = Date.now();
    if (isDueOnly && id) {
      setLoadingDue(true);
      studyApi
        .getDueReviews(id)
        .then((res) => {
          const dueList = res.data || [];
          setCards(dueList);
          setDueCardsCount(dueList.length);
        })
        .catch(() => {})
        .finally(() => {
          setLoadingDue(false);
        });
    }
  };

  if (loading || loadingDue) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading Learn Mode...")}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  if (isDueOnly && cards.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          {t(
            "srs.noDueInSetTitle",
            undefined,
            "Không có từ nào đến hạn ôn tập! 🎉",
          )}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "srs.noDueInSetDesc",
            undefined,
            "Học phần này hiện không có từ vựng nào đến hạn ôn tập SM-2 hôm nay.",
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setSearchParams({})}
          >
            {t(
              "srs.allCardsAction",
              { count: currentSet.cards.length },
              `Ôn tập toàn bộ (${currentSet.cards.length} từ)`,
            )}
          </Button>
          <Link to={`/sets/${id}`}>
            <Button variant="outline" size="md">
              {t("common.backToSet", undefined, "Quay lại học phần")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent =
    cards.length > 0
      ? Math.round(((currentIndex + 1) / cards.length) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Unified Study Header Bar */}
      <div className="space-y-3">
        <StudyHeaderBar
          current={isCompleted ? cards.length : currentIndex + 1}
          total={cards.length}
          backUrl={`/sets/${id}`}
          percent={progressPercent}
        />

        {/* Due Only / All Cards Mode Switcher */}
        {isDueOnly ? (
          <div className="bg-[#4f5fd8]/15 border border-[#4f5fd8]/40 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
            <span className="text-white font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t(
                "srs.onlyDueBadge",
                { count: cards.length },
                `Ôn tập từ đến hạn (${cards.length} từ)`,
              )}
            </span>
            {currentSet.cards.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="text-[#9cb1ff] hover:text-white underline cursor-pointer transition-all shrink-0 font-medium"
              >
                {t(
                  "srs.allCardsAction",
                  { count: currentSet.cards.length },
                  `Ôn tập toàn bộ (${currentSet.cards.length} từ)`,
                )}
              </button>
            )}
          </div>
        ) : dueCardsCount > 0 ? (
          <div className="bg-[#4f5fd8]/15 border border-[#4f5fd8]/40 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
            <span className="text-white font-medium flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#7988ff]" />
              {t(
                "srs.onlyDueBanner",
                { count: dueCardsCount },
                `Học phần này có ${dueCardsCount} từ đến hạn ôn tập hôm nay.`,
              )}
            </span>
            <button
              type="button"
              onClick={() => setSearchParams({ dueOnly: "true" })}
              className="bg-[#4f5fd8] hover:bg-[#5e6ef8] text-white px-3 py-1 rounded-xl font-bold cursor-pointer transition-all shrink-0 active:scale-95"
            >
              {t("srs.onlyDueAction", undefined, "Chỉ ôn từ đến hạn")}
            </button>
          </div>
        ) : null}

        {/* SRS Mastery Summary Dots */}
        {progressSummary && (
          <div className="flex items-center justify-between text-xs text-[#939bb4] px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t("modes.masteredStat", {
                count: progressSummary.masteredCount,
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t("modes.learningStat", {
                count: progressSummary.learningCount,
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              {t("modes.notStudiedStat", {
                count: progressSummary.notStudiedCount,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Learn Card Interactive Interface */}
      {isCompleted ? (
        <div className="bg-[#1a1d36] border-2 border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-scale-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-3xl font-black text-white">
              {isDueOnly
                ? t(
                    "srs.dueReviewCompleteTitle",
                    undefined,
                    "Hoàn Thành Ôn Tập Từ Đến Hạn! 🎉",
                  )
                : t(
                    "modes.learnCompleteTitle",
                    undefined,
                    "Adaptive Learning Round Complete! 🎉",
                  )}
            </h2>
            <p className="text-sm text-[#939bb4]">
              {isDueOnly
                ? t(
                    "srs.dueReviewCompleteDesc",
                    undefined,
                    "Tất cả các từ vựng đến hạn hôm nay đã được củng cố theo chu kỳ Spaced Repetition (SM-2). Trí nhớ dài hạn của bạn đang được tối ưu hóa!",
                  )
                : t(
                    "modes.learnCompleteDesc",
                    undefined,
                    "The Spaced Repetition engine has recorded your recall intervals. Cards with difficulty will be scheduled sooner for optimal retention.",
                  )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleRestart}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {t("modes.studyAgain", undefined, "Study Again")}
            </Button>
            {isDueOnly && (
              <Link to="/reviews">
                <Button variant="outline" size="lg">
                  {t("srs.dueReviewBackToList", undefined, "Quay về danh sách")}
                </Button>
              </Link>
            )}
            <Link to={`/sets/${id}/test`}>
              <Button variant="gradient" size="lg">
                {t("modes.takeQuizTest", undefined, "Take a Quiz / Test 📝")}
              </Button>
            </Link>
          </div>
        </div>
      ) : currentCard ? (
        <div className="bg-[#1a1d36] border-2 border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Card Prompt */}
          <div className="text-center space-y-3 py-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#939bb4] bg-[#2e3856]/60 px-3 py-1 rounded-full border border-[#3c476c]">
              {t(
                "modes.howWellRemember",
                undefined,
                "How well do you remember this term?",
              )}
            </span>

            <div className="flex items-center justify-center gap-3 pt-2">
              <h2 className="text-3xl md:text-5xl font-black text-white">
                {currentCard.term}
              </h2>
              <AudioButton
                text={currentCard.term}
                size="md"
                showAccentToggle={true}
              />
            </div>

            {currentCard.phonetic && (
              <p className="text-base font-mono text-[#939bb4]">
                {currentCard.phonetic}
              </p>
            )}
          </div>

          {/* Reveal Answer Section */}
          {!showAnswer ? (
            <div className="text-center pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowAnswer(true)}
                className="w-full sm:w-auto px-8"
              >
                {t("modes.revealAnswer", undefined, "Reveal Meaning & Example")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-[#2e3856] animate-fade-in">
              <div className="bg-[#0a092d]/80 border border-[#2e3856] rounded-2xl p-6 text-center space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  {t(
                    "modes.vietnameseMeaning",
                    undefined,
                    "Vietnamese Meaning:",
                  )}
                </span>
                <p className="text-2xl font-bold text-white">
                  {currentCard.definition}
                </p>

                {currentCard.example && (
                  <p className="text-sm text-[#939bb4] italic pt-2">
                    "{currentCard.example}"
                  </p>
                )}
              </div>

              {lastIntervalFeedback && (
                <p className="text-xs text-center font-bold text-emerald-400 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  {lastIntervalFeedback}
                </p>
              )}

              {/* SM-2 Recall Rating Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#939bb4] text-center block">
                  {t(
                    "modes.rateRecallDifficulty",
                    undefined,
                    "Rate your recall difficulty (SM-2 Interval Adjustment):",
                  )}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateQuality(1)}
                    className="p-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-base">❌</span>
                    <span>{t("modes.sm2Forgot", undefined, "1. Forgot")}</span>
                    <span className="text-[10px] text-red-400/80 font-normal">
                      {t("modes.sm2ForgotSub", undefined, "Reset interval")}
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateQuality(2)}
                    className="p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-base">⚠️</span>
                    <span>{t("modes.sm2Hard", undefined, "2. Hard")}</span>
                    <span className="text-[10px] text-amber-400/80 font-normal">
                      {t("modes.sm2HardSub", undefined, "Review soon")}
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateQuality(3)}
                    className="p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-base">👍</span>
                    <span>{t("modes.sm2Good", undefined, "3. Good")}</span>
                    <span className="text-[10px] text-blue-400/80 font-normal">
                      {t("modes.sm2GoodSub", undefined, "+1-6 days")}
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateQuality(5)}
                    className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-base">⚡</span>
                    <span>{t("modes.sm2Easy", undefined, "4. Easy")}</span>
                    <span className="text-[10px] text-emerald-400/80 font-normal">
                      {t("modes.sm2EasySub", undefined, "Long interval")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
