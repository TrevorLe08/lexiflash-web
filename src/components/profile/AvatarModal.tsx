import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Upload, Camera, Check } from "lucide-react";
import { cn } from "../../utils/cn";
import { authApi } from "../../api/authApi";
import { useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { useTranslation } from "../../i18n";
import { UserProfile } from "../../types";
import { AVATAR_PRESETS } from "../../constants/avatarPresets";

interface AvatarGridItemProps {
  url: string;
  isSelected: boolean;
  onSelect: (url: string) => void;
  title: string;
}

// Memoized item to ensure zero-lag scrolling: Only updated item re-renders on selection!
const AvatarGridItem = memo<AvatarGridItemProps>(
  ({ url, isSelected, onSelect, title }) => {
    return (
      <button
        type="button"
        onClick={() => onSelect(url)}
        className={cn(
          "relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95 [content-visibility:auto] [contain-intrinsic-size:64px]",
          isSelected
            ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
            : "border-[#2e3856] bg-[#0a092d]/60 hover:border-indigo-400/60 opacity-90 hover:opacity-100",
        )}
        title={title}
      >
        <img
          src={url}
          alt={title}
          className="w-full h-full object-cover rounded-full pointer-events-none"
          loading="lazy"
          decoding="async"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-indigo-600/30 rounded-full flex items-center justify-center pointer-events-none">
            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md stroke-[2.5]" />
          </div>
        )}
      </button>
    );
  },
);

AvatarGridItem.displayName = "AvatarGridItem";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName?: string;
  userBio?: string;
  onSaveSuccess: (updatedUser: UserProfile) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName,
  userBio,
  onSaveSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl || "");
  const [customUploadedAvatar, setCustomUploadedAvatar] = useState<string>(
    currentAvatarUrl && !currentAvatarUrl.includes("api.dicebear.com")
      ? currentAvatarUrl
      : "",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const initialUrl = currentAvatarUrl || "";
      setSelectedAvatar(initialUrl);
      if (initialUrl && !initialUrl.includes("api.dicebear.com")) {
        setCustomUploadedAvatar(initialUrl);
      }
      setUploadedFile(null);
    }
  }, [isOpen, currentAvatarUrl]);

  const handleSelectAvatar = useCallback((url: string) => {
    setSelectedAvatar(url);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      dispatch(
        addToast({
          message:
            "Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, WebP). Tệp SVG không được hỗ trợ.",
          type: "error",
        }),
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(
        addToast({
          message: "Vui lòng chọn ảnh có dung lượng dưới 5MB",
          type: "error",
        }),
      );
      return;
    }

    // Retain binary file for direct CDN upload
    setUploadedFile(file);

    // Fast canvas downscale for crisp, instant client preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 300;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCustomUploadedAvatar(compressedDataUrl);
          setSelectedAvatar(compressedDataUrl);
          dispatch(
            addToast({
              message: "Đã chọn ảnh! Hãy bấm Lưu thay đổi để tải lên.",
              type: "success",
            }),
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarToSave = selectedAvatar;

      // Direct Signed Upload to Cloudinary CDN if user selected a newly picked local file
      if (uploadedFile && selectedAvatar === customUploadedAvatar) {
        // 1. Fetch authorized upload signature from backend
        const sigResponse = await authApi.getAvatarSignature();
        const {
          signature,
          timestamp,
          folder,
          publicId,
          apiKey,
          cloudName,
          transformation,
          allowedFormats,
        } = sigResponse.data;

        // 2. Build multipart/form-data payload with exact signed parameters
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);
        formData.append("public_id", publicId);
        formData.append("overwrite", "true");
        formData.append("invalidate", "true");
        formData.append("transformation", transformation);
        formData.append("allowed_formats", allowedFormats);

        // 3. Upload directly from browser to Cloudinary CDN (no proxy through app server)
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error?.message ||
              "Không thể tải ảnh đại diện lên máy chủ.",
          );
        }

        avatarToSave = uploadResult.secure_url;
      }

      // 4. Save sanitized URL to user profile in MongoDB Atlas
      const res = await authApi.updateProfile({
        name: userName,
        bio: userBio,
        avatarUrl: avatarToSave,
      });

      dispatch(
        addToast({
          message: "Cập nhật ảnh đại diện thành công!",
          type: "success",
        }),
      );
      onSaveSuccess(res.data);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      dispatch(
        addToast({
          message:
            errorObj.response?.data?.message ||
            errorObj.message ||
            "Cập nhật ảnh đại diện thất bại",
          type: "error",
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSelectedCustom = selectedAvatar === customUploadedAvatar;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Avatar</span>
        </div>
      }
      maxWidth="xl"
      contentClassName="p-4 sm:p-5 overflow-hidden flex flex-col max-h-[85vh]"
    >
      <div className="flex flex-col flex-1 min-h-0 space-y-3.5">
        {/* Hidden File Input for Device Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
          id="avatar-modal-file-upload"
        />

        {/* Single Scrollable Avatar Grid (Hardware accelerated, zero-lag) */}
        <div className="flex-1 min-h-0 max-h-[400px] sm:max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar py-1.5 overscroll-contain [transform:translateZ(0)]">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3.5 place-items-center">
            {/* ITEM 1: Self-uploaded Avatar */}
            <div className="relative flex items-center justify-center [content-visibility:auto] [contain-intrinsic-size:64px]">
              {customUploadedAvatar ? (
                <div className="relative group/custom">
                  <button
                    type="button"
                    onClick={() => handleSelectAvatar(customUploadedAvatar)}
                    className={cn(
                      "relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95 block",
                      isSelectedCustom
                        ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                        : "border-[#2e3856] hover:border-indigo-400/60 opacity-90 hover:opacity-100",
                    )}
                    title="Ảnh tự tải lên từ thiết bị"
                  >
                    <img
                      src={customUploadedAvatar}
                      alt="Custom Upload"
                      className="w-full h-full object-cover rounded-full pointer-events-none"
                    />
                    {isSelectedCustom && (
                      <div className="absolute inset-0 bg-indigo-600/30 rounded-full flex items-center justify-center pointer-events-none">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md stroke-[2.5]" />
                      </div>
                    )}
                  </button>

                  {/* Quick button to replace image */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute -bottom-0.5 -right-0.5 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md ring-2 ring-[#1a1d36] transition-transform hover:scale-110 cursor-pointer"
                    title="Tải ảnh khác từ máy tính/điện thoại"
                  >
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-indigo-400/60 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 flex flex-col items-center justify-center text-indigo-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                  title="Tải ảnh từ máy tính hoặc điện thoại"
                >
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform text-indigo-400" />
                </button>
              )}
            </div>

            {/* ITEMS 2..33: 32 Curated Preset Avatars (8 categories x 4 avatars) */}
            {AVATAR_PRESETS.map((preset) => (
              <AvatarGridItem
                key={preset.url}
                url={preset.url}
                isSelected={selectedAvatar === preset.url}
                onSelect={handleSelectAvatar}
                title={preset.title}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2e3856] shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("common.cancel", undefined, "Hủy")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSaving}
            onClick={handleSave}
          >
            {t("profile.saveChanges", undefined, "Lưu thay đổi")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
