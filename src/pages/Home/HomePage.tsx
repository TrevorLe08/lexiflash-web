import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  fetchStudySets,
  toggleStarSet,
} from "../../store/slices/studySetSlice";
import {
  Sparkles,
  Layers,
  Star,
  Search,
  BookOpen,
  ArrowRight,
  Plus,
  Volume2,
  RotateCw,
  Bookmark,
  CheckCircle2,
  Flame,
  TrendingUp,
  X,
  Zap,
  Eye,
  Users,
  GraduationCap,
  Folder as FolderIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { studySetApi } from "../../api/studySetApi";
import { searchApi } from "../../api/searchApi";
import { addToast } from "../../store/slices/uiSlice";
import { Pagination } from "../../components/common/Pagination";
import { speakWord } from "../../utils/speech";
import { StudyLevel, StudySet } from "../../types";
import { useTranslation } from "../../i18n";

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(currentSearch);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== currentSearch) {
        if (localSearch.trim()) {
          setSearchParams({ search: localSearch.trim() });
        } else {
          setSearchParams({});
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, currentSearch, setSearchParams]);

  const { sets, loading, totalItems } = useAppSelector(
    (state) => state.studySets,
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dueReviews = useAppSelector((state) => state.study.dueReviews);

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / 6) || 1;

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel | "ALL">("ALL");
  const [featuredSets, setFeaturedSets] = useState<StudySet[]>([]);
  const [trendingSets, setTrendingSets] = useState<StudySet[]>([]);
  const [recommendationTags, setRecommendationTags] = useState<string[]>([]);

  // TanStack Query Unified Search for peak performance & caching
  const isSearchActive = Boolean(currentSearch.trim());
  const { data: searchResponse, isLoading: isSearchLoading } = useQuery({
    queryKey: ["homeUnifiedSearch", currentSearch.trim()],
    queryFn: () => searchApi.search(currentSearch.trim(), "all", 60),
    enabled: isSearchActive,
    staleTime: 60 * 1000,
  });

  const searchResults = searchResponse?.data;
  const searchSets = searchResults?.studySets || [];
  const searchUsers = searchResults?.users || [];
  const searchClasses = searchResults?.classes || [];
  const searchFolders = searchResults?.folders || [];
  const totalSearchMatches =
    searchSets.length +
    searchUsers.length +
    searchClasses.length +
    searchFolders.length;

  // Search pagination states & constants (6 items per page for clean 3-col grid layout)
  const SEARCH_SETS_PER_PAGE = 6;
  const SEARCH_USERS_PER_PAGE = 6;
  const SEARCH_CLASSES_PER_PAGE = 6;
  const SEARCH_FOLDERS_PER_PAGE = 6;

  const [searchSetsPage, setSearchSetsPage] = useState(1);
  const [searchUsersPage, setSearchUsersPage] = useState(1);
  const [searchClassesPage, setSearchClassesPage] = useState(1);
  const [searchFoldersPage, setSearchFoldersPage] = useState(1);

  // Reset pagination when search query changes
  useEffect(() => {
    setSearchSetsPage(1);
    setSearchUsersPage(1);
    setSearchClassesPage(1);
    setSearchFoldersPage(1);
  }, [currentSearch]);

  const totalSearchSetsPages =
    Math.ceil(searchSets.length / SEARCH_SETS_PER_PAGE) || 1;
  const paginatedSearchSets = searchSets.slice(
    (searchSetsPage - 1) * SEARCH_SETS_PER_PAGE,
    searchSetsPage * SEARCH_SETS_PER_PAGE,
  );

  const totalSearchUsersPages =
    Math.ceil(searchUsers.length / SEARCH_USERS_PER_PAGE) || 1;
  const paginatedSearchUsers = searchUsers.slice(
    (searchUsersPage - 1) * SEARCH_USERS_PER_PAGE,
    searchUsersPage * SEARCH_USERS_PER_PAGE,
  );

  const totalSearchClassesPages =
    Math.ceil(searchClasses.length / SEARCH_CLASSES_PER_PAGE) || 1;
  const paginatedSearchClasses = searchClasses.slice(
    (searchClassesPage - 1) * SEARCH_CLASSES_PER_PAGE,
    searchClassesPage * SEARCH_CLASSES_PER_PAGE,
  );

  const totalSearchFoldersPages =
    Math.ceil(searchFolders.length / SEARCH_FOLDERS_PER_PAGE) || 1;
  const paginatedSearchFolders = searchFolders.slice(
    (searchFoldersPage - 1) * SEARCH_FOLDERS_PER_PAGE,
    searchFoldersPage * SEARCH_FOLDERS_PER_PAGE,
  );

  const handleSearchSetsPageChange = (newPage: number) => {
    setSearchSetsPage(newPage);
    const el = document.getElementById("search-section-sets");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSearchUsersPageChange = (newPage: number) => {
    setSearchUsersPage(newPage);
    const el = document.getElementById("search-section-users");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSearchClassesPageChange = (newPage: number) => {
    setSearchClassesPage(newPage);
    const el = document.getElementById("search-section-classes");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSearchFoldersPageChange = (newPage: number) => {
    setSearchFoldersPage(newPage);
    const el = document.getElementById("search-section-folders");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Interactive Demo Card in Hero
  const demoCards = [
    {
      term: "Resilient",
      phonetic: "/rɪˈzɪl.jənt/",
      definition: "Kiên cường, có khả năng hồi phục nhanh sau nghịch cảnh",
      example:
        "The local economy proved remarkably resilient during the crisis.",
      hint: "Synonym: tough, adaptable",
    },
    {
      term: "Ubiquitous",
      phonetic: "/juːˈbɪk.wə.təs/",
      definition: "Phổ biến, có mặt ở khắp mọi nơi",
      example: "Smartphones have become ubiquitous in modern society.",
      hint: "Synonym: omnipresent, pervasive",
    },
    {
      term: "Bite the bullet",
      phonetic: "/baɪt ðə ˈbʊl.ɪt/",
      definition: "Cắn răng chịu đựng, dũng cảm đối mặt với thử thách khó khăn",
      example: "I decided to bite the bullet and give the speech in English.",
      hint: "Origin: battlefield medicine",
    },
  ];

  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemoFlipped, setIsDemoFlipped] = useState(false);

  const currentDemoCard = demoCards[demoIndex]!;

  const handleNextDemo = () => {
    setIsDemoFlipped(false);
    setDemoIndex((prev) => (prev + 1) % demoCards.length);
  };

  // Load explore recommendations on mount
  useEffect(() => {
    searchApi
      .getExploreRecommendations()
      .then((res) => {
        if (res.data) {
          setTrendingSets(res.data.trendingSets || []);
          setFeaturedSets(res.data.featuredSets || []);
          if (res.data.popularTags?.length) {
            setRecommendationTags(res.data.popularTags);
          }
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // Fetch sets when query / filters change
  useEffect(() => {
    dispatch(
      fetchStudySets({
        search: currentSearch || undefined,
        tag: selectedTag || undefined,
        level: selectedLevel !== "ALL" ? selectedLevel : undefined,
        page,
        limit: 6,
      }),
    );
  }, [dispatch, currentSearch, selectedTag, selectedLevel, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [currentSearch, selectedTag, selectedLevel]);

  const handleToggleBookmark = async (setId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: "Please log in to bookmark study sets",
          type: "info",
        }),
      );
      return;
    }

    try {
      const res = await studySetApi.toggleBookmark(setId);
      dispatch(
        addToast({
          message: res.data.isBookmarked
            ? "Added to your bookmarked sets 🔖"
            : "Removed from bookmarks",
          type: "success",
        }),
      );
      dispatch(
        fetchStudySets({
          search: currentSearch || undefined,
          tag: selectedTag || undefined,
          level: selectedLevel !== "ALL" ? selectedLevel : undefined,
          page,
          limit: 8,
        }),
      );
    } catch {
      // ignore
    }
  };

  const defaultTags = [
    "Speaking",
    "IELTS",
    "Daily English",
    "Business",
    "Workplace",
    "Academic",
    "Writing",
    "Reading",
    "Negotiation",
    "Communication",
  ];

  const popularTags =
    recommendationTags.length > 0 ? recommendationTags : defaultTags;

  const renderLevelBadge = (level?: string) => {
    switch (level) {
      case "ADVANCED":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap shrink-0 inline-flex items-center">
            Advanced
          </span>
        );
      case "BEGINNER":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0 inline-flex items-center">
            Beginner
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap shrink-0 inline-flex items-center">
            Intermediate
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. SRS DUE REVIEWS ALERT */}
      {isAuthenticated && dueReviews.length > 0 && (
        <div className="bg-[#0f111a] border border-[#4f5fd8]/30 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 text-[#9cb1ff] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {t(
                    "home.srsAlertTitle",
                    undefined,
                    "Daily Spaced Repetition Due Today",
                  )}
                </h3>
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {t(
                    "home.srsAlertDue",
                    { count: dueReviews.length },
                    `${dueReviews.length} due`,
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8e98b0] mt-0.5">
                {t(
                  "home.srsAlertDesc",
                  undefined,
                  "Review these flashcards today to reinforce memory before retention decays.",
                )}
              </p>
            </div>
          </div>
          <Link to="/reviews" className="w-full sm:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t("home.srsAlertBtn", undefined, "Review Now")}
            </Button>
          </Link>
        </div>
      )}

      {/* 2. SIGNATURE HERO: Authentic Interactive Learning Deck */}
      {!isSearchActive && (
        <div className="relative rounded-2xl bg-[#0f111a] border border-white/[0.08] p-5 sm:p-7 md:p-9 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Thesis */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/[0.05] text-[#9cb1ff] border border-white/[0.1]">
                <Zap className="w-3.5 h-3.5 text-[#4f5fd8]" />
                Spaced Repetition (SRS)
              </span>
              <Badge variant="blue" size="sm">
                Active Recall
              </Badge>
              <Badge variant="purple" size="sm">
                CEFR & IELTS 3000
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
              {t(
                "home.heroTitle",
                undefined,
                "Active Recall & Spaced Repetition",
              )}
              <span className="block text-[#9cb1ff] font-semibold mt-1">
                {t(
                  "home.heroHighlight",
                  undefined,
                  "Engineered for Long-Term Memory",
                )}
              </span>
            </h1>

            <p className="text-[#8e98b0] text-sm sm:text-base leading-relaxed max-w-xl">
              {t(
                "home.heroDesc",
                undefined,
                "Review vocabulary right at the moment your brain is about to forget. 5 focused study modes designed for cognitive mastery.",
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
              <Link to="/sets/create" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto justify-center font-semibold"
                  icon={<Plus className="w-4 h-4" />}
                >
                  {t("home.heroCreateBtn", undefined, "Create Study Set")}
                </Button>
              </Link>
              <Link to="/ai-generator" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto justify-center font-medium"
                  icon={<Sparkles className="w-4 h-4 text-[#9cb1ff]" />}
                >
                  {t("home.heroAiBtn", undefined, "Generate with AI")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Hero Signature: Interactive 3D Card Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm perspective-1000">
              <div
                onClick={() => setIsDemoFlipped(!isDemoFlipped)}
                className={`relative w-full h-56 rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d shadow-xl ${
                  isDemoFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-[#121420] border border-white/[0.12] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-xs text-[#8e98b0]">
                    <span className="font-mono text-[11px] font-bold text-[#9cb1ff]">
                      TERM PREVIEW
                    </span>
                    <span className="text-[11px] text-[#545d78] flex items-center gap-1">
                      <kbd className="kbd-pill">Click</kbd> to flip
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                      {currentDemoCard.term}
                    </h3>
                    <p className="text-sm font-mono text-[#9cb1ff]">
                      {currentDemoCard.phonetic}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentDemoCard.term);
                      }}
                      className="p-1.5 rounded-lg bg-white/[0.06] text-[#8e98b0] hover:text-white hover:bg-white/[0.12] transition-colors"
                      title={t(
                        "home.demoPronounce",
                        undefined,
                        "Pronounce English word",
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-[#8e98b0] italic font-mono truncate max-w-[200px]">
                      {currentDemoCard.hint}
                    </span>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#161926] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-xs text-[#8e98b0]">
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      RECALL DEFINITION
                    </span>
                    <span className="text-[11px] text-[#545d78] flex items-center gap-1">
                      <kbd className="kbd-pill">Click</kbd> to flip back
                    </span>
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {currentDemoCard.definition}
                    </h3>
                    <p className="text-xs text-[#8e98b0] italic line-clamp-2">
                      &quot;{currentDemoCard.example}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-center pt-2 border-t border-white/[0.08] text-xs text-emerald-400 font-medium gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Recall Verified</span>
                  </div>
                </div>
              </div>

              {/* Demo Controls */}
              <div className="flex items-center justify-between w-full pt-3 px-1 text-xs text-[#8e98b0]">
                <button
                  type="button"
                  onClick={() => setIsDemoFlipped(!isDemoFlipped)}
                  className="hover:text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t("home.demoFlipBtn", undefined, "Flip Card")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextDemo}
                  className="text-[#9cb1ff] hover:text-white font-bold flex items-center gap-1 cursor-pointer font-mono"
                >
                  <span>{t("home.demoNextBtn", undefined, "Next Term")}</span>
                  <span>
                    ({demoIndex + 1}/{demoCards.length}) →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* 2.5 ⭐ FEATURED STUDY SETS (STRICTLY HIDDEN IF NO FEATURED SETS) */}
      {featuredSets.length > 0 && !currentSearch && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {t("home.featuredTitle", undefined, "Featured Study Sets")}
                  </h2>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>
                      {t("home.featuredBadge", undefined, "Featured")}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-[#8e98b0] mt-0.5">
                  {t(
                    "home.featuredDesc",
                    undefined,
                    "High-quality study materials curated by administrators with Featured badge",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSets.map((set) => (
              <Link
                key={set.id}
                to={`/sets/${set.id}`}
                className="bg-[#0f111a] hover:bg-[#161926] border border-amber-500/25 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xs group relative overflow-hidden"
              >
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-amber-300" />
                        Featured
                      </span>
                      <span className="text-xs font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap shrink-0">
                        {set.cardCount || set.cards?.length || 0}{" "}
                        {t("common.terms", undefined, "terms")}
                      </span>
                      {renderLevelBadge(set.level)}
                    </div>
                    <span className="text-[11px] text-[#8e98b0] font-mono whitespace-nowrap shrink-0 flex items-center gap-1 pt-0.5">
                      <Eye className="w-3.5 h-3.5 text-[#545d78]" />
                      <span>
                        {set.viewCount} {t("common.views", undefined, "views")}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {set.title}
                  </h3>

                  {set.description && (
                    <p className="text-xs text-[#8e98b0] line-clamp-2 leading-relaxed">
                      {set.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.08] mt-3 flex items-center justify-between text-xs text-[#8e98b0] gap-2 relative z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        set.creator?.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          set.creator?.username || "user",
                        )}`
                      }
                      alt={set.creator?.name || "Creator"}
                      className="w-5 h-5 rounded-full object-cover bg-[#121420] shrink-0"
                    />
                    <span className="truncate">
                      {t("common.by", undefined, "By")} {set.creator?.name}
                    </span>
                  </div>
                  <span className="font-semibold text-amber-300 group-hover:text-white flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap">
                    {t("common.studyNow", undefined, "Study Now")}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. 🔥 TRENDING & RECOMMENDED STUDY SETS (TOP 3 WEEKLY) */}
      {trendingSets.length > 0 && !currentSearch && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {t(
                      "home.trendingTitle",
                      undefined,
                      "Trending Sets This Week",
                    )}
                  </h2>
                  <span className="text-[11px] font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      {t("home.trendingFeatured", undefined, "Trending")}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-[#8e98b0] mt-0.5">
                  {t(
                    "home.trendingDesc",
                    undefined,
                    "Top 3 study sets with the highest engagement and views this week",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingSets.slice(0, 3).map((set) => (
              <Link
                key={set.id}
                to={`/sets/${set.id}`}
                className="bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-[#4f5fd8]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xs group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-xs font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap shrink-0">
                        {set.cardCount || set.cards?.length || 0}{" "}
                        {t("common.terms", undefined, "terms")}
                      </span>
                      {renderLevelBadge(set.level)}
                    </div>
                    <span className="text-[11px] text-[#8e98b0] font-mono whitespace-nowrap shrink-0 flex items-center gap-1 pt-0.5">
                      <Eye className="w-3.5 h-3.5 text-[#545d78]" />
                      <span>
                        {set.viewCount} {t("common.views", undefined, "views")}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#9cb1ff] transition-colors line-clamp-1">
                    {set.title}
                  </h3>

                  {set.description && (
                    <p className="text-xs text-[#8e98b0] line-clamp-2 leading-relaxed">
                      {set.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.08] mt-3 flex items-center justify-between text-xs text-[#8e98b0] gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        set.creator?.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          set.creator?.username || "user",
                        )}`
                      }
                      alt={set.creator?.name || "Creator"}
                      className="w-5 h-5 rounded-full object-cover bg-[#121420] shrink-0"
                    />
                    <span className="truncate">
                      {t("common.by", undefined, "By")} {set.creator?.name}
                    </span>
                  </div>
                  <span className="font-semibold text-[#9cb1ff] group-hover:text-white flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap">
                    {t("common.studyNow", undefined, "Study Now")}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. SEARCH MODE VS EXPLORE MODE */}
      {isSearchActive ? (
        <div className="space-y-8 pt-2">
          {/* Search Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f111a] border border-white/[0.08] p-5 sm:p-6 rounded-2xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 text-[#9cb1ff] text-xs font-bold">
                <Search className="w-3.5 h-3.5" />
                <span>Tìm kiếm toàn diện</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kết quả tìm kiếm cho &quot;{currentSearch}&quot;
              </h2>
              <p className="text-xs sm:text-sm text-[#8e98b0]">
                Tìm thấy {totalSearchMatches} kết quả phù hợp qua học phần, người dùng, nhóm học tập và thư mục.
              </p>
            </div>

            {/* Clear Search Pill */}
            <button
              onClick={() => {
                setLocalSearch("");
                setSearchParams({});
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1d36] hover:bg-[#232747] border border-[#2e3856] text-xs font-bold text-white transition-all cursor-pointer shrink-0"
            >
              <span>Xóa tìm kiếm</span>
              <X className="w-4 h-4 text-[#8e98b0]" />
            </button>
          </div>

          {/* Search Content */}
          {isSearchLoading ? (
            <Spinner
              size="lg"
              label="Đang tìm kiếm học phần, người dùng, nhóm học tập và thư mục..."
              className="py-20"
            />
          ) : totalSearchMatches === 0 ? (
            <div className="text-center py-16 bg-[#0f111a] rounded-2xl border border-white/[0.08] space-y-4">
              <Search className="w-12 h-12 text-[#545d78] mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Không tìm thấy kết quả nào cho &quot;{currentSearch}&quot;
              </h3>
              <p className="text-sm text-[#8e98b0] max-w-md mx-auto">
                Không tìm thấy học phần, người dùng, nhóm học tập hoặc thư mục nào phù hợp với từ khóa này. Hãy thử kiểm tra lỗi chính tả hoặc tìm với từ khóa khác.
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setLocalSearch("");
                    setSearchParams({});
                  }}
                  className="cursor-pointer"
                >
                  Xóa tìm kiếm & Quay lại trang chủ
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* SECTION A: HỌC PHẦN (STUDY SETS) */}
              {searchSets.length > 0 && (
                <div id="search-section-sets" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#4f5fd8]/15 text-[#9cb1ff] flex items-center justify-center border border-[#4f5fd8]/30">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>Học phần</span>
                          <span className="text-xs font-mono font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 px-2 py-0.5 rounded-full border border-[#4f5fd8]/30">
                            {searchSets.length}
                          </span>
                          {totalSearchSetsPages > 1 && (
                            <span className="text-xs font-medium text-[#8e98b0]">
                              • Trang {searchSetsPage}/{totalSearchSetsPages}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#8e98b0]">
                          Bộ từ vựng và thẻ ghi nhớ phù hợp
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {paginatedSearchSets.map((set) => {
                      const isStarred = set.isStarredByCurrentUser;
                      const isBookmarked = set.isBookmarked;

                      return (
                        <div
                          key={set.id}
                          className="group relative bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-[#4f5fd8]/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap shrink-0">
                                  {set.cardCount || set.cards?.length || 0}{" "}
                                  {t("common.terms", undefined, "terms")}
                                </span>
                                {renderLevelBadge(set.level)}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleBookmark(set.id, e)}
                                  title={
                                    isBookmarked ? "Remove Bookmark" : "Bookmark set"
                                  }
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isBookmarked
                                      ? "bg-[#4f5fd8]/15 text-[#9cb1ff] border-[#4f5fd8]/30"
                                      : "bg-white/[0.04] text-[#8e98b0] hover:text-white border-white/[0.08]"
                                  }`}
                                >
                                  <Bookmark
                                    className={`w-3.5 h-3.5 ${isBookmarked ? "fill-[#9cb1ff]" : ""}`}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (isAuthenticated) {
                                      dispatch(toggleStarSet(set.id));
                                    }
                                  }}
                                  title={isStarred ? "Unstar" : "Star set"}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isStarred
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      : "bg-white/[0.04] text-[#8e98b0] hover:text-amber-300 border-white/[0.08]"
                                  }`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`}
                                  />
                                </button>
                              </div>
                            </div>

                            <Link to={`/sets/${set.id}`} className="block group">
                              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#9cb1ff] transition-colors line-clamp-1">
                                {set.title}
                              </h3>
                              {set.description && (
                                <p className="text-xs text-[#8e98b0] line-clamp-2 mt-1 leading-relaxed">
                                  {set.description}
                                </p>
                              )}
                            </Link>

                            {set.tags && set.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {set.tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="text-[10px] font-medium bg-white/[0.04] text-[#8e98b0] border border-white/[0.06] px-2 py-0.5 rounded"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] mt-4 text-xs">
                            <Link
                              to={
                                user &&
                                (user.id === set.creator.id ||
                                  user.username === set.creator.username)
                                  ? "/profile"
                                  : `/users/${set.creator.id}`
                              }
                              className="flex items-center gap-2 group/creator hover:text-white transition-colors"
                            >
                              <img
                                src={
                                  set.creator.avatarUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                    set.creator.username,
                                  )}`
                                }
                                alt={set.creator.name}
                                className="w-5 h-5 rounded-full object-cover bg-[#121420] group-hover/creator:ring-2 group-hover/creator:ring-[#4f5fd8] transition-all duration-200"
                              />
                              <span className="text-[#8e98b0] group-hover/creator:text-[#9cb1ff] font-medium truncate max-w-[120px]">
                                {set.creator.name}
                              </span>
                            </Link>

                            <Link
                              to={`/sets/${set.id}`}
                              className="font-bold text-[#9cb1ff] group-hover:text-white flex items-center gap-1 hover:translate-x-0.5 transition-all"
                            >
                              <span>{t("common.studyNow", undefined, "Study Now")}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalSearchSetsPages > 1 && (
                    <div className="flex justify-center pt-2">
                      <Pagination
                        currentPage={searchSetsPage}
                        totalPages={totalSearchSetsPages}
                        onPageChange={handleSearchSetsPageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION B: NGƯỜI DÙNG (USERS) */}
              {searchUsers.length > 0 && (
                <div id="search-section-users" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>Người dùng</span>
                          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {searchUsers.length}
                          </span>
                          {totalSearchUsersPages > 1 && (
                            <span className="text-xs font-medium text-[#8e98b0]">
                              • Trang {searchUsersPage}/{totalSearchUsersPages}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#8e98b0]">
                          Người học và thành viên trong cộng đồng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedSearchUsers.map((u) => (
                      <Link
                        key={u.id}
                        to={`/users/${u.id}`}
                        className="bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between gap-3 group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              u.avatarUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                u.username,
                              )}`
                            }
                            alt={u.name}
                            className="w-11 h-11 rounded-full object-cover bg-[#121420] border border-white/[0.1] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white group-hover:text-purple-300 transition-colors truncate text-sm">
                                {u.name}
                              </span>
                              {u.role === "ADMIN" && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8e98b0] truncate">@{u.username}</p>
                            {u.bio && (
                              <p className="text-[11px] text-[#545d78] truncate mt-0.5 max-w-[170px]">
                                {u.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {u.streakCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                              <Flame className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{u.streakCount}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#545d78]">0 streak</span>
                          )}
                          <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Xem <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalSearchUsersPages > 1 && (
                    <div className="flex justify-center pt-2">
                      <Pagination
                        currentPage={searchUsersPage}
                        totalPages={totalSearchUsersPages}
                        onPageChange={handleSearchUsersPageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION C: NHÓM HỌC TẬP (STUDY GROUPS) */}
              {searchClasses.length > 0 && (
                <div id="search-section-classes" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>Nhóm học tập</span>
                          <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {searchClasses.length}
                          </span>
                          {totalSearchClassesPages > 1 && (
                            <span className="text-xs font-medium text-[#8e98b0]">
                              • Trang {searchClassesPage}/{totalSearchClassesPages}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#8e98b0]">
                          Lớp học và nhóm học chung trên hệ thống
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedSearchClasses.map((cls) => (
                      <Link
                        key={cls.id}
                        to={`/classes/${cls.id}`}
                        className="bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group shadow-xs space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                              {cls.memberCount || cls.members?.length || 0} thành viên
                            </span>
                            {cls.schoolName && (
                              <span className="text-[11px] text-[#8e98b0] truncate max-w-[130px]">
                                {cls.schoolName}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {cls.name}
                          </h4>
                          {cls.description && (
                            <p className="text-xs text-[#8e98b0] line-clamp-2 leading-relaxed">
                              {cls.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs text-[#8e98b0]">
                          <span className="font-mono text-[11px]">
                            {cls.setCount || cls.studySetIds?.length || 0} học phần
                          </span>
                          <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
                            Vào nhóm <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalSearchClassesPages > 1 && (
                    <div className="flex justify-center pt-2">
                      <Pagination
                        currentPage={searchClassesPage}
                        totalPages={totalSearchClassesPages}
                        onPageChange={handleSearchClassesPageChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION D: THƯ MỤC (FOLDERS) */}
              {searchFolders.length > 0 && (
                <div id="search-section-folders" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/30">
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>Thư mục</span>
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {searchFolders.length}
                          </span>
                          {totalSearchFoldersPages > 1 && (
                            <span className="text-xs font-medium text-[#8e98b0]">
                              • Trang {searchFoldersPage}/{totalSearchFoldersPages}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#8e98b0]">
                          Thư mục tổng hợp các học phần
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedSearchFolders.map((f) => (
                      <Link
                        key={f.id}
                        to={`/folders/${f.id}`}
                        className="bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group shadow-xs space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                              {f.setCount || f.studySetIds?.length || 0} học phần
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                            {f.title}
                          </h4>
                          {f.description && (
                            <p className="text-xs text-[#8e98b0] line-clamp-2 leading-relaxed">
                              {f.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs text-[#8e98b0]">
                          <span className="truncate max-w-[130px]">
                            bởi {f.creator.name}
                          </span>
                          <span className="font-semibold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                            Xem thư mục <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalSearchFoldersPages > 1 && (
                    <div className="flex justify-center pt-2">
                      <Pagination
                        currentPage={searchFoldersPage}
                        totalPages={totalSearchFoldersPages}
                        onPageChange={handleSearchFoldersPageChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* EXPLORE MODE: Normal Explore Study Sets view */
        <div className="space-y-8">
          {/* 4. SEARCH, LEVEL & TOPIC FILTERS */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {t("home.exploreTitle", undefined, "Explore Study Sets")}
                </h2>
                <p className="text-sm text-[#939bb4]">
                  {t(
                    "home.exploreDesc",
                    undefined,
                    "Browse community curated vocabulary sets & study materials",
                  )}
                </p>
              </div>

              {/* Search bar on mobile / quick search indicator */}
              <div className="w-full sm:w-72 md:hidden">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t(
                      "home.exploreSearchPlaceholder",
                      undefined,
                      "Search study sets...",
                    )}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full bg-[#121420] text-white placeholder-[#545d78] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#4f5fd8]"
                  />
                </div>
              </div>
            </div>

            {/* Level Filters & Topic Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Level Tabs */}
              <div className="flex items-center gap-1 bg-[#121420] p-1 rounded-xl border border-white/[0.08]">
                {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedLevel === lvl
                          ? "bg-[#4f5fd8] text-white shadow-xs"
                          : "text-[#8e98b0] hover:text-white"
                      }`}
                    >
                      {lvl === "ALL"
                        ? t("home.allLevels", undefined, "All Levels")
                        : lvl === "BEGINNER"
                          ? "Beginner"
                          : lvl === "INTERMEDIATE"
                            ? "Intermediate"
                            : "Advanced"}
                    </button>
                  ),
                )}
              </div>

              {/* Topic Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedTag === null
                      ? "bg-[#4f5fd8]/20 text-[#9cb1ff] border border-[#4f5fd8]/40"
                      : "bg-[#121420] text-[#8e98b0] hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {t("home.allTopics", undefined, "All Topics")}
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedTag === tag
                        ? "bg-[#4f5fd8]/20 text-[#9cb1ff] border border-[#4f5fd8]/40"
                        : "bg-[#121420] text-[#8e98b0] hover:text-white border border-white/[0.08]"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. STUDY SETS GRID */}
          {loading ? (
            <Spinner
              size="lg"
              label={t("common.loading", undefined, "Loading...")}
              className="py-20"
            />
          ) : sets.length === 0 ? (
            <div className="text-center py-16 bg-[#0f111a] rounded-2xl border border-white/[0.08] space-y-4">
              <Layers className="w-12 h-12 text-[#545d78] mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {t("home.noSetsFound", undefined, "No study sets found")}
              </h3>
              <p className="text-sm text-[#8e98b0] max-w-sm mx-auto">
                {selectedTag || selectedLevel !== "ALL"
                  ? t(
                      "home.noSetsFoundDesc",
                      undefined,
                      "Try adjusting your search keywords or removing selected topic filters.",
                    )
                  : t(
                      "profile.noSetsDesc",
                      undefined,
                      "Be the first to create an English study set or use our AI Generator!",
                    )}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                {(selectedTag || selectedLevel !== "ALL") && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setSelectedTag(null);
                      setSelectedLevel("ALL");
                    }}
                  >
                    {t("home.clearFiltersBtn", undefined, "Clear All Filters")}
                  </Button>
                )}
                <Link to="/sets/create">
                  <Button variant="primary" size="md">
                    {t("home.heroCreateBtn", undefined, "Create Study Set")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {sets.map((set) => {
                const isStarred = set.isStarredByCurrentUser;
                const isBookmarked = set.isBookmarked;

                return (
                  <div
                    key={set.id}
                    className="group relative bg-[#0f111a] hover:bg-[#161926] border border-white/[0.08] hover:border-[#4f5fd8]/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap shrink-0">
                            {set.cardCount || set.cards?.length || 0}{" "}
                            {t("common.terms", undefined, "terms")}
                          </span>
                          {renderLevelBadge(set.level)}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmark(set.id, e)}
                            title={
                              isBookmarked ? "Remove Bookmark" : "Bookmark set"
                            }
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked
                                ? "bg-[#4f5fd8]/15 text-[#9cb1ff] border-[#4f5fd8]/30"
                                : "bg-white/[0.04] text-[#8e98b0] hover:text-white border-white/[0.08]"
                            }`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isBookmarked ? "fill-[#9cb1ff]" : ""}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isAuthenticated) {
                                dispatch(toggleStarSet(set.id));
                              }
                            }}
                            title={isStarred ? "Unstar" : "Star set"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isStarred
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-white/[0.04] text-[#8e98b0] hover:text-amber-300 border-white/[0.08]"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`}
                            />
                          </button>
                        </div>
                      </div>

                      <Link to={`/sets/${set.id}`} className="block group">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#9cb1ff] transition-colors line-clamp-1">
                          {set.title}
                        </h3>
                        {set.description && (
                          <p className="text-xs text-[#8e98b0] line-clamp-2 mt-1 leading-relaxed">
                            {set.description}
                          </p>
                        )}
                      </Link>

                      {set.tags && set.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {set.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-medium bg-white/[0.04] text-[#8e98b0] border border-white/[0.06] px-2 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] mt-4 text-xs">
                      <Link
                        to={
                          user &&
                          (user.id === set.creator.id ||
                            user.username === set.creator.username)
                            ? "/profile"
                            : `/users/${set.creator.id}`
                        }
                        className="flex items-center gap-2 group/creator hover:text-white transition-colors"
                      >
                        <img
                          src={
                            set.creator.avatarUrl ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                              set.creator.username,
                            )}`
                          }
                          alt={set.creator.name}
                          className="w-5 h-5 rounded-full object-cover bg-[#121420] group-hover/creator:ring-2 group-hover/creator:ring-[#4f5fd8] transition-all duration-200"
                        />
                        <span className="text-[#8e98b0] group-hover/creator:text-[#9cb1ff] font-medium truncate max-w-[120px]">
                          {set.creator.name}
                          {user &&
                            (user.id === set.creator.id ||
                              user.username === set.creator.username) && (
                              <span className="text-[#545d78] ml-1 font-normal">
                                ({t("common.you", undefined, "You")})
                              </span>
                            )}
                        </span>
                      </Link>

                      <Link
                        to={`/sets/${set.id}`}
                        className="font-bold text-[#9cb1ff] group-hover:text-white flex items-center gap-1 hover:translate-x-0.5 transition-all"
                      >
                        <span>{t("common.studyNow", undefined, "Study Now")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && !loading && sets.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </div>
      )}
    </div>
  );
};
