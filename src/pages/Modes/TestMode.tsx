import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { testApi } from "../../api/testApi";
import { Button } from "../../components/common/Button";
import { StudyHeaderBar } from "../../components/study/StudyHeaderBar";
import { triggerConfetti } from "../../utils/confetti";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  Check,
  Lock,
  SlidersHorizontal,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LayoutList,
  Layers,
  Send,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { GeneratedTest, TestResult, QuestionType } from "../../types";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

export const TestMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { currentSet, loading: setDetailLoading } = useAppSelector(
    (state) => state.studySets,
  );

  const [testData, setTestData] = useState<GeneratedTest | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [setNotFound, setSetNotFound] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Configuration state
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.WRITTEN,
  ]);

  const totalCards = currentSet?.cards?.length || 0;
  const [countInput, setCountInput] = useState<string>("10");

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  // Sync initial question count & valid question types when currentSet loads
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

      if (count === 1) {
        setQuestionTypes([QuestionType.WRITTEN]);
      } else if (count === 2) {
        setQuestionTypes([QuestionType.TRUE_FALSE, QuestionType.WRITTEN]);
      } else {
        setQuestionTypes([
          QuestionType.MULTIPLE_CHOICE,
          QuestionType.TRUE_FALSE,
          QuestionType.WRITTEN,
        ]);
      }
    }
  }, [currentSet?.cards]);

  // Load generated test
  const handleStartTest = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    const finalCount = countInput
      ? Math.min(
          totalCards,
          Math.max(1, parseInt(countInput, 10) || questionCount),
        )
      : questionCount;
    setQuestionCount(finalCount);
    setCountInput(String(finalCount));

    setLoadingTest(true);
    setSetNotFound(false);
    setTestResult(null);
    setUserAnswers({});
    setTimeSpentSeconds(0);
    setCurrentIndex(0);
    setViewMode("card");
    try {
      const res = await testApi.generate(id, {
        questionCount: finalCount,
        questionTypes,
      });
      setTestData(res.data);
      setIsConfiguring(false);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setSetNotFound(true);
      }
    } finally {
      setLoadingTest(false);
    }
  }, [
    id,
    isAuthenticated,
    questionCount,
    questionTypes,
    countInput,
    totalCards,
  ]);

  const handleRestart = () => {
    setUserAnswers({});
    setTestResult(null);
    setTimeSpentSeconds(0);
    setCurrentIndex(0);
  };

  // Stopwatch timer
  useEffect(() => {
    if (!testData || testResult) return;
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testData, testResult]);

  // Keyboard navigation for card view (ArrowLeft for prev, ArrowRight for next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!testData || testResult || viewMode !== "card") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) =>
          Math.min(testData.questions.length - 1, prev + 1),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [testData, testResult, viewMode]);

  const handleSelectOption = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const formatReviewAnswer = (type: QuestionType, ans?: string) => {
    if (!ans) return "";
    if (type === QuestionType.TRUE_FALSE) {
      const lower = ans.trim().toLowerCase();
      if (
        lower === "true" ||
        lower === "đúng" ||
        lower === "dung" ||
        lower === "t"
      ) {
        return t("common.true", undefined, "Đúng");
      }
      if (lower === "false" || lower === "sai" || lower === "f") {
        return t("common.false", undefined, "Sai");
      }
    }
    return ans;
  };

  const renderQuestionPrompt = (
    type: QuestionType,
    promptText: string,
    isCardView = false,
  ) => {
    if (type === QuestionType.TRUE_FALSE) {
      const match = promptText.match(
        /Term:\s*"([^"]+)"\s*\n\s*Definition:\s*"([^"]+)"(?:\s*\n\s*Is this match correct\??)?/i,
      );
      if (match) {
        const [, term, def] = match;
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#8e98b0]">
                {t("modes.termLabel", undefined, "Thuật ngữ:")}
              </span>
              <span
                className={`${
                  isCardView ? "text-2xl sm:text-3xl" : "text-lg"
                } font-black text-white`}
              >
                &quot;{term}&quot;
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#8e98b0]">
                {t("modes.definitionLabel", undefined, "Định nghĩa:")}
              </span>
              <span
                className={`${
                  isCardView ? "text-xl sm:text-2xl" : "text-base"
                } font-bold text-emerald-400`}
              >
                &quot;{def}&quot;
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#939bb4] pt-1">
              {t(
                "modes.isMatchCorrect",
                undefined,
                "Cặp từ và định nghĩa này có chính xác không?",
              )}
            </p>
          </div>
        );
      }
    }
    return <span className="whitespace-pre-line">{promptText}</span>;
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

  const toggleType = (type: QuestionType) => {
    setQuestionTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  if (setDetailLoading && !currentSet) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Preparing test environment...")}
        className="py-24"
      />
    );
  }

  if (setNotFound || (!setDetailLoading && !currentSet)) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  if (currentSet && totalCards === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <FileCheck2 className="w-12 h-12 text-[#6366F1] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-white">
          Học phần chưa có từ vựng
        </h2>
        <p className="text-sm text-[#939bb4]">
          Vui lòng thêm thẻ từ vựng vào học phần trước khi làm bài thi.
        </p>
        <Link to={`/sets/${id}`}>
          <Button variant="primary">Quay về học phần</Button>
        </Link>
      </div>
    );
  }

  if (isConfiguring) {
    const isMultiDisabled = totalCards <= 2;
    const isTrueFalseDisabled = totalCards === 1;

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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#a855f7] flex items-center justify-center text-white shadow-lg shrink-0">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                Thiết lập bài thi trắc nghiệm
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] truncate mt-0.5">
                {currentSet?.title} • {totalCards} từ vựng
              </p>
            </div>
          </div>

          {/* Section 1: Số câu hỏi */}
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
              <span className="text-xs sm:text-sm font-bold font-mono text-[#38bdf8]">
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
                        : "bg-[#1a2035] border-[#252b48] text-[#939bb4] hover:text-white hover:border-[#38bdf8]/40"
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
                    : "bg-[#1a2035] border-[#252b48] text-[#939bb4] hover:text-white hover:border-[#38bdf8]/40"
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

          {/* Section 2: Loại câu hỏi */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-bold text-white block">
              Loại câu hỏi muốn kiểm tra
            </label>

            <div className="space-y-2.5">
              {/* Multiple Choice */}
              <div
                onClick={() => {
                  if (isMultiDisabled) return;
                  toggleType(QuestionType.MULTIPLE_CHOICE);
                }}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between select-none ${
                  isMultiDisabled
                    ? "bg-[#161a2b]/50 border-[#252b48]/50 opacity-60 cursor-not-allowed"
                    : questionTypes.includes(QuestionType.MULTIPLE_CHOICE)
                      ? "bg-[#6366F1]/15 border-[#6366F1]/60 cursor-pointer shadow-sm"
                      : "bg-[#1a2035] border-[#252b48] hover:border-[#38bdf8]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Trắc nghiệm (4 lựa chọn)
                    </span>
                    {isMultiDisabled && (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3" /> Khóa: Cần ≥ 3 từ vựng
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#939bb4]">
                    Chọn định nghĩa chính xác từ 4 phương án lựa chọn
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    questionTypes.includes(QuestionType.MULTIPLE_CHOICE) &&
                    !isMultiDisabled
                      ? "bg-[#6366F1] border-[#6366F1] text-white"
                      : "border-[#3b4568] bg-[#0e1122]"
                  }`}
                >
                  {questionTypes.includes(QuestionType.MULTIPLE_CHOICE) &&
                    !isMultiDisabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* True / False */}
              <div
                onClick={() => {
                  if (isTrueFalseDisabled) return;
                  toggleType(QuestionType.TRUE_FALSE);
                }}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between select-none ${
                  isTrueFalseDisabled
                    ? "bg-[#161a2b]/50 border-[#252b48]/50 opacity-60 cursor-not-allowed"
                    : questionTypes.includes(QuestionType.TRUE_FALSE)
                      ? "bg-[#6366F1]/15 border-[#6366F1]/60 cursor-pointer shadow-sm"
                      : "bg-[#1a2035] border-[#252b48] hover:border-[#38bdf8]/40 cursor-pointer"
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Đúng / Sai
                    </span>
                    {isTrueFalseDisabled && (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3" /> Khóa: Cần ≥ 2 từ vựng
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#939bb4]">
                    Xác định xem cặp từ vựng và định nghĩa là đúng hay sai
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    questionTypes.includes(QuestionType.TRUE_FALSE) &&
                    !isTrueFalseDisabled
                      ? "bg-[#6366F1] border-[#6366F1] text-white"
                      : "border-[#3b4568] bg-[#0e1122]"
                  }`}
                >
                  {questionTypes.includes(QuestionType.TRUE_FALSE) &&
                    !isTrueFalseDisabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Written */}
              <div
                onClick={() => toggleType(QuestionType.WRITTEN)}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                  questionTypes.includes(QuestionType.WRITTEN)
                    ? "bg-[#6366F1]/15 border-[#6366F1]/60 shadow-sm"
                    : "bg-[#1a2035] border-[#252b48] hover:border-[#38bdf8]/40"
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Tự luận / Viết
                  </span>
                  <p className="text-[11px] sm:text-xs text-[#939bb4]">
                    Tự gõ chính xác từ vựng tiếng Anh theo định nghĩa
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    questionTypes.includes(QuestionType.WRITTEN)
                      ? "bg-[#6366F1] border-[#6366F1] text-white"
                      : "border-[#3b4568] bg-[#0e1122]"
                  }`}
                >
                  {questionTypes.includes(QuestionType.WRITTEN) && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </div>

            {questionTypes.length === 0 && (
              <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Vui lòng chọn ít nhất một dạng câu hỏi hợp lệ
              </p>
            )}
          </div>

          {/* Action button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-2 text-sm sm:text-base font-bold py-3.5 shadow-lg shadow-indigo-600/30 whitespace-nowrap"
            disabled={
              questionTypes.length === 0 || questionCount < 1 || loadingTest
            }
            loading={loadingTest}
            onClick={handleStartTest}
            icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          >
            <span>Bắt đầu làm bài thi</span>
            <span className="font-mono">({questionCount} câu)</span>
          </Button>
        </div>
      </div>
    );
  }

  if (loadingTest) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Preparing test environment...")}
        className="py-24"
      />
    );
  }

  if (setNotFound || !testData) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = testData
    ? Object.keys(userAnswers).filter((k) => userAnswers[k]?.trim()).length
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16 px-3 sm:px-0">
      {/* Unified Study Header Bar */}
      <div className="space-y-3">
        <StudyHeaderBar
          current={
            testResult
              ? testData.totalQuestions
              : viewMode === "card"
                ? currentIndex + 1
                : answeredCount
          }
          total={testData.totalQuestions}
          backUrl={`/sets/${id}`}
          percent={
            testResult
              ? 100
              : viewMode === "card"
                ? Math.min(
                    100,
                    Math.round(
                      ((currentIndex + 1) / testData.totalQuestions) * 100,
                    ),
                  )
                : Math.min(
                    100,
                    Math.round((answeredCount / testData.totalQuestions) * 100),
                  )
          }
          onSettings={() => setIsConfiguring(true)}
        />

        {/* Sub-bar with Timer, Mode Badge, and View Mode Toggle */}
        <div className="flex items-center justify-between text-xs text-[#939bb4] px-1">
          <div className="flex items-center gap-1.5 bg-[#1a1d36] border border-[#2e3856] text-white px-3 py-1 rounded-full font-mono font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>{formatTime(timeSpentSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            {!testResult && (
              <button
                type="button"
                onClick={() =>
                  setViewMode((prev) => (prev === "card" ? "list" : "card"))
                }
                className="flex items-center gap-1.5 bg-[#1a1d36] hover:bg-[#252b48] border border-[#2e3856] hover:border-[#6366F1]/50 text-[#9cb1ff] hover:text-white px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm select-none"
                title={
                  viewMode === "card"
                    ? "Chuyển sang xem danh sách toàn bộ câu hỏi"
                    : "Chuyển sang làm bài tập trung từng câu một"
                }
              >
                {viewMode === "card" ? (
                  <>
                    <LayoutList className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span className="hidden sm:inline">Dạng danh sách</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5 text-[#818cf8]" />
                    <span className="hidden sm:inline">Từng câu một</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-bold shadow-sm">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t("modes.testTitle", undefined, "Test Mode")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results View */}
      {testResult ? (
        <div className="space-y-6 animate-scale-up">
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
                testResult.scorePercentage >= 80
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20"
              }`}
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <span className="text-xs sm:text-sm font-bold text-[#939bb4] uppercase tracking-wider block mb-1">
                {t("modes.testScoreTitle", undefined, "Điểm bài thi của bạn")}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
                {testResult.scorePercentage}%
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4]">
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
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("modes.testCorrectTerms", {
                      count: testResult.correctTerms?.length || 0,
                    })}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Mistakes -1
                  </span>
                </div>

                {testResult.correctTerms &&
                testResult.correctTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {testResult.correctTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#939bb4] italic py-2">
                    {t("common.none", undefined, "Không có")}
                  </p>
                )}
              </div>

              {/* Incorrect terms */}
              <div className="p-4 rounded-2xl bg-[#0a092d] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {t("modes.testIncorrectTerms", {
                      count: testResult.incorrectTerms?.length || 0,
                    })}
                  </span>
                  <span className="text-[10px] text-rose-400/90 font-semibold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                    Mistakes +1
                  </span>
                </div>

                {testResult.incorrectTerms &&
                testResult.incorrectTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {testResult.incorrectTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold py-2">
                    {t(
                      "modes.perfectNoMistakes",
                      undefined,
                      "Xuất sắc! Không mắc lỗi nào 🎉",
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons (aligned with WriteMode & ClozeMode) */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-[#2e3856]">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleRestart}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                {t("modes.studyAgain", undefined, "Làm lại bài thi")}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsConfiguring(true)}
                icon={<SlidersHorizontal className="w-4 h-4" />}
              >
                {t(
                  "modes.customNewSession",
                  undefined,
                  "Tùy chỉnh bài thi mới",
                )}
              </Button>

              <Link to={`/sets/${id}`}>
                <Button variant="primary" size="lg">
                  {t("modes.backToSet", undefined, "Quay lại Học phần")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Breakdown Review of Each Question */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <span>
                  {t(
                    "modes.reviewAnswers",
                    undefined,
                    "Xem lại chi tiết bài làm",
                  )}
                </span>
              </h3>
              <span className="text-xs text-[#939bb4]">
                {testResult.correctCount} / {testResult.totalQuestions} câu đúng
              </span>
            </div>

            <div className="space-y-3">
              {testResult.reviews.map((rev, idx) => (
                <div
                  key={rev.questionId}
                  className={`p-5 rounded-2xl border transition-all ${
                    rev.isCorrect
                      ? "bg-[#12162a] border-emerald-500/30"
                      : "bg-[#12162a] border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#818cf8] bg-[#6366F1]/15 border border-[#6366F1]/30 px-2.5 py-0.5 rounded-lg">
                        Câu #{idx + 1}
                      </span>
                      <span className="text-[11px] uppercase font-semibold text-[#939bb4] bg-[#1a2035] border border-[#252b48] px-2.5 py-0.5 rounded-lg">
                        {rev.type === QuestionType.MULTIPLE_CHOICE
                          ? "Trắc nghiệm"
                          : rev.type === QuestionType.TRUE_FALSE
                            ? "Đúng / Sai"
                            : "Tự luận"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold">
                      {rev.isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {t("modes.correct", undefined, "Chính xác")}
                          </span>
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>
                            {t("modes.incorrect", undefined, "Chưa đúng")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-base font-bold text-white mb-3 leading-relaxed">
                    {renderQuestionPrompt(rev.type, rev.prompt)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0a092d] p-3 rounded-xl border border-[#252b48]">
                      <span className="text-[#939bb4] block mb-1">
                        {t(
                          "modes.yourAnswer",
                          undefined,
                          "Câu trả lời của bạn:",
                        )}
                      </span>
                      <strong
                        className={
                          rev.isCorrect
                            ? "text-emerald-300 font-medium"
                            : "text-rose-300 font-medium line-through"
                        }
                      >
                        {formatReviewAnswer(rev.type, rev.userAnswer) ||
                          `(${t("modes.noAnswerProvided", undefined, "Chưa nhập câu trả lời")})`}
                      </strong>
                    </div>
                    <div className="bg-[#0a092d] p-3 rounded-xl border border-[#252b48]">
                      <span className="text-[#939bb4] block mb-1">
                        {t(
                          "modes.correctAnswerLabel",
                          undefined,
                          "Đáp án chính xác:",
                        )}
                      </span>
                      <strong className="text-emerald-400 font-medium">
                        {formatReviewAnswer(rev.type, rev.correctAnswer)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : testData ? (
        viewMode === "card" ? (
          /* ========================================================= */
          /* CARD-BY-CARD VIEW (Focus mode matching Write/Cloze/Learn) */
          /* ========================================================= */
          <div className="space-y-6">
            {(() => {
              const currentQ = testData.questions[currentIndex];
              if (!currentQ) return null;
              const selectedAnswer = userAnswers[currentQ.id];

              return (
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between border-b border-[#2e3856] pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#818cf8] font-mono font-bold text-xs">
                        Câu {currentIndex + 1} / {testData.totalQuestions}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#1a2035] border border-[#252b48] text-[#939bb4] text-xs font-semibold">
                        {currentQ.type === QuestionType.MULTIPLE_CHOICE
                          ? "Trắc nghiệm"
                          : currentQ.type === QuestionType.TRUE_FALSE
                            ? "Đúng / Sai"
                            : "Tự luận"}
                      </span>
                    </div>

                    <div className="text-xs text-[#939bb4]">
                      Đã trả lời:{" "}
                      <span className="text-emerald-400 font-bold">
                        {answeredCount}
                      </span>{" "}
                      / {testData.totalQuestions}
                    </div>
                  </div>

                  {/* Question Prompt Card */}
                  <div className="py-8 sm:py-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 bg-[#131722]/60 rounded-2xl border border-[#252b48]/60 shadow-inner">
                    <div className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-wide">
                      {renderQuestionPrompt(
                        currentQ.type,
                        currentQ.prompt,
                        true,
                      )}
                    </div>
                  </div>

                  {/* Options / Input Area */}
                  {currentQ.type === QuestionType.MULTIPLE_CHOICE &&
                  currentQ.options &&
                  currentQ.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const letter =
                          ["A", "B", "C", "D"][optIdx] || `${optIdx + 1}`;
                        const isSelected = selectedAnswer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt)}
                            className={`group relative p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none ${
                              isSelected
                                ? "bg-[#6366F1]/20 border-[#6366F1] text-white shadow-lg shadow-indigo-600/20 ring-1 ring-[#6366F1]"
                                : "bg-[#131722]/80 border-[#252b48] text-[#d9dde8] hover:bg-[#1a2035] hover:border-[#818cf8]/50 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-[#6366F1] text-white"
                                    : "bg-[#1a2035] border border-[#252b48] text-[#939bb4] group-hover:border-[#818cf8]/50 group-hover:text-white"
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="text-sm sm:text-base font-semibold leading-snug">
                                {opt}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-[#6366F1] bg-[#6366F1] text-white"
                                  : "border-[#3b4568] bg-transparent opacity-40 group-hover:opacity-100"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 stroke-[3]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQ.type === QuestionType.TRUE_FALSE ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {[
                        {
                          value: "true",
                          label: t("common.true", undefined, "Đúng"),
                        },
                        {
                          value: "false",
                          label: t("common.false", undefined, "Sai"),
                        },
                      ].map((item) => {
                        const isTrue = item.value === "true";
                        const isSelected =
                          selectedAnswer === item.value ||
                          (item.value === "true" &&
                            (selectedAnswer?.toLowerCase() === "true" ||
                              selectedAnswer?.toLowerCase() === "đúng")) ||
                          (item.value === "false" &&
                            (selectedAnswer?.toLowerCase() === "false" ||
                              selectedAnswer?.toLowerCase() === "sai"));
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                              handleSelectOption(currentQ.id, item.value)
                            }
                            className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer select-none ${
                              isSelected
                                ? isTrue
                                  ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500"
                                  : "bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/20 ring-1 ring-rose-500"
                                : "bg-[#131722]/80 border-[#252b48] text-[#d9dde8] hover:bg-[#1a2035] hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isTrue
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}
                              >
                                {isTrue ? (
                                  <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                  <XCircle className="w-6 h-6" />
                                )}
                              </div>
                              <span className="text-base sm:text-lg font-bold">
                                {item.label}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? isTrue
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-rose-500 bg-rose-500 text-white"
                                  : "border-[#3b4568] bg-transparent opacity-40"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 stroke-[3]" />
                              )}
                            </div>
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
                          "Gõ câu trả lời tiếng Anh vào đây...",
                        )}
                        value={selectedAnswer || ""}
                        onChange={(e) =>
                          handleSelectOption(currentQ.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (currentIndex + 1 < testData.questions.length) {
                              setCurrentIndex((prev) => prev + 1);
                            }
                          }
                        }}
                        className="w-full bg-[#0a092d] text-white placeholder-[#586380] border-2 border-[#2e3856] focus:border-[#6366F1] rounded-2xl px-5 py-4 text-center text-lg sm:text-xl font-bold tracking-wide focus:outline-none transition-colors shadow-inner"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                    </div>
                  )}

                  {/* Card Navigation Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#2e3856]">
                    <Button
                      variant="secondary"
                      size="md"
                      disabled={currentIndex === 0}
                      onClick={() =>
                        setCurrentIndex((prev) => Math.max(0, prev - 1))
                      }
                      icon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Câu trước
                    </Button>

                    {currentIndex < testData.questions.length - 1 ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="flex items-center gap-1.5"
                      >
                        <span>Câu tiếp theo</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="gradient"
                        size="md"
                        loading={isSubmitting}
                        onClick={handleSubmitTest}
                        icon={<Send className="w-4 h-4" />}
                      >
                        Nộp bài thi 🚀
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Question Jump Navigator Pill Bar */}
            <div className="bg-[#12162a] border border-[#252b48] rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#818cf8]" />
                  Danh sách câu hỏi bài thi
                </span>
                <span className="text-[#939bb4]">
                  Đã trả lời{" "}
                  <span className="text-emerald-400 font-bold">
                    {answeredCount}
                  </span>{" "}
                  / {testData.totalQuestions} câu
                </span>
              </div>

              {/* Number buttons */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto py-1">
                {testData.questions.map((q, idx) => {
                  const hasAnswer = !!userAnswers[q.id]?.trim();
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer relative flex items-center justify-center ${
                        isCurrent
                          ? "bg-[#6366F1] border-2 border-[#818cf8] text-white shadow-md shadow-indigo-500/30 scale-105"
                          : hasAnswer
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                            : "bg-[#1a2035] border border-[#252b48] text-[#939bb4] hover:text-white hover:border-[#818cf8]/40"
                      }`}
                      title={`Câu ${idx + 1}: ${hasAnswer ? "Đã trả lời" : "Chưa trả lời"}`}
                    >
                      {idx + 1}
                      {hasAnswer && !isCurrent && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#12162a]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#252b48]/60">
                <div className="text-xs text-[#939bb4] flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{" "}
                    Đã làm
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#252b48] inline-block" />{" "}
                    Chưa làm
                  </span>
                </div>

                <Button
                  variant="gradient"
                  size="md"
                  loading={isSubmitting}
                  onClick={handleSubmitTest}
                  icon={<Send className="w-4 h-4" />}
                  className="w-full sm:w-auto px-6 font-bold"
                >
                  Nộp bài thi ngay ({answeredCount}/{testData.totalQuestions})
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* LIST VIEW (All questions displayed on single scrolling page) */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="space-y-4">
              {testData.questions.map((q, idx) => {
                const selectedAnswer = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-[#2e3856] pb-3">
                      <span className="text-xs font-bold text-[#818cf8] bg-[#6366F1]/15 border border-[#6366F1]/30 px-3 py-1 rounded-full font-mono">
                        {t(
                          "modes.questionOf",
                          {
                            current: idx + 1,
                            total: testData.totalQuestions,
                          },
                          `Câu ${idx + 1} / ${testData.totalQuestions}`,
                        )}
                      </span>
                      <span className="text-xs text-[#939bb4] font-semibold uppercase bg-[#1a2035] border border-[#252b48] px-2.5 py-1 rounded-full">
                        {q.type === QuestionType.MULTIPLE_CHOICE
                          ? "Trắc nghiệm"
                          : q.type === QuestionType.TRUE_FALSE
                            ? "Đúng / Sai"
                            : "Tự luận"}
                      </span>
                    </div>

                    <div className="py-4 px-5 bg-[#131722]/60 rounded-2xl border border-[#252b48]/60 shadow-inner">
                      <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        {renderQuestionPrompt(q.type, q.prompt, false)}
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {q.type === QuestionType.MULTIPLE_CHOICE &&
                    q.options &&
                    q.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const letter =
                            ["A", "B", "C", "D"][optIdx] || `${optIdx + 1}`;
                          const isSelected = selectedAnswer === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt)}
                              className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none ${
                                isSelected
                                  ? "bg-[#6366F1]/20 border-[#6366F1] text-white shadow-md shadow-indigo-600/20 ring-1 ring-[#6366F1]"
                                  : "bg-[#131722]/80 border-[#252b48] text-[#d9dde8] hover:bg-[#1a2035] hover:border-[#818cf8]/50 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-[#6366F1] text-white"
                                      : "bg-[#1a2035] border border-[#252b48] text-[#939bb4] group-hover:border-[#818cf8]/50 group-hover:text-white"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="text-sm font-semibold leading-snug">
                                  {opt}
                                </span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "border-[#6366F1] bg-[#6366F1] text-white"
                                    : "border-[#3b4568] bg-transparent opacity-40 group-hover:opacity-100"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : q.type === QuestionType.TRUE_FALSE ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {[
                          {
                            value: "true",
                            label: t("common.true", undefined, "Đúng"),
                          },
                          {
                            value: "false",
                            label: t("common.false", undefined, "Sai"),
                          },
                        ].map((item) => {
                          const isTrue = item.value === "true";
                          const isSelected =
                            selectedAnswer === item.value ||
                            (item.value === "true" &&
                              (selectedAnswer?.toLowerCase() === "true" ||
                                selectedAnswer?.toLowerCase() === "đúng")) ||
                            (item.value === "false" &&
                              (selectedAnswer?.toLowerCase() === "false" ||
                                selectedAnswer?.toLowerCase() === "sai"));
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() =>
                                handleSelectOption(q.id, item.value)
                              }
                              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer select-none ${
                                isSelected
                                  ? isTrue
                                    ? "bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500"
                                    : "bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500"
                                  : "bg-[#131722]/80 border-[#252b48] text-[#d9dde8] hover:bg-[#1a2035]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isTrue ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-rose-400" />
                                )}
                                <span className="text-sm font-bold">
                                  {item.label}
                                </span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? isTrue
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : "border-rose-500 bg-rose-500 text-white"
                                    : "border-[#3b4568] bg-transparent opacity-40"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Written Answer Input */
                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder={t(
                            "modes.typeYourEnglishAnswer",
                            undefined,
                            "Gõ câu trả lời tiếng Anh vào đây...",
                          )}
                          value={selectedAnswer || ""}
                          onChange={(e) =>
                            handleSelectOption(q.id, e.target.value)
                          }
                          className="w-full bg-[#0a092d] text-white placeholder-[#586380] border-2 border-[#2e3856] focus:border-[#6366F1] rounded-2xl px-4 py-3 text-base font-bold focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Action Sticky Bottom */}
            <div className="p-4 bg-[#1a1d36] border border-[#2e3856] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl">
              <div className="text-xs text-[#939bb4]">
                {t(
                  "modes.answeredCount",
                  {
                    current: answeredCount,
                    total: testData.totalQuestions,
                  },
                  `Đã trả lời: ${answeredCount} / ${testData.totalQuestions} câu`,
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
                  "Nộp bài thi & Xem kết quả 🚀",
                )}
              </Button>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
};
