import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAppDispatch } from "../../store/store";
import { setUser } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

interface ChangeEmailFormValues {
  newEmail: string;
  password: string;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = React.memo(
  ({ isOpen, onClose, currentEmail }) => {
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<ChangeEmailFormValues>({
      defaultValues: {
        newEmail: "",
        password: "",
      },
    });

    const handleClose = () => {
      reset();
      setFormError(null);
      setShowPassword(false);
      onClose();
    };

    const onSubmit = async (values: ChangeEmailFormValues) => {
      setFormError(null);
      const normalizedNewEmail = values.newEmail.trim().toLowerCase();

      if (normalizedNewEmail === currentEmail.trim().toLowerCase()) {
        setFormError("Email mới phải khác với địa chỉ email hiện tại.");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await authApi.changeEmail({
          newEmail: normalizedNewEmail,
          password: values.password,
        });

        if (res.data) {
          dispatch(setUser(res.data));
        }

        dispatch(
          addToast({
            message: "Đổi địa chỉ email thành công! 📬",
            type: "success",
          }),
        );
        handleClose();
      } catch (err: any) {
        setFormError(
          err.response?.data?.message ||
            err.message ||
            "Đổi email thất bại. Vui lòng kiểm tra lại mật khẩu xác nhận.",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Thay Đổi Địa Chỉ Email"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-[#939bb4] leading-relaxed">
            Nhập địa chỉ email mới mà bạn muốn liên kết với tài khoản. Vui lòng
            xác nhận mật khẩu hiện tại để đảm bảo an toàn thông tin.
          </p>

          {/* Current Email Display */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
              Email hiện tại
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f111a] border border-white/[0.08] text-sm text-[#939bb4]">
              <Mail className="w-4 h-4 text-[#6366F1] shrink-0" />
              <span className="font-mono truncate">{currentEmail}</span>
            </div>
          </div>

          {/* New Email Input */}
          <div className="space-y-1.5">
            <Input
              label="Email mới"
              type="email"
              placeholder="nhap.email.moi@example.com"
              icon={<Mail className="w-4 h-4 text-[#6366F1]" />}
              {...register("newEmail", {
                required: "Vui lòng nhập địa chỉ email mới",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Địa chỉ email không đúng định dạng",
                },
              })}
              error={errors.newEmail?.message}
            />
          </div>

          {/* Password Confirmation */}
          <div className="space-y-1.5">
            <Input
              label="Mật khẩu xác nhận"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại của bạn..."
              icon={<Lock className="w-4 h-4 text-[#6366F1]" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#939bb4] hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
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
              {...register("password", {
                required: "Vui lòng nhập mật khẩu xác nhận danh tính",
              })}
              error={errors.password?.message}
            />
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Xác nhận đổi Email
            </Button>
          </div>
        </form>
      </Modal>
    );
  },
);

ChangeEmailModal.displayName = "ChangeEmailModal";
