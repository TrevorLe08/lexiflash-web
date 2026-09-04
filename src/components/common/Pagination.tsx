import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  className?: string;
}

type PageItem =
  | { type: "page"; page: number }
  | { type: "dots"; position: "left" | "right" };

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  // Active input state: which ellipsis is currently replaced by the jump input box
  const [activeInput, setActiveInput] = useState<"left" | "right" | null>(null);
  const [jumpValue, setJumpValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the jump input by 600ms for smooth, lag-free auto-commit if Enter isn't pressed
  const debouncedJump = useDebounce(jumpValue, 600);

  // Auto-focus input when activated
  useEffect(() => {
    if (activeInput) {
      inputRef.current?.focus();
    }
  }, [activeInput]);

  const commitJump = (val: string) => {
    setActiveInput(null);
    const trimmed = val.trim();
    setJumpValue("");
    if (trimmed) {
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(1, Math.min(totalPages, parsed));
        if (clamped !== currentPage) {
          onPageChange(clamped);
        }
      }
    }
  };

  // When debounced value updates while input is still open, auto-commit
  useEffect(() => {
    if (activeInput && debouncedJump.trim()) {
      commitJump(debouncedJump);
    }
  }, [debouncedJump]);

  const handleStartJump = (pos: "left" | "right") => {
    setActiveInput(pos);
    setJumpValue("");
  };

  // Generate pagination items matching user requirements:
  // - Always page 1 and page totalPages
  // - Only 2 boxes beside the active page (1 on left, 1 on right in the middle: e.g. 1 ... 11 [12] 13 ... 23)
  // - Dots '...' when gap is larger than 1
  const getPaginationItems = (): PageItem[] => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => ({
        type: "page",
        page: i + 1,
      }));
    }

    const items: PageItem[] = [];

    // Always include page 1
    items.push({ type: "page", page: 1 });

    let start: number;
    let end: number;

    if (currentPage === 1) {
      // 2 boxes to the right: 2, 3 (matches [1] 2 3 ... totalPages)
      start = 2;
      end = Math.min(3, totalPages - 1);
    } else if (currentPage === totalPages) {
      // 2 boxes to the left: totalPages - 2, totalPages - 1 (matches 1 ... 21 22 [23])
      start = Math.max(2, totalPages - 2);
      end = totalPages - 1;
    } else {
      // Middle pages: exactly 1 box on left, 1 box on right (matches 1 ... 11 [12] 13 ... 23)
      start = Math.max(2, currentPage - 1);
      end = Math.min(totalPages - 1, currentPage + 1);
    }

    // Left dots
    if (start > 2) {
      items.push({ type: "dots", position: "left" });
    }

    // Middle pages
    for (let p = start; p <= end; p++) {
      items.push({ type: "page", page: p });
    }

    // Right dots
    if (end < totalPages - 1) {
      items.push({ type: "dots", position: "right" });
    }

    // Always include last page
    items.push({ type: "page", page: totalPages });

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <div
      className={`flex items-center justify-center gap-1.5 select-none ${className}`}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Trang trước"
        title="Trang trước"
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
      </button>

      {/* Page items */}
      {paginationItems.map((item, index) => {
        if (item.type === "page") {
          const isActive = item.page === currentPage;
          return (
            <button
              key={`page-${item.page}`}
              type="button"
              onClick={() => onPageChange(item.page)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#4f5fd8] hover:bg-[#4352c2] text-white border border-[#6978f8]/50 shadow-sm shadow-[#4f5fd8]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.page}
            </button>
          );
        }

        // Ellipsis item: either render input box or clickable "..."
        const isEditing = activeInput === item.position;

        if (isEditing) {
          return (
            <div key={`input-${item.position}`} className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={jumpValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setJumpValue(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitJump(jumpValue);
                  } else if (e.key === "Escape") {
                    setActiveInput(null);
                    setJumpValue("");
                  }
                }}
                onBlur={() => {
                  if (jumpValue.trim()) {
                    commitJump(jumpValue);
                  } else {
                    setActiveInput(null);
                  }
                }}
                className="w-12 h-8 text-center bg-[#181a2e] text-white font-bold text-sm rounded-xl border-2 border-[#6978f8] focus:border-white focus:ring-2 focus:ring-[#4f5fd8]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm shadow-[#4f5fd8]/20"
                placeholder="..."
                autoFocus
                title={`Nhập trang từ 1 đến ${totalPages} rồi Enter`}
                aria-label={`Nhập số trang từ 1 đến ${totalPages}`}
              />
            </div>
          );
        }

        return (
          <button
            key={`dots-${item.position}-${index}`}
            type="button"
            onClick={() => handleStartJump(item.position)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold tracking-wider text-sm hover:bg-white/10 transition-colors cursor-pointer select-none"
            title="Nhấn để nhập số trang"
            aria-label="Nhấn để nhập số trang"
          >
            ...
          </button>
        );
      })}

      {/* Next button */}
      <button
        type="button"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Trang sau"
        title="Trang sau"
      >
        <ArrowRight size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
};
