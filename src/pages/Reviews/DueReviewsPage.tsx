import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchDueReviews } from "../../store/slices/studySlice";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { studyApi } from "../../api/studyApi";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import { Spinner } from "../../components/common/Spinner";
import { triggerConfetti } from "../../utils/confetti";
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
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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
  const [pressedOption, setPressedOption] = useState<string | null>(null);
  const pressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Due Review State
  const [isDueReviewMode, setIsDueReviewMode] = useState(false);
  const [dueReviewCards, setDueReviewCards] = useState<
    Array<Card & { progress: UserCardProgress; studySetTitle?: string }>
  >([]);
  const [dueReviewIndex, setDueReviewIndex] = useState(0);
  const [dueShowAnswer, setDueShowAnswer] = useState(false);
  const [dueFeedback, setDueFeedback] = useState<string | null>(null);
  const [isSubmittingDue, setIsSubmittingDue] = useState(false);
  const [isDueCompleted, setIsDueCompleted] = useState(false);
  const [dueStats, setDueStats] = useState({
    good: 0,
    easy: 0,
    hard: 0,
    forgot: 0,
  });

  // Enable iOS Safari :active support
  useEffect(() => {
    const enableTouch = () => {};
    window.addEventListener("touchstart", enableTouch, { passive: true });
    return () => window.removeEventListener("touchstart", enableTouch);
  }, []);

  // Cleanup press timer on question index change or unmount
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
        pressTimeoutRef.current = null;
      }
    };
  }, [quizIndex]);

  const handleTouchStartOption = (opt: string) => {
    if (isChecked || isSubmittingAnswer) return;
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    touchStartTimeRef.current = Date.now();
    setPressedOption(opt);
  };

  const handleTouchEndOption = () => {
    if (!touchStartTimeRef.current) {
      setPressedOption(null);
      return;
    }
    const elapsed = Date.now() - touchStartTimeRef.current;
    touchStartTimeRef.current = 0;
    const remaining = Math.max(0, 75 - elapsed);
    if (remaining > 0) {
      pressTimeoutRef.current = setTimeout(() => {
        setPressedOption(null);
        pressTimeoutRef.current = null;
      }, remaining);
    } else {
      setPressedOption(null);
    }
  };

  const handleTouchCancelOption = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    touchStartTimeRef.current = 0;
    setPressedOption(null);
  };

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
    setIsChecked(false);
    setIsCorrect(null);
    setAnswerFeedback(null);
    setQuizHistory([]);
    setIsQuizCompleted(false);
    setIsQuizMode(true);
  };

  const handleOptionSelect = (option: string) => {
    if (isChecked || isSubmittingAnswer) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOption || isSubmittingAnswer) return;

    if (isChecked) {
      handleNextQuizQuestion();
      return;
    }

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return;

    const isCorrectAns = selectedOption === currentQ.correctOption;
    setIsChecked(true);
    setIsCorrect(isCorrectAns);
    setIsSubmittingAnswer(true);

    const prevLapses = currentQ.card.progress?.lapses || 1;
    let newLapses = isCorrectAns ? Math.max(0, prevLapses - 1) : prevLapses + 1;
    let removedFromMistakeBank = newLapses === 0;

    try {
      const res = await studyApi.submitMistakeAnswer({
        cardId: currentQ.card.id,
        isCorrect: isCorrectAns,
      });
      newLapses = res.data.lapses;
      removedFromMistakeBank = res.data.removedFromMistakeBank;
    } catch {
      // fallback to optimistic computation
    } finally {
      setIsSubmittingAnswer(false);
    }

    setAnswerFeedback({
      isCorrect: isCorrectAns,
      prevLapses,
      newLapses,
      removedFromMistakeBank,
    });

    setQuizHistory((prev) => [
      ...prev,
      {
        cardId: currentQ.card.id,
        term: currentQ.card.term,
        isCorrect: isCorrectAns,
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
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    setPressedOption(null);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setIsCorrect(null);
      setAnswerFeedback(null);
    } else {
      setIsQuizCompleted(true);
      if (isAuthenticated) {
        dispatch(recordStudyStreak());
      }
    }
  };

  const handleRestartQuiz = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    setPressedOption(null);
    if (quizQuestions.length > 0) {
      startMistakeQuiz(quizQuestions.map((q) => q.card));
    }
  };

  const handleExitQuiz = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    setPressedOption(null);
    setIsQuizMode(false);
    setIsQuizCompleted(false);
    setSelectedOption(null);
    setIsChecked(false);
    setIsCorrect(null);
    setAnswerFeedback(null);
    refreshMistakeBank();
  };

  const startDueReview = (cardsToReview = dueReviews) => {
    if (!cardsToReview.length) return;
    setDueReviewCards(cardsToReview);
    setDueReviewIndex(0);
    setDueShowAnswer(false);
    setDueFeedback(null);
    setIsDueCompleted(false);
    setDueStats({ good: 0, easy: 0, hard: 0, forgot: 0 });
    setIsDueReviewMode(true);
  };

  const handleRateDueQuality = async (quality: number) => {
    const currentCard = dueReviewCards[dueReviewIndex];
    if (!currentCard || isSubmittingDue) return;

    setIsSubmittingDue(true);
    setDueStats((prev) => ({
      ...prev,
      good: quality === 3 ? prev.good + 1 : prev.good,
      easy: quality === 5 ? prev.easy + 1 : prev.easy,
      hard: quality === 2 ? prev.hard + 1 : prev.hard,
      forgot: quality === 1 ? prev.forgot + 1 : prev.forgot,
    }));

    try {
      const response = await studyApi.submitLearnAnswer(
        currentCard.studySetId,
        {
          cardId: currentCard.id,
          quality,
        },
      );
      const { progress } = response.data;
      setDueFeedback(
        t("modes.nextReviewIn", {
          days: progress.intervalDays,
          status: progress.status,
        }),
      );

      if (dueReviewIndex < dueReviewCards.length - 1) {
        setTimeout(() => {
          setDueReviewIndex((prev) => prev + 1);
          setDueShowAnswer(false);
          setDueFeedback(null);
          setIsSubmittingDue(false);
        }, 400);
      } else {
        setIsDueCompleted(true);
        setIsSubmittingDue(false);
        triggerConfetti();
        dispatch(recordStudyStreak());
        dispatch(fetchDueReviews(undefined));
      }
    } catch {
      setIsSubmittingDue(false);
    }
  };

  const handleRestartDueReview = () => {
    setDueReviewIndex(0);
    setDueShowAnswer(false);
    setDueFeedback(null);
    setIsDueCompleted(false);
    setDueStats({ good: 0, easy: 0, hard: 0, forgot: 0 });
  };

  const handleExitDueReview = () => {
    setIsDueReviewMode(false);
    setIsDueCompleted(false);
    setDueReviewCards([]);
    setDueReviewIndex(0);
    setDueShowAnswer(false);
    setDueFeedback(null);
    dispatch(fetchDueReviews(undefined));
  };

  // Keyboard navigation for desktop Mistake Quiz
  const handleCheckAnswerRef = useRef(handleCheckAnswer);
  useEffect(() => {
    handleCheckAnswerRef.current = handleCheckAnswer;
  });

  useEffect(() => {
    if (!isQuizMode || isQuizCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentQ = quizQuestions[quizIndex];
      if (!currentQ) return;

      if (!isChecked && !isSubmittingAnswer) {
        const key = e.key.toUpperCase();
        let selectedIdx = -1;
        if (key === "1" || key === "A") selectedIdx = 0;
        if (key === "2" || key === "B") selectedIdx = 1;
        if (key === "3" || key === "C") selectedIdx = 2;
        if (key === "4" || key === "D") selectedIdx = 3;

        if (selectedIdx >= 0 && selectedIdx < currentQ.options.length) {
          setSelectedOption(currentQ.options[selectedIdx]);
          return;
        }
      }

      if (e.key === "Enter" || e.key === " ") {
        if (!isSubmittingAnswer && (selectedOption || isChecked)) {
          e.preventDefault();
          handleCheckAnswerRef.current();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isQuizMode,
    isQuizCompleted,
    isChecked,
    selectedOption,
    quizIndex,
    quizQuestions,
    isSubmittingAnswer,
  ]);

  // Keyboard navigation for Due Reviews Mode
  const handleExitDueReviewRef = useRef(handleExitDueReview);
  useEffect(() => {
    handleExitDueReviewRef.current = handleExitDueReview;
  });

  const handleRateDueQualityRef = useRef(handleRateDueQuality);
  useEffect(() => {
    handleRateDueQualityRef.current = handleRateDueQuality;
  });

  useEffect(() => {
    if (!isDueReviewMode || isDueCompleted) return;

    const handleDueKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleExitDueReviewRef.current();
        return;
      }

      if (!dueShowAnswer) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setDueShowAnswer(true);
        }
        return;
      }

      if (!isSubmittingDue) {
        if (e.key === "1") {
          e.preventDefault();
          handleRateDueQualityRef.current(1);
        } else if (e.key === "2") {
          e.preventDefault();
          handleRateDueQualityRef.current(2);
        } else if (e.key === "3") {
          e.preventDefault();
          handleRateDueQualityRef.current(3);
        } else if (e.key === "4" || e.key === "5") {
          e.preventDefault();
          handleRateDueQualityRef.current(5);
        }
      }
    };

    window.addEventListener("keydown", handleDueKeyDown);
    return () => window.removeEventListener("keydown", handleDueKeyDown);
  }, [
    isDueReviewMode,
    isDueCompleted,
    dueShowAnswer,
    isSubmittingDue,
  ]);

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
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-16 px-3 sm:px-0 select-none">
          <div className="bg-[#1a1d36] border-2 border-[#2e3856] border-b-6 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/15">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {t("srs.quizResultTitle", undefined, "Hoàn thành!")}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-white">
                Điểm số: <span className="font-black text-emerald-400">{correctCount}</span> / {quizQuestions.length} điểm
              </p>
            </div>

            {/* Accuracy Score */}
            <div className="py-4 border-y border-[#2e3856]/60">
              <span className="text-5xl sm:text-6xl font-black text-emerald-400">
                {accuracyPercent}%
              </span>
              <p className="text-xs font-bold text-[#939bb4] uppercase tracking-wider mt-1">
                {t("srs.quizAccuracy", undefined, "Độ chính xác")}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-[#0a092d]/70 border-2 border-emerald-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {correctCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatCorrect", undefined, "Đúng")}
                </div>
              </div>

              <div className="bg-[#0a092d]/70 border-2 border-rose-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-rose-400">
                  {incorrectCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatIncorrect", undefined, "Sai")}
                </div>
              </div>

              <div className="bg-[#0a092d]/70 border-2 border-purple-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-purple-400">
                  {removedCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.quizStatRemoved", undefined, "Đã giải phóng")}
                </div>
              </div>
            </div>

            {/* Action Buttons 3D */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="emerald"
                size="md"
                onClick={handleRestartQuiz}
                icon={<RotateCcw className="w-4 h-4" />}
                className="w-full sm:w-auto uppercase tracking-wider"
              >
                <span>{t("srs.quizRestart", undefined, "Làm lại từ đầu?")}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleExitQuiz}
                className="w-full sm:w-auto uppercase tracking-wider"
              >
                <span>{t("srs.quizBackToMistakes", undefined, "Quay lại Mistake Bank")}</span>
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

    const progressPercentage =
      ((quizIndex + (isChecked ? 1 : 0)) / quizQuestions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-fade-in pb-20 px-3 sm:px-0 select-none">
        {/* Top Header: Close, Progress Bar, Question Counter */}
        <div className="w-full flex items-center gap-3 sm:gap-4 pt-2">
          <button
            type="button"
            onClick={handleExitQuiz}
            disabled={isSubmittingAnswer}
            className={`text-[#939bb4] font-bold text-2xl p-1 -ml-1 transition-colors ${
              isSubmittingAnswer
                ? "opacity-30 pointer-events-none cursor-not-allowed"
                : "hover:text-white cursor-pointer"
            }`}
            title={t("srs.quizExitBtn", undefined, "Thoát Quiz")}
          >
            ✕
          </button>

          <div className="flex-1 h-3.5 sm:h-4 bg-[#1a1d36] border border-[#2e3856] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <span className="font-extrabold text-sm sm:text-base text-[#939bb4] font-mono shrink-0">
            {quizIndex + 1}/{quizQuestions.length}
          </span>
        </div>

        {/* Question Prompt Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6366F1] bg-[#4257B2]/20 border border-[#6366F1]/30 px-3 py-1 rounded-lg">
              {t("srs.questionNum", { current: quizIndex + 1 }, `Question ${quizIndex + 1}`)}
            </span>

            <span className="text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
              <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              {t(
                "srs.lapsesCount",
                { count: currentLapses },
                `${currentLapses} lần sai`,
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight break-words">
              {currentQ.card.term}
            </h2>
            <AudioButton
              text={currentQ.card.term}
              size="md"
              showAccentToggle={true}
              disabled={isChecked || isSubmittingAnswer}
            />
          </div>

          {currentQ.card.example && (
            <p className="text-xs sm:text-sm text-[#939bb4] italic border-l-2 border-[#4257B2] pl-3 py-1 bg-[#0a092d]/40 rounded-r-xl">
              &quot;{currentQ.card.example}&quot;
            </p>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
          {currentQ.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            const isSelected = selectedOption === opt;
            const isCorrectOption = opt === currentQ.correctOption;
            const isPressed =
              !isChecked && !isSubmittingAnswer && pressedOption === opt;

            // Status determination matching example.jsx
            const status: "default" | "selecting" | "correct" | "wrong" = (() => {
              if (!isChecked) {
                return isSelected ? "selecting" : "default";
              }
              if (isCorrectOption) return "correct";
              if (isSelected) return "wrong";
              return "default";
            })();

            // Styles for each status tailored for LexiFlash dark theme with sleek 1px border and 4px 3D bevel
            const statusClasses = (() => {
              if (isChecked) {
                if (isCorrectOption) {
                  return "border-emerald-500 shadow-[0_4px_0_0_#047857] bg-emerald-500/20 text-emerald-200 translate-y-0";
                }
                if (isSelected) {
                  return "border-rose-500 shadow-[0_4px_0_0_#be123c] bg-rose-500/20 text-rose-200 translate-y-0";
                }
                return "border-[#2e3856]/40 shadow-[0_4px_0_0_#141727] bg-[#15182c]/40 text-[#5f6b88] opacity-40 translate-y-0";
              }

              if (status === "selecting") {
                return isPressed
                  ? "border-[#6366F1] shadow-[0_1px_0_0_#4345c7] translate-y-[3px] bg-[#6366F1]/25 text-white"
                  : "border-[#6366F1] shadow-[0_4px_0_0_#4345c7] translate-y-0 bg-[#6366F1]/15 text-white active:translate-y-[3px] active:shadow-[0_1px_0_0_#4345c7]";
              }

              // default status
              return isPressed
                ? "border-[#4257B2] shadow-[0_1px_0_0_#1c2136] translate-y-[3px] bg-[#202545] text-[#d9dde8]"
                : "border-[#2e3856] shadow-[0_4px_0_0_#1c2136] translate-y-0 bg-[#1a1d36] text-[#d9dde8] hover:bg-[#202545] hover:border-[#4257B2] hover:shadow-[0_4px_0_0_#2b3870] active:translate-y-[3px] active:shadow-[0_1px_0_0_#1c2136]";
            })();

            const letterBadgeClasses = (() => {
              if (isChecked) {
                if (isCorrectOption) {
                  return "border-emerald-500 bg-emerald-500 text-white shadow-sm";
                }
                if (isSelected) {
                  return "border-rose-500 bg-rose-500 text-white shadow-sm";
                }
                return "border-[#2e3856]/40 bg-[#0e1227]/40 text-[#5f6b88]";
              }
              if (status === "selecting" || isPressed) {
                return "border-[#6366F1] bg-[#6366F1] text-white shadow-sm";
              }
              return "border-[#3b476d] bg-[#0e1227] text-[#939bb4] group-hover:border-[#6366F1] group-hover:text-white";
            })();

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleOptionSelect(opt)}
                onTouchStart={() => handleTouchStartOption(opt)}
                onTouchEnd={handleTouchEndOption}
                onTouchCancel={handleTouchCancelOption}
                onTouchMove={handleTouchCancelOption}
                onMouseDown={() => handleTouchStartOption(opt)}
                onMouseUp={handleTouchEndOption}
                disabled={isChecked || isSubmittingAnswer}
                className={`group w-full border rounded-2xl p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 select-none min-h-[62px] touch-manipulation outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] transform-gpu will-change-transform transition-[transform,background-color,border-color,box-shadow,opacity] duration-100 ease-out ${
                  !isChecked && !isSubmittingAnswer
                    ? "cursor-pointer"
                    : "cursor-default pointer-events-none"
                } ${statusClasses}`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span
                    className={`border w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors duration-100 ease-out ${letterBadgeClasses}`}
                  >
                    {letter}
                  </span>
                  <p className="font-bold text-sm sm:text-base leading-relaxed flex-1 break-words">
                    {opt}
                  </p>
                </div>

                {isChecked && (
                  <div className="shrink-0 pl-2">
                    {isCorrectOption ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-scale-up" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-scale-up" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Banner when checked */}
        {isChecked && answerFeedback && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-[0_4px_0_0_rgba(0,0,0,0.3)] flex items-center gap-3.5 animate-fade-in ${
              isCorrect
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                : "bg-rose-500/15 border-rose-500/50 text-rose-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400 shrink-0" />
            )}
            <div className="space-y-0.5 flex-1 text-left">
              <div className="text-base sm:text-lg font-black">
                {isCorrect
                  ? "Chính xác! 🎉"
                  : `Sai rồi. Đáp án đúng là: "${currentQ.correctOption}"`}
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-90">
                {isCorrect
                  ? answerFeedback.removedFromMistakeBank
                    ? t(
                        "srs.quizMasteredFeedback",
                        undefined,
                        "Xuất sắc! Đã thành thạo và xóa khỏi Mistake Bank! ✨",
                      )
                    : t(
                        "srs.quizCorrectFeedback",
                        {
                          from: answerFeedback.prevLapses,
                          to: answerFeedback.newLapses,
                        },
                        `Số lần sai: ${answerFeedback.prevLapses} ➔ ${answerFeedback.newLapses}`,
                      )
                  : t(
                      "srs.quizIncorrectFeedback",
                      {
                        from: answerFeedback.prevLapses,
                        to: answerFeedback.newLapses,
                      },
                      `Số lần sai: ${answerFeedback.prevLapses} ➔ ${answerFeedback.newLapses}`,
                    )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Kiểm tra / Tiếp tục / Hoàn thành */}
        <div className="pt-2 flex justify-center w-full">
          <Button
            type="button"
            onClick={handleCheckAnswer}
            disabled={(!isChecked && !selectedOption) || isSubmittingAnswer}
            loading={isSubmittingAnswer}
            size="lg"
            variant={
              !isChecked && !selectedOption
                ? "secondary"
                : isChecked
                  ? isCorrect
                    ? "emerald"
                    : "danger"
                  : "emerald"
            }
            className={`w-full sm:w-auto sm:min-w-[240px] select-none ${
              !isChecked && !selectedOption
                ? "bg-[#1a1d36] border-[#2e3856] shadow-[0_4px_0_0_#14182b] text-[#586380] cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {isChecked ? (
              <>
                <span>
                  {quizIndex + 1 === quizQuestions.length
                    ? "Hoàn thành"
                    : "Tiếp tục"}
                </span>
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </>
            ) : (
              "Kiểm tra"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // DUE REVIEWS INTERACTIVE SESSION
  if (isDueReviewMode) {
    const currentCard = dueReviewCards[dueReviewIndex];
    const totalDue = dueReviewCards.length;
    const progressPercent =
      totalDue > 0
        ? Math.round(((dueReviewIndex + 1) / totalDue) * 100)
        : 0;

    if (isDueCompleted) {
      const goodCount = dueStats.good + dueStats.easy;
      const hardCount = dueStats.hard + dueStats.forgot;
      return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8 px-4">
          <div className="bg-[#1a1d36] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-scale-up">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t(
                  "srs.dueReviewCompleteTitle",
                  undefined,
                  "Hoàn Thành Ôn Tập Từ Đến Hạn! 🎉",
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#8e98b0]">
                {t(
                  "srs.dueReviewCompleteDesc",
                  undefined,
                  "Tất cả các từ vựng đến hạn hôm nay đã được củng cố theo chu kỳ Spaced Repetition (SM-2). Trí nhớ dài hạn của bạn đang được tối ưu hóa!",
                )}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-[#0a092d]/70 border-2 border-[#2e3856] rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-white">
                  {totalDue}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.dueStatTotal", undefined, "Tổng thẻ đã ôn")}
                </div>
              </div>

              <div className="bg-[#0a092d]/70 border-2 border-emerald-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {goodCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.dueStatGood", undefined, "Nhớ tốt / Dễ")}
                </div>
              </div>

              <div className="bg-[#0a092d]/70 border-2 border-rose-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-rose-400">
                  {hardCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#939bb4] mt-1">
                  {t("srs.dueStatHard", undefined, "Cần ôn sớm / Quên")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleRestartDueReview}
                icon={<RotateCcw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {t("srs.dueReviewRestart", undefined, "Ôn lại phiên này")}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleExitDueReview}
                className="w-full sm:w-auto"
              >
                {t("srs.dueReviewBackToList", undefined, "Quay về danh sách")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-6 px-4">
        {/* Top Header Bar */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExitDueReview}
              className="flex items-center gap-1.5 text-xs font-bold text-[#8e98b0] hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>{t("srs.dueReviewExitBtn", undefined, "Thoát Ôn Tập")}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#4f5fd8]/20 text-[#9cb1ff] border border-[#4f5fd8]/40">
                {t(
                  "srs.dueReviewProgress",
                  { current: dueReviewIndex + 1, total: totalDue },
                  `Thẻ ${dueReviewIndex + 1} / ${totalDue}`,
                )}
              </span>
            </div>

            <div className="text-xs text-[#8e98b0] truncate max-w-[150px] sm:max-w-[200px]">
              Set: {(currentCard as any)?.studySetTitle || "Study Set"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0a092d] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4f5fd8] to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card Interactive Area */}
        {currentCard && (
          <div className="bg-[#1a1d36] border-2 border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-3 py-4 sm:py-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#939bb4] bg-[#2e3856]/60 px-3 py-1 rounded-full border border-[#3c476c]">
                  {t(
                    "modes.howWellRemember",
                    undefined,
                    "How well do you remember this term?",
                  )}
                </span>
                {currentCard.progress.lapses > 0 && (
                  <span className="text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-rose-400" />
                    {t(
                      "srs.lapsesCount",
                      { count: currentCard.progress.lapses },
                      `${currentCard.progress.lapses} lapses`,
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  {currentCard.term}
                </h2>
                <AudioButton
                  text={currentCard.term}
                  size="md"
                  showAccentToggle={true}
                />
              </div>

              {currentCard.phonetic && (
                <p className="text-sm sm:text-base font-mono text-[#939bb4]">
                  {currentCard.phonetic}
                </p>
              )}
            </div>

            {/* Reveal Answer Section */}
            {!dueShowAnswer ? (
              <div className="text-center pt-2 sm:pt-4">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => setDueShowAnswer(true)}
                  className="w-full sm:w-auto px-8"
                >
                  {t(
                    "modes.revealAnswer",
                    undefined,
                    "Hiện nghĩa & ví dụ (Space / Enter)",
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 pt-4 border-t border-[#2e3856] animate-fade-in">
                <div className="bg-[#0a092d]/80 border border-[#2e3856] rounded-2xl p-5 sm:p-6 text-center space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    {t(
                      "modes.vietnameseMeaning",
                      undefined,
                      "Nghĩa tiếng Việt:",
                    )}
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {currentCard.definition}
                  </p>

                  {currentCard.example && (
                    <p className="text-xs sm:text-sm text-[#939bb4] italic pt-2">
                      &quot;{currentCard.example}&quot;
                    </p>
                  )}
                </div>

                {dueFeedback && (
                  <p className="text-xs text-center font-bold text-emerald-400 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                    {dueFeedback}
                  </p>
                )}

                {/* SM-2 Recall Rating Buttons */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#939bb4] text-center block">
                    {t(
                      "modes.rateRecallDifficulty",
                      undefined,
                      "Rate your recall difficulty (SM-2 Interval Adjustment):",
                    )}
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      disabled={isSubmittingDue}
                      onClick={() => handleRateDueQuality(1)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span className="text-base">❌</span>
                      <span>
                        {t("modes.sm2Forgot", undefined, "1. Quên hoàn toàn")}
                      </span>
                      <span className="text-[10px] text-red-400/80 font-normal">
                        {t("modes.sm2ForgotSub", undefined, "Lặp lại ngay")}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingDue}
                      onClick={() => handleRateDueQuality(2)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span className="text-base">⚠️</span>
                      <span>
                        {t("modes.sm2Hard", undefined, "2. Khó nhớ")}
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-normal">
                        {t("modes.sm2HardSub", undefined, "Ôn sớm")}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingDue}
                      onClick={() => handleRateDueQuality(3)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span className="text-base">👍</span>
                      <span>
                        {t("modes.sm2Good", undefined, "3. Nhớ tốt")}
                      </span>
                      <span className="text-[10px] text-blue-400/80 font-normal">
                        {t("modes.sm2GoodSub", undefined, "+1-6 ngày")}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingDue}
                      onClick={() => handleRateDueQuality(5)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <span className="text-base">⚡</span>
                      <span>
                        {t("modes.sm2Easy", undefined, "4. Rất dễ")}
                      </span>
                      <span className="text-[10px] text-emerald-400/80 font-normal">
                        {t("modes.sm2EasySub", undefined, "Khoảng cách dài")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => startDueReview()}
            className="shrink-0 w-full sm:w-auto justify-center shadow-xs"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {t(
              "srs.startReviewBtn",
              { count: dueReviews.length },
              `Start Review (${dueReviews.length} cards) 🚀`,
            )}
          </Button>
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

                      {card.progress.lapses > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-rose-400" />
                            {t(
                              "srs.lapsesCount",
                              { count: card.progress.lapses },
                              `${card.progress.lapses} lapses`,
                            )}
                          </span>
                        </div>
                      )}
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
                      <span className="text-[#586380] truncate max-w-[130px] sm:max-w-[180px]">
                        Set: {(card as any).studySetTitle || "Study Set"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startDueReview([card])}
                          className="text-white bg-[#4f5fd8]/30 hover:bg-[#4f5fd8]/50 border border-[#4f5fd8]/50 px-2.5 py-1 rounded-lg font-bold text-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {t("srs.reviewThisCard", undefined, "Ôn từ này")}
                        </button>
                        <Link
                          to={`/sets/${card.studySetId}/learn?dueOnly=true`}
                          className="text-[#6366F1] font-bold hover:underline flex items-center gap-1"
                        >
                          <span>
                            {t("common.studyNow", undefined, "Review Now")}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
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
