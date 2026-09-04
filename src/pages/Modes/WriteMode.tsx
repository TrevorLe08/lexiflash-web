import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import { triggerConfetti } from "../../utils/confetti";
import {
  ArrowLeft,
  PenTool,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Card, StudyMode } from "../../types";
import { studyApi } from "../../api/studyApi";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

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
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentSet?.cards) {
      setCards(currentSet.cards);
      setCurrentIndex(0);
      setUserAnswer("");
      setFeedback(null);
      setCorrectCount(0);
      setIsCompleted(false);
    }
  }, [currentSet]);

  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, feedback]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <PenTool className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("auth.loginTitle", undefined, "Log in to use Write Mode")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "modes.writeInstructions",
            undefined,
            "Write Mode trains spelling and active recall by prompting you to type the correct English terms.",
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
      setCorrectCount((prev) => prev + 1);
    }

    setFeedback({ isCorrect, expected: currentCard.term });
  };

  const handleNext = () => {
    setFeedback(null);
    setUserAnswer("");

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      triggerConfetti();
      if (isAuthenticated && id) {
        dispatch(recordStudyStreak());
        const timeSpentSeconds = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000),
        );
        studyApi
          .recordSession({
            studySetId: id,
            mode: StudyMode.WRITE,
            cardsTotal: cards.length,
            cardsCorrect: correctCount,
            cardsIncorrect: Math.max(0, cards.length - correctCount),
            timeSpentSeconds,
          })
          .catch(() => {});
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setCorrectCount(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading Write Mode...")}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  const progressPercent =
    cards.length > 0
      ? Math.round(((currentIndex + 1) / cards.length) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/sets/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("modes.backToSet", undefined, "Back to Set")}</span>
        </Link>

        <div className="flex items-center gap-2 bg-pink-500/20 border border-pink-500/40 text-pink-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <PenTool className="w-4 h-4" />
          <span>
            {t("modes.writeTitle", undefined, "Write & Spelling Mode")}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#939bb4]">
          <span>
            {t("modes.questionOf", {
              current: currentIndex + 1,
              total: cards.length,
            })}
          </span>
          <span>{t("modes.scoreCountCorrect", { count: correctCount })}</span>
        </div>
        <div className="w-full bg-[#1a1d36] h-2 rounded-full overflow-hidden border border-[#2e3856]">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Write Card */}
      {isCompleted ? (
        <div className="bg-[#1a1d36] border-2 border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-scale-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">
              {t(
                "modes.writeCompleteTitle",
                undefined,
                "Spelling Session Finished! 🎉",
              )}
            </h2>
            <p className="text-sm text-[#939bb4]">
              {t("modes.writeCompleteDesc", {
                correct: correctCount,
                total: cards.length,
                percent: Math.round((correctCount / cards.length) * 100),
              })}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleRestart}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {t("modes.studyAgain", undefined, "Try Again")}
            </Button>
            <Link to={`/sets/${id}`}>
              <Button variant="primary" size="lg">
                {t("modes.backToSet", undefined, "Back to Study Set")}
              </Button>
            </Link>
          </div>
        </div>
      ) : currentCard ? (
        <div className="bg-[#1a1d36] border-2 border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Prompt */}
          <div className="space-y-3 text-center py-4">
            <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider bg-[#4257B2]/20 px-3 py-1 rounded-full border border-[#4257B2]/30">
              {t("modes.typeEnglishTerm", undefined, "Type the English Term")}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
              {currentCard.definition}
            </h3>
            {currentCard.phonetic && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-mono text-[#939bb4]">
                  {currentCard.phonetic}
                </span>
                <AudioButton text={currentCard.term} size="sm" showAccentToggle={true} />
              </div>
            )}
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
                  "Type your answer here...",
                )}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-[#0a092d] text-white placeholder-[#586380] border-2 border-[#2e3856] focus:border-[#4257B2] rounded-2xl px-5 py-3.5 text-lg font-medium text-center focus:outline-none transition-colors"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Feedback Box */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl border text-center space-y-2 animate-fade-in ${
                  feedback.isCorrect
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-100"
                    : "bg-red-950/80 border-red-500/40 text-red-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-base">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
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
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span>
                        {t(
                          "modes.incorrectCorrectIs",
                          undefined,
                          "Incorrect. The correct term is:",
                        )}
                      </span>
                    </>
                  )}
                </div>

                {!feedback.isCorrect && (
                  <p className="text-2xl font-black text-white">
                    {feedback.expected}
                  </p>
                )}

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="mt-2"
                >
                  {t("modes.continueBtn", undefined, "Continue (Enter ↵)")}
                </Button>
              </div>
            )}

            {!feedback && (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                {t("modes.checkAnswerBtn", undefined, "Check Answer ↵")}
              </Button>
            )}
          </form>
        </div>
      ) : null}
    </div>
  );
};
