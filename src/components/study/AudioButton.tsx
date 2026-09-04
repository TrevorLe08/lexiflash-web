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
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className,
  size = "md",
  showAccentToggle = false,
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
        title={`Phát âm (${accent === "en-GB" ? "Anh - Anh 🇬🇧" : "Anh - Mỹ 🇺🇸"})`}
        className={cn(
          "rounded-full bg-[#2e3856]/80 hover:bg-[#4257B2] text-[#d9dde8] hover:text-white border border-[#3c476c] hover:border-transparent transition-all duration-200 active:scale-90 cursor-pointer shadow-sm",
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
          title="Bấm để đổi giữa giọng Anh - Mỹ 🇺🇸 và Anh - Anh 🇬🇧"
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-[#8e98b0] hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
        >
          {accent === "en-GB" ? "🇬🇧 UK" : "🇺🇸 US"}
        </button>
      )}
    </div>
  );
};
