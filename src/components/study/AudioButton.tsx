import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import {
  speakText,
  getVoiceAccent,
  toggleVoiceAccent,
  subscribeVoiceAccent,
  VoiceAccent,
} from "../../utils/speech";
import { cn } from "../../utils/cn";

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showAccentToggle?: boolean;
  disabled?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className,
  size = "md",
  showAccentToggle = false,
  disabled = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [accent, setAccent] = useState<VoiceAccent>(getVoiceAccent());

  useEffect(() => {
    return subscribeVoiceAccent(setAccent);
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakText(text, accent);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  const handleToggleAccent = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVoiceAccent();
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2.5",
    lg: "p-3.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handlePlay}
        disabled={disabled}
        title={disabled ? undefined : `Phát âm (${accent === "en-GB" ? "Anh - Anh 🇬🇧" : "Anh - Mỹ 🇺🇸"})`}
        className={cn(
          "rounded-full bg-[#2e3856]/80 text-[#d9dde8] border border-[#3c476c] transition-all duration-200 shadow-sm",
          !disabled && "hover:bg-[#4257B2] hover:text-white hover:border-transparent active:scale-90 cursor-pointer",
          disabled && "opacity-40 pointer-events-none cursor-not-allowed",
          sizeClasses[size],
          isPlaying &&
            "bg-[#4257B2] text-white ring-2 ring-[#4257B2]/50 scale-105",
          className,
        )}
      >
        <Volume2 className={cn(iconSizes[size], isPlaying && "animate-pulse")} />
      </button>

      {showAccentToggle && (
        <button
          type="button"
          onClick={handleToggleAccent}
          disabled={disabled}
          title={disabled ? undefined : `Bấm để đổi giọng đọc (Hiện tại: ${accent === "en-GB" ? "Anh - Anh (UK)" : "Anh - Mỹ (US)"})`}
          className={cn(
            "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-[#8e98b0] border border-white/[0.08] transition-all flex items-center gap-1",
            !disabled && "hover:bg-white/[0.12] hover:text-white cursor-pointer",
            disabled && "opacity-40 pointer-events-none cursor-not-allowed"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>{accent === "en-GB" ? "UK" : "US"}</span>
        </button>
      )}
    </div>
  );
};
