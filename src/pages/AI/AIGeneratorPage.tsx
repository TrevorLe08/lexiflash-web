import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { aiApi, AiGeneratedSetData, AiExplainTermData } from "../../api/aiApi";
import { studySetApi } from "../../api/studySetApi";
import { cardApi } from "../../api/cardApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Save,
  CheckCircle2,
  Lightbulb,
  Layers,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { Select } from "../../components/common/Select";
import { StudySetSelectCard } from "./StudySetSelectCard";
import { useTranslation } from "../../i18n";
import { UserRole, StudySet } from "../../types";
import { cn } from "../../utils/cn";

export const AIGeneratorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryTargetSetId =
    searchParams.get("targetSetId") || searchParams.get("setId") || "";

  const [activeTab, setActiveTab] = useState<"generator" | "explainer">(
    "generator",
  );

  // Generator State
  const [prompt, setPrompt] = useState("");
  const [cardCount, setCardCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<AiGeneratedSetData | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAppending, setIsAppending] = useState(false);

  // Destination State: "NEW_SET" or "EXISTING_SET"
  const [saveMode, setSaveMode] = useState<"NEW_SET" | "EXISTING_SET">(
    queryTargetSetId ? "EXISTING_SET" : "NEW_SET",
  );
  const [targetSetId, setTargetSetId] = useState<string>(queryTargetSetId);
  const [userSets, setUserSets] = useState<StudySet[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);

  // Explainer State
  const [lookupTerm, setLookupTerm] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainedData, setExplainedData] = useState<AiExplainTermData | null>(
    null,
  );

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingSets(true);
      studySetApi
        .getAll({ onlyMine: true, limit: 100 })
        .then((res) => {
          const sets = res.data || [];
          setUserSets(sets);
          if (queryTargetSetId && sets.some((s) => s.id === queryTargetSetId)) {
            setTargetSetId(queryTargetSetId);
            setSaveMode("EXISTING_SET");
          } else if (sets.length > 0) {
            setTargetSetId((prev) => prev || sets[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSets(false));
    }
  }, [isAuthenticated, queryTargetSetId]);

  const isEnglishTerm = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    if (!/[a-zA-Z]/.test(trimmed)) return false;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed.charCodeAt(i) > 127) return false;
    }
    return /^[a-zA-Z0-9\s\-',.?!/"]+$/.test(trimmed);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await aiApi.generateSet({
        prompt: prompt.trim(),
        cardCount,
      });
      setGeneratedSet(res.data);
      dispatch(
        addToast({
          message: t(
            "ai.generateSuccess",
            undefined,
            "Flashcards generated with AI!",
          ),
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message:
            err.message ||
            t("ai.generateFailed", undefined, "AI Generation failed"),
          type: "error",
        }),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNewSet = async () => {
    if (!generatedSet) return;
    setIsSaving(true);
    try {
      const res = await studySetApi.create({
        title: generatedSet.title,
        description: generatedSet.description,
        tags: generatedSet.tags,
        cards: generatedSet.cards,
      });
      dispatch(
        addToast({
          message: t("ai.saveSuccess", undefined, "Saved to your study sets!"),
          type: "success",
        }),
      );
      navigate(`/sets/${res.data.id}`);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || t("ai.saveFailed", undefined, "Save failed"),
          type: "error",
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAppendToExistingSet = async () => {
    if (!generatedSet) return;
    if (!targetSetId) {
      dispatch(
        addToast({
          message: "Vui lòng chọn học phần muốn thêm từ vựng vào!",
          type: "error",
        }),
      );
      return;
    }

    const chosenSet = userSets.find((s) => s.id === targetSetId);
    setIsAppending(true);
    try {
      const res = await cardApi.bulkCreate(targetSetId, generatedSet.cards);
      dispatch(
        addToast({
          message: `Đã thêm thành công ${res.data.length} từ vựng vào học phần "${chosenSet?.title || "học phần của bạn"}"!`,
          type: "success",
        }),
      );
      navigate(`/sets/${targetSetId}`);
    } catch (err: any) {
      dispatch(
        addToast({
          message:
            err.message ||
            "Không thể thêm từ vựng vào học phần. Vui lòng thử lại!",
          type: "error",
        }),
      );
    } finally {
      setIsAppending(false);
    }
  };

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = lookupTerm.trim();
    if (!term) return;

    if (!isEnglishTerm(term)) {
      dispatch(
        addToast({
          message: t(
            "ai.enterEnglishOnly",
            undefined,
            "Vui lòng nhập từ vựng bằng tiếng Anh.",
          ),
          type: "error",
        }),
      );
      return;
    }

    setIsExplaining(true);
    try {
      const res = await aiApi.explainTerm({
        term,
      });
      setExplainedData(res.data);
    } catch (err: any) {
      dispatch(
        addToast({
          message:
            err.message || t("ai.explainFailed", undefined, "Explain failed"),
          type: "error",
        }),
      );
    } finally {
      setIsExplaining(false);
    }
  };

  const samplePrompts = [
    "Essential IELTS Band 8.0 Academic Collocations for Writing Task 2",
    "Business English: Cross-border Merger & Acquisition Terminology",
    "Advanced English Phrasal Verbs used in Tech & Startups",
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          {t("ai.loginRequired", undefined, "Log in to use AI Study Assistant")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "ai.subtitle",
            undefined,
            "Generate complete flashcard decks from any topic or look up smart mnemonic stories with AI.",
          )}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="lg">
              {t("nav.login", undefined, "Log in")}
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              {t("nav.signup", undefined, "Sign up")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{t("ai.badge", undefined, "AI Study Assistant")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("ai.title", undefined, "AI Study Assistant")}
        </h1>
        <p className="text-sm md:text-base text-[#939bb4] max-w-xl mx-auto">
          {t(
            "ai.subtitle",
            undefined,
            "Generate complete flashcard decks from any topic or look up smart mnemonic stories with AI.",
          )}
        </p>

        {/* User Quota Indicator */}
        {user && (
          <div className="flex justify-center pt-1">
            {user.role === UserRole.ADMIN ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Quản trị viên (ADMIN): Không giới hạn lượt dùng AI</span>
              </span>
            ) : user.vipPlan === "1_YEAR" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  VIP Diamond Elite: Hạn mức 40 lượt tạo/giải nghĩa AI mỗi ngày
                </span>
              </span>
            ) : user.isVip ||
              (user.vipExpiresAt &&
                new Date(user.vipExpiresAt).getTime() > Date.now()) ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  VIP Gold Member: Hạn mức 20 lượt tạo/giải nghĩa AI mỗi ngày
                </span>
              </span>
            ) : (
              <Link
                to="/vip"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Nâng cấp VIP để sử dụng AI Study Assistant →</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 bg-[#121633] p-1 rounded-xl border border-[#2e3856]">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "generator"
                ? "bg-[#4257B2] text-white shadow-sm"
                : "text-[#939bb4] hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t("ai.generatorTab", undefined, "Generate Study Set")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("explainer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "explainer"
                ? "bg-[#4257B2] text-white shadow-sm"
                : "text-[#939bb4] hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {t("ai.explainerTab", undefined, "Word Explainer & Mnemonics")}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI GENERATOR */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          <form
            onSubmit={handleGenerate}
            className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#939bb4]">
                {t(
                  "ai.promptLabel",
                  undefined,
                  "Topic, Notes, or Vocabulary Request",
                )}
              </label>
              <textarea
                rows={3}
                placeholder={t(
                  "ai.promptPlaceholder",
                  undefined,
                  "Enter a topic or paste a paragraph/article here...",
                )}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#4257B2]"
                required
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#939bb4] uppercase tracking-wider block">
                {t("ai.ideasLabel", undefined, "Ideas to try:")}
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="text-xs bg-[#0a092d] hover:bg-[#202545] text-[#d9dde8] border border-[#2e3856] hover:border-[#4257B2] px-3 py-1 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Selection: New Set vs Existing Set */}
            <div className="p-4 bg-[#131722] border border-[#262e48] rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <label className="text-xs font-bold text-[#8e98b0] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4f5fd8]" />
                  <span>
                    {t(
                      "ai.destinationLabel",
                      undefined,
                      "Mục tiêu lưu từ vựng:",
                    )}
                  </span>
                </label>

                <div className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex p-1 bg-[#1a1f30] border border-[#262e48] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSaveMode("NEW_SET")}
                    className={cn(
                      "px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 leading-tight",
                      saveMode === "NEW_SET"
                        ? "bg-[#4f5fd8] text-white shadow-xs"
                        : "text-[#8e98b0] hover:text-white",
                    )}
                  >
                    ➕{" "}
                    {t("ai.createNewSetOption", undefined, "Tạo học phần mới")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveMode("EXISTING_SET")}
                    className={cn(
                      "px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 leading-tight",
                      saveMode === "EXISTING_SET"
                        ? "bg-[#4f5fd8] text-white shadow-xs"
                        : "text-[#8e98b0] hover:text-white",
                    )}
                  >
                    📥{" "}
                    {t(
                      "ai.addToExistingOption",
                      undefined,
                      "Thêm vào học phần có sẵn",
                    )}
                  </button>
                </div>
              </div>

              {saveMode === "EXISTING_SET" && (
                <div className="pt-2 border-t border-[#262e48]/60 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8e98b0] uppercase tracking-wider">
                      {t(
                        "ai.selectTargetSet",
                        undefined,
                        "Chọn học phần nhận từ vựng:",
                      )}
                    </span>
                    {userSets.length > 0 && (
                      <span className="text-[11px] text-[#8e98b0]">
                        {userSets.length} học phần sở hữu
                      </span>
                    )}
                  </div>
                  <StudySetSelectCard
                    userSets={userSets}
                    selectedSetId={targetSetId}
                    onSelectSet={(id) => setTargetSetId(id)}
                    loading={loadingSets}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#262e48]">
              {/* Number of Cards Select */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8e98b0] uppercase tracking-wider">
                  {t("ai.cardsCountLabel", undefined, "Cards:")}
                </span>
                <Select
                  value={String(cardCount)}
                  onChange={(val) => setCardCount(Number(val))}
                  options={[
                    {
                      value: "5",
                      label: `5 ${t("common.cards", undefined, "cards")}`,
                    },
                    {
                      value: "8",
                      label: `8 ${t("common.cards", undefined, "cards")}`,
                    },
                    {
                      value: "10",
                      label: `10 ${t("common.cards", undefined, "cards")}`,
                    },
                    {
                      value: "12",
                      label: `12 ${t("common.cards", undefined, "cards")}`,
                    },
                    {
                      value: "15",
                      label: `15 ${t("common.cards", undefined, "cards")}`,
                    },
                  ]}
                  icon={<Layers className="w-3.5 h-3.5 text-[#4f5fd8]" />}
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={isGenerating}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold"
              >
                {t("ai.generateBtn", undefined, "Generate Flashcards with AI")}
              </Button>
            </div>
          </form>

          {/* Generated Result Preview */}
          {generatedSet && (
            <div className="bg-[#1a1f30] border border-pink-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up">
              {/* Top Header with Context & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262e48] pb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {generatedSet.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8e98b0] mt-1 line-clamp-2">
                    {generatedSet.description}
                  </p>
                  {saveMode === "EXISTING_SET" && (
                    <div className="mt-3.5 max-w-lg space-y-1.5">
                      <span className="text-[11px] font-bold text-[#8e98b0] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Học phần nhận thêm từ vựng:</span>
                      </span>
                      <StudySetSelectCard
                        userSets={userSets}
                        selectedSetId={targetSetId}
                        onSelectSet={(id) => setTargetSetId(id)}
                        loading={loadingSets}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {saveMode === "EXISTING_SET" && targetSetId ? (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        loading={isAppending}
                        disabled={isSaving}
                        onClick={handleAppendToExistingSet}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        className="font-bold"
                      >
                        Thêm {generatedSet.cards.length} từ vào học phần 📥
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        loading={isSaving}
                        disabled={isAppending}
                        onClick={handleSaveNewSet}
                        icon={<Save className="w-4 h-4" />}
                      >
                        Lưu thành bộ mới 🚀
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        loading={isSaving}
                        disabled={isAppending}
                        onClick={handleSaveNewSet}
                        icon={<Save className="w-4 h-4" />}
                        className="font-bold"
                      >
                        Lưu thành học phần mới 🚀
                      </Button>
                      {userSets.length > 0 && (
                        <Button
                          variant="secondary"
                          size="md"
                          disabled={isSaving || isAppending}
                          onClick={() => setSaveMode("EXISTING_SET")}
                          icon={<Layers className="w-4 h-4" />}
                        >
                          Thêm vào học phần có sẵn 📥
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Cards Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedSet.cards.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-[#131722] border border-[#262e48] rounded-2xl p-4 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-white">
                        {c.term}
                      </h4>
                      <AudioButton text={c.term} size="sm" />
                    </div>
                    {c.phonetic && (
                      <p className="text-xs font-mono text-[#8e98b0]">
                        {c.phonetic}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-emerald-400">
                      {c.definition}
                    </p>
                    {c.example && (
                      <p className="text-xs text-[#8e98b0] italic">
                        "{c.example}"
                      </p>
                    )}
                    {c.hint && (
                      <p className="text-[11px] text-amber-300/90 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>{c.hint}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#262e48]">
                <div className="text-xs text-[#8e98b0]">
                  Tổng cộng {generatedSet.cards.length} thẻ từ vựng được AI tạo
                  thành công.
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {saveMode === "EXISTING_SET" && targetSetId ? (
                    <Button
                      variant="primary"
                      size="md"
                      loading={isAppending}
                      disabled={isSaving}
                      onClick={handleAppendToExistingSet}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      className="font-bold flex-1 sm:flex-initial"
                    >
                      Thêm {generatedSet.cards.length} từ vào học phần 📥
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      loading={isSaving}
                      disabled={isAppending}
                      onClick={handleSaveNewSet}
                      icon={<Save className="w-4 h-4" />}
                      className="font-bold flex-1 sm:flex-initial"
                    >
                      Lưu thành học phần mới 🚀
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI WORD EXPLAINER */}
      {activeTab === "explainer" && (
        <div className="space-y-6">
          <form
            onSubmit={handleExplain}
            className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={t(
                  "ai.searchWordPlaceholder",
                  undefined,
                  "Type an English word (e.g. Ephemeral, Ubiquitous, Pernicious)...",
                )}
                value={lookupTerm}
                onChange={(e) => setLookupTerm(e.target.value)}
                className="flex-1 bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-2xl px-5 py-3 text-base focus:outline-none focus:border-[#4257B2]"
                required
              />
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={isExplaining}
              >
                {t("ai.explainBtn", undefined, "Explain with AI 💡")}
              </Button>
            </div>
          </form>

          {explainedData && (
            <div className="bg-[#1a1d36] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up">
              {/* Top Term & Pronunciation */}
              <div className="flex items-center justify-between border-b border-[#2e3856] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-white">
                      {explainedData.term}
                    </h2>
                    <AudioButton text={explainedData.term} size="md" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#939bb4] font-mono mt-1">
                    <span>{explainedData.phonetic}</span>
                    <span>•</span>
                    <span className="text-[#6366F1] font-sans font-bold uppercase text-xs">
                      {explainedData.partOfSpeech}
                    </span>
                  </div>
                </div>
              </div>

              {/* Definition */}
              <div className="bg-[#0a092d] p-4 rounded-2xl border border-[#2e3856]">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  {t("ai.vietnameseMeaning", undefined, "Vietnamese Meaning")}
                </span>
                <p className="text-xl font-bold text-white leading-relaxed">
                  {explainedData.definition}
                </p>
              </div>

              {/* Mnemonic Story Hook */}
              {explainedData.mnemonicStory && (
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    {t("ai.mnemonicHook", undefined, "Mnemonic Memory Hook")}
                  </span>
                  <p className="text-sm text-amber-100/90 leading-relaxed italic">
                    {explainedData.mnemonicStory}
                  </p>
                </div>
              )}

              {/* Examples */}
              {explainedData.examples && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                    {t(
                      "ai.exampleSentences",
                      undefined,
                      "Authentic Example Sentences",
                    )}
                  </span>
                  <div className="space-y-2">
                    {explainedData.examples.map((ex, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-[#d9dde8] italic bg-[#0a092d]/70 p-3 rounded-xl border border-[#2e3856]"
                      >
                        "{ex}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Collocations & Synonyms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {explainedData.commonCollocations && (
                  <div className="bg-[#0a092d] p-4 rounded-2xl border border-[#2e3856] space-y-2">
                    <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider block">
                      {t("ai.collocations", undefined, "Common Collocations")}
                    </span>
                    <ul className="text-xs text-[#d9dde8] space-y-1">
                      {explainedData.commonCollocations.map((col, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1]" />
                          <span>{col}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explainedData.synonyms && (
                  <div className="bg-[#0a092d] p-4 rounded-2xl border border-[#2e3856] space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      {t("ai.synonyms", undefined, "Synonyms")}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {explainedData.synonyms.map((syn, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#2e3856] text-emerald-300 px-2.5 py-1 rounded-lg"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {explainedData.antonyms &&
                  explainedData.antonyms.length > 0 && (
                    <div className="bg-[#0a092d] p-4 rounded-2xl border border-[#2e3856] space-y-2 sm:col-span-2">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                        {t("ai.antonyms", undefined, "Antonyms")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {explainedData.antonyms.map((ant, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg"
                          >
                            {ant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
