import React from "react";
import { Card } from "../../types";
import { AudioButton } from "./AudioButton";
import { StarButton } from "./StarButton";
import { RotateCw, Sparkles, Lightbulb } from "lucide-react";
import { cn } from "../../utils/cn";

interface FlipCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  isStarred?: boolean;
  onToggleStar?: () => void;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  card,
  isFlipped,
  onFlip,
  isStarred = false,
  onToggleStar,
  className,
}) => {
  return (
    <div
      onClick={onFlip}
      className={cn(
        "group relative w-full h-[360px] sm:h-[400px] md:h-[440px] perspective-1000 cursor-pointer select-none",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full h-full duration-500 transform-style-3d transition-transform ease-out shadow-2xl rounded-3xl",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* FRONT SIDE (Term & English) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0f111a] border border-white/[0.12] group-hover:border-[#4f5fd8]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-xl">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#8e98b0] uppercase bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/[0.08]">
                Term
              </span>
              {card.hint && (
                <span className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  <Lightbulb className="w-3.5 h-3.5" /> Hint
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AudioButton text={card.term} size="sm" showAccentToggle={true} />
              {onToggleStar && (
                <StarButton
                  isStarred={isStarred}
                  onToggle={onToggleStar}
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {card.term}
            </h2>
            {card.phonetic && (
              <span className="text-base sm:text-lg md:text-xl font-mono text-[#9cb1ff] tracking-wide">
                {card.phonetic}
              </span>
            )}
          </div>

          {/* Bottom Flip Cue */}
          <div className="flex items-center justify-between text-xs text-[#545d78] border-t border-white/[0.08] pt-4">
            <span className="flex items-center gap-1.5 text-[#8e98b0]">
              <Sparkles className="w-3.5 h-3.5 text-[#4f5fd8]" /> Click or press{" "}
              <kbd className="kbd-pill">Space</kbd> to flip
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <RotateCw className="w-3.5 h-3.5" /> Meaning
            </span>
          </div>
        </div>

        {/* BACK SIDE (Definition & Vietnamese) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#121420] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Definition
            </span>

            <div className="flex items-center gap-2">
              <AudioButton text={card.term} size="sm" showAccentToggle={true} />
              {onToggleStar && (
                <StarButton
                  isStarred={isStarred}
                  onToggle={onToggleStar}
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Center Meaning & Example */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto max-h-[220px]">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-relaxed">
              {card.definition}
            </p>

            {card.example && (
              <div className="w-full bg-[#0f111a] border border-white/[0.08] rounded-xl p-3.5 mt-2 text-left">
                <span className="text-[10px] font-mono font-bold text-[#9cb1ff] uppercase tracking-wider block mb-1">
                  Example:
                </span>
                <p className="text-xs sm:text-sm text-[#e2e8f0] italic">
                  &quot;{card.example}&quot;
                </p>
              </div>
            )}

            {card.hint && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 mt-2.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tip: {card.hint}</span>
              </div>
            )}
          </div>

          {/* Bottom Flip Cue */}
          <div className="flex items-center justify-between text-xs text-[#545d78] border-t border-white/[0.08] pt-4">
            <span className="text-[#8e98b0]">
              Term:{" "}
              <strong className="text-white ml-1 font-mono">{card.term}</strong>
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <RotateCw className="w-3.5 h-3.5" /> Flip back
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
