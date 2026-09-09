import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Search,
  X,
  Layers,
  Globe,
  Lock,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Pagination } from "../../components/common/Pagination";
import { StudySet, PrivacyLevel } from "../../types";
import { useTranslation } from "../../i18n";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../utils/cn";

interface StudySetSelectCardProps {
  userSets: StudySet[];
  selectedSetId: string;
  onSelectSet: (setId: string) => void;
  loading?: boolean;
}

export const StudySetSelectCard: React.FC<StudySetSelectCardProps> = ({
  userSets,
  selectedSetId,
  onSelectSet,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // 300ms debounce delay to prevent UI lag while typing
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const SETS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const selectedSet = useMemo(() => {
    return userSets.find((s) => s.id === selectedSetId) || userSets[0];
  }, [userSets, selectedSetId]);

  const filteredSets = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return userSets;
    const lower = debouncedSearchTerm.toLowerCase();
    return userSets.filter(
      (s) =>
        s.title.toLowerCase().includes(lower) ||
        s.description?.toLowerCase().includes(lower) ||
        s.tags?.some((tag) => tag.toLowerCase().includes(lower)),
    );
  }, [userSets, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredSets.length / SETS_PER_PAGE) || 1;

  // Reset to page 1 whenever search query changes or modal opens
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, isModalOpen]);

  // Keep page within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSets = useMemo(() => {
    const start = (currentPage - 1) * SETS_PER_PAGE;
    return filteredSets.slice(start, start + SETS_PER_PAGE);
  }, [filteredSets, currentPage]);

  const renderLevelBadge = (level?: string) => {
    switch (level) {
      case "ADVANCED":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            Advanced
          </span>
        );
      case "BEGINNER":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            Beginner
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            Intermediate
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-[#131722] border border-[#262e48] animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#262e48]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-[#262e48] rounded-md w-1/3" />
          <div className="h-2.5 bg-[#262e48]/70 rounded-md w-1/2" />
        </div>
      </div>
    );
  }

  if (userSets.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
        <p className="text-xs font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Bạn chưa có học phần nào</span>
        </p>
        <p className="text-[11px] text-amber-300/80">
          Hãy chọn "Tạo học phần mới" để AI tạo bộ flashcard mới toanh cho bạn
          nhé!
        </p>
      </div>
    );
  }

  const handleSelectAndClose = (setId: string) => {
    onSelectSet(setId);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative p-3 sm:p-4 rounded-2xl bg-[#131722] hover:bg-[#181d2e] border border-[#262e48] hover:border-[#4f5fd8]/60 transition-all duration-200 cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Glowing Icon Box */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 group-hover:scale-105 group-hover:border-indigo-500/50 transition-all duration-200 shadow-xs">
            <BookOpen className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
          </div>

          {/* Set Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h4 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors">
                {selectedSet?.title || "Chọn học phần nhận từ"}
              </h4>
              {selectedSet?.level && renderLevelBadge(selectedSet.level)}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8e98b0]">
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-300 bg-[#262e48]/70 px-2 py-0.5 rounded-md text-[11px]">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>
                  {typeof selectedSet?.cardCount === "number"
                    ? selectedSet.cardCount
                    : selectedSet?.cards?.length || 0}{" "}
                  thẻ đang có
                </span>
              </span>

              {selectedSet?.privacy === PrivacyLevel.PUBLIC ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                  <Globe className="w-3 h-3" />
                  <span>Công khai</span>
                </span>
              ) : selectedSet?.privacy === PrivacyLevel.PRIVATE ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                  <Lock className="w-3 h-3" />
                  <span>Riêng tư</span>
                </span>
              ) : null}

              {selectedSet?.description && (
                <span className="hidden md:inline-block text-[11px] text-[#8e98b0] truncate max-w-[200px]">
                  • {selectedSet.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change Set Button */}
        <div className="flex items-center justify-end sm:justify-start pt-2 sm:pt-0 border-t border-[#262e48]/60 sm:border-t-0 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-[#8e98b0] group-hover:text-white transition-colors bg-[#1a1f30] hover:bg-[#242b42] border border-[#262e48] group-hover:border-[#4f5fd8]/50 px-3 py-1.5 rounded-xl cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Đổi học phần</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog for Selecting Study Set */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSearchTerm("");
        }}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Chọn học phần nhận từ vựng
              </h3>
              <p className="text-xs text-[#8e98b0]">
                Chọn 1 trong các học phần của bạn để AI thêm các thẻ mới vào
              </p>
            </div>
          </div>
        }
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Search Input Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8e98b0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm học phần theo tên, chủ đề hoặc nhãn..."
              className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-xs sm:text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none transition-colors placeholder:text-[#586380]"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e98b0] hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* List of Study Sets (3 items per page, fits modal perfectly with zero scroll lag) */}
          <div className="space-y-2">
            {filteredSets.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8e98b0] space-y-2">
                <p className="text-sm text-[#d9dde8]">
                  Không tìm thấy học phần nào khớp với "{searchTerm}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-indigo-400 hover:underline font-bold text-xs cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              paginatedSets.map((s) => {
                const isSelected = s.id === (selectedSet?.id || selectedSetId);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectAndClose(s.id)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start sm:items-center justify-between gap-3.5 select-none",
                      isSelected
                        ? "bg-[#1f263d] border-[#4f5fd8] ring-1 ring-[#4f5fd8]/40 shadow-md"
                        : "bg-[#131722] hover:bg-[#181d2e] border-[#262e48] hover:border-[#4f5fd8]/40",
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Radio / Selection Indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors",
                          isSelected
                            ? "bg-[#4f5fd8] border-[#4f5fd8] text-white shadow-xs"
                            : "border-[#262e48] bg-[#131722]",
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4
                          className={cn(
                            "text-sm font-bold leading-snug line-clamp-2 break-words",
                            isSelected
                              ? "text-white"
                              : "text-[#d9dde8] group-hover:text-white",
                          )}
                        >
                          {s.title}
                        </h4>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-[#8e98b0] pt-0.5">
                          {s.level && renderLevelBadge(s.level)}
                          <span className="font-semibold text-indigo-300 shrink-0">
                            {typeof s.cardCount === "number"
                              ? s.cardCount
                              : s.cards?.length || 0}{" "}
                            thẻ đang có
                          </span>
                          {s.privacy === PrivacyLevel.PRIVATE && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400/90 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Riêng tư</span>
                            </span>
                          )}
                          {s.description && (
                            <span className="text-[11px] text-[#8e98b0] line-clamp-1 break-words">
                              • {s.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selected Badge */}
                    <div className="shrink-0 self-center">
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 sm:px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Đang chọn</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#8e98b0] hover:text-white bg-[#1a1f30] hover:bg-[#242b42] border border-[#262e48] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Chọn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-2 flex items-center justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#262e48] flex items-center justify-between">
            <span className="text-xs text-[#8e98b0]">
              {filteredSets.length > 0 ? (
                <>
                  {t("common.page", undefined, "Trang")} {currentPage}/
                  {totalPages} • {t("common.total", undefined, "Tổng cộng")}{" "}
                  {filteredSets.length}{" "}
                  {t("studySet.setsCount", undefined, "học phần")}
                </>
              ) : (
                `Tổng cộng ${userSets.length} học phần của bạn`
              )}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                setSearchTerm("");
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
