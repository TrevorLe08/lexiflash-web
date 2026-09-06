import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { createStudySet } from "../../store/slices/studySetSlice";
import { studySetApi } from "../../api/studySetApi";
import { cardApi } from "../../api/cardApi";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Pagination } from "../../components/common/Pagination";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Save,
  Globe,
  Lock,
  Link2,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { PrivacyLevel, StudyLevel, UserRole } from "../../types";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

// Lazy-load modals containing heavy libraries (e.g. xlsx)
const BulkImportModal = lazy(() =>
  import("./BulkImportModal").then((m) => ({ default: m.BulkImportModal })),
);
const AiGenerateModal = lazy(() =>
  import("./AiGenerateModal").then((m) => ({ default: m.AiGenerateModal })),
);

interface CardDraft {
  id?: string;
  clientId?: string;
  term: string;
  definition: string;
  phonetic: string;
  example: string;
  hint: string;
}

let nextCardCounter = 0;
const createCardDraft = (initial?: Partial<CardDraft>): CardDraft => ({
  clientId:
    initial?.clientId ||
    `card_${Date.now()}_${++nextCardCounter}_${Math.random().toString(36).slice(2, 6)}`,
  term: initial?.term || "",
  definition: initial?.definition || "",
  phonetic: initial?.phonetic || "",
  example: initial?.example || "",
  hint: initial?.hint || "",
  id: initial?.id,
});

interface CardEditorRowProps {
  card: CardDraft;
  index: number;
  canDelete: boolean;
  onCardChange: (index: number, field: keyof CardDraft, value: string) => void;
  onDelete: (index: number) => void;
}

const CardEditorRow: React.FC<CardEditorRowProps> = React.memo(
  ({ card, index, canDelete, onCardChange, onDelete }) => {
    const { t } = useTranslation();

    return (
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-4 relative group shadow-md">
        <div className="flex items-center justify-between border-b border-[#2e3856] pb-3">
          <span className="text-xs font-mono font-bold text-[#6366F1] bg-[#4257B2]/20 px-2.5 py-0.5 rounded">
            {t("setEditor.cardIndex", { index: index + 1 }, `#${index + 1}`)}
          </span>

          <button
            type="button"
            onClick={() => onDelete(index)}
            disabled={!canDelete}
            className="text-[#939bb4] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title={t("setEditor.deleteCard", undefined, "Delete card row")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Term & Definition Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#939bb4] uppercase tracking-wider block">
              {t("setEditor.termLabel", undefined, "Term (English)")}
            </label>
            <input
              type="text"
              placeholder={t(
                "setEditor.termPlaceholder",
                undefined,
                "Enter English term...",
              )}
              value={card.term}
              onChange={(e) => onCardChange(index, "term", e.target.value)}
              className="w-full bg-[#0a092d] text-white text-base font-semibold placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4257B2]"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#939bb4] uppercase tracking-wider block">
              {t(
                "setEditor.definitionLabel",
                undefined,
                "Definition (Vietnamese / Meaning)",
              )}
            </label>
            <input
              type="text"
              placeholder={t(
                "setEditor.definitionPlaceholder",
                undefined,
                "Enter definition...",
              )}
              value={card.definition}
              onChange={(e) => onCardChange(index, "definition", e.target.value)}
              className="w-full bg-[#0a092d] text-white text-sm placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4257B2]"
            />
          </div>
        </div>

        {/* Optional: Phonetic, Example & Hint */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <input
            type="text"
            placeholder={t(
              "setEditor.phoneticPlaceholder",
              undefined,
              "Phonetic (e.g. /juːˈbɪk.wə.təs/)",
            )}
            value={card.phonetic}
            onChange={(e) => onCardChange(index, "phonetic", e.target.value)}
            className="w-full bg-[#0a092d]/60 text-xs font-mono text-[#d9dde8] placeholder-[#586380] border border-[#2e3856]/80 rounded-xl px-3 py-2 focus:outline-none focus:border-[#4257B2]"
          />
          <input
            type="text"
            placeholder={t(
              "setEditor.examplePlaceholder",
              undefined,
              "Example sentence (optional)",
            )}
            value={card.example}
            onChange={(e) => onCardChange(index, "example", e.target.value)}
            className="w-full bg-[#0a092d]/60 text-xs text-[#d9dde8] placeholder-[#586380] border border-[#2e3856]/80 rounded-xl px-3 py-2 focus:outline-none focus:border-[#4257B2]"
          />
          <input
            type="text"
            placeholder={t(
              "setEditor.hintPlaceholder",
              undefined,
              "Hint / Gợi ý (optional)",
            )}
            value={card.hint}
            onChange={(e) => onCardChange(index, "hint", e.target.value)}
            className="w-full bg-[#0a092d]/60 text-xs text-[#d9dde8] placeholder-[#586380] border border-[#2e3856]/80 rounded-xl px-3 py-2 focus:outline-none focus:border-[#4257B2]"
          />
        </div>
      </div>
    );
  },
);

export const SetEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const isSystemAdmin = user?.role === UserRole.ADMIN;
  const isVip = Boolean(
    isSystemAdmin ||
    user?.isVip ||
    (user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now()),
  );
  const isDiamond = isVip && !isSystemAdmin && user?.vipPlan === "1_YEAR";
  const isGold = isVip && !isSystemAdmin && user?.vipPlan !== "1_YEAR";
  const totalCardsOwned = user?.stats?.totalCardsOwned || 0;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [privacy, setPrivacy] = useState<PrivacyLevel>(PrivacyLevel.PUBLIC);
  const [level, setLevel] = useState<StudyLevel>("INTERMEDIATE");
  const [cards, setCards] = useState<CardDraft[]>(() => [
    createCardDraft(),
    createCardDraft(),
    createCardDraft(),
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [loadingSet, setLoadingSet] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [editorPage, setEditorPage] = useState(1);
  const pageSize = 10;
  const totalEditorPages = Math.max(1, Math.ceil(cards.length / pageSize));
  const currentEditorPage = Math.min(editorPage, totalEditorPages);

  const visibleCards = useMemo(() => {
    const start = (currentEditorPage - 1) * pageSize;
    return cards
      .slice(start, start + pageSize)
      .map((card, idx) => ({ card, actualIndex: start + idx }));
  }, [cards, currentEditorPage, pageSize]);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: "Please log in to create or edit study sets",
          type: "info",
        }),
      );
      navigate("/login");
      return;
    }

    if (isEditMode && id) {
      setLoadingSet(true);
      setNotFound(false);
      studySetApi
        .getById(id)
        .then((res) => {
          const s = res.data;
          setTitle(s.title);
          setDescription(s.description || "");
          setTagsInput(s.tags?.join(", ") || "");
          setPrivacy(s.privacy);
          if (s.level) setLevel(s.level);
          if (s.cards && s.cards.length > 0) {
            setCards(
              s.cards.map((c) =>
                createCardDraft({
                  id: c.id,
                  term: c.term,
                  definition: c.definition,
                  phonetic: c.phonetic || "",
                  example: c.example || "",
                  hint: c.hint || "",
                }),
              ),
            );
          }
        })
        .catch(() => {
          setNotFound(true);
        })
        .finally(() => {
          setLoadingSet(false);
        });
    }
  }, [id, isEditMode, isAuthenticated, navigate, dispatch]);

  const handleAddCardRow = () => {
    if (!isVip && !isSystemAdmin && totalCardsOwned + cards.length >= 300) {
      dispatch(
        addToast({
          message: t(
            "setEditor.freeLimitReachedToast",
            undefined,
            "Bạn đã đạt giới hạn 300 từ vựng cho tài khoản Miễn phí! Vui lòng nâng cấp VIP để tạo không giới hạn.",
          ),
          type: "error",
        }),
      );
      return;
    }
    setCards((prev) => {
      const next = [...prev, createCardDraft()];
      const nextTotalPages = Math.ceil(next.length / pageSize);
      setEditorPage(nextTotalPages);
      return next;
    });
  };

  const handleCardChange = useCallback(
    (index: number, field: keyof CardDraft, value: string) => {
      setCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
      );
    },
    [],
  );

  const handleDeleteCardRow = useCallback((index: number) => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, idx) => idx !== index);
      const nextTotalPages = Math.max(1, Math.ceil(next.length / pageSize));
      setEditorPage((curr) => Math.min(curr, nextTotalPages));
      return next;
    });
  }, [pageSize]);

  const handleBulkImportCards = (
    imported: Array<{
      term: string;
      definition: string;
      phonetic?: string;
      example?: string;
      hint?: string;
    }>,
  ) => {
    if (
      !isVip &&
      !isSystemAdmin &&
      totalCardsOwned + cards.length + imported.length > 300
    ) {
      const remainingSlots = Math.max(
        0,
        300 - (totalCardsOwned + cards.length),
      );
      dispatch(
        addToast({
          message: t(
            "setEditor.bulkLimitExceededToast",
            { remaining: remainingSlots },
            `Không thể nhập toàn bộ! Tài khoản Miễn phí chỉ còn được thêm tối đa ${remainingSlots} từ vựng nữa (giới hạn 300 từ). Vui lòng nâng cấp gói VIP!`,
          ),
          type: "error",
        }),
      );
      return;
    }

    const formatted = imported.map((item) => ({
      term: item.term,
      definition: item.definition,
      phonetic: item.phonetic || "",
      example: item.example || "",
      hint: item.hint || "",
    }));

    // Replace empty rows or append
    setCards((prev) => {
      const nonEmpty = prev.filter((c) => c.term.trim() || c.definition.trim());
      return [...nonEmpty, ...formatted.map((f) => createCardDraft(f))];
    });

    dispatch(
      addToast({
        message: `Imported ${imported.length} cards!`,
        type: "success",
      }),
    );
  };

  const handleInsertAiCards = (
    newCards: Array<{
      term: string;
      definition: string;
      phonetic?: string;
      example?: string;
      hint?: string;
    }>,
  ) => {
    if (
      !isVip &&
      !isSystemAdmin &&
      totalCardsOwned + cards.length + newCards.length > 300
    ) {
      const remainingSlots = Math.max(
        0,
        300 - (totalCardsOwned + cards.length),
      );
      dispatch(
        addToast({
          message: t(
            "setEditor.bulkLimitExceededToast",
            { remaining: remainingSlots },
            `Không thể nhập toàn bộ! Tài khoản Miễn phí chỉ còn được thêm tối đa ${remainingSlots} từ vựng nữa (giới hạn 300 từ). Vui lòng nâng cấp gói VIP!`,
          ),
          type: "error",
        }),
      );
      return;
    }

    const formatted = newCards.map((item) => ({
      term: item.term,
      definition: item.definition,
      phonetic: item.phonetic || "",
      example: item.example || "",
      hint: item.hint || "",
    }));

    setCards((prev) => {
      const nonEmpty = prev.filter((c) => c.term.trim() || c.definition.trim());
      return [...nonEmpty, ...formatted.map((f) => createCardDraft(f))];
    });

    dispatch(
      addToast({
        message: `Đã chèn thành công ${newCards.length} từ vựng do AI tạo vào học phần!`,
        type: "success",
      }),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      dispatch(
        addToast({
          message: "Please provide a title for the study set",
          type: "error",
        }),
      );
      return;
    }

    const validCards = cards.filter(
      (c) => c.term.trim() !== "" && c.definition.trim() !== "",
    );

    if (validCards.length < 2) {
      dispatch(
        addToast({
          message: "Please add at least 2 complete cards",
          type: "error",
        }),
      );
      return;
    }

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    setIsSaving(true);

    try {
      if (isEditMode && id) {
        // Update existing set with atomic card sync (updates modified, deletes removed, adds new)
        await studySetApi.update(id, {
          title,
          description,
          tags: tagsArray,
          privacy,
          level,
          cards: validCards,
        });

        dispatch(addToast({ message: "Study set updated!", type: "success" }));
        navigate(`/sets/${id}`);
      } else {
        // Create new set
        const res = await dispatch(
          createStudySet({
            title,
            description,
            tags: tagsArray,
            privacy,
            level,
            cards: validCards,
          }),
        );
        if (createStudySet.fulfilled.match(res)) {
          navigate(`/sets/${res.payload.id}`);
        }
      }
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || "Save failed", type: "error" }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingSet) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading study set...")}
        className="py-24"
      />
    );
  }

  if (notFound) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-2.5 sm:gap-4">
        {/* Cancel Action */}
        <div>
          <Link
            to={isEditMode ? `/sets/${id}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("common.cancel", undefined, "Cancel")}</span>
          </Link>
        </div>

        {/* Section title & Save button placed below Cancel button */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">
            {isEditMode
              ? t("setEditor.editTitle", undefined, "Edit Study Set")
              : t("setEditor.createTitle", undefined, "Create a New Study Set")}
          </h1>

          <Button
            type="button"
            variant="gradient"
            size="md"
            loading={isSaving}
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
            className="shrink-0"
          >
            {isEditMode
              ? t("setEditor.saveBtn", undefined, "Save Changes")
              : t("setEditor.createBtn", undefined, "Create Set")}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Set Details Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <Input
            label={t("setEditor.titleLabel", undefined, "Title")}
            placeholder={t(
              "setEditor.titlePlaceholder",
              undefined,
              'e.g. "IELTS Band 8.0 - Essential Collocations"',
            )}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
              {t("setEditor.descLabel", undefined, "Description")}
            </label>
            <textarea
              rows={2}
              placeholder={t(
                "setEditor.descPlaceholder",
                undefined,
                "Add a description for this study set...",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4257B2]"
            />
          </div>

          <div>
            <Input
              label={t(
                "setEditor.tagsLabel",
                undefined,
                "Tags (comma separated)",
              )}
              placeholder={t(
                "setEditor.tagsPlaceholder",
                undefined,
                "IELTS, Academic, Writing, Speaking",
              )}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Privacy & Visibility Selector */}
          <div className="space-y-2 text-left pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
              {t("setEditor.privacyLabel", undefined, "Privacy & Sharing")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  {
                    key: PrivacyLevel.PUBLIC,
                    label: t("setEditor.public", undefined, "Public"),
                    desc: t(
                      "setEditor.publicDesc",
                      undefined,
                      "Visible to everyone on Explore & Search",
                    ),
                    icon: Globe,
                  },
                  {
                    key: PrivacyLevel.UNLISTED,
                    label: t(
                      "setEditor.unlisted",
                      undefined,
                      "Unlisted (Link only)",
                    ),
                    desc: t(
                      "setEditor.unlistedDesc",
                      undefined,
                      "Hidden from search, accessible via URL",
                    ),
                    icon: Link2,
                  },
                  {
                    key: PrivacyLevel.PRIVATE,
                    label: t("setEditor.private", undefined, "Private"),
                    desc: t(
                      "setEditor.privateDesc",
                      undefined,
                      "Only you can view and study",
                    ),
                    icon: Lock,
                  },
                ] as const
              ).map((opt) => {
                const isSelected = privacy === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPrivacy(opt.key)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "bg-indigo-950/40 border-[#6366F1] ring-2 ring-[#6366F1]/30 shadow-md"
                        : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? "text-[#6366F1]" : "text-[#939bb4]"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-white" : "text-[#d9dde8]"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#939bb4] leading-tight">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Selector */}
          <div className="space-y-2 text-left pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
              {t("setEditor.levelLabel", undefined, "Target Proficiency Level")}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(
                [
                  {
                    key: "BEGINNER",
                    label: t(
                      "setEditor.beginner",
                      undefined,
                      "Beginner (A1-A2)",
                    ),
                    color: "emerald",
                  },
                  {
                    key: "INTERMEDIATE",
                    label: t(
                      "setEditor.intermediate",
                      undefined,
                      "Intermediate (B1-B2)",
                    ),
                    color: "indigo",
                  },
                  {
                    key: "ADVANCED",
                    label: t(
                      "setEditor.advanced",
                      undefined,
                      "Advanced (C1-C2)",
                    ),
                    color: "purple",
                  },
                ] as const
              ).map((lvl) => {
                const isSelected = level === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => setLevel(lvl.key as StudyLevel)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? lvl.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30"
                          : lvl.color === "purple"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500 ring-2 ring-purple-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border-indigo-500 ring-2 ring-indigo-500/30"
                        : "bg-[#0a092d] text-[#939bb4] hover:text-white border-[#2e3856]"
                    }`}
                  >
                    <span>{lvl.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Toolbar: Import / AI Helper / Free Limit Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">
              {t(
                "setEditor.cardsCount",
                { count: cards.length },
                `Cards (${cards.length})`,
              )}
            </h2>
            {totalEditorPages > 1 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#4f5fd8]/20 text-[#a5b4fc] border border-[#4f5fd8]/40">
                {t(
                  "setEditor.pageIndicator",
                  { page: currentEditorPage, total: totalEditorPages },
                  `Trang ${currentEditorPage}/${totalEditorPages}`,
                )}
              </span>
            )}
            {isSystemAdmin ? (
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {t(
                    "setEditor.adminUnlimited",
                    { count: totalCardsOwned },
                    `Admin: ${totalCardsOwned} từ vựng (Không giới hạn)`,
                  )}
                </span>
              </span>
            ) : isDiamond ? (
              <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {t(
                    "setEditor.vipDiamondUnlimited",
                    { count: totalCardsOwned },
                    `VIP Diamond: ${totalCardsOwned} từ vựng (Không giới hạn)`,
                  )}
                </span>
              </span>
            ) : isGold ? (
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {t(
                    "setEditor.vipGoldUnlimited",
                    { count: totalCardsOwned },
                    `VIP Gold: ${totalCardsOwned} từ vựng (Không giới hạn)`,
                  )}
                </span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#8e98b0] bg-[#121420] px-3 py-1 rounded-xl border border-white/[0.08]">
                {t(
                  "setEditor.freeLimitNotice",
                  { count: totalCardsOwned },
                  `Tài khoản miễn phí: ${totalCardsOwned}/300 từ vựng`,
                )}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              className="w-full sm:w-auto justify-center text-xs whitespace-nowrap"
            >
              {t("setEditor.importBtn", undefined, "Import Excel / CSV")}
            </Button>

            {/* AI Generator Button: Exclusive to VIP & Admin */}
            {isVip ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                icon={
                  isDiamond ? (
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  ) : isGold ? (
                    <Crown className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#9cb1ff]" />
                  )
                }
                className={cn(
                  "w-full sm:w-auto justify-center text-xs whitespace-nowrap",
                  isDiamond &&
                    "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10",
                  isGold &&
                    "border-amber-500/30 text-amber-300 hover:bg-amber-500/10",
                )}
              >
                {t("setEditor.generateAiBtn", undefined, "Generate with AI")}
              </Button>
            ) : (
              <Link
                to="/vip"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-xs group w-full sm:w-auto whitespace-nowrap"
                title="Upgrade to VIP to unlock AI flashcard generator"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">
                  {t("setEditor.unlockVipAi", undefined, "Unlock AI with VIP")}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Cards Row List */}
        <div id="editor-cards-section" className="space-y-4 scroll-mt-24">
          {visibleCards.map(({ card, actualIndex }) => (
            <CardEditorRow
              key={card.clientId || card.id || `card-${actualIndex}`}
              card={card}
              index={actualIndex}
              canDelete={cards.length > 1}
              onCardChange={handleCardChange}
              onDelete={handleDeleteCardRow}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalEditorPages > 1 && (
          <div className="flex items-center justify-center p-3 bg-[#1a1d36] border border-[#2e3856] rounded-2xl">
            <Pagination
              currentPage={currentEditorPage}
              totalPages={totalEditorPages}
              onPageChange={(p) => {
                setEditorPage(p);
                const el = document.getElementById("editor-cards-section");
                if (el) {
                  const yOffset = -90;
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                }
              }}
            />
          </div>
        )}

        {/* Add Card Row Button */}
        <button
          type="button"
          onClick={handleAddCardRow}
          className="w-full py-4 border-2 border-dashed border-[#2e3856] hover:border-[#4257B2] rounded-2xl text-sm font-bold text-[#6366F1] hover:text-white bg-[#1a1d36]/50 hover:bg-[#1a1d36] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{t("setEditor.addCardBtn", undefined, "Add Card Row")}</span>
        </button>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            loading={isSaving}
            className="px-10"
            icon={<Save className="w-4 h-4" />}
          >
            {isEditMode
              ? t("setEditor.saveBtn", undefined, "Save Changes")
              : t("setEditor.createBtn", undefined, "Create Study Set 🚀")}
          </Button>
        </div>
      </form>

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <Suspense fallback={null}>
          <BulkImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleBulkImportCards}
          />
        </Suspense>
      )}

      {/* AI Generate Modal */}
      {isAiModalOpen && (
        <Suspense fallback={null}>
          <AiGenerateModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            onInsertCards={handleInsertAiCards}
            targetSetId={id}
            isVip={isVip}
            isDiamond={isDiamond}
            isGold={isGold}
          />
        </Suspense>
      )}
    </div>
  );
};
