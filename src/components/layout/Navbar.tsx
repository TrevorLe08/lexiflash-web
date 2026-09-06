import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logoutUser } from "../../store/slices/authSlice";
import { toggleSidebar, setSidebarOpen, toggleLanguage } from "../../store/slices/uiSlice";
import { searchApi } from "../../api/searchApi";
import { UnifiedSearchResult, UserRole } from "../../types";
import { useTranslation } from "../../i18n";
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Layers,
  FolderPlus,
  Users,
  LogOut,
  User as UserIcon,
  UserCheck,
  BookOpen,
  ShieldCheck,
  Crown,
  X,
  ArrowRight,
  Folder as FolderIcon,
  ChevronRight,
  Loader2,
  Globe,
  Volume2,
  LogIn,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import { Button } from "../common/Button";
import { Logo } from "../common/Logo";
import { StreakBadge } from "../common/StreakBadge";
import { cn } from "../../utils/cn";
import {
  getVoiceAccent,
  toggleVoiceAccent,
  subscribeVoiceAccent,
  VoiceAccent,
} from "../../utils/speech";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dueReviews = useAppSelector((state) => state.study.dueReviews);
  const language = useAppSelector((state) => state.ui.language);
  const { t } = useTranslation();

  const isVipUser = Boolean(
    user?.isVip ||
    (user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now()),
  );
  const isDiamondUser = isVipUser && user?.vipPlan === "1_YEAR";

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActiveTab, setSearchActiveTab] = useState<
    "ALL" | "SETS" | "USERS" | "FOLDERS" | "CLASSES"
  >("ALL");
  const [searchResults, setSearchResults] =
    useState<UnifiedSearchResult | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [voiceAccent, setVoiceAccent] = useState<VoiceAccent>(getVoiceAccent());

  useEffect(() => {
    return subscribeVoiceAccent(setVoiceAccent);
  }, []);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await searchApi.search(searchQuery.trim(), "all", 4);
        setSearchResults(res.data);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside listener to close search, create and user dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(target)
      ) {
        setCreateDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        guestDropdownRef.current &&
        !guestDropdownRef.current.contains(target)
      ) {
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global hotkey (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setMobileSearchOpen(false);
        setGuestDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setMobileSearchOpen(false);
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    navigate("/");
  };

  const renderRoleBadge = (role?: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          ADMIN
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131722] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile only) & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Hamburger Sidebar toggle button */}
          <button
            onClick={() => {
              setMobileSearchOpen(false);
              dispatch(toggleSidebar());
            }}
            className="p-2 text-[#8e98b0] hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Toggle menu"
            title="Toggle Sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center group">
            <Logo size="sm" showSlogan={false} />
          </Link>
        </div>

        {/* Center: Live Unified Search Bar */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-sm lg:max-w-md xl:max-w-xl hidden md:block"
        >
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#545d78] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t(
                  "nav.searchPlaceholder",
                  undefined,
                  "Search flashcards, topics, users, folders...",
                )}
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-[#121420] text-[#f1f3f9] placeholder-[#545d78] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#4f5fd8] focus:ring-1 focus:ring-[#4f5fd8] transition-colors"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-[#4f5fd8] animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-[#8e98b0] hover:text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          {/* Unified Dropdown Modal */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0f111a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-[60] animate-fade-in max-h-[80vh] flex flex-col">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-2 bg-[#121420] border-b border-white/[0.08] overflow-x-auto">
                {(["ALL", "SETS", "USERS", "FOLDERS", "CLASSES"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setSearchActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        searchActiveTab === tab
                          ? "bg-[#4f5fd8] text-white shadow-xs"
                          : "text-[#8e98b0] hover:text-white"
                      }`}
                    >
                      {tab === "ALL"
                        ? t("nav.searchFilterAll", undefined, "All")
                        : tab === "SETS"
                          ? t("nav.searchFilterSets", undefined, "Sets")
                          : tab === "USERS"
                            ? t("nav.searchFilterUsers", undefined, "Users")
                            : tab === "FOLDERS"
                              ? t(
                                  "nav.searchFilterFolders",
                                  undefined,
                                  "Folders",
                                )
                              : t(
                                  "nav.searchFilterClasses",
                                  undefined,
                                  "Study Groups",
                                )}
                    </button>
                  ),
                )}
              </div>

              {/* Body */}
              <div className="overflow-y-auto divide-y divide-[#2e3856]">
                {searchQuery.trim().length > 0 ? (
                  isSearching ? (
                    <div className="p-8 text-center text-sm text-[#939bb4] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#6366F1]" />
                      <span>
                        {t(
                          "nav.searchSearching",
                          undefined,
                          "Searching the knowledge base...",
                        )}
                      </span>
                    </div>
                  ) : !searchResults ? (
                    <div className="p-8 text-center text-sm text-[#939bb4]">
                      {t(
                        "nav.searchEmptyPrompt",
                        undefined,
                        "Type keywords to find vocabulary sets, groups or users",
                      )}
                    </div>
                  ) : searchResults.totalResults > 0 ? (
                    <div>
                      {/* Sets */}
                      {(searchActiveTab === "ALL" ||
                        searchActiveTab === "SETS") &&
                        searchResults.studySets.length > 0 && (
                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center justify-between px-2 text-[11px] font-extrabold uppercase tracking-wider text-[#6366F1]">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />{" "}
                                {t(
                                  "nav.searchFilterSets",
                                  undefined,
                                  "Study Sets",
                                )}
                              </span>
                              <span>{searchResults.studySets.length}</span>
                            </div>
                            {searchResults.studySets.map((s) => (
                              <Link
                                key={s.id}
                                to={`/sets/${s.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#202545] text-xs transition-colors group"
                              >
                                <div className="min-w-0 pr-2">
                                  <p className="font-bold text-white group-hover:text-[#6366F1] transition-colors truncate">
                                    {s.title}
                                  </p>
                                  <p className="text-[11px] text-[#939bb4] truncate">
                                    {s.cardCount || s.cards?.length || 0}{" "}
                                    {t("common.cards", undefined, "cards")} •{" "}
                                    {s.creator.name}
                                  </p>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#4257B2]/20 text-[#6366F1] border border-[#4257B2]/30 shrink-0">
                                  {s.level}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}

                      {/* Users */}
                      {(searchActiveTab === "ALL" ||
                        searchActiveTab === "USERS") &&
                        searchResults.users.length > 0 && (
                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center justify-between px-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                              <span className="flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5" />{" "}
                                {t(
                                  "nav.searchFilterUsers",
                                  undefined,
                                  "Users & Learners",
                                )}
                              </span>
                              <span>{searchResults.users.length}</span>
                            </div>
                            {searchResults.users.map((u) => {
                              const isSelf =
                                user &&
                                (user.id === u.id ||
                                  user.username === u.username);
                              return (
                                <Link
                                  key={u.id}
                                  to={isSelf ? "/profile" : `/users/${u.id}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#202545] text-xs transition-colors group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={
                                        u.avatarUrl ||
                                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                          u.username,
                                        )}`
                                      }
                                      alt={u.name}
                                      className="w-6 h-6 rounded-full object-cover bg-[#2e3856] group-hover:ring-2 group-hover:ring-[#6366F1]"
                                    />
                                    <div className="truncate">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-white group-hover:text-[#6366F1] truncate">
                                          {u.name}
                                          {isSelf && (
                                            <span className="text-[#939bb4] ml-1 font-normal">
                                              (
                                              {t(
                                                "common.you",
                                                undefined,
                                                "You",
                                              )}
                                              )
                                            </span>
                                          )}
                                        </span>
                                        {renderRoleBadge(u.role)}
                                      </div>
                                      <span className="text-[11px] text-[#939bb4]">
                                        @{u.username}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#586380] group-hover:text-[#6366F1] shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        )}

                      {/* Folders */}
                      {(searchActiveTab === "ALL" ||
                        searchActiveTab === "FOLDERS") &&
                        searchResults.folders.length > 0 && (
                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center justify-between px-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                              <span className="flex items-center gap-1.5">
                                <FolderIcon className="w-3.5 h-3.5" />{" "}
                                {t(
                                  "nav.searchFilterFolders",
                                  undefined,
                                  "Folders",
                                )}
                              </span>
                              <span>{searchResults.folders.length}</span>
                            </div>
                            {searchResults.folders.map((f) => (
                              <Link
                                key={f.id}
                                to={`/folders/${f.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#202545] text-xs transition-colors group"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-white group-hover:text-amber-400 truncate">
                                    {f.title}
                                  </p>
                                  <p className="text-[11px] text-[#939bb4]">
                                    {f.setCount}{" "}
                                    {t(
                                      "nav.searchFilterSets",
                                      undefined,
                                      "study sets",
                                    )}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#586380] group-hover:text-amber-400 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        )}

                      {/* Classes / Groups */}
                      {(searchActiveTab === "ALL" ||
                        searchActiveTab === "CLASSES") &&
                        searchResults.classes.length > 0 && (
                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center justify-between px-2 text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />{" "}
                                {t(
                                  "nav.searchFilterClasses",
                                  undefined,
                                  "Study Groups",
                                )}
                              </span>
                              <span>{searchResults.classes.length}</span>
                            </div>
                            {searchResults.classes.map((c) => (
                              <Link
                                key={c.id}
                                to={`/classes/${c.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#202545] text-xs transition-colors group"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-white group-hover:text-purple-400 truncate">
                                    {c.name}
                                  </p>
                                  <p className="text-[11px] text-[#939bb4]">
                                    {c.memberCount} members • {c.setCount} sets
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#586380] group-hover:text-purple-400 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        )}

                      {/* View All Search Action */}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full p-3 bg-[#0a092d] hover:bg-[#202545] text-xs font-bold text-[#6366F1] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>
                          {t(
                            "nav.viewAllResults",
                            { count: searchResults.totalResults },
                            `View all ${searchResults.totalResults} results for`,
                          )}{" "}
                          &quot;{searchQuery}&quot;
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* No Results Found */
                    <div className="p-6 text-center space-y-2">
                      <p className="text-sm font-bold text-white">
                        {t("nav.searchNoResults", undefined, "No results for")}{" "}
                        &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-xs text-[#939bb4]">
                        {t(
                          "nav.searchTryAgain",
                          undefined,
                          "Try searching for vocabulary topics like IELTS, TOEIC, Phrasal Verbs or author names.",
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#6366F1] hover:underline pt-2 inline-block cursor-pointer"
                      >
                        {t(
                          "nav.searchExploreAction",
                          undefined,
                          "Search on Explore Page →",
                        )}
                      </button>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Search on mobile & User Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile search toggle button */}
          <button
            onClick={() => {
              if (!mobileSearchOpen) {
                dispatch(setSidebarOpen(false));
              }
              setMobileSearchOpen(!mobileSearchOpen);
            }}
            className="md:hidden p-2 text-[#939bb4] hover:text-white rounded-xl hover:bg-[#1a1d36] transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Create Button Dropdown - hidden on small mobile where MobileNav '+' exists */}
          <div ref={createDropdownRef} className="relative hidden sm:block">
            <button
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#4f5fd8] hover:bg-[#4352c2] text-white text-sm font-semibold flex items-center gap-1.5 transition-all border border-[#6978f8]/40 shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t("nav.create", undefined, "Create")}
              </span>
            </button>

            {createDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#0f111a] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] animate-scale-up"
                onClick={() => setCreateDropdownOpen(false)}
              >
                <Link
                  to="/sets/create"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#4f5fd8]" />
                  <span>{t("nav.studySet", undefined, "Study set")}</span>
                </Link>
                <Link
                  to="/ai-generator"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#9cb1ff]" />
                  <div className="flex items-center gap-1.5">
                    <span>
                      {t("nav.aiFlashcards", undefined, "AI Flashcards")}
                    </span>
                    <span className="text-[10px] bg-[#4f5fd8]/20 text-[#9cb1ff] px-1.5 py-0.5 rounded font-bold">
                      AI
                    </span>
                  </div>
                </Link>
                <Link
                  to="/folders"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-emerald-400" />
                  <span>{t("nav.folder", undefined, "Folder")}</span>
                </Link>
                <Link
                  to="/classes"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{t("nav.studyGroup", undefined, "Study Group")}</span>
                </Link>
              </div>
            )}
          </div>

          {/* If authenticated */}
          {isAuthenticated && user ? (
            <>
              {/* Due Reviews Quick Badge - hidden on small mobile where MobileNav has due reviews tab */}
              <Link
                to="/reviews"
                title={t(
                  "nav.dueReviews",
                  undefined,
                  "Due review cards (Spaced Repetition)",
                )}
                className="relative p-2 rounded-xl bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] text-[#8e98b0] hover:text-white hidden sm:flex items-center justify-center transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#4f5fd8]" />
                {dueReviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {dueReviews.length}
                  </span>
                )}
              </Link>

              {/* Streak Badge - hidden on mobile, visible on tablet+ */}
              <Link to="/profile" className="hidden sm:block">
                <StreakBadge
                  streakCount={user.streakCount}
                  isStreakActiveToday={user.isStreakActiveToday}
                  isStreakAtRisk={user.isStreakAtRisk}
                  streakStatus={user.streakStatus}
                  lastStudyDate={user.lastStudyDate}
                />
              </Link>

              {/* VIP Status / Upgrade Quick Button */}
              {user.role !== UserRole.ADMIN &&
                (isVipUser ? (
                  <Link
                    to="/vip"
                    className={cn(
                      "hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs",
                      isDiamondUser
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                        : "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25",
                    )}
                    title={
                      isDiamondUser
                        ? "Thành viên VIP Diamond Elite"
                        : "Thành viên VIP Gold"
                    }
                  >
                    {isDiamondUser ? (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="hidden xl:inline">
                      {isDiamondUser ? "DIAMOND" : "VIP GOLD"}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/vip"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all shadow-xs"
                    title={t("nav.upgradeVip", undefined, "Nâng cấp VIP")}
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline">
                      {t("nav.upgradeVip", undefined, "Nâng cấp VIP")}
                    </span>
                  </Link>
                ))}

              {/* Admin Portal Quick Button */}
              {user.role === UserRole.ADMIN && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-bold transition-all shadow-xs"
                  title={t(
                    "nav.adminDashboard",
                    undefined,
                    "Admin Dashboard & Content Moderation",
                  )}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="hidden xl:inline">
                    {t("nav.admin", undefined, "Admin")}
                  </span>
                </Link>
              )}

              {/* User Avatar Menu - prominent with badge for Admin / Diamond / Gold */}
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="relative flex items-center justify-center p-0.5 rounded-full transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="User account menu"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        user.username,
                      )}`
                    }
                    alt={user.name}
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-[#121420] border transition-all",
                      user.role === UserRole.ADMIN
                        ? "border-purple-400 ring-2 ring-purple-500/40 shadow-sm shadow-purple-500/25"
                        : isDiamondUser
                          ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-sm shadow-cyan-500/25"
                          : isVipUser
                            ? "border-amber-400 ring-2 ring-amber-400/50 shadow-sm shadow-amber-500/25"
                            : "border-white/[0.12] ring-2 ring-white/10 hover:ring-[#4f5fd8]",
                    )}
                  />
                  {/* Avatar Badges for Admin / Diamond / Gold */}
                  {user.role === UserRole.ADMIN ? (
                    <span
                      className="absolute -top-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full ring-2 ring-[#0f111a] shadow-xs"
                      title="Quản trị viên (ADMIN) - Không giới hạn"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </span>
                  ) : isDiamondUser ? (
                    <span
                      className="absolute -top-1 -right-1 bg-cyan-400 text-black p-0.5 rounded-full ring-2 ring-[#0f111a] shadow-xs animate-pulse"
                      title="VIP Diamond Elite"
                    >
                      <Sparkles className="w-2.5 h-2.5 fill-current" />
                    </span>
                  ) : isVipUser ? (
                    <span
                      className="absolute -top-1 -right-1 bg-amber-400 text-black p-0.5 rounded-full ring-2 ring-[#0f111a] shadow-xs"
                      title="VIP Gold Member"
                    >
                      <Crown className="w-2.5 h-2.5 fill-current" />
                    </span>
                  ) : null}
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-[#0f111a] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] animate-scale-up"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white truncate">
                          {user.name}
                        </p>
                        {user.role === UserRole.ADMIN ? (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                          </span>
                        ) : isDiamondUser ? (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> VIP DIAMOND
                          </span>
                        ) : isVipUser ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> VIP GOLD
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#8e98b0] truncate">
                        @{user.username}
                      </p>
                    </div>

                    {user.role === UserRole.ADMIN && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-white/[0.04] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>
                          {t(
                            "nav.adminDashboard",
                            undefined,
                            "Admin Dashboard",
                          )}
                        </span>
                      </Link>
                    )}

                    <Link
                      to="/vip"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-white/[0.04] transition-colors"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>
                        {user.isVip ||
                        (user.vipExpiresAt &&
                          new Date(user.vipExpiresAt).getTime() > Date.now())
                          ? t("nav.yourVip", undefined, "Gói VIP của bạn")
                          : t("nav.upgradeVip", undefined, "Nâng cấp VIP")}
                      </span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#8e98b0]" />
                      <span>
                        {t("nav.profileAndStats", undefined, "Profile & Stats")}
                      </span>
                    </Link>

                    {/* Language Switch inside Dropdown */}
                    <div className="border-t border-white/[0.08] my-1 py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleLanguage());
                        }}
                        className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-[#4f5fd8]" />
                          <span>
                            {language === "vi"
                              ? t("nav.switchToEn", undefined, "English (US)")
                              : t(
                                  "nav.switchToVi",
                                  undefined,
                                  "Tiếng Việt (VN)",
                                )}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-1.5 py-0.5 rounded">
                          {language === "vi" ? "VI" : "EN"}
                        </span>
                      </button>
                    </div>

                    {/* Voice Accent Switch */}
                    <div className="border-t border-white/[0.08] my-1 py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVoiceAccent();
                        }}
                        className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Volume2 className="w-4 h-4 text-[#4f5fd8]" />
                          <span>
                            {voiceAccent === "en-GB"
                              ? t("nav.voiceAccentUk", undefined, "Giọng đọc: Anh - Anh 🇬🇧")
                              : t("nav.voiceAccentUs", undefined, "Giọng đọc: Anh - Mỹ 🇺🇸")}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-1.5 py-0.5 rounded">
                          {voiceAccent === "en-GB" ? "UK" : "US"}
                        </span>
                      </button>
                    </div>
                    <div className="border-t border-white/[0.08] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("nav.logout", undefined, "Log out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Desktop View (sm:flex): Language, Voice Accent, Login, Sign up */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Guest Language Quick Switch */}
                <button
                  type="button"
                  onClick={() => dispatch(toggleLanguage())}
                  className="px-2.5 py-1.5 rounded-xl bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] text-[#8e98b0] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold"
                  title={
                    language === "vi"
                      ? "Switch to English"
                      : "Chuyển sang Tiếng Việt"
                  }
                  aria-label="Toggle Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#4f5fd8]" />
                  <span className="text-[11px] font-extrabold text-[#9cb1ff]">
                    {language === "vi" ? "VI" : "EN"}
                  </span>
                </button>

                {/* Guest Accent Quick Switch */}
                <button
                  type="button"
                  onClick={() => toggleVoiceAccent()}
                  className="px-2.5 py-1.5 rounded-xl bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] text-[#8e98b0] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold"
                  title={
                    voiceAccent === "en-GB"
                      ? t("nav.switchAccentUs", undefined, "Đổi sang giọng Anh - Mỹ 🇺🇸")
                      : t("nav.switchAccentUk", undefined, "Đổi sang giọng Anh - Anh 🇬🇧")
                  }
                  aria-label="Toggle Voice Accent"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#4f5fd8]" />
                  <span className="text-[11px] font-extrabold text-[#9cb1ff]">
                    {voiceAccent === "en-GB" ? "UK" : "US"}
                  </span>
                </button>

                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.login", undefined, "Log in")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    {t("nav.signup", undefined, "Sign up")}
                  </Button>
                </Link>
              </div>

              {/* Mobile View (sm:hidden): Direct visible Login button + Compact Dropdown */}
              <div className="flex sm:hidden items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 rounded-xl bg-[#4f5fd8] hover:bg-[#4352c2] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t("nav.login", undefined, "Đăng nhập")}</span>
                </Link>

                {/* Mobile Guest Dropdown Menu */}
                <div ref={guestDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
                    className="p-1.5 rounded-xl bg-[#121420] hover:bg-[#181c30] border border-white/[0.08] text-[#8e98b0] hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                    aria-label="Guest Menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {guestDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-[#0f111a] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] animate-scale-up"
                      onClick={() => setGuestDropdownOpen(false)}
                    >
                      <Link
                        to="/register"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#9cb1ff] hover:bg-white/[0.04] transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-[#4f5fd8]" />
                        <span>{t("nav.signup", undefined, "Đăng ký tài khoản")}</span>
                      </Link>

                      {/* Language Toggle in Mobile Dropdown */}
                      <div className="border-t border-white/[0.08] my-1 py-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleLanguage());
                          }}
                          className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-[#4f5fd8]" />
                            <span>
                              {language === "vi"
                                ? t("nav.switchToEn", undefined, "English (US)")
                                : t("nav.switchToVi", undefined, "Tiếng Việt (VN)")}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-1.5 py-0.5 rounded">
                            {language === "vi" ? "VI" : "EN"}
                          </span>
                        </button>
                      </div>

                      {/* Voice Accent Toggle in Mobile Dropdown */}
                      <div className="border-t border-white/[0.08] my-1 py-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVoiceAccent();
                          }}
                          className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-[#f1f3f9] hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Volume2 className="w-4 h-4 text-[#4f5fd8]" />
                            <span>
                              {voiceAccent === "en-GB"
                                ? t("nav.voiceAccentUk", undefined, "Giọng đọc: UK 🇬🇧")
                                : t("nav.voiceAccentUs", undefined, "Giọng đọc: US 🇺🇸")}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/30 px-1.5 py-0.5 rounded">
                            {voiceAccent === "en-GB" ? "UK" : "US"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#131722] p-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#545d78] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder={t(
                "nav.searchMobilePlaceholder",
                undefined,
                "Search flashcards, topics, users...",
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121420] text-[#f1f3f9] placeholder-[#545d78] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#4f5fd8]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8e98b0]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
};
