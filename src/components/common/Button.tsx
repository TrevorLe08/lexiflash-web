import React, { ButtonHTMLAttributes, useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "gradient"
    | "emerald"
    | "rose"
    | "cyan";
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
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    touchStartTimeRef.current = Date.now();
    setIsPressed(true);
    onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!touchStartTimeRef.current) {
      setIsPressed(false);
      onTouchEnd?.(e);
      return;
    }
    const elapsed = Date.now() - touchStartTimeRef.current;
    touchStartTimeRef.current = 0;
    const remaining = Math.max(0, 75 - elapsed);
    if (remaining > 0) {
      pressTimeoutRef.current = setTimeout(() => {
        setIsPressed(false);
        pressTimeoutRef.current = null;
      }, remaining);
    } else {
      setIsPressed(false);
    }
    onTouchEnd?.(e);
  };

  const handleTouchCancel = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    touchStartTimeRef.current = 0;
    setIsPressed(false);
    onTouchCancel?.(e);
  };

  const baseStyles =
    "inline-flex items-center justify-center font-bold select-none cursor-pointer border touch-manipulation outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] transform-gpu will-change-transform transition-[transform,background-color,border-color,box-shadow,opacity] duration-100 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:translate-y-0 disabled:shadow-none";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs gap-2 rounded-xl min-h-[38px]",
    md: "px-4 py-2.5 text-sm gap-2 rounded-2xl min-h-[42px]",
    lg: "px-6 py-3.5 sm:py-4 text-base font-black uppercase tracking-wider gap-2.5 rounded-2xl min-h-[48px]",
  };

  const variantStyles = {
    primary: isPressed
      ? "bg-[#5457e5] border-[#7c7ef8] text-white shadow-[0_1px_0_0_#3739a8] translate-y-[3px]"
      : "bg-[#6366F1] hover:bg-[#5457e5] border-[#7c7ef8] text-white shadow-[0_4px_0_0_#3739a8] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#3739a8]",

    emerald: isPressed
      ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_1px_0_0_#065f46] translate-y-[3px]"
      : "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_0_0_#065f46] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#065f46]",

    danger: isPressed
      ? "bg-rose-500 border-rose-400 text-white shadow-[0_1px_0_0_#9f1239] translate-y-[3px]"
      : "bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-[0_4px_0_0_#9f1239] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#9f1239]",

    rose: isPressed
      ? "bg-rose-500 border-rose-400 text-white shadow-[0_1px_0_0_#9f1239] translate-y-[3px]"
      : "bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-[0_4px_0_0_#9f1239] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#9f1239]",

    secondary: isPressed
      ? "bg-[#222744] border-[#3b476b] text-[#d9dde8] shadow-[0_1px_0_0_#2b3553] translate-y-[3px]"
      : "bg-[#1a1d36] hover:bg-[#222744] border-[#3b476b] text-[#d9dde8] shadow-[0_4px_0_0_#2b3553] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#2b3553]",

    outline: isPressed
      ? "bg-[#1d223d] border-[#3e4a70] text-white shadow-[0_1px_0_0_#242c44] translate-y-[3px]"
      : "bg-[#16192e] hover:bg-[#1d223d] border-[#3b476b] hover:border-[#4f5fd8] text-[#d9dde8] hover:text-white shadow-[0_4px_0_0_#242c44] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#242c44]",

    ghost:
      "border-transparent bg-transparent hover:bg-white/[0.06] text-[#8e98b0] hover:text-[#f1f3f9] active:scale-[0.98]",

    gradient: isPressed
      ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_1px_0_0_#4338ca] translate-y-[3px]"
      : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5457e5] hover:to-[#7c4def] border-[#8B5CF6] text-white shadow-[0_4px_0_0_#4338ca] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#4338ca]",

    cyan: isPressed
      ? "bg-[#0c2a38] border-cyan-400 text-cyan-200 shadow-[0_1px_0_0_#0891b2] translate-y-[3px]"
      : "bg-[#08202d] hover:bg-[#0c2a38] border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 shadow-[0_4px_0_0_#0891b2] translate-y-0 active:translate-y-[3px] active:shadow-[0_1px_0_0_#0891b2]",
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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
