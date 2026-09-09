import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { registerUser } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Logo } from "../../components/common/Logo";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "../../i18n";
import {
  PasswordStrengthMeter,
  evaluatePassword,
} from "../../components/common/PasswordStrengthMeter";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validateRegistrationPayload,
} from "../../utils/authValidation";

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field-level validations
  const nameError = touched.name ? validateFullName(name) : null;
  const usernameError = touched.username ? validateUsername(username) : null;
  const emailError = touched.email ? validateEmail(email) : null;

  // Password Complexity Validations
  const { isStrong: isPasswordStrong } = evaluatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all touched
    setTouched({ name: true, username: true, email: true, password: true });

    // Client-side Validation Guard
    const validation = validateRegistrationPayload({
      name,
      username,
      email,
      password,
    });

    if (!validation.isValid) {
      dispatch(
        addToast({
          message:
            validation.firstError || "Vui lòng kiểm tra lại thông tin đăng ký.",
          type: "error",
        }),
      );
      return;
    }

    if (!isPasswordStrong) {
      dispatch(
        addToast({
          message: t(
            "auth.passwordWeakError",
            undefined,
            "Mật khẩu quá yếu! Vui lòng đáp ứng đầy đủ 5 tiêu chí bảo mật bên dưới.",
          ),
          type: "error",
        }),
      );
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      }),
    );
    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/");
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 animate-fade-in space-y-6">
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="lg" showSlogan={true} className="justify-center" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {t("auth.signupTitle", undefined, "Create a free account")}
          </h1>
          <p className="text-xs text-[#939bb4]">
            {t(
              "auth.signupSubtitle",
              undefined,
              "Join thousands of learners on LexiFlash today",
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("auth.fullName", undefined, "Full Name")}
            placeholder={t(
              "auth.fullNamePlaceholder",
              undefined,
              "e.g. John Doe",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            error={nameError || undefined}
            hint={!nameError ? "Họ và tên tối thiểu 2 ký tự" : undefined}
            required
          />

          <Input
            label={t("auth.username", undefined, "Username")}
            placeholder={t(
              "auth.usernamePlaceholder",
              undefined,
              "e.g. johndoe_ielts",
            )}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
            error={usernameError || undefined}
            hint={
              !usernameError
                ? "Tối thiểu 2 ký tự, chỉ gồm chữ, số và _"
                : undefined
            }
            required
          />

          <Input
            label={t("auth.email", undefined, "Email address")}
            type="email"
            placeholder={t(
              "auth.emailPlaceholder",
              undefined,
              "name@example.com",
            )}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            error={emailError || undefined}
            required
          />

          <div className="space-y-2">
            <Input
              label={t("auth.password", undefined, "Password")}
              type={showPassword ? "text" : "password"}
              placeholder={t(
                "auth.passwordCreatePlaceholder",
                undefined,
                "Enter strong password (8+ chars)",
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

            {/* Password Strength Meter & Live Checklist */}
            <PasswordStrengthMeter password={password} />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {t("auth.signupBtn", undefined, "Sign up")}
          </Button>
        </form>

        <div className="text-center text-xs text-[#939bb4] pt-2 border-t border-[#2e3856]">
          {t("auth.hasAccount", undefined, "Already have an account?")}{" "}
          <Link
            to="/login"
            className="text-[#6366F1] font-bold hover:underline"
          >
            {t("auth.loginLink", undefined, "Log in")}
          </Link>
        </div>
      </div>
    </div>
  );
};
