/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { useTranslation } from "../../i18n";

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passedChecksCount: number;
  isStrong: boolean;
}

export const evaluatePassword = (
  password: string,
): PasswordValidationResult => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const passedChecksCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passedChecksCount,
    isStrong: passedChecksCount === 5,
  };
};

interface PasswordStrengthMeterProps {
  password: string;
  showChecklist?: boolean;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showChecklist = true,
  className = "",
}) => {
  const { t } = useTranslation();

  if (!password) return null;

  const {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passedChecksCount,
  } = evaluatePassword(password);

  return (
    <div
      className={`bg-[#0a092d] p-3.5 rounded-2xl border border-[#2e3856] space-y-2.5 animate-fade-in text-xs ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#939bb4] font-medium flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          {t("auth.passStrength", undefined, "Độ mạnh mật khẩu:")}
        </span>
        <span
          className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
            passedChecksCount === 5
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : passedChecksCount >= 3
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {passedChecksCount === 5
            ? t("auth.passVeryStrong", undefined, "Rất mạnh")
            : passedChecksCount >= 3
              ? t("auth.passMedium", undefined, "Trung bình")
              : t("auth.passWeak", undefined, "Quá yếu")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#1a1d36] h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            passedChecksCount === 5
              ? "bg-emerald-400 w-full"
              : passedChecksCount >= 3
                ? "bg-amber-400 w-3/5"
                : "bg-red-500 w-1/5"
          }`}
        />
      </div>

      {/* Checklist Requirements */}
      {showChecklist && (
        <div className="grid grid-cols-1 gap-1 text-[11px] pt-1">
          <div
            className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-semibold" : "text-[#586380]"}`}
          >
            {hasMinLength ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {t("auth.passMinLength", undefined, "Tối thiểu 8 ký tự")}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-semibold" : "text-[#586380]"}`}
          >
            {hasUppercase ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {t(
                "auth.passUppercase",
                undefined,
                "Ít nhất 1 chữ cái in hoa (A-Z)",
              )}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400 font-semibold" : "text-[#586380]"}`}
          >
            {hasLowercase ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {t(
                "auth.passLowercase",
                undefined,
                "Ít nhất 1 chữ cái thường (a-z)",
              )}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-semibold" : "text-[#586380]"}`}
          >
            {hasNumber ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {t("auth.passNumber", undefined, "Ít nhất 1 chữ số (0-9)")}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-emerald-400 font-semibold" : "text-[#586380]"}`}
          >
            {hasSpecialChar ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {t(
                "auth.passSpecial",
                undefined,
                "Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)",
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
