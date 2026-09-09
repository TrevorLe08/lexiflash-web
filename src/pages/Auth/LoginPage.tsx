import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Logo } from "../../components/common/Logo";
import { LogIn, Eye, EyeOff, AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslation } from "../../i18n";
import { systemApi } from "../../api/systemApi";

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    systemApi
      .getMaintenance()
      .then((res) => {
        if (res.data?.maintenance?.isActive) {
          setIsMaintenanceActive(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await dispatch(
      loginUser({ loginIdentifier: identifier, password }),
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      setError(
        (result.payload as string) ||
          t(
            "auth.invalidCredentials",
            undefined,
            "Invalid credentials. Please try again.",
          ),
      );
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 animate-fade-in space-y-6">
      {/* Card Wrapper */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="lg" showSlogan={true} className="justify-center" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {t("auth.loginTitle", undefined, "Log in to your account")}
          </h1>
          <p className="text-xs text-[#939bb4]">
            {t(
              "auth.loginSubtitle",
              undefined,
              "Continue your fast-track English mastery journey",
            )}
          </p>
        </div>

        {/* Maintenance Warning Banner */}
        {isMaintenanceActive && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hệ thống đang trong chế độ bảo trì</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed">
              Tài khoản học viên thông thường hiện không thể đăng nhập. Nếu bạn
              là Quản trị viên, vui lòng truy cập qua{" "}
              <Link
                to="/admin/login"
                className="text-amber-200 font-bold underline hover:text-white inline-flex items-center gap-1"
              >
                Cổng Đăng nhập Quản trị viên
              </Link>
              .
            </p>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("auth.emailOrUsername", undefined, "Email or Username")}
            placeholder={t(
              "auth.emailOrUsernamePlaceholder",
              undefined,
              "Enter your email or username",
            )}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
                {t("auth.password", undefined, "Password")}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#818cf8] hover:text-[#a5b4fc] hover:underline transition-colors"
              >
                {t("auth.forgotPassword", undefined, "Quên mật khẩu?")}
              </Link>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t(
                "auth.passwordPlaceholder",
                undefined,
                "Enter your password",
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#939bb4] hover:text-white transition-colors cursor-pointer p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4257B2]"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<LogIn className="w-4 h-4" />}
          >
            {t("auth.loginBtn", undefined, "Log in")}
          </Button>
        </form>

        <div className="text-center text-xs text-[#939bb4] pt-2 border-t border-[#2e3856] space-y-2">
          <div>
            {t("auth.noAccount", undefined, "Don't have an account?")}{" "}
            <Link
              to="/register"
              className="text-[#6366F1] font-bold hover:underline"
            >
              {t("auth.signupLink", undefined, "Sign up for free")}
            </Link>
          </div>
          <div className="pt-2 border-t border-[#2e3856]/60">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cổng Đăng nhập Quản trị viên (Admin Portal)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
