import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Lock, KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { useTranslation } from "../../i18n";
import {
  PasswordStrengthMeter,
  evaluatePassword,
} from "../common/PasswordStrengthMeter";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset } =
    useForm<ChangePasswordFormValues>({
      defaultValues: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    });

  const newPassword = watch("newPassword") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const handleClose = () => {
    reset();
    setFormError(null);
    setShowPassword(false);
    onClose();
  };

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setFormError(null);
    const { oldPassword, newPassword, confirmPassword } = values;

    const { isStrong } = evaluatePassword(newPassword);
    if (!isStrong) {
      setFormError(
        t(
          "auth.passwordWeakError",
          undefined,
          "Mật khẩu mới quá yếu! Vui lòng đáp ứng đầy đủ 5 tiêu chí bảo mật bên dưới.",
        ),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    if (oldPassword === newPassword) {
      setFormError("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      dispatch(
        addToast({ message: "Đổi mật khẩu thành công!", type: "success" }),
      );
      handleClose();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Đổi mật khẩu tài khoản">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="relative">
            <Input
              label="Mật khẩu hiện tại"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại..."
              {...register("oldPassword", { required: true })}
              required
              icon={<Lock className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[33px] text-[#939bb4] hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
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
            icon={<KeyRound className="w-4 h-4" />}
          />

          <PasswordStrengthMeter password={newPassword} className="mt-2.5" />
        </div>

        <div>
          <Input
            label="Xác nhận mật khẩu mới"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới..."
            {...register("confirmPassword", { required: true })}
            required
            icon={<KeyRound className="w-4 h-4" />}
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-red-400 mt-1">
              Mật khẩu xác nhận chưa khớp
            </p>
          )}
        </div>

        {formError && (
          <p className="text-xs text-red-400 font-medium">{formError}</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#2e3856]">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            icon={<Save className="w-4 h-4" />}
          >
            Cập nhật mật khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
