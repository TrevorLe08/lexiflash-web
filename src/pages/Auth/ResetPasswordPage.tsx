import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authApi } from "../../api/authApi";
import { useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Logo } from "../../components/common/Logo";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "../../i18n";
import {
  PasswordStrengthMeter,
  evaluatePassword,
} from "../../components/common/PasswordStrengthMeter";

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // Securely retrieve token and email from URL or persisted session storage
  const [token] = useState(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      sessionStorage.setItem("lexiflash_reset_token", urlToken);
      return urlToken;
    }
    return sessionStorage.getItem("lexiflash_reset_token") || "";
  });

  const [email] = useState(() => {
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      sessionStorage.setItem("lexiflash_reset_email", urlEmail);
      return urlEmail;
    }
    return sessionStorage.getItem("lexiflash_reset_email") || "";
  });

  // Automatically hide token and email from the URL address bar immediately upon mount
  useEffect(() => {
    if (searchParams.get("token") || searchParams.get("email")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // React Hook Form for zero-lag input performance
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
  } = useForm<{
    newPassword: string;
    confirmPassword: string;
  }>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword") || "";
  const confirmPassword = watch("confirmPassword") || "";

  // Validate password rules
  const { isStrong: isPasswordValid } = evaluatePassword(newPassword);
  const isMatched = Boolean(newPassword && newPassword === confirmPassword);

  const onSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setError(null);

    if (!isPasswordValid) {
      setError(
        t(
          "auth.passwordWeakError",
          undefined,
          "Mật khẩu quá yếu! Vui lòng đáp ứng đầy đủ 5 tiêu chí bảo mật bên dưới.",
        ),
      );
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        token,
        email,
        newPassword: values.newPassword,
      });

      // Clear storage after success
      sessionStorage.removeItem("lexiflash_reset_token");
      sessionStorage.removeItem("lexiflash_reset_email");

      setIsSuccess(true);
      dispatch(
        addToast({
          message:
            "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.",
          type: "success",
        }),
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn hoặc không hợp lệ.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Missing token or email state
  if (!token || !email) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fade-in space-y-6">
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Liên kết không hợp lệ
          </h2>
          <p className="text-xs text-[#939bb4] leading-relaxed">
            Đường dẫn đặt lại mật khẩu thiếu thông tin mã xác thực hoặc email.
            Vui lòng yêu cầu liên kết mới.
          </p>
          <div className="pt-2">
            <Link to="/forgot-password">
              <Button variant="primary" size="md" className="w-full">
                Yêu cầu liên kết mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in space-y-6">
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="lg" showSlogan={true} className="justify-center" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {t("auth.resetPasswordTitle", undefined, "Đặt lại mật khẩu mới")}
          </h1>
          <p className="text-xs text-[#939bb4]">
            Tài khoản: <strong className="text-[#818cf8]">{email}</strong>
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Mật khẩu đã được cập nhật!
              </h3>
              <p className="text-xs text-[#939bb4] leading-relaxed">
                Mật khẩu tài khoản của bạn đã được thay đổi thành công. Hãy sử
                dụng mật khẩu mới này để đăng nhập.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <div className="relative">
                <Input
                  label="Mật khẩu mới"
                  type={showPassword ? "text" : "password"}
                  placeholder={t(
                    "auth.passwordCreatePlaceholder",
                    undefined,
                    "Nhập mật khẩu an toàn (8+ ký tự)",
                  )}
                  {...register("newPassword", { required: true })}
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[33px] text-[#939bb4] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter & Live Checklist */}
              <PasswordStrengthMeter
                password={newPassword}
                className="mt-2.5"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Xác nhận mật khẩu mới"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới..."
                {...register("confirmPassword", { required: true })}
                required
                icon={<Lock className="w-4 h-4" />}
              />
              {confirmPassword && !isMatched && (
                <p className="text-[11px] text-red-400 mt-1">
                  Mật khẩu xác nhận chưa khớp
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isPasswordValid || !isMatched}
            >
              Cập nhật mật khẩu
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#939bb4] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại trang Đăng nhập</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
