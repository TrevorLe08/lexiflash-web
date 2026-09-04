import React from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

interface StarButtonProps {
  isStarred: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StarButton: React.FC<StarButtonProps> = ({
  isStarred,
  onToggle,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2.5",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e);
      }}
      title={isStarred ? "Unstar term" : "Star term for focused study"}
      className={cn(
        "rounded-full transition-all duration-200 cursor-pointer active:scale-90",
        isStarred
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
          : "bg-[#2e3856]/80 text-[#939bb4] hover:text-amber-300 border border-[#3c476c] hover:border-amber-400/40",
        sizeClasses[size],
        className,
      )}
    >
      <Star
        className={cn(
          iconSizes[size],
          isStarred &&
            "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
        )}
      />
    </button>
  );
};
