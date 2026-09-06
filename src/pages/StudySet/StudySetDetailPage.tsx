import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  toggleStarSet,
  updateCardStarred,
} from "../../store/slices/studySetSlice";
import { studySetApi } from "../../api/studySetApi";
import { cardApi } from "../../api/cardApi";
import { matchApi } from "../../api/matchApi";
import { folderApi } from "../../api/folderApi";
import { addToast } from "../../store/slices/uiSlice";
import {
  Layers,
  BrainCircuit,
  Headphones,
  FileCheck2,
  Gamepad2,
  PenLine,
  Star,
  Copy,
  FolderPlus,
  Edit3,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Trophy,
  Bookmark,
  Lock,
  Plus,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { FlipCard } from "../../components/study/FlipCard";
import { AudioButton } from "../../components/study/AudioButton";
import { StarButton } from "../../components/study/StarButton";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Pagination } from "../../components/common/Pagination";
import { MatchLeaderboardEntry, Folder, UserRole } from "../../types";
import { useTranslation } from "../../i18n";
import { useDebounce } from "../../hooks/useDebounce";

export const StudySetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // TanStack Query for study set details (with 3-minute automatic caching & deduplication)
  const {
    data: currentSet,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["studySet", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await studySetApi.getById(id);
      return res.data;
    },
    enabled: !!id,
    retry: false,
  });

  // TanStack Query for match leaderboard
  const { data: leaderboard = [] } = useQuery<MatchLeaderboardEntry[]>({
    queryKey: ["matchLeaderboard", id],
    queryFn: async () => {
      if (!id) return [];
      const res = await matchApi.getLeaderboard(id);
      return res.data || [];
    },
    enabled: !!id,
  });

  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [termsPage, setTermsPage] = useState(1);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [addToFolderModalOpen, setAddToFolderModalOpen] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [folderModalPage, setFolderModalPage] = useState(1);
  const [addingToFolderId, setAddingToFolderId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoreModesOpen, setIsMoreModesOpen] = useState(false);

  useEffect(() => {
    if (currentSet) {
      setIsBookmarked(Boolean(currentSet.isBookmarked));
    }
  }, [currentSet]);

  const handleToggleStar = async () => {
    if (!id || !isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to star study sets",
          ),
          type: "info",
        }),
      );
      return;
    }
    await dispatch(toggleStarSet(id));
    queryClient.invalidateQueries({ queryKey: ["studySet", id] });
  };

  const handleToggleBookmark = async () => {
    if (!id || !isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to bookmark study sets",
          ),
          type: "info",
        }),
      );
      return;
    }

    try {
      const res = await studySetApi.toggleBookmark(id);
      setIsBookmarked(res.data.isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["studySet", id] });
      dispatch(
        addToast({
          message: res.data.isBookmarked
            ? t(
                "studySet.bookmarkToastAdded",
                undefined,
                "Added to your bookmarked sets 🔖",
              )
            : t(
                "studySet.bookmarkToastRemoved",
                undefined,
                "Removed from bookmarks",
              ),
          type: "success",
        }),
      );
    } catch {
      // ignore
    }
  };

  const handleClone = async () => {
    if (!id || !isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to copy this set",
          ),
          type: "info",
        }),
      );
      return;
    }
    try {
      const response = await studySetApi.clone(id);
      dispatch(
        addToast({
          message: t(
            "studySet.copyToastSuccess",
            undefined,
            "Study set copied to your library!",
          ),
          type: "success",
        }),
      );
      navigate(`/sets/${response.data.id}`);
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || "Clone failed", type: "error" }),
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await studySetApi.delete(id);
      dispatch(
        addToast({
          message: t(
            "studySet.deleteToastSuccess",
            undefined,
            "Study set deleted successfully!",
          ),
          type: "info",
        }),
      );
      setDeleteModalOpen(false);
      navigate("/");
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || "Delete failed", type: "error" }),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddToFolderModal = async () => {
    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to organize sets into folders",
          ),
          type: "info",
        }),
      );
      return;
    }
    setFolderSearchQuery("");
    setFolderModalPage(1);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["myFolders"],
        queryFn: async () => {
          const res = await folderApi.getAll({ limit: 100 });
          return res.data;
        },
        staleTime: 1000 * 60 * 2,
      });
      setFolders(data || []);
      setAddToFolderModalOpen(true);
    } catch {
      // ignore
    }
  };

  const [starredCardIds, setStarredCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentSet?.cards) {
      const initialStarred = new Set(
        currentSet.cards.filter((c) => Boolean(c.isStarred)).map((c) => c.id),
      );
      setStarredCardIds(initialStarred);
    }
  }, [currentSet?.cards]);

  const handleToggleCardStar = async (cardId: string) => {
    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to star cards",
          ),
          type: "info",
        }),
      );
      return;
    }
    try {
      const res = await cardApi.toggleStar(cardId);
      const isStarred = res.data.isStarred;
      setStarredCardIds((prev) => {
        const next = new Set(prev);
        if (isStarred) next.add(cardId);
        else next.delete(cardId);
        return next;
      });

      // Synchronize TanStack Query cache
      if (id) {
        queryClient.setQueryData(["studySet", id], (old: any) => {
          if (!old || !old.cards) return old;
          return {
            ...old,
            cards: old.cards.map((c: any) =>
              c.id === cardId ? { ...c, isStarred } : c,
            ),
          };
        });
      }

      // Synchronize Redux currentSet for study modes
      dispatch(updateCardStarred({ cardId, isStarred }));
    } catch {
      // ignore
    }
  };

  const handleAddSetToFolder = async (folderId: string) => {
    if (!id || addingToFolderId) return;
    setAddingToFolderId(folderId);
    try {
      await folderApi.addSets(folderId, [id]);
      // Immediately reflect "Đã thêm ✓" on this folder (giống hình 2)
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? {
                ...f,
                studySetIds: [...(f.studySetIds || []), id],
                setCount: (f.setCount || 0) + 1,
              }
            : f,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["myFolders"] });
      dispatch(
        addToast({
          message: t(
            "folders.addSetSuccess",
            undefined,
            "Added study set to folder!",
          ),
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to add to folder",
          type: "error",
        }),
      );
    } finally {
      setAddingToFolderId(null);
    }
  };

  const cards = useMemo(() => currentSet?.cards || [], [currentSet?.cards]);
  const currentCard = cards[previewIndex];
  const isOwner = Boolean(user && currentSet && user.id === currentSet.creatorId);
  const isStarred = Boolean(currentSet?.isStarredByCurrentUser);

  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const debouncedFolderSearchQuery = useDebounce(folderSearchQuery, 200);

  const filteredCards = useMemo(() => {
    const q = debouncedSearchTerm.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.term.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q),
    );
  }, [cards, debouncedSearchTerm]);

  const filteredFolders = useMemo(() => {
    const q = debouncedFolderSearchQuery.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)),
    );
  }, [folders, debouncedFolderSearchQuery]);

  const TERMS_PER_PAGE = 10;
  const totalTermsPages = Math.max(
    1,
    Math.ceil(filteredCards.length / TERMS_PER_PAGE),
  );

  useEffect(() => {
    setTermsPage(1);
  }, [debouncedSearchTerm]);

  const paginatedCards = useMemo(() => {
    const start = (termsPage - 1) * TERMS_PER_PAGE;
    return filteredCards.slice(start, start + TERMS_PER_PAGE);
  }, [filteredCards, termsPage]);

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading study set...")}
        className="py-24"
      />
    );
  }

  if (isError || !currentSet) {
    return <EntityNotFound type="set" className="py-16" />;
  }

  const primaryStudyModes = [
    {
      title: t("studySet.modeFlashcards", undefined, "Flashcards 3D"),
      desc: t(
        "studySet.modeFlashcardsDesc",
        undefined,
        "Flip 3D cards with pronunciation and hotkeys",
      ),
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      to: `/sets/${id}/flashcards`,
    },
    {
      title: t("studySet.modeLearn", undefined, "Learn (SM-2)"),
      desc: t(
        "studySet.modeLearnDesc",
        undefined,
        "Adaptive spaced repetition review",
      ),
      icon: BrainCircuit,
      color: "from-purple-500 to-indigo-600",
      to: `/sets/${id}/learn`,
    },
    {
      title: t("studySet.modeTest", undefined, "Test Exam"),
      desc: t(
        "studySet.modeTestDesc",
        undefined,
        "Custom quizzes with instant grading",
      ),
      icon: FileCheck2,
      color: "from-amber-500 to-orange-600",
      to: `/sets/${id}/test`,
    },
    {
      title: t("studySet.modeMatch", undefined, "Match Game"),
      desc: t(
        "studySet.modeMatchDesc",
        undefined,
        "Pair words with meanings in a race against time",
      ),
      icon: Gamepad2,
      color: "from-pink-500 to-rose-600",
      to: `/sets/${id}/match`,
    },
  ];

  const secondaryStudyModes = [
    {
      title: t("studySet.modeWrite", undefined, "Listening & Dictation"),
      desc: t(
        "studySet.modeWriteDesc",
        undefined,
        "Listen to authentic pronunciation and write the spelling",
      ),
      icon: Headphones,
      color: "from-emerald-500 to-teal-600",
      to: `/sets/${id}/write`,
      badge: "Luyện nghe",
    },
    {
      title: t("studySet.modeCloze", undefined, "Fill in the Blanks"),
      desc: t(
        "studySet.modeClozeDesc",
        undefined,
        "Fill in the missing word in context sentences",
      ),
      icon: PenLine,
      color: "from-cyan-500 to-blue-600",
      to: `/sets/${id}/cloze`,
      badge: "Ngữ cảnh",
    },
  ];

  const renderLevelBadge = (level?: string) => {
    switch (level) {
      case "ADVANCED":
        return (
          <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Advanced
          </span>
        );
      case "BEGINNER":
        return (
          <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Beginner
          </span>
        );
      default:
        return (
          <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Intermediate
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* 1. SET HEADER & ACTION BAR */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Title, Description & Tags Section (Full width) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#6366F1] bg-[#4257B2]/20 border border-[#4257B2]/30 px-3 py-0.5 rounded-full">
              {t(
                "studySet.termsCount",
                { count: cards.length },
                `${cards.length} terms`,
              )}
            </span>
            {renderLevelBadge(currentSet.level)}
            <span className="text-xs font-mono text-[#939bb4] uppercase">
              {currentSet.sourceLanguage} → {currentSet.targetLanguage}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight break-words leading-snug">
            {currentSet.title}
          </h1>

          {currentSet.description && (
            <p className="text-sm sm:text-base text-[#939bb4] max-w-4xl leading-relaxed">
              {currentSet.description}
            </p>
          )}

          {currentSet.tags && currentSet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentSet.tags.map((tg) => (
                <span
                  key={tg}
                  className="text-[11px] font-medium bg-[#0a092d] text-[#939bb4] border border-[#2e3856] px-2 py-0.5 rounded-md"
                >
                  #{tg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Toolbar Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-[#2e3856]/70">
          {/* Bookmark Button */}
          <Button
            variant={isBookmarked ? "primary" : "secondary"}
            size="sm"
            onClick={handleToggleBookmark}
            icon={
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? "fill-white text-white" : "text-indigo-400"}`}
              />
            }
          >
            {isBookmarked
              ? t("studySet.bookmarked", undefined, "Bookmarked")
              : t("studySet.bookmark", undefined, "Bookmark")}
          </Button>

          {/* Star Button */}
          <Button
            variant={isStarred ? "primary" : "secondary"}
            size="sm"
            onClick={handleToggleStar}
            icon={
              <Star
                className={`w-4 h-4 ${isStarred ? "fill-amber-400 text-amber-400" : "text-amber-400"}`}
              />
            }
          >
            {isStarred
              ? t("studySet.starred", undefined, "Starred")
              : t("studySet.star", undefined, "Star")}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleClone}
            icon={<Copy className="w-4 h-4" />}
          >
            {t("studySet.copy", undefined, "Copy")}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={openAddToFolderModal}
            icon={<FolderPlus className="w-4 h-4" />}
          >
            {t("studySet.addToFolder", undefined, "Add to Folder")}
          </Button>

          {isOwner && (
            <>
              <Link to={`/ai-generator?targetSetId=${id}`}>
                <Button
                  variant="cyan"
                  size="sm"
                  icon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                  title="Tạo thêm từ vựng cho học phần này bằng AI"
                >
                  AI Thêm từ ✨
                </Button>
              </Link>
              <Link to={`/sets/${id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  {t("studySet.edit", undefined, "Edit")}
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                icon={<Trash2 className="w-4 h-4" />}
                title={t("studySet.delete", undefined, "Delete Set")}
              />
            </>
          )}
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#2e3856]">
          <Link
            to={
              user &&
              (user.id === currentSet.creator.id ||
                user.username === currentSet.creator.username)
                ? "/profile"
                : `/users/${currentSet.creator.id}`
            }
            className="flex items-center gap-3 group/creator hover:text-white transition-colors"
          >
            <img
              src={
                currentSet.creator.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                  currentSet.creator.username,
                )}`
              }
              alt={currentSet.creator.name}
              className="w-10 h-10 rounded-full object-cover bg-[#2e3856] border-2 border-[#3c476c] group-hover/creator:scale-115 group-hover/creator:ring-2 group-hover/creator:ring-[#6366F1] group-hover:border-transparent transition-all duration-200"
            />
            <div>
              <p className="text-xs text-[#939bb4]">
                {t("studySet.createdBy", undefined, "Created by")}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white group-hover/creator:text-[#6366F1] group-hover/creator:underline transition-colors">
                  {currentSet.creator.name}
                  {isOwner && (
                    <span className="text-xs text-[#939bb4] font-normal ml-1">
                      ({t("common.you", undefined, "You")})
                    </span>
                  )}
                </p>
                {currentSet.creator.role === UserRole.ADMIN && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. STUDY MODES LAUNCHPAD */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-white tracking-tight">
          {t("studySet.selectModeTitle", undefined, "Select a Study Mode")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {primaryStudyModes.map((mode) => {
            const Icon = mode.icon;
            const isFree = mode.to.includes("flashcards");
            const isLocked = !isAuthenticated && !isFree;

            return (
              <Link
                key={mode.to}
                to={mode.to}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    dispatch(
                      addToast({
                        message: t(
                          "studySet.loginRequiredMode",
                          { mode: mode.title },
                          `Please log in to use ${mode.title} mode`,
                        ),
                        type: "info",
                      }),
                    );
                    navigate("/login");
                  }
                }}
                className={`group relative bg-[#1a1d36] hover:bg-[#202545] border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-950/50 hover:-translate-y-0.5 ${
                  isLocked
                    ? "border-[#2e3856] opacity-85 hover:border-amber-500/50"
                    : "border-[#2e3856] hover:border-[#4257B2]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 shrink-0 aspect-square rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isLocked && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {t("nav.login", undefined, "Log in")}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#6366F1] transition-colors flex items-center gap-1.5">
                      <span>{mode.title}</span>
                    </h3>
                    <p className="text-xs text-[#939bb4] line-clamp-2 mt-1 leading-snug">
                      {mode.desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 5th Slot: Expand / More Modes Card */}
          <button
            type="button"
            onClick={() => setIsMoreModesOpen(true)}
            className="group relative bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#6366F1] rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-950/50 hover:-translate-y-0.5 text-left cursor-pointer"
          >
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2 py-0.5 rounded-full">
                  +{secondaryStudyModes.length} chế độ
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#6366F1] transition-colors flex items-center gap-1.5">
                  <span>{t("studySet.modeMore", undefined, "Chế Độ Khác")}</span>
                </h3>
                <p className="text-xs text-[#939bb4] line-clamp-2 mt-1 leading-snug">
                  {t(
                    "studySet.modeMoreDesc",
                    undefined,
                    "Nghe chính tả, điền từ khuyết & luyện chuyên sâu...",
                  )}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE CAROUSEL PREVIEW */}
      {currentCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight">
              {t("studySet.previewTitle", undefined, "Flashcard Preview")}
            </h2>
            <span className="text-sm font-bold text-[#939bb4]">
              {previewIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="max-w-2xl mx-auto">
            <FlipCard
              card={currentCard}
              isFlipped={isPreviewFlipped}
              onFlip={() => setIsPreviewFlipped(!isPreviewFlipped)}
              isStarred={starredCardIds.has(currentCard.id)}
              onToggleStar={() => handleToggleCardStar(currentCard.id)}
            />

            {/* Navigation controls */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="secondary"
                size="md"
                disabled={previewIndex === 0}
                onClick={() => {
                  setIsPreviewFlipped(false);
                  setPreviewIndex((p) => Math.max(0, p - 1));
                }}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                {t("modes.previous", undefined, "Previous")}
              </Button>

              <div className="flex items-center gap-2">
                <AudioButton text={currentCard.term} size="md" showAccentToggle={true} />
                <StarButton
                  isStarred={starredCardIds.has(currentCard.id)}
                  onToggle={() => handleToggleCardStar(currentCard.id)}
                  size="md"
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                disabled={previewIndex === cards.length - 1}
                onClick={() => {
                  setIsPreviewFlipped(false);
                  setPreviewIndex((p) => Math.min(cards.length - 1, p + 1));
                }}
              >
                {t("modes.next", undefined, "Next")}{" "}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL TERMS LIST & LEADERBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Term List */}
        <div id="study-set-terms-list" className="lg:col-span-2 space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-white leading-tight">
                {t(
                  "studySet.termsInSet",
                  { count: filteredCards.length },
                  `Terms in this Set (${filteredCards.length})`,
                )}
              </h2>
              {totalTermsPages > 1 && (
                <div>
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4f5fd8]/20 text-[#a5b4fc] border border-[#4f5fd8]/40">
                    {t(
                      "studySet.pageIndicator",
                      { page: termsPage, total: totalTermsPages },
                      `Trang ${termsPage}/${totalTermsPages}`,
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-64 sm:shrink-0">
              <Search className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t(
                  "studySet.searchTermsPlaceholder",
                  undefined,
                  "Search terms...",
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1d36] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#4257B2] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredCards.length === 0 ? (
              <div className="text-center py-10 bg-[#1a1d36]/50 rounded-2xl border border-[#2e3856] text-[#939bb4] text-sm">
                {t(
                  "studySet.noTermsFound",
                  undefined,
                  "No matching terms found",
                )}
              </div>
            ) : (
              paginatedCards.map((card, idx) => {
                const globalIdx =
                  (termsPage - 1) * TERMS_PER_PAGE + idx + 1;
                return (
                  <div
                    key={card.id}
                    className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 shadow-sm hover:border-[#4257B2]/60 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#586380]">
                          #{globalIdx}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                          {card.term}
                        </h3>
                        {card.phonetic && (
                          <span className="text-xs font-mono text-[#6366F1]">
                            {card.phonetic}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-[#e2e6f0] leading-snug">
                        {card.definition}
                      </p>

                      {card.example && (
                        <p className="text-xs text-[#939bb4] italic border-l-2 border-[#4257B2] pl-2.5 mt-1">
                          &quot;{card.example}&quot;
                        </p>
                      )}

                      {card.hint && (
                        <p className="text-xs text-amber-400/80">
                          💡 Hint: {card.hint}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <AudioButton text={card.term} size="sm" />
                      <StarButton
                        isStarred={starredCardIds.has(card.id)}
                        onToggle={() => handleToggleCardStar(card.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalTermsPages > 1 && (
            <div className="pt-4 flex items-center justify-center border-t border-[#2e3856]/60">
              <Pagination
                currentPage={termsPage}
                totalPages={totalTermsPages}
                onPageChange={(page) => {
                  setTermsPage(page);
                  const el = document.getElementById("study-set-terms-list");
                  if (el) {
                    const yOffset = -90;
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Match Game Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>
              {t(
                "studySet.matchLeaderboardTitle",
                undefined,
                "Match Leaderboard",
              )}
            </span>
          </h2>

          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-4 space-y-3 shadow-lg">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-[#939bb4] text-center py-6">
                {t(
                  "studySet.noLeaderboardYet",
                  undefined,
                  "No record yet. Be the first to set a high score in Match Game!",
                )}
              </p>
            ) : (
              leaderboard.slice(0, 5).map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a092d]/60 border border-[#2e3856] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? "bg-amber-400 text-black"
                          : idx === 1
                            ? "bg-gray-300 text-black"
                            : idx === 2
                              ? "bg-amber-700 text-white"
                              : "text-[#939bb4]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <Link
                      to={
                        user &&
                        (user.id === entry.userId ||
                          user.username === entry.user.username)
                          ? "/profile"
                          : `/users/${entry.userId}`
                      }
                      className="flex items-center gap-2 group/entry min-w-0"
                    >
                      <img
                        src={
                          entry.user.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                            entry.user.username,
                          )}`
                        }
                        alt={entry.user.name}
                        className="w-5 h-5 rounded-full object-cover bg-[#2e3856] group-hover/entry:scale-120 group-hover/entry:ring-2 group-hover/entry:ring-[#6366F1] transition-all duration-200"
                      />
                      <span className="font-semibold text-white group-hover/entry:text-[#6366F1] group-hover/entry:underline truncate max-w-[120px]">
                        {entry.user.name}
                        {user &&
                          (user.id === entry.userId ||
                            user.username === entry.user.username) && (
                            <span className="text-xs text-[#939bb4] font-normal ml-1">
                              ({t("common.you", undefined, "You")})
                            </span>
                          )}
                      </span>
                    </Link>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    {(entry.timeRecordMs / 1000).toFixed(2)}s
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. ADD TO FOLDER MODAL */}
      <Modal
        isOpen={addToFolderModalOpen}
        onClose={() => setAddToFolderModalOpen(false)}
        title={t("studySet.addToFolderModalTitle", undefined, "Add to Folder")}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#939bb4]">
            {t(
              "studySet.selectFolderPrompt",
              undefined,
              "Select a folder to add this study set to:",
            )}
          </p>

          {/* Search bar inside modal */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#939bb4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t(
                "folders.searchPlaceholder",
                undefined,
                "Tìm kiếm thư mục...",
              )}
              value={folderSearchQuery}
              onChange={(e) => {
                setFolderSearchQuery(e.target.value);
                setFolderModalPage(1);
              }}
              className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#4257B2]"
            />
          </div>

          {(() => {
            const FOLDER_MODAL_LIMIT = 5;
            const totalPages =
              Math.ceil(filteredFolders.length / FOLDER_MODAL_LIMIT) || 1;
            const paginated = filteredFolders.slice(
              (folderModalPage - 1) * FOLDER_MODAL_LIMIT,
              folderModalPage * FOLDER_MODAL_LIMIT,
            );

            if (folders.length === 0) {
              return (
                <div className="text-center py-6 text-sm text-[#939bb4]">
                  {t(
                    "studySet.noFoldersPrompt",
                    undefined,
                    "You don't have any folders yet.",
                  )}{" "}
                  <Link
                    to="/folders"
                    className="text-[#6366F1] font-bold hover:underline"
                  >
                    {t("studySet.createFolderNow", undefined, "Create one now")}
                  </Link>
                </div>
              );
            }

            if (filteredFolders.length === 0) {
              return (
                <div className="text-center py-6 text-sm text-[#939bb4]">
                  {t(
                    "folders.noSearchResults",
                    undefined,
                    "No folders found matching your search.",
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="space-y-2">
                  {paginated.map((f) => {
                    const isAlreadyInFolder =
                      f.studySetIds?.includes(id!) ||
                      f.studySets?.some((s) => s.id === id);

                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          if (!isAlreadyInFolder && !addingToFolderId) {
                            handleAddSetToFolder(f.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isAlreadyInFolder
                            ? "bg-[#0a092d]/40 border-[#2e3856]/40 opacity-60 cursor-not-allowed"
                            : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2] cursor-pointer"
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-bold text-white truncate">
                            {f.title}
                          </h4>
                          <p className="text-xs text-[#939bb4]">
                            {t(
                              "folders.setsCount",
                              { count: f.setCount },
                              `${f.setCount} sets`,
                            )}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyInFolder ? (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              {t(
                                "classes.alreadyAddedBadge",
                                undefined,
                                "Đã thêm ✓",
                              )}
                            </span>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={addingToFolderId === f.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSetToFolder(f.id);
                              }}
                              icon={<Plus className="w-3.5 h-3.5" />}
                            >
                              {t("common.add", undefined, "Thêm")}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination (Max 5 per page) */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center pt-3 border-t border-[#2e3856]">
                    <Pagination
                      currentPage={folderModalPage}
                      totalPages={totalPages}
                      onPageChange={setFolderModalPage}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* 5. MORE STUDY MODES MODAL */}
      <Modal
        isOpen={isMoreModesOpen}
        onClose={() => setIsMoreModesOpen(false)}
        maxWidth="2xl"
      >
        <div className="p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2e3856]/70 pb-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 shrink-0 aspect-square rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {t(
                    "studySet.moreModesModalTitle",
                    undefined,
                    "Các Chế Độ Học Mở Rộng",
                  )}
                </h3>
                <p className="text-xs text-[#939bb4]">
                  {t(
                    "studySet.moreModesModalDesc",
                    undefined,
                    "Lựa chọn phương pháp luyện tập nâng cao để ghi nhớ từ vựng sâu và hiệu quả",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryStudyModes.map((mode) => {
              const Icon = mode.icon;
              const isLocked = !isAuthenticated;

              return (
                <Link
                  key={mode.to}
                  to={mode.to}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      dispatch(
                        addToast({
                          message: t(
                            "studySet.loginRequiredMode",
                            { mode: mode.title },
                            `Please log in to use ${mode.title} mode`,
                          ),
                          type: "info",
                        }),
                      );
                      setIsMoreModesOpen(false);
                      navigate("/login");
                    } else {
                      setIsMoreModesOpen(false);
                    }
                  }}
                  className={`group relative bg-[#141824] hover:bg-[#1f253d] border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/40 hover:-translate-y-0.5 ${
                    isLocked
                      ? "border-[#2e3856] opacity-85 hover:border-amber-500/50"
                      : "border-[#2e3856] hover:border-[#6366F1]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 shrink-0 aspect-square rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {mode.badge && (
                        <span className="text-[10px] font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2.5 py-0.5 rounded-full">
                          {mode.badge}
                        </span>
                      )}

                      {isLocked && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {t("nav.login", undefined, "Log in")}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-[#6366F1] transition-colors flex items-center gap-1.5">
                        <span>{mode.title}</span>
                      </h4>
                      <p className="text-xs text-[#939bb4] mt-1.5 leading-relaxed">
                        {mode.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-[#9cb1ff] group-hover:text-white transition-colors">
                    <span>{t("common.start", undefined, "Vào học ngay")}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* 6. DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t(
          "studySet.deleteModalTitle",
          undefined,
          "Confirm Delete Study Set",
        )}
        message={t(
          "studySet.deleteModalMessage",
          undefined,
          "Are you sure you want to delete this study set? This action cannot be undone and all review progress will be lost.",
        )}
        confirmText={t("confirmModal.delete", undefined, "Delete Set")}
        cancelText={t("confirmModal.cancel", undefined, "Cancel")}
        loading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};
