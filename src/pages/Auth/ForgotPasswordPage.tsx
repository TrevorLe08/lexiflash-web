import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authApi } from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Logo } from "../../components/common/Logo";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useTranslation } from "../../i18n";

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit: handleFormSubmit, reset } = useForm<{
    email: string;
  }>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: { email: string }) => {
    setError(null);
    setLoading(true);

    try {
      await authApi.forgotPassword(values.email.trim());
      setSubmittedEmail(values.email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in space-y-6">
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size="lg" showSlogan={true} className="justify-center" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {t("auth.forgotPasswordTitle", undefined, "Quên mật khẩu")}
          </h1>
          <p className="text-xs text-[#939bb4]">
            {t(
              "auth.forgotPasswordSubtitle",
              undefined,
              "Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu",
            )}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Kiểm tra hòm thư của bạn
              </h3>
              <p className="text-xs text-[#939bb4] leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                <br />
                <span className="font-semibold text-[#818cf8]">
                  {submittedEmail}
                </span>
              </p>
              <div className="bg-[#0f1225] border border-[#2e3856] rounded-xl p-3.5 text-xs text-[#f59e0b] text-left mt-3">
                ⚠️ <strong>Lưu ý:</strong> Liên kết có hiệu lực trong 15 phút.
                Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra thư mục{" "}
                <strong>Spam (Thư rác)</strong>.
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  reset();
                }}
              >
                Gửi lại email khác
              </Button>

              <Link to="/login" className="block">
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("auth.email", undefined, "Địa chỉ Email")}
              type="email"
              placeholder="nhap.email@example.com"
              {...register("email", { required: true })}
              required
              icon={<Mail className="w-4 h-4" />}
            />

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              icon={<Send className="w-4 h-4" />}
            >
              Gửi liên kết đặt lại mật khẩu
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
