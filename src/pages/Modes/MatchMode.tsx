import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchStudySetById } from "../../store/slices/studySetSlice";
import { matchApi } from "../../api/matchApi";
import { Button } from "../../components/common/Button";
import { StudyHeaderBar } from "../../components/study/StudyHeaderBar";
import { triggerConfetti } from "../../utils/confetti";
import { Trophy, RotateCcw, Sparkles, Gamepad2 } from "lucide-react";
import { Spinner } from "../../components/common/Spinner";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { MatchGameCard, MatchLeaderboardEntry, StudyMode } from "../../types";
import { studyApi } from "../../api/studyApi";
import { recordStudyStreak } from "../../store/slices/authSlice";
import { useTranslation } from "../../i18n";

export const MatchMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { currentSet, loading } = useAppSelector((state) => state.studySets);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [tiles, setTiles] = useState<MatchGameCard[]>([]);
  const [selectedTile, setSelectedTile] = useState<MatchGameCard | null>(null);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [correctPairIds, setCorrectPairIds] = useState<string[]>([]);

  const [sessionToken, setSessionToken] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboardResult, setLeaderboardResult] = useState<{
    entry: MatchLeaderboardEntry;
    isNewPersonalBest: boolean;
  } | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudySetById(id));
    }
  }, [dispatch, id]);

  const loadGame = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    setSelectedTile(null);
    setMatchedCardIds([]);
    setWrongPairIds([]);
    setCorrectPairIds([]);
    setIsGameOver(false);
    setLeaderboardResult(null);
    setElapsedMs(0);
    setSessionToken("");

    try {
      const res = await matchApi.getTiles(id, 6);
      setTiles(res.data.tiles);
      setSessionToken(res.data.sessionToken);
      setStartTime(Date.now());
    } catch {
      // ignore
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (id && isAuthenticated) {
      loadGame();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, isAuthenticated, loadGame]);

  // Live Timer
  useEffect(() => {
    if (!startTime || isGameOver || !isAuthenticated) return;

    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [startTime, isGameOver, isAuthenticated]);

  const handleTileClick = async (tile: MatchGameCard) => {
    if (
      isGameOver ||
      matchedCardIds.includes(tile.cardId) ||
      wrongPairIds.length > 0 ||
      correctPairIds.length > 0
    ) {
      return;
    }

    if (selectedTile && selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // Second tile clicked -> Check match
    if (
      selectedTile.cardId === tile.cardId &&
      selectedTile.type !== tile.type
    ) {
      // ✅ CORRECT PAIR MATCH!
      setCorrectPairIds([selectedTile.id, tile.id]);

      const updatedMatched = [...matchedCardIds, tile.cardId];
      const totalPairs = tiles.length / 2;

      setTimeout(async () => {
        setMatchedCardIds(updatedMatched);
        setCorrectPairIds([]);
        setSelectedTile(null);

        // Check if all matched
        if (updatedMatched.length === totalPairs) {
          setIsGameOver(true);
          triggerConfetti();

          const finalTimeMs = Date.now() - (startTime || Date.now());
          setElapsedMs(finalTimeMs);

          if (isAuthenticated && id && sessionToken) {
            try {
              const result = await matchApi.submitScore(id, {
                timeRecordMs: finalTimeMs,
                matchedPairs: totalPairs,
                sessionToken,
              });
              setLeaderboardResult(result.data);
            } catch {
              // ignore
            }
            dispatch(recordStudyStreak());
            studyApi
              .recordSession({
                studySetId: id,
                mode: StudyMode.MATCH,
                cardsTotal: totalPairs,
                cardsCorrect: totalPairs,
                cardsIncorrect: 0,
                timeSpentSeconds: Math.max(1, Math.round(finalTimeMs / 1000)),
              })
              .catch(() => {});
          }
        }
      }, 450);
    } else {
      // ❌ WRONG PAIR MISMATCH!
      setWrongPairIds([selectedTile.id, tile.id]);
      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedTile(null);
      }, 500);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <Gamepad2 className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("auth.loginTitle", undefined, "Log in to play Match Game")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "modes.matchInstructions",
            undefined,
            "Match mode tests your speed and accuracy against the clock and records your times on the leaderboard.",
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
        label={t("common.loading", undefined, "Loading Match Game...")}
        className="py-24"
      />
    );
  }

  if (!currentSet) {
    return <EntityNotFound type="set" className="py-20" />;
  }

  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Unified Study Header Bar */}
      <div className="space-y-3">
        <StudyHeaderBar
          current={matchedCardIds.length}
          total={tiles.length > 0 ? tiles.length / 2 : 6}
          backUrl={`/sets/${id}`}
        />

        {/* Sub-bar with Stopwatch Timer and Restart Button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 bg-[#1a1d36] border border-[#2e3856] text-white px-3.5 py-1 rounded-full font-mono text-sm font-bold shadow-md">
            <span className="text-amber-400">⏱️</span>
            <span>{seconds}s</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadGame}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            {t("modes.restart", undefined, "Restart")}
          </Button>
        </div>
      </div>

      {/* Game Board / Complete Screen */}
      {isGameOver ? (
        <div className="bg-[#1a1d36] border-2 border-amber-500/40 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl animate-scale-up">
          <div className="w-24 h-24 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              {t("modes.matchCompleteTitle", undefined, "Match Completed! 🎉")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              {t("modes.matchSeconds", { seconds })}
            </h2>
            {leaderboardResult?.isNewPersonalBest && (
              <p className="text-sm text-emerald-400 font-bold flex items-center justify-center gap-1.5 pt-1">
                <Sparkles className="w-4 h-4" />{" "}
                {t(
                  "modes.matchPersonalBest",
                  undefined,
                  "New personal best score recorded! 🏆",
                )}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={loadGame}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {t("modes.playAgain", undefined, "Play Again")}
            </Button>
            <Link to={`/sets/${id}`}>
              <Button variant="secondary" size="lg">
                {t("modes.backToSet", undefined, "Back to Set")}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
          {tiles.map((tile) => {
            const isMatched = matchedCardIds.includes(tile.cardId);
            const isSelected = selectedTile?.id === tile.id;
            const isWrong = wrongPairIds.includes(tile.id);
            const isCorrect = correctPairIds.includes(tile.id);

            if (isMatched) {
              return (
                <div
                  key={tile.id}
                  className="h-32 rounded-2xl border border-transparent opacity-0 pointer-events-none transition-opacity duration-300"
                />
              );
            }

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile)}
                className={`h-32 p-4 rounded-2xl border text-center flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md select-none ${
                  isCorrect
                    ? "bg-emerald-600/90 border-emerald-400 text-white animate-match-correct shadow-xl shadow-emerald-600/40 ring-2 ring-emerald-400 scale-105"
                    : isWrong
                      ? "bg-red-600/90 border-red-400 text-white animate-match-wrong shadow-xl shadow-red-600/40 ring-2 ring-red-400 scale-105"
                      : isSelected
                        ? "bg-[#4257B2] border-[#6366F1] text-white scale-105 shadow-xl shadow-indigo-900/50 ring-2 ring-[#6366F1]"
                        : "bg-[#1a1d36] hover:bg-[#222749] border-[#2e3856] hover:border-[#4257B2]/70 text-[#f6f7fb]"
                }`}
              >
                <span className="line-clamp-3 font-bold text-base sm:text-lg leading-snug">
                  {tile.content}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
