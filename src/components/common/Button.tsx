import React, { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a092d] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[34px]",
    md: "px-4 py-2 text-sm gap-2 min-h-[40px] sm:min-h-[38px]",
    lg: "px-5 py-2.5 text-base gap-2.5 font-semibold min-h-[44px]",
  };

  const variantStyles = {
    primary:
      "bg-[#4f5fd8] hover:bg-[#4352c2] text-white border border-[#6978f8]/40 shadow-sm focus:ring-[#4f5fd8] active:scale-[0.98]",
    secondary:
      "bg-[#161926] hover:bg-[#1e2235] text-[#f1f3f9] border border-white/[0.08] hover:border-white/[0.14] focus:ring-[#4f5fd8] active:scale-[0.98]",
    outline:
      "border border-white/[0.12] hover:border-white/[0.24] text-[#d9dde8] hover:text-white bg-transparent focus:ring-[#4f5fd8] active:scale-[0.98]",
    ghost:
      "text-[#8e98b0] hover:text-[#f1f3f9] hover:bg-white/[0.06] bg-transparent focus:ring-[#4f5fd8] active:scale-[0.98]",
    danger:
      "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 focus:ring-red-500 active:scale-[0.98]",
    gradient:
      "bg-[#4f5fd8] hover:bg-[#4352c2] text-white border border-[#6978f8]/40 shadow-sm focus:ring-[#4f5fd8] active:scale-[0.98]",
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
