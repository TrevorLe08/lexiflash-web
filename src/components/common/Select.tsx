import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#131722] hover:bg-[#242b42] border border-[#262e48] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer min-w-[135px]",
          isOpen && "border-[#4f5fd8] ring-2 ring-[#4f5fd8]/30 bg-[#181d2e]",
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon || icon}
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#939bb4] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-white",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-52 bg-[#1a1f30] border border-[#262e48] rounded-2xl shadow-2xl py-1.5 z-50 animate-scale-up origin-top-left">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-[calc(100%-8px)] mx-1 text-left flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer rounded-xl my-0.5",
                  isSelected
                    ? "bg-[#4f5fd8]/20 text-white font-bold"
                    : "text-[#939bb4] hover:text-white hover:bg-[#242b42]",
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#4f5fd8] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
