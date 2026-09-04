import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, hint, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[#939bb4] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[#1a1d36] text-[#f6f7fb] placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-2.5 text-sm transition-colors duration-150",
              "focus:outline-none focus:border-[#4257B2] focus:ring-1 focus:ring-[#4257B2]",
              icon && "pl-10",
              rightElement && "pr-10",
              error &&
                "border-red-500/70 focus:border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-[#939bb4] flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-[#939bb4]">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
