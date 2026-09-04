import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchDueReviews } from "../../store/slices/studySlice";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { studyApi } from "../../api/studyApi";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import { Spinner } from "../../components/common/Spinner";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Flame,
  Sparkles,
  RotateCcw,
  Trophy,
  Target,
  X,
  ChevronRight,
} from "lucide-react";
import { Card, UserCardProgress } from "../../types";
import { useTranslation } from "../../i18n";

export const DueReviewsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dueReviews, loading } = useAppSelector((state) => state.study);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"due" | "mistakes">("due");
  const [mistakeCards, setMistakeCards] = useState<
    Array<Card & { progress: UserCardProgress; studySetTitle?: string }>
  >([]);
  const [loadingMistakes, setLoadingMistakes] = useState(false);

  // Mistake Quiz State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      card: Card & { progress: UserCardProgress; studySetTitle?: string };
      options: string[];
      correctOption: string;
    }>
  >([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    isCorrect: boolean;
    prevLapses: number;
    newLapses: number;
    removedFromMistakeBank: boolean;
  } | null>(null);
  const [quizHistory, setQuizHistory] = useState<
    Array<{
      cardId: string;
      term: string;
      isCorrect: boolean;
      removed: boolean;
    }>
  >([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const refreshMistakeBank = async () => {
    setLoadingMistakes(true);
    try {
      const res = await studyApi.getMistakeBank();
      setMistakeCards(res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingMistakes(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDueReviews(undefined));
      refreshMistakeBank();
    }
  }, [dispatch, isAuthenticated]);

  const startMistakeQuiz = (cardsToQuiz = mistakeCards) => {
    if (!cardsToQuiz.length) return;
    const shuffledCards = [...cardsToQuiz].sort(() => Math.random() - 0.5);

    const allDefs = Array.from(new Set(mistakeCards.map((c) => c.definition)));
    const fallbackDefs = [
      "To cause someone to feel very enthusiastic or excited",
      "Showing or feeling hesitation or reluctance",
      "Having a great deal of variety or diversity",
      "Extremely important, essential, or necessary",
      "To express disapproval of something or someone",
    ];

    const generated = shuffledCards.map((c) => {
      const correctOption = c.definition;
      const otherDefs = allDefs.filter((d) => d !== correctOption);
      const shuffledOthers = otherDefs.sort(() => Math.random() - 0.5);
      const distractors: string[] = [];
      for (const d of shuffledOthers) {
        if (distractors.length < 3) distractors.push(d);
      }
      for (const fb of fallbackDefs) {
        if (
          distractors.length < 3 &&
          fb !== correctOption &&
          !distractors.includes(fb)
        ) {
          distractors.push(fb);
        }
      }
      const options = [correctOption, ...distractors].sort(
        () => Math.random() - 0.5,
      );
      return { card: c, options, correctOption };
    });

    setQuizQuestions(generated);
    setQuizIndex(0);
    setSelectedOption(null);
    setAnswerFeedback(null);
    setQuizHistory([]);
    setIsQuizCompleted(false);
    setIsQuizMode(true);
  };

  const handleSelectOption = async (option: string) => {
    if (selectedOption !== null || isSubmittingAnswer) return;
    setSelectedOption(option);
    const currentQ = quizQuestions[quizIndex];
    const isCorrect = option === currentQ.correctOption;
    const prevLapses = currentQ.card.progress?.lapses || 1;

    setIsSubmittingAnswer(true);
    let newLapses = isCorrect ? Math.max(0, prevLapses - 1) : prevLapses + 1;
    let removedFromMistakeBank = newLapses === 0;

    try {
      const res = await studyApi.submitMistakeAnswer({
        cardId: currentQ.card.id,
        isCorrect,
      });
      newLapses = res.data.lapses;
      removedFromMistakeBank = res.data.removedFromMistakeBank;
    } catch {
      // fallback to optimistic computation
    } finally {
      setIsSubmittingAnswer(false);
    }

    setAnswerFeedback({
      isCorrect,
      prevLapses,
      newLapses,
      removedFromMistakeBank,
    });

    setQuizHistory((prev) => [
      ...prev,
      {
        cardId: currentQ.card.id,
        term: currentQ.card.term,
        isCorrect,
        removed: removedFromMistakeBank,
      },
    ]);

    // Update local mistakeCards state
    setMistakeCards((prev) => {
      if (removedFromMistakeBank) {
        return prev.filter((c) => c.id !== currentQ.card.id);
      }
      return prev.map((c) => {
        if (c.id === currentQ.card.id) {
          return {
            ...c,
            progress: {
              ...c.progress,
              lapses: newLapses,
            },
          };
        }
        return c;
      });
    });
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerFeedback(null);
    } else {
      setIsQuizCompleted(true);
      if (isAuthenticated) {
        dispatch(recordStudyStreak());
      }
    }
  };

  const handleExitQuiz = () => {
    setIsQuizMode(false);
    setIsQuizCompleted(false);
    setSelectedOption(null);
    setAnswerFeedback(null);
    refreshMistakeBank();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-[#586380] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("srs.title", undefined, "SRS Review & Mistake Hub")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "srs.subtitle",
            undefined,
            "Spaced Repetition schedules personalized review intervals and tracks tricky words based on your learning history.",
          )}
        </p>
        <Link to="/login">
          <Button variant="primary" size="lg">
            {t("nav.login", undefined, "Log In Now")}
          </Button>
        </Link>
      </div>
    );
  }

  if (loading && activeTab === "due" && !isQuizMode) {
    return (
      <Spinner
        size="lg"
        label={t(
          "common.loading",
          undefined,
          "Checking Spaced Repetition queue...",
        )}
        className="py-24"
      />
    );
  }

  // QUIZ MODE RENDER
  if (isQuizMode) {
    if (isQuizCompleted) {
      const correctCount = quizHistory.filter((h) => h.isCorrect).length;
      const incorrectCount = quizHistory.filter((h) => !h.isCorrect).length;
      const removedCount = quizHistory.filter((h) => h.removed).length;
      const accuracyPercent = Math.round(
        (correctCount / (quizHistory.length || 1)) * 100,
      );

      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-16">
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white">
                {t(
                  "srs.quizResultTitle",
                  undefined,
                  "Mistake Practice Completed! 🎉",
                )}
              </h1>
              <p className="text-sm text-[#939bb4]">
                {t(
                  "srs.quizResultSubtitle",
                  undefined,
                  "Summary of your recent mistake bank quiz session.",
                )}
              </p>
            </div>

            {/* Accuracy Score */}
            <div className="py-4 border-y border-[#2e3856]/60">
              <span className="text-5xl font-black text-emerald-400">
                {accuracyPercent}%
              </span>
              <p className="text-xs font-bold text-[#939bb4] uppercase tracking-wider mt-1">
                {t("srs.quizAccuracy", undefined, "Accuracy")}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a092d]/60 border border-emerald-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-400">
                  {correctCount}
                </div>
                <div className="text-[11px] font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatCorrect", undefined, "Correct")}
                </div>
              </div>

              <div className="bg-[#0a092d]/60 border border-rose-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-rose-400">
                  {incorrectCount}
                </div>
                <div className="text-[11px] font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatIncorrect", undefined, "Incorrect")}
                </div>
              </div>

              <div className="bg-[#0a092d]/60 border border-purple-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-purple-400">
                  {removedCount}
                </div>
                <div className="text-[11px] font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatRemoved", undefined, "Resolved (0 Mistakes)")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {mistakeCards.length > 0 && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startMistakeQuiz(mistakeCards)}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  {t(
                    "srs.quizRetryRemaining",
                    { count: mistakeCards.length },
                    `Practice Remaining Mistakes (${mistakeCards.length})`,
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleExitQuiz}
                className="w-full sm:w-auto"
              >
                {t("srs.quizBackToMistakes", undefined, "Back to Mistake Bank")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return null;

    const currentLapses =
      answerFeedback !== null
        ? answerFeedback.newLapses
        : currentQ.card.progress?.lapses || 1;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-16">
        {/* Quiz Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6366F1] bg-[#4257B2]/20 px-3 py-1 rounded-lg">
              {t(
                "srs.quizProgress",
                { current: quizIndex + 1, total: quizQuestions.length },
                `Question ${quizIndex + 1} of ${quizQuestions.length}`,
              )}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitQuiz}
            icon={<X className="w-4 h-4" />}
            className="text-[#939bb4] hover:text-white"
          >
            {t("srs.quizExitBtn", undefined, "Exit Quiz")}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1a1d36] h-2 rounded-full overflow-hidden border border-[#2e3856]">
          <div
            className="bg-gradient-to-r from-[#6366F1] to-emerald-400 h-full transition-all duration-300"
            style={{
              width: `${((quizIndex + (selectedOption !== null ? 1 : 0)) / quizQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Prompt Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {currentQ.card.term}
              </h2>
              <AudioButton text={currentQ.card.term} size="md" showAccentToggle={true} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-rose-400" />
                {t(
                  "srs.lapsesCount",
                  { count: currentLapses },
                  `${currentLapses} lapses`,
                )}
              </span>
            </div>
          </div>

          {currentQ.card.example && (
            <p className="text-sm text-[#939bb4] italic border-l-2 border-[#4257B2] pl-3 py-0.5">
              &quot;{currentQ.card.example}&quot;
            </p>
          )}
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOption === option;
            const isCorrectOption = option === currentQ.correctOption;

            let optionStyle =
              "bg-[#1a1d36] border-[#2e3856] hover:border-[#6366F1] text-white hover:bg-[#1f2342]";

            if (selectedOption !== null) {
              if (isSelected) {
                if (isCorrectOption) {
                  optionStyle =
                    "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10";
                } else {
                  optionStyle =
                    "bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10";
                }
              } else if (isCorrectOption) {
                optionStyle =
                  "bg-emerald-500/10 border-emerald-500/60 text-emerald-300";
              } else {
                optionStyle =
                  "bg-[#1a1d36]/50 border-[#2e3856]/40 text-[#586380] opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isSelected
                      ? isCorrectOption
                        ? "bg-emerald-500 text-white border-emerald-400"
                        : "bg-rose-500 text-white border-rose-400"
                      : selectedOption !== null && isCorrectOption
                        ? "bg-emerald-500/40 text-white border-emerald-400"
                        : "bg-[#0a092d] text-[#939bb4] border-[#2e3856]"
                  }`}
                >
                  {letter}
                </span>

                <span className="text-sm font-semibold leading-relaxed pt-0.5 flex-1">
                  {option}
                </span>

                {selectedOption !== null && (
                  <span className="shrink-0 pt-0.5">
                    {isCorrectOption ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Progression Banner */}
        {answerFeedback !== null && (
          <div className="space-y-4 animate-fade-in pt-2">
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                answerFeedback.isCorrect
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/40 text-rose-300"
              }`}
            >
              {answerFeedback.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div className="text-sm font-bold leading-relaxed">
                {answerFeedback.isCorrect
                  ? answerFeedback.removedFromMistakeBank
                    ? t(
                        "srs.quizMasteredFeedback",
                        undefined,
                        "Great job! Mastered and removed from Mistake Bank! 🎉",
                      )
                    : t(
                        "srs.quizCorrectFeedback",
                        {
                          from: answerFeedback.prevLapses,
                          to: answerFeedback.newLapses,
                        },
                        `Correct! Mistakes: ${answerFeedback.prevLapses} ➔ ${answerFeedback.newLapses}`,
                      )
                  : t(
                      "srs.quizIncorrectFeedback",
                      {
                        from: answerFeedback.prevLapses,
                        to: answerFeedback.newLapses,
                      },
                      `Incorrect! Mistakes: ${answerFeedback.prevLapses} ➔ ${answerFeedback.newLapses}`,
                    )}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextQuizQuestion}
              icon={<ChevronRight className="w-5 h-5" />}
              className="w-full justify-center text-base font-bold shadow-lg shadow-[#4257B2]/30 py-3.5"
            >
              {quizIndex + 1 < quizQuestions.length
                ? t("studySet.next", undefined, "Next Question")
                : t("studySet.finish", undefined, "Finish Quiz 🎯")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // REGULAR DUE REVIEWS & MISTAKE BANK VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1d36] via-[#161932] to-[#0a092d] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#121420] border border-white/[0.08] flex items-center justify-center text-[#4f5fd8] shrink-0 shadow-xs">
            <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {t("srs.title", undefined, "Spaced Repetition & Mistake Bank")}
            </h1>
            <p className="text-xs sm:text-sm text-[#8e98b0] leading-relaxed">
              {t(
                "srs.subtitle",
                undefined,
                "Consolidate your long-term memory with SuperMemo-2 Spaced Repetition and target tricky vocabulary.",
              )}
            </p>
          </div>
        </div>

        {activeTab === "due" && dueReviews.length > 0 && (
          <Link
            to={dueReviews[0] ? `/sets/${dueReviews[0].studySetId}/learn` : "/"}
            className="shrink-0 w-full sm:w-auto"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto justify-center"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t(
                "srs.startReviewBtn",
                { count: dueReviews.length },
                `Start Review (${dueReviews.length} cards) 🚀`,
              )}
            </Button>
          </Link>
        )}

        {activeTab === "mistakes" && mistakeCards.length > 0 && (
          <Button
            variant="primary"
            size="md"
            onClick={() => startMistakeQuiz()}
            icon={<Target className="w-4 h-4" />}
            className="shrink-0 w-full sm:w-auto justify-center shadow-xs"
          >
            {t(
              "srs.startMistakeQuizBtn",
              { count: mistakeCards.length },
              `Practice Mistake Quiz (${mistakeCards.length} words) 🎯`,
            )}
          </Button>
        )}
      </div>

      {/* Tabs: Symmetrical 2-Column Grid on Mobile, Flex on Desktop */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => setActiveTab("due")}
          className={`w-full sm:w-auto px-2.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
            activeTab === "due"
              ? "bg-[#4f5fd8] text-white shadow-xs border border-[#6978f8]/40"
              : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">
            {t("srs.tabDue", undefined, "Due for Review")}
          </span>
          <span
            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black font-mono shrink-0 ${
              activeTab === "due"
                ? "bg-white/20 text-white"
                : "bg-white/[0.08] text-[#8e98b0]"
            }`}
          >
            {dueReviews.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("mistakes")}
          className={`w-full sm:w-auto px-2.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
            activeTab === "mistakes"
              ? "bg-[#4f5fd8] text-white shadow-xs border border-[#6978f8]/40"
              : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
          <span className="truncate">
            {t("srs.tabMistakes", undefined, "Mistake Bank")}
          </span>
          <span
            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black font-mono shrink-0 ${
              activeTab === "mistakes"
                ? "bg-white/20 text-white"
                : "bg-white/[0.08] text-[#8e98b0]"
            }`}
          >
            {mistakeCards.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Due Reviews */}
      {activeTab === "due" && (
        <>
          {dueReviews.length === 0 ? (
            <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {t(
                  "srs.noDueTitle",
                  undefined,
                  "All caught up! No reviews due today 🎉",
                )}
              </h2>
              <p className="text-sm text-[#939bb4] max-w-md mx-auto">
                {t(
                  "srs.noDueDesc",
                  undefined,
                  "You have completed all spaced repetition reviews for today. Try exploring new study sets or practice your Mistake Bank!",
                )}
              </p>
              <div className="pt-2">
                <Link to="/">
                  <Button variant="outline" size="md">
                    {t("nav.explore", undefined, "Explore Sets")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-[#6366F1]" />
                    <span>
                      {t("srs.tabDue", undefined, "Due for Review")} (
                      {dueReviews.length})
                    </span>
                  </h2>
                  <p className="text-xs text-[#939bb4] mt-0.5">
                    {t(
                      "srs.dueCardDesc",
                      undefined,
                      "Cards scheduled by SM-2 spaced repetition algorithm for memory reinforcement.",
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dueReviews.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#1a1d36] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-5 transition-all space-y-3 shadow-md group relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">
                          {card.term}
                        </h3>
                        <AudioButton text={card.term} size="sm" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {card.progress.lapses > 0 && (
                          <span className="text-[10px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-rose-400" />
                            {t(
                              "srs.lapsesCount",
                              { count: card.progress.lapses },
                              `${card.progress.lapses} lapses`,
                            )}
                          </span>
                        )}
                        <span className="text-[10px] font-bold bg-[#2e3856] text-[#939bb4] px-2 py-0.5 rounded-md">
                          {t(
                            "srs.easeFactor",
                            { val: card.progress.easeFactor || 2.5 },
                            `EF: ${card.progress.easeFactor || 2.5}`,
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-[#d9dde8]">
                      {card.definition}
                    </p>

                    {card.example && (
                      <p className="text-xs text-[#939bb4] italic">
                        &quot;{card.example}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#2e3856] text-xs">
                      <span className="text-[#586380] truncate max-w-[180px]">
                        Set: {(card as any).studySetTitle || "Study Set"}
                      </span>
                      <Link
                        to={`/sets/${card.studySetId}/learn`}
                        className="text-[#6366F1] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>
                          {t("common.studyNow", undefined, "Review Now")}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Mistake Bank */}
      {activeTab === "mistakes" && (
        <>
          {loadingMistakes ? (
            <Spinner
              size="md"
              label={t(
                "common.loading",
                undefined,
                "Loading Mistake Bank cards...",
              )}
              className="py-12"
            />
          ) : mistakeCards.length === 0 ? (
            <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {t(
                  "srs.noMistakesTitle",
                  undefined,
                  "Mistake Bank is Empty! 🌟",
                )}
              </h2>
              <p className="text-sm text-[#939bb4] max-w-md mx-auto">
                {t(
                  "srs.noMistakesDesc",
                  undefined,
                  "You have zero recorded lapses right now. Keep up your remarkable accuracy!",
                )}
              </p>
              <Link to="/">
                <Button variant="outline" size="md">
                  {t("nav.explore", undefined, "Explore Sets")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-400 fill-rose-400" />
                    <span>
                      {t(
                        "srs.tabMistakes",
                        undefined,
                        "Tricky Vocabulary & Lapses",
                      )}{" "}
                      ({mistakeCards.length})
                    </span>
                  </h2>
                  <p className="text-xs text-[#939bb4] mt-0.5">
                    {t(
                      "srs.mistakeCardDesc",
                      undefined,
                      "Cards sorted by frequency of mistakes and difficulty factor. Practice anytime.",
                    )}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => startMistakeQuiz()}
                  icon={<Target className="w-4 h-4" />}
                  className="shadow-lg shadow-[#4257B2]/20 shrink-0"
                >
                  {t(
                    "srs.startMistakeQuizBtn",
                    { count: mistakeCards.length },
                    `Practice Mistake Quiz (${mistakeCards.length} words) 🎯`,
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mistakeCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#1a1d36] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-5 transition-all space-y-3 shadow-md group relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">
                          {card.term}
                        </h3>
                        <AudioButton text={card.term} size="sm" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {card.progress.lapses > 0 && (
                          <span className="text-[10px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-rose-400" />
                            {t(
                              "srs.lapsesCount",
                              { count: card.progress.lapses },
                              `${card.progress.lapses} lapses`,
                            )}
                          </span>
                        )}
                        <span className="text-[10px] font-bold bg-[#2e3856] text-[#939bb4] px-2 py-0.5 rounded-md">
                          {t(
                            "srs.easeFactor",
                            { val: card.progress.easeFactor || 2.5 },
                            `EF: ${card.progress.easeFactor || 2.5}`,
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-[#d9dde8]">
                      {card.definition}
                    </p>

                    {card.example && (
                      <p className="text-xs text-[#939bb4] italic">
                        &quot;{card.example}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#2e3856] text-xs">
                      <span className="text-[#586380] truncate max-w-[180px]">
                        Set: {card.studySetTitle || "Study Set"}
                      </span>
                      <Link
                        to={`/sets/${card.studySetId}/learn`}
                        className="text-[#6366F1] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>
                          {t("common.studyNow", undefined, "Train Term")}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
