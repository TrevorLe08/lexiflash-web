import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      error,
      disabled = false,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="space-y-1 text-left">
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex items-start gap-3 cursor-pointer select-none group",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className,
          )}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200",
                checked
                  ? "bg-gradient-to-br from-[#4f5fd8] to-[#6366F1] border-[#6366F1] text-white shadow-xs shadow-indigo-500/30"
                  : "bg-[#0f111a] border-[#2e3856] text-transparent hover:border-[#4f5fd8]/50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4f5fd8]",
                error && "border-rose-500/70",
              )}
            >
              <Check
                className={cn(
                  "w-3.5 h-3.5 stroke-[3] transition-transform duration-150",
                  checked ? "scale-100" : "scale-0",
                )}
              />
            </div>
          </div>

          {(label || description) && (
            <div className="text-left space-y-0.5">
              {label && (
                <span className="text-xs font-semibold text-[#d9dde8] group-hover:text-white transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <p className="text-[11px] text-[#8e98b0] leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}
        </label>
        {error && (
          <p className="text-xs text-rose-400 font-medium pl-8">{error}</p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
