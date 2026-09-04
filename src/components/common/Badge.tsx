import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "amber" | "purple" | "gray" | "pink";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  className,
  size = "md",
}) => {
  const variantStyles = {
    blue: "bg-[#4f5fd8]/15 text-[#9cb1ff] border border-[#4f5fd8]/30",
    green: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    purple: "bg-purple-500/10 text-purple-300 border border-purple-500/25",
    pink: "bg-pink-500/10 text-pink-300 border border-pink-500/25",
    gray: "bg-white/[0.05] text-[#8e98b0] border border-white/[0.1]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-md",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 shrink-0 whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
};
