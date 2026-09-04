import React from "react";
import logoImg from "../../assets/logo.png";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  showSlogan = false,
  className = "",
}) => {
  const sizeConfig = {
    xs: {
      img: "w-6 h-6",
      text: "text-base",
      slogan: "text-[8px] tracking-[0.14em]",
    },
    sm: {
      img: "w-8 h-8",
      text: "text-lg sm:text-xl",
      slogan: "text-[9px] tracking-[0.16em]",
    },
    md: {
      img: "w-10 h-10",
      text: "text-2xl",
      slogan: "text-[10px] tracking-[0.18em]",
    },
    lg: {
      img: "w-14 h-14",
      text: "text-3xl sm:text-4xl",
      slogan: "text-[11px] tracking-[0.2em]",
    },
    xl: {
      img: "w-20 h-20",
      text: "text-5xl",
      slogan: "text-xs tracking-[0.22em]",
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Brand Icon */}
      <img
        src={logoImg}
        alt="LexiFlash Logo"
        className={`${currentSize.img} object-contain shrink-0 drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)] transition-transform duration-300 group-hover:scale-105`}
      />

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div
            className={`font-black tracking-tight ${currentSize.text} flex items-center`}
          >
            <span className="text-white drop-shadow-xs">Lexi</span>
            <span className="text-[#F59E0B] drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              Flash
            </span>
          </div>

          {showSlogan && (
            <span
              className={`font-extrabold uppercase text-[#7a8ba8] mt-1 font-sans ${currentSize.slogan}`}
            >
              FAST-TRACK YOUR ENGLISH
            </span>
          )}
        </div>
      )}
    </div>
  );
};
