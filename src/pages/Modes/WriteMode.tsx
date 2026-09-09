import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import { triggerConfetti } from "../../utils/confetti";
import {
  speakText,
  getVoiceAccent,
  toggleVoiceAccent,
  subscribeVoiceAccent,
  VoiceAccent,
} from "../../utils/speech";
import { StudyHeaderBar } from "../../components/study/StudyHeaderBar";
import {
  Volume2,
  Headphones,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Flame,
  Clock,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Card, StudyMode } from "../../types";
import { studyApi } from "../../api/studyApi";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

interface IncorrectSubmission {
  card: Card;
  userAnswer: string;
}

export const WriteMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentSet, loading } = useAppSelector((state) => state.studySets);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    expected: string;
  } | null>(null);

  const [correctCards, setCorrectCards] = useState<Card[]>([]);
  const [incorrectCards, setIncorrectCards] = useState<IncorrectSubmission[]>(
    [],
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [accent, setAccent] = useState<VoiceAccent>(getVoiceAccent());
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    return subscribeVoiceAccent(setAccent);
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  const [isConfiguring, setIsConfiguring] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [countInput, setCountInput] = useState<string>("10");
  const totalCards = currentSet?.cards?.length || 0;

  useEffect(() => {
    if (currentSet?.cards) {
      const count = currentSet.cards.length;
      setQuestionCount((prev) => {
        const next =
          prev > count
            ? count
            : prev === 10
              ? Math.min(10, Math.max(1, count))
              : prev;
        setCountInput(String(next));
        return next;
      });
    }
  }, [currentSet?.cards]);

  const handleStartPractice = () => {
    if (!currentSet?.cards || currentSet.cards.length === 0) return;
    const finalCount = countInput
      ? Math.min(
          currentSet.cards.length,
          Math.max(1, parseInt(countInput, 10) || questionCount),
        )
      : questionCount;
    setQuestionCount(finalCount);
    setCountInput(String(finalCount));

    const shuffled = [...currentSet.cards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, finalCount);
    setCards(selected);
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setCorrectCards([]);
    setIncorrectCards([]);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    setTimeSpentSeconds(0);
    setIsConfiguring(false);
  };

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeSpentSeconds(
        Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Focus input on card change
  useEffect(() => {
    if (!feedback && !isCompleted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, feedback, isCompleted]);

  const currentCard = cards[currentIndex];

  const playCurrentAudio = () => {
    if (!currentCard) return;
    setIsPlayingAudio(true);
    speakText(currentCard.term, accent);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  // Auto play audio when transitioning to next card
  useEffect(() => {
    if (currentCard && !feedback && !isCompleted) {
      const timer = setTimeout(() => {
        playCurrentAudio();
      }, 250);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isCompleted]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <Headphones className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t(
            "auth.loginTitle",
            undefined,
            "Log in to use Listening & Dictation",
          )}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "modes.writeInstructions",
            undefined,
            "Listening & Dictation Mode trains your native listening reflex and exact spelling accuracy.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentCard || feedback) return;

    const normalizedUser = userAnswer
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const normalizedExpected = currentCard.term
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const isCorrect = normalizedUser === normalizedExpected;

    if (isCorrect) {
      setCorrectCards((prev) => [...prev, currentCard]);
    } else {
      setIncorrectCards((prev) => [
        ...prev,
        { card: currentCard, userAnswer: userAnswer.trim() },
      ]);
    }

    setFeedback({ isCorrect, expected: currentCard.term });
  };

  const handleNext = async () => {
    setFeedback(null);
    setUserAnswer("");

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      triggerConfetti();

      if (isAuthenticated && id) {
        const timeSpent = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000),
        );

        const correctIds = correctCards.map((c) => c.id);
        const incorrectIds = incorrectCards.map((item) => item.card.id);

        try {
          // 1. Record session & Mistake Bank in backend
          await studyApi.recordSession({
            studySetId: id,
            mode: StudyMode.WRITE,
            cardsTotal: cards.length,
            cardsCorrect: correctCards.length,
            cardsIncorrect: incorrectCards.length,
            timeSpentSeconds: timeSpent,
            correctCardIds: correctIds,
            incorrectCardIds: incorrectIds,
          });

          // 2. Guaranteed streak update & streak notification
          await dispatch(recordStudyStreak());
        } catch (err) {
          console.error("Error saving session and streak:", err);
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setCorrectCards([]);
    setIncorrectCards([]);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    setTimeSpentSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t(
          "modes.loadingDictation",
          undefined,
          "Loading Dictation Mode...",
        )}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  if (currentSet && totalCards === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <Headphones className="w-12 h-12 text-[#6366F1] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-white">
          Học phần chưa có từ vựng
        </h2>
        <p className="text-sm text-[#939bb4]">
          Vui lòng thêm thẻ từ vựng vào học phần trước khi luyện nghe & viết
          chính tả.
        </p>
        <Link to={`/sets/${id}`}>
          <Button variant="primary">Quay về học phần</Button>
        </Link>
      </div>
    );
  }

  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-16 px-3 sm:px-0">
        <StudyHeaderBar
          current={0}
          total={totalCards}
          backUrl={`/sets/${id}`}
          percent={0}
        />

        <div className="bg-[#12162a] border border-[#252b48] rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#818cf8] flex items-center justify-center text-white shadow-lg shrink-0">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                Thiết lập phiên Nghe & Viết chính tả
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] truncate mt-0.5">
                {currentSet?.title} • {totalCards} từ vựng
              </p>
            </div>
          </div>

          {/* Section: Số câu hỏi */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Số lượng câu hỏi
                </span>
                <span className="text-[11px] sm:text-xs text-[#939bb4]">
                  (Tối đa {totalCards} câu)
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#818cf8]">
                {questionCount} câu
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[5, 10, 20].map((preset) => {
                if (preset >= totalCards) return null;
                const isSelected = questionCount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuestionCount(preset);
                      setCountInput(String(preset));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#6366F1] border-[#818cf8] text-white shadow-md shadow-indigo-500/20"
                        : "bg-[#1a2035] border-[#252b48] text-[#939bb4] hover:text-white hover:border-[#818cf8]/40"
                    }`}
                  >
                    {preset} câu
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setQuestionCount(totalCards);
                  setCountInput(String(totalCards));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  questionCount === totalCards
                    ? "bg-[#6366F1] border-[#818cf8] text-white shadow-md shadow-indigo-500/20"
                    : "bg-[#1a2035] border-[#252b48] text-[#939bb4] hover:text-white hover:border-[#818cf8]/40"
                }`}
              >
                Tất cả ({totalCards} câu)
              </button>
            </div>

            {/* Range & Number Input */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min={1}
                max={Math.max(1, totalCards)}
                value={questionCount}
                onChange={(e) => {
                  const val = Math.min(
                    totalCards,
                    Math.max(1, Number(e.target.value)),
                  );
                  setQuestionCount(val);
                  setCountInput(String(val));
                }}
                className="flex-1 accent-[#6366F1] cursor-pointer h-2 bg-[#1a2035] rounded-lg"
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={countInput}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, "");
                  setCountInput(clean);
                  if (clean !== "") {
                    const num = parseInt(clean, 10);
                    if (!isNaN(num) && num >= 1) {
                      setQuestionCount(Math.min(totalCards, num));
                    }
                  }
                }}
                onBlur={() => {
                  if (!countInput || parseInt(countInput, 10) < 1) {
                    setCountInput("1");
                    setQuestionCount(1);
                  } else {
                    const num = Math.min(
                      totalCards,
                      Math.max(1, parseInt(countInput, 10)),
                    );
                    setCountInput(String(num));
                    setQuestionCount(num);
                  }
                }}
                placeholder="1"
                className="w-14 sm:w-16 px-2 py-1.5 rounded-xl bg-[#1a2035] border border-[#252b48] text-white font-mono text-center text-sm font-bold focus:outline-none focus:border-[#6366F1] shrink-0"
              />
            </div>
          </div>

          {/* Action button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartPractice}
            className="w-full flex items-center justify-center gap-2 text-sm sm:text-base font-bold py-3.5 shadow-lg shadow-indigo-500/25 whitespace-nowrap"
            icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          >
            <span>Bắt đầu luyện tập</span>
            <span className="font-mono">({questionCount} câu)</span>
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent =
    cards.length > 0
      ? Math.round(((currentIndex + (feedback ? 1 : 0)) / cards.length) * 100)
      : 0;

  const scorePercentage =
    cards.length > 0
      ? Math.round((correctCards.length / cards.length) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-16 px-3 sm:px-0">
      {/* Unified Study Header Bar */}
      <div className="space-y-3">
        <StudyHeaderBar
          current={isCompleted ? cards.length : currentIndex + 1}
          total={cards.length}
          backUrl={`/sets/${id}`}
          percent={progressPercent}
          onSettings={() => setIsConfiguring(true)}
        />

        {/* Sub-bar with Timer and Score count */}
        <div className="flex items-center justify-between text-xs text-[#939bb4] px-1">
          <div className="flex items-center gap-1.5 bg-[#1a1d36] border border-[#2e3856] text-white px-3 py-1 rounded-full font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>{formatTime(timeSpentSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {t("modes.scoreCountCorrect", { count: correctCards.length })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Study Area */}
      {isCompleted ? (
        /* Results & Mistake Bank Breakdown View */
        <div className="space-y-6 animate-scale-up">
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 border border-emerald-500/40">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#939bb4]">
                {t("modes.yourTestScore", undefined, "Your Session Score")}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white">
                {scorePercentage}%
              </h2>
              <p className="text-sm text-[#939bb4]">
                {t("modes.testCorrectSummary", {
                  correct: correctCards.length,
                  total: cards.length,
                  time: formatTime(timeSpentSeconds),
                })}
              </p>
            </div>

            {/* Breakdown Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full pt-2">
              {/* Correct words column */}
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("modes.dictationCorrectTerms", {
                      count: correctCards.length,
                    })}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {t("modes.mistakeReduced", undefined, "Mistakes -1")}
                  </span>
                </div>

                {correctCards.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {correctCards.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-white block truncate">
                            {c.term}
                          </span>
                          <span className="text-xs text-emerald-300/80 truncate block">
                            {c.definition}
                          </span>
                        </div>
                        <AudioButton text={c.term} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#939bb4] italic py-2">
                    {t("common.none", undefined, "None")}
                  </p>
                )}
              </div>

              {/* Incorrect words column (Mistake Bank) */}
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {t("modes.dictationIncorrectTerms", {
                      count: incorrectCards.length,
                    })}
                  </span>
                  <span className="text-[10px] text-rose-400/90 font-semibold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {t("modes.mistakeIncreased", undefined, "Mistakes +1")}
                  </span>
                </div>

                {incorrectCards.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {incorrectCards.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white">
                            {item.card.term}
                          </span>
                          <AudioButton text={item.card.term} size="sm" />
                        </div>
                        <div className="text-xs text-[#939bb4]">
                          {t("modes.yourAnswer", undefined, "Your answer:")}{" "}
                          <span className="line-through text-rose-300 font-mono">
                            {item.userAnswer ||
                              t("modes.emptyAnswer", undefined, "(empty)")}
                          </span>
                        </div>
                        <p className="text-xs text-[#8e98b0] truncate">
                          {item.card.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold py-2">
                    {t(
                      "modes.perfectNoMistakes",
                      undefined,
                      "Perfect! No mistakes recorded. 🎉",
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-[#2e3856]">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleRestart}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                {t("modes.studyAgain", undefined, "Study Again")}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsConfiguring(true)}
                icon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Tùy chỉnh phiên mới
              </Button>

              <Link to={`/sets/${id}`}>
                <Button variant="primary" size="lg">
                  {t("modes.backToSet", undefined, "Back to Set")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : currentCard ? (
        /* Question & Dictation View */
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Prompt Header & Accent Settings */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#939bb4] border-b border-[#2e3856] pb-3">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate sm:whitespace-normal">
                {t(
                  "modes.dictationPrompt",
                  undefined,
                  "Listen to pronunciation and type the word",
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleVoiceAccent}
              className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1e233d] hover:bg-[#2b3553] text-[#9cb1ff] hover:text-white text-xs font-semibold border border-[#3b476b] hover:border-emerald-400/50 transition-all cursor-pointer shadow-sm select-none"
              title={t(
                "modes.switchVoiceAccent",
                undefined,
                "Switch Voice Accent (UK / US)",
              )}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono font-bold">
                {accent === "en-GB" ? "UK" : "US"}
              </span>
            </button>
          </div>

          {/* Central Audio Prominence (NO DEFINITION, NO PHONETIC) */}
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center space-y-4 text-center">
            {/* Big 3D Audio Trigger Button */}
            <button
              type="button"
              onClick={playCurrentAudio}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100 ease-out transform-gpu will-change-transform ${
                isPlayingAudio
                  ? "bg-[#5457e5] border-2 border-[#7c7ef8] text-white shadow-[0_1px_0_0_#3739a8] translate-y-[3px]"
                  : "bg-[#6366F1] hover:bg-[#5457e5] border-2 border-[#7c7ef8] text-white shadow-[0_4px_0_0_#3739a8] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#3739a8]"
              }`}
              title={t(
                "modes.listenAgainHint",
                undefined,
                "Click the speaker to replay audio",
              )}
            >
              <Volume2
                className={`w-12 h-12 sm:w-14 sm:h-14 ${
                  isPlayingAudio ? "animate-pulse scale-110" : ""
                }`}
              />
            </button>

            <p className="text-sm font-bold text-white">
              {t(
                "modes.listenAgainHint",
                undefined,
                "Click the speaker to replay audio",
              )}
            </p>
          </div>

          {/* Form / Answer Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                disabled={!!feedback}
                placeholder={t(
                  "modes.typeAnswerPlaceholder",
                  undefined,
                  "Type what you hear...",
                )}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-[#0a092d] text-white placeholder-[#586380] border-2 border-[#2e3856] focus:border-[#6366F1] rounded-2xl px-5 py-4 text-center text-lg sm:text-xl font-bold tracking-wide focus:outline-none transition-colors shadow-inner"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            {/* Feedback Box (Only displayed AFTER checking answer) */}
            {feedback && (
              <div
                className={`p-5 rounded-2xl border text-center space-y-3 animate-fade-in ${
                  feedback.isCorrect
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100"
                    : "bg-rose-950/80 border-rose-500/50 text-rose-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-black text-lg">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <span>
                        {t(
                          "modes.correctWellDone",
                          undefined,
                          "Correct! Well done. ✨",
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      <span>
                        {t(
                          "modes.incorrectCorrectIs",
                          undefined,
                          "Incorrect! The correct spelling is:",
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Incorrect comparison */}
                {!feedback.isCorrect && (
                  <div className="text-sm text-rose-300">
                    {t("modes.yourAnswer", undefined, "Your answer:")}{" "}
                    <span className="line-through font-mono font-bold">
                      {userAnswer}
                    </span>
                  </div>
                )}

                {/* Correct Word Revelation */}
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white tracking-wide">
                    {currentCard.term}
                  </p>
                  {currentCard.phonetic && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-mono text-[#9cb1ff]">
                        {currentCard.phonetic}
                      </span>
                      <AudioButton text={currentCard.term} size="sm" />
                    </div>
                  )}
                </div>

                {/* Definition Revelation (Unlocked for learning reinforcement) */}
                <div className="pt-1 border-t border-white/10 text-xs sm:text-sm text-gray-300 italic">
                  <span className="font-bold text-white not-italic mr-1">
                    {t("modes.revealedDefinition", undefined, "Definition:")}
                  </span>
                  {currentCard.definition}
                </div>

                {!feedback.isCorrect && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                      <Flame className="w-3 h-3 text-rose-400" />
                      {t(
                        "modes.willAddToMistakeBank",
                        undefined,
                        "Added to Mistake Bank",
                      )}
                    </span>
                  </div>
                )}

                <Button
                  variant={feedback.isCorrect ? "emerald" : "primary"}
                  size="lg"
                  onClick={handleNext}
                  className="w-full mt-2"
                >
                  {t("modes.continueBtn", undefined, "Continue")}
                </Button>
              </div>
            )}

            {!feedback && (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!userAnswer.trim()}
                className="w-full"
              >
                {t("modes.checkAnswerBtn", undefined, "Check Answer")}
              </Button>
            )}
          </form>
        </div>
      ) : null}
    </div>
  );
};
