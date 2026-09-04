import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { testApi } from "../../api/testApi";
import { Button } from "../../components/common/Button";
import { triggerConfetti } from "../../utils/confetti";
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { GeneratedTest, TestResult } from "../../types";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

export const TestMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { currentSet, loading } = useAppSelector((state) => state.studySets);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [testData, setTestData] = useState<GeneratedTest | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const questionCount = 10;

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  // Load generated test
  const startNewTest = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    setTestResult(null);
    setUserAnswers({});
    setTimeSpentSeconds(0);
    try {
      const res = await testApi.generate(id, { questionCount });
      setTestData(res.data);
    } catch {
      // ignore
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      startNewTest();
    }
  }, [startNewTest, isAuthenticated]);

  // Stopwatch timer
  useEffect(() => {
    if (!testData || testResult) return;
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testData, testResult]);

  const handleSelectOption = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = async () => {
    if (!testData) return;
    setIsSubmitting(true);

    const submissionPayload = testData.questions.map((q) => ({
      questionId: q.id,
      cardId: q.cardId,
      userAnswer: userAnswers[q.id] || "",
    }));

    try {
      const res = await testApi.submit(testData.testId, {
        timeSpentSeconds,
        answers: submissionPayload,
      });
      setTestResult(res.data);
      if (res.data.scorePercentage >= 70) {
        triggerConfetti();
      }
      if (isAuthenticated) {
        dispatch(recordStudyStreak());
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <FileCheck2 className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("auth.loginTitle", undefined, "Log in to take Practice Tests")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "modes.testInstructions",
            undefined,
            "Practice Tests grade your answers automatically, track mistakes in your Mistake Bank, and generate customized quiz questions.",
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

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Preparing test environment...")}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/sets/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("modes.backToSet", undefined, "Back to Set")}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1a1d36] border border-[#2e3856] text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-[#6366F1]" />
            <span>{formatTime(timeSpentSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <FileCheck2 className="w-4 h-4" />
            <span>{t("modes.testTitle", undefined, "Test Mode")}</span>
          </div>
        </div>
      </div>

      {/* Results View */}
      {testResult ? (
        <div className="space-y-6 animate-scale-up">
          <div className="bg-[#1a1d36] border-2 border-[#2e3856] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div
              className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
                testResult.scorePercentage >= 80
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20"
              }`}
            >
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <span className="text-sm font-bold text-[#939bb4] uppercase tracking-wider block mb-1">
                {t("modes.testScoreTitle", undefined, "Your Test Score")}
              </span>
              <h2 className="text-5xl font-black text-white mb-2">
                {testResult.scorePercentage}%
              </h2>
              <p className="text-sm text-[#939bb4]">
                {t("modes.testCorrectSummary", {
                  correct: testResult.correctCount,
                  total: testResult.totalQuestions,
                  time: formatTime(testResult.timeSpentSeconds),
                })}
              </p>
            </div>

            {/* Summary Lists of Correct & Incorrect Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full pt-2">
              {/* Correct terms */}
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("modes.testCorrectTerms", {
                      count: testResult.correctTerms?.length || 0,
                    })}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Mistakes -1
                  </span>
                </div>
                {testResult.correctTerms &&
                testResult.correctTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.correctTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#939bb4] italic">
                    {t("common.none", undefined, "None")}
                  </p>
                )}
              </div>

              {/* Incorrect terms */}
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {t("modes.testIncorrectTerms", {
                      count: testResult.incorrectTerms?.length || 0,
                    })}
                  </span>
                  <span className="text-[10px] text-rose-400/80 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">
                    Mistakes +1
                  </span>
                </div>
                {testResult.incorrectTerms &&
                testResult.incorrectTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.incorrectTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold">
                    {t(
                      "modes.perfectNoMistakes",
                      undefined,
                      "Perfect! No mistakes recorded. 🎉",
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={startNewTest}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                {t("modes.retakeTest", undefined, "Retake Test")}
              </Button>
              <Link to={`/sets/${id}`}>
                <Button variant="primary" size="lg">
                  {t("modes.backToSet", undefined, "Back to Study Set")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Breakdown Review of Each Question */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-white">
              {t("modes.reviewAnswers", undefined, "Review Your Answers")}
            </h3>
            <div className="space-y-3">
              {testResult.reviews.map((rev, idx) => (
                <div
                  key={rev.questionId}
                  className={`p-5 rounded-2xl border transition-all ${
                    rev.isCorrect
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-red-950/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#939bb4]">
                        #{idx + 1}
                      </span>
                      <span className="text-xs uppercase font-bold text-[#6366F1] bg-[#4257B2]/20 px-2 py-0.5 rounded">
                        {rev.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold">
                      {rev.isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />{" "}
                          {t("modes.correct", undefined, "Correct")}
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />{" "}
                          {t("modes.incorrect", undefined, "Incorrect")}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base font-semibold text-white mb-3 whitespace-pre-line">
                    {rev.prompt}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0a092d]/80 p-3 rounded-xl border border-[#2e3856]">
                      <span className="text-[#939bb4] block mb-1">
                        {t("modes.yourAnswer", undefined, "Your answer:")}
                      </span>
                      <strong
                        className={
                          rev.isCorrect ? "text-emerald-300" : "text-red-300"
                        }
                      >
                        {rev.userAnswer ||
                          `(${t("modes.noAnswerProvided", undefined, "No answer provided")})`}
                      </strong>
                    </div>
                    <div className="bg-[#0a092d]/80 p-3 rounded-xl border border-[#2e3856]">
                      <span className="text-[#939bb4] block mb-1">
                        {t(
                          "modes.correctAnswerLabel",
                          undefined,
                          "Correct answer:",
                        )}
                      </span>
                      <strong className="text-emerald-400">
                        {rev.correctAnswer}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : testData ? (
        /* Questions Form */
        <div className="space-y-6">
          <div className="space-y-4">
            {testData.questions.map((q, idx) => {
              const selectedAnswer = userAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6366F1] bg-[#4257B2]/20 px-2.5 py-1 rounded-lg">
                      {t(
                        "modes.questionOf",
                        {
                          current: idx + 1,
                          total: testData.totalQuestions,
                        },
                        `Question ${idx + 1} of ${testData.totalQuestions}`,
                      )}
                    </span>
                    <span className="text-xs text-[#939bb4] font-medium uppercase">
                      {q.type}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                    {q.prompt}
                  </h4>

                  {/* Multiple Choice / True-False Options */}
                  {q.options && q.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#4257B2] border-[#6366F1] text-white shadow-md shadow-indigo-900/30"
                                : "bg-[#0a092d]/70 border-[#2e3856] text-[#d9dde8] hover:bg-[#202545] hover:border-[#4257B2]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Written Answer Input */
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder={t(
                          "modes.typeYourEnglishAnswer",
                          undefined,
                          "Type your English answer...",
                        )}
                        value={selectedAnswer || ""}
                        onChange={(e) =>
                          handleSelectOption(q.id, e.target.value)
                        }
                        className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] focus:border-[#4257B2] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="p-4 bg-[#1a1d36] border border-[#2e3856] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl backdrop-blur-md">
            <div className="text-xs text-[#939bb4]">
              {t(
                "modes.answeredCount",
                {
                  current: Object.keys(userAnswers).length,
                  total: testData.totalQuestions,
                },
                `Answered: ${Object.keys(userAnswers).length} / ${testData.totalQuestions}`,
              )}
            </div>

            <Button
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              onClick={handleSubmitTest}
              className="w-full sm:w-auto px-8"
            >
              {t(
                "modes.submitTestBtn",
                undefined,
                "Submit Test & Grade Answers 🚀",
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
