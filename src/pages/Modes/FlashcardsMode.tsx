import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  fetchStudySetById,
  updateCardStarred,
} from "../../store/slices/studySetSlice";
import { addToast } from "../../store/slices/uiSlice";
import { studyApi } from "../../api/studyApi";
import { cardApi } from "../../api/cardApi";
import { FlipCard } from "../../components/study/FlipCard";
import { StudyHeaderBar } from "../../components/study/StudyHeaderBar";
import { Button } from "../../components/common/Button";
import { triggerConfetti } from "../../utils/confetti";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  RotateCcw,
  Keyboard,
  Trophy,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Card, StudyMode } from "../../types";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

export const FlashcardsMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { currentSet, loading } = useAppSelector((state) => state.studySets);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [starredOnly, setStarredOnly] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const loadedSetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (id) {
      loadedSetIdRef.current = null;
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentSet?.cards && loadedSetIdRef.current !== currentSet.id) {
      loadedSetIdRef.current = currentSet.id;
      setCards(currentSet.cards);
      const starred = currentSet.cards
        .filter((c) => Boolean(c.isStarred))
        .map((c) => c.id);
      setStarredIds(starred);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsCompleted(false);
      startTimeRef.current = Date.now();
    }
  }, [currentSet]);

  const activeCards = starredOnly
    ? cards.filter((c) => starredIds.includes(c.id))
    : cards;

  // Auto-clamp currentIndex when cards list shrinks (e.g. unstarring in starredOnly mode)
  useEffect(() => {
    if (activeCards.length > 0 && currentIndex >= activeCards.length) {
      setCurrentIndex(Math.max(0, activeCards.length - 1));
      setIsFlipped(false);
    }
  }, [activeCards.length, currentIndex]);

  const safeIndex = Math.min(
    currentIndex,
    Math.max(0, activeCards.length - 1),
  );
  const currentCard = activeCards[safeIndex];

  const handleNext = useCallback(() => {
    if (isCompleted) return;
    if (safeIndex < activeCards.length - 1) {
      setCurrentIndex((prev) => Math.min(prev + 1, activeCards.length - 1));
      setIsFlipped(false);
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
            mode: StudyMode.FLASHCARDS,
            cardsTotal: activeCards.length,
            cardsCorrect: activeCards.length,
            cardsIncorrect: 0,
            timeSpentSeconds,
          })
          .catch(() => {});
      }
    }
  }, [
    safeIndex,
    activeCards.length,
    isCompleted,
    isAuthenticated,
    id,
    dispatch,
  ]);

  const handlePrev = useCallback(() => {
    if (isCompleted) return;
    if (safeIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setIsFlipped(false);
    }
  }, [safeIndex, isCompleted]);

  const handleFlip = useCallback(() => {
    if (isCompleted) return;
    setIsFlipped((prev) => !prev);
  }, [isCompleted]);

  const handleToggleStar = useCallback(async () => {
    if (!currentCard || isCompleted) return;
    const cardId = currentCard.id;

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

    const willBeStarred = !starredIds.includes(cardId);

    // Optimistic local state update
    setStarredIds((prev) =>
      willBeStarred
        ? [...prev, cardId]
        : prev.filter((item) => item !== cardId),
    );
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, isStarred: willBeStarred } : c,
      ),
    );

    // Sync with Redux store
    dispatch(updateCardStarred({ cardId, isStarred: willBeStarred }));

    // Sync with TanStack Query cache for StudySetDetailPage
    if (id) {
      queryClient.setQueryData(["studySet", id], (old: any) => {
        if (!old || !old.cards) return old;
        return {
          ...old,
          cards: old.cards.map((c: any) =>
            c.id === cardId ? { ...c, isStarred: willBeStarred } : c,
          ),
        };
      });
    }

    try {
      const res = await cardApi.toggleStar(cardId);
      const actualStarred = res.data.isStarred;
      if (actualStarred !== willBeStarred) {
        setStarredIds((prev) =>
          actualStarred
            ? [...prev, cardId]
            : prev.filter((item) => item !== cardId),
        );
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, isStarred: actualStarred } : c,
          ),
        );
        dispatch(updateCardStarred({ cardId, isStarred: actualStarred }));
        if (id) {
          queryClient.setQueryData(["studySet", id], (old: any) => {
            if (!old || !old.cards) return old;
            return {
              ...old,
              cards: old.cards.map((c: any) =>
                c.id === cardId ? { ...c, isStarred: actualStarred } : c,
              ),
            };
          });
        }
      }
    } catch {
      // Revert optimistic update on error
      setStarredIds((prev) =>
        !willBeStarred
          ? [...prev, cardId]
          : prev.filter((item) => item !== cardId),
      );
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, isStarred: !willBeStarred } : c,
        ),
      );
      dispatch(updateCardStarred({ cardId, isStarred: !willBeStarred }));
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["studySet", id] });
      }
    }
  }, [
    currentCard,
    isCompleted,
    isAuthenticated,
    starredIds,
    dispatch,
    t,
    id,
    queryClient,
  ]);

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  // Keyboard navigation support (Space to flip, ArrowLeft, ArrowRight, S to star)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (isCompleted) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleToggleStar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleToggleStar, isCompleted]);

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading flashcards...")}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  const progressPercent =
    activeCards.length > 0
      ? isCompleted
        ? 100
        : Math.min(
            100,
            Math.round(((safeIndex + 1) / activeCards.length) * 100),
          )
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Unified Study Header Bar */}
      <div className="space-y-3">
        <StudyHeaderBar
          current={activeCards.length > 0 ? (isCompleted ? activeCards.length : safeIndex + 1) : 0}
          total={activeCards.length}
          backUrl={`/sets/${id}`}
          percent={progressPercent}
        />

        {/* Sub Header: Set Title & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {currentSet.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShuffle}
              title={t("modes.shuffleBtn", undefined, "Shuffle cards")}
              className="p-1.5 sm:p-2 rounded-xl bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] text-[#8e98b0] hover:text-white transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStarredOnly(!starredOnly);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              title={t("modes.starredOnlyBtn", undefined, "Filter starred only")}
              className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${
                starredOnly
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-[#121420] text-[#8e98b0] hover:text-white border-white/[0.08]"
              }`}
            >
              <Star className={`w-4 h-4 ${starredOnly ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Flashcard Component / Completed View */}
      {isCompleted ? (
        <div className="bg-[#0f111a] border border-emerald-500/30 rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-xl animate-scale-up">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t(
                "modes.flashcardsCompleteTitle",
                undefined,
                "Session Complete! 🎉",
              )}
            </h2>
            <p className="text-sm text-[#8e98b0]">
              {t("modes.flashcardsCompleteDesc", { count: activeCards.length })}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleRestart}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {t("modes.studyAgain", undefined, "Study Again")}
            </Button>
            <Link to={`/sets/${id}/learn`}>
              <Button variant="primary" size="md">
                {t("modes.tryLearnModeSrs", undefined, "Active Recall (SRS)")}
              </Button>
            </Link>
          </div>
        </div>
      ) : currentCard ? (
        <div className="space-y-6">
          <FlipCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            isStarred={starredIds.includes(currentCard.id)}
            onToggleStar={handleToggleStar}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handlePrev}
              disabled={safeIndex === 0}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              {t("modes.previous", undefined, "Previous")}
            </Button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8e98b0] bg-[#121420] border border-white/[0.08] px-3 py-1.5 rounded-lg">
              <Keyboard className="w-3.5 h-3.5 text-[#4f5fd8]" />
              <span>
                <kbd className="kbd-pill">Space</kbd> Flip •{" "}
                <kbd className="kbd-pill">←</kbd>{" "}
                <kbd className="kbd-pill">→</kbd> Navigate •{" "}
                <kbd className="kbd-pill">S</kbd> Star
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              {safeIndex === activeCards.length - 1
                ? t("modes.finish", undefined, "Finish")
                : t("modes.next", undefined, "Next")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0f111a] rounded-2xl border border-white/[0.08] space-y-4">
          <p className="text-[#8e98b0]">
            {t(
              "modes.noMatchingCards",
              undefined,
              "No cards found matching your filter.",
            )}
          </p>
          <Button variant="primary" onClick={() => setStarredOnly(false)}>
            {t("modes.showAllCards", undefined, "Show all cards")}
          </Button>
        </div>
      )}
    </div>
  );
};
