import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import {
  User,
  Volume2,
  Globe,
  Camera,
  Upload,
  Check,
  Play,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { authApi } from "../../api/authApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setUser } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";
import { useTranslation } from "../../i18n";
import {
  VoiceAccent,
  getVoiceAccent,
  setVoiceAccent,
  getVoiceSpeed,
  setVoiceSpeed,
  getAutoPlayPronunciation,
  setAutoPlayPronunciation,
  speakText,
} from "../../utils/speech";
import { AVATAR_PRESETS } from "../../constants/avatarPresets";
import { ChangePasswordModal } from "../profile/ChangePasswordModal";
import { ChangeEmailModal } from "../profile/ChangeEmailModal";
import { UserProfile } from "../../types";

export type SettingsTab = "profile" | "audio" | "preferences";

interface SpeedOptionItem {
  value: number;
  speed: string;
  label: string;
  desc: string;
  badge: string;
}

const SPEED_OPTIONS: SpeedOptionItem[] = [
  {
    value: 0.75,
    speed: "0.75x",
    label: "Rất chậm",
    desc: "Nghe rõ từng âm tiết, luyện phát âm cho người mới",
    badge: "Mới bắt đầu",
  },
  {
    value: 0.85,
    speed: "0.85x",
    label: "Chậm",
    desc: "Dễ nghe, phân biệt ngữ điệu rõ nét",
    badge: "Dễ nghe",
  },
  {
    value: 1.0,
    speed: "1.0x",
    label: "Tiêu chuẩn",
    desc: "Ngữ điệu tự nhiên, chuẩn bản xứ",
    badge: "Mặc định",
  },
  {
    value: 1.15,
    speed: "1.15x",
    label: "Nhanh",
    desc: "Luyện phản xạ và kỹ năng bắt từ nhanh",
    badge: "Phản xạ",
  },
  {
    value: 1.25,
    speed: "1.25x",
    label: "Rất nhanh",
    desc: "Thử thách nghe nhanh nâng cao",
    badge: "Nâng cao",
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  onProfileUpdated?: (user: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "profile",
  onProfileUpdated,
}) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Profile Edit State
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser?.avatarUrl || "",
  );
  const [customUploadedAvatar, setCustomUploadedAvatar] = useState<string>(
    currentUser?.avatarUrl &&
      !currentUser.avatarUrl.includes("api.dicebear.com")
      ? currentUser.avatarUrl
      : "",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submodals for Security
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Audio / Speech State
  const [voiceAccent, setVoiceAccentState] =
    useState<VoiceAccent>(getVoiceAccent());
  const [voiceSpeed, setVoiceSpeedState] = useState<number>(getVoiceSpeed());
  const [autoPlay, setAutoPlayState] = useState<boolean>(
    getAutoPlayPronunciation(),
  );
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const speedDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for speed dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        speedDropdownRef.current &&
        !speedDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSpeedDropdownOpen(false);
      }
    };
    if (isSpeedDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSpeedDropdownOpen]);

  // Reset & sync data whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(currentUser?.name || "");
      setBio(currentUser?.bio || "");
      const initialAvatar = currentUser?.avatarUrl || "";
      setSelectedAvatar(initialAvatar);
      if (initialAvatar && !initialAvatar.includes("api.dicebear.com")) {
        setCustomUploadedAvatar(initialAvatar);
      }
      setUploadedFile(null);
      setIsAvatarPickerOpen(false);
      setIsSpeedDropdownOpen(false);

      setVoiceAccentState(getVoiceAccent());
      setVoiceSpeedState(getVoiceSpeed());
      setAutoPlayState(getAutoPlayPronunciation());
    }
  }, [isOpen, initialTab, currentUser]);

  // Handle Local File Upload for Avatar
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

    setUploadedFile(file);

    // Fast canvas downscale for instant client preview
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
              message: "Đã chọn ảnh! Hãy bấm Lưu hồ sơ để tải ảnh lên máy chủ.",
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

  // Save Profile (Name, Bio, Avatar)
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      dispatch(
        addToast({
          message: "Tên hiển thị không được để trống",
          type: "error",
        }),
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      let finalAvatarUrl = selectedAvatar;

      // Direct Signed Upload to Cloudinary CDN if user picked a new local file
      if (uploadedFile && selectedAvatar === customUploadedAvatar) {
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

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error?.message ||
              "Không thể tải ảnh đại diện lên máy chủ CDN Cloudinary.",
          );
        }

        finalAvatarUrl = uploadResult.secure_url;
      }

      const res = await authApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl,
      });

      dispatch(setUser(res.data));
      if (onProfileUpdated) {
        onProfileUpdated(res.data);
      }
      dispatch(
        addToast({
          message: "Cập nhật thông tin hồ sơ thành công!",
          type: "success",
        }),
      );
      setUploadedFile(null);
      setIsAvatarPickerOpen(false);
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
            "Cập nhật hồ sơ thất bại",
          type: "error",
        }),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Audio Handlers
  const handleSelectAccent = (accent: VoiceAccent) => {
    setVoiceAccent(accent);
    setVoiceAccentState(accent);
    dispatch(
      addToast({
        message:
          accent === "en-GB"
            ? "Đã chọn giọng Anh - Anh (UK 🇬🇧)"
            : "Đã chọn giọng Anh - Mỹ (US 🇺🇸)",
        type: "info",
      }),
    );
  };

  const handleSelectSpeed = (speed: number) => {
    setVoiceSpeed(speed);
    setVoiceSpeedState(speed);
    dispatch(
      addToast({
        message: `Đã chỉnh tốc độ đọc: ${speed}x`,
        type: "info",
      }),
    );
  };

  const handleToggleAutoPlay = () => {
    const next = !autoPlay;
    setAutoPlayPronunciation(next);
    setAutoPlayState(next);
  };

  const handlePlaySampleAudio = () => {
    setIsPlayingSample(true);
    speakText(
      "Welcome to LexiFlash! Practice English every day to master your vocabulary.",
      voiceAccent,
    );
    setTimeout(() => setIsPlayingSample(false), 2500);
  };

  const isSelectedCustom = selectedAvatar === customUploadedAvatar;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <span>{t("common.settings", undefined, "Cài đặt")}</span>
          </div>
        }
        maxWidth="4xl"
        contentClassName="p-0 overflow-hidden flex flex-col max-h-[92dvh]"
      >
        <div className="flex flex-col md:flex-row h-[78vh] sm:h-[82vh] md:h-[640px] max-h-[82vh] md:max-h-[700px]">
          {/* NAVIGATION TABS: Segmented Bar on Mobile, Vertical Sidebar on Desktop */}
          <div className="w-full md:w-64 lg:w-72 bg-[#121420] border-b md:border-b-0 md:border-r border-[#2e3856] p-2 sm:p-3 md:p-4 shrink-0">
            <div className="grid grid-cols-3 md:flex md:flex-col gap-1 sm:gap-1.5 bg-[#0a092d]/60 md:bg-transparent p-1 md:p-0 rounded-xl md:rounded-none">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center md:justify-start gap-1 sm:gap-2.5 px-2 py-2 sm:py-2.5 md:px-3.5 md:py-3 rounded-lg md:rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center md:text-left select-none",
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  Hồ sơ<span className="hidden md:inline"> & Tài khoản</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audio")}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center md:justify-start gap-1 sm:gap-2.5 px-2 py-2 sm:py-2.5 md:px-3.5 md:py-3 rounded-lg md:rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center md:text-left select-none",
                  activeTab === "audio"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  Giọng đọc<span className="hidden md:inline"> & Âm thanh</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center md:justify-start gap-1 sm:gap-2.5 px-2 py-2 sm:py-2.5 md:px-3.5 md:py-3 rounded-lg md:rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center md:text-left select-none",
                  activeTab === "preferences"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-[#8e98b0] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  Cài đặt<span className="hidden md:inline"> & Giao diện</span>
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT: Active Tab View with smooth touch scrolling */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6 lg:p-8 custom-scrollbar space-y-5 pb-16 sm:pb-8">
            {/* ========================================================= */}
            {/* TAB 1: PROFILE & ACCOUNT                                  */}
            {/* ========================================================= */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Avatar Section */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-400" />
                      <span>Ảnh đại diện</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAvatarPickerOpen((prev) => !prev)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 active:bg-indigo-500/30 transition-colors cursor-pointer"
                    >
                      <span>
                        {isAvatarPickerOpen ? "Thu gọn" : "Chọn avatar mẫu"}
                      </span>
                      {isAvatarPickerOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={
                          selectedAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                            currentUser?.username || "user",
                          )}`
                        }
                        alt="Avatar Preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20 bg-[#0a092d]"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                        title="Tải ảnh từ máy tính / điện thoại"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-white">
                        {name || currentUser?.name}
                      </p>
                      <p className="text-xs text-[#8e98b0]">
                        @{currentUser?.username}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        icon={
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        }
                      >
                        Tải ảnh từ thiết bị
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Expandable Avatar Grid (32 curated presets + Upload tile) */}
                  {isAvatarPickerOpen && (
                    <div className="pt-3 border-t border-[#2e3856]/60 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs text-[#8e98b0] mb-3">
                        Chọn một trong 32 ảnh đại diện phong cách hoặc tải ảnh
                        tự chọn:
                      </p>
                      <div className="max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5 place-items-center">
                          {/* Tile 1: Custom local image */}
                          <div className="relative flex items-center justify-center">
                            {customUploadedAvatar ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAvatar(customUploadedAvatar)
                                }
                                className={cn(
                                  "relative w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95 block",
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
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full border-2 border-dashed border-indigo-400/60 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 flex flex-col items-center justify-center text-indigo-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                title="Tải ảnh từ máy tính hoặc điện thoại"
                              >
                                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                              </button>
                            )}
                          </div>

                          {/* Preset Avatars */}
                          {AVATAR_PRESETS.map((preset, idx) => {
                            const isSelected = selectedAvatar === preset.url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedAvatar(preset.url)}
                                className={cn(
                                  "relative w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95 block bg-[#1a1d36]",
                                  isSelected
                                    ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                                    : "border-[#2e3856] hover:border-indigo-400/60 opacity-85 hover:opacity-100",
                                )}
                                title={preset.title}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover rounded-full pointer-events-none"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-indigo-600/30 rounded-full flex items-center justify-center pointer-events-none">
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md stroke-[2.5]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Basic Info Form */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Thông tin cá nhân</span>
                  </h3>

                  <Input
                    label="Tên hiển thị"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Alex Johnson"
                    required
                  />

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
                      {t(
                        "profile.bioLabel",
                        undefined,
                        "Giới thiệu / Mục tiêu học tập",
                      )}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t(
                        "profile.bioPlaceholder",
                        undefined,
                        "Chia sẻ mục tiêu học tiếng Anh của bạn...",
                      )}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                    />
                    <p className="text-[11px] text-[#586380] text-right">
                      {bio.length}/300 ký tự
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSavingProfile}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Lưu hồ sơ
                    </Button>
                  </div>
                </div>

                {/* 3. Account Security (Email & Password) */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Bảo mật & Đăng nhập</span>
                  </h3>

                  {/* Email Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0a092d] border border-[#2e3856] rounded-xl gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[#8e98b0]">Địa chỉ Email</p>
                        <p className="text-sm font-semibold text-white">
                          {currentUser?.email || "Chưa có email"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEmailModalOpen(true)}
                    >
                      Đổi Email
                    </Button>
                  </div>

                  {/* Password Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0a092d] border border-[#2e3856] rounded-xl gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-[#8e98b0]">
                          Mật khẩu tài khoản
                        </p>
                        <p className="text-sm font-semibold text-white tracking-widest">
                          ••••••••••••
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* TAB 2: AUDIO & SPEECH                                     */}
            {/* ========================================================= */}
            {activeTab === "audio" && (
              <div className="space-y-6">
                {/* Accent Selection */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span>Chất giọng phát âm (Accent)</span>
                  </h3>
                  <p className="text-xs text-[#8e98b0]">
                    Chọn ngữ điệu phát âm mặc định khi học flashcard và làm bài
                    tập.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* US Accent */}
                    <button
                      type="button"
                      onClick={() => handleSelectAccent("en-US")}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer",
                        voiceAccent === "en-US"
                          ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30"
                          : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2]",
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇺🇸</span>
                          <span className="text-sm font-bold text-white">
                            Tiếng Anh - Mỹ (US)
                          </span>
                        </div>
                        <p className="text-xs text-[#8e98b0]">
                          Chất giọng chuẩn phổ biến toàn cầu, ngữ điệu mở.
                        </p>
                      </div>
                      {voiceAccent === "en-US" && (
                        <span className="p-1 rounded-full bg-indigo-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>

                    {/* UK Accent */}
                    <button
                      type="button"
                      onClick={() => handleSelectAccent("en-GB")}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer",
                        voiceAccent === "en-GB"
                          ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30"
                          : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2]",
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇬🇧</span>
                          <span className="text-sm font-bold text-white">
                            Tiếng Anh - Anh (UK)
                          </span>
                        </div>
                        <p className="text-xs text-[#8e98b0]">
                          Chất giọng hoàng gia chuẩn mực, phát âm tròn vành.
                        </p>
                      </div>
                      {voiceAccent === "en-GB" && (
                        <span className="p-1 rounded-full bg-indigo-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Playback Speed Dropdown */}
                {(() => {
                  const currentSpeedOption = SPEED_OPTIONS.reduce(
                    (prev, curr) =>
                      Math.abs(curr.value - voiceSpeed) <
                      Math.abs(prev.value - voiceSpeed)
                        ? curr
                        : prev,
                    SPEED_OPTIONS[2],
                  );
                  return (
                    <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Tốc độ đọc từ vựng</span>
                          </h3>
                          <p className="text-xs text-[#8e98b0] mt-0.5">
                            Điều chỉnh tốc độ phát âm phù hợp với trình độ nghe
                            của bạn.
                          </p>
                        </div>
                        <span className="shrink-0 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                          Tốc độ: {currentSpeedOption.speed}
                        </span>
                      </div>

                      {/* Custom Polished Dropdown */}
                      <div ref={speedDropdownRef} className="relative pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setIsSpeedDropdownOpen((prev) => !prev)
                          }
                          className={cn(
                            "w-full bg-[#0a092d] hover:bg-[#101438] border rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all cursor-pointer shadow-sm",
                            isSpeedDropdownOpen
                              ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-[#101438]"
                              : "border-[#2e3856] hover:border-indigo-400/50",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs">
                              {currentSpeedOption.speed}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white truncate">
                                  {currentSpeedOption.speed} —{" "}
                                  {currentSpeedOption.label}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 shrink-0 border border-indigo-500/30">
                                  {currentSpeedOption.badge}
                                </span>
                              </div>
                              <p className="text-xs text-[#8e98b0] truncate mt-0.5">
                                {currentSpeedOption.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-[#8e98b0] transition-transform duration-200 shrink-0",
                              isSpeedDropdownOpen &&
                                "rotate-180 text-indigo-400",
                            )}
                          />
                        </button>

                        {/* Dropdown Menu Popover */}
                        {isSpeedDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#121420] border border-[#2e3856] rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                            {SPEED_OPTIONS.map((option) => {
                              const isSelected =
                                option.value === currentSpeedOption.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    handleSelectSpeed(option.value);
                                    setIsSpeedDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer",
                                    isSelected
                                      ? "bg-indigo-600/20 border border-indigo-500/40 text-white font-semibold"
                                      : "text-[#8e98b0] hover:text-white hover:bg-white/[0.06]",
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <span
                                      className={cn(
                                        "text-xs font-bold px-2 py-1 rounded-md shrink-0 border",
                                        isSelected
                                          ? "bg-indigo-600 text-white border-indigo-500"
                                          : "bg-[#0a092d] text-[#8e98b0] border-[#2e3856]",
                                      )}
                                    >
                                      {option.speed}
                                    </span>
                                    <div className="truncate">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={cn(
                                            "text-xs sm:text-sm",
                                            isSelected
                                              ? "text-white font-bold"
                                              : "text-[#d1d5db]",
                                          )}
                                        >
                                          {option.label}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#8e98b0]">
                                          {option.badge}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#8e98b0] truncate mt-0.5">
                                        {option.desc}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Audio Sample & AutoPlay */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0a092d] border border-[#2e3856] rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Nghe thử giọng đọc đã cài đặt
                      </p>
                      <p className="text-xs text-[#8e98b0]">
                        Kiểm tra chất giọng (
                        {voiceAccent === "en-GB" ? "UK" : "US"}) với tốc độ vừa
                        chọn.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={isPlayingSample}
                      onClick={handlePlaySampleAudio}
                      icon={<Play className="w-4 h-4 fill-current" />}
                    >
                      Nghe thử phát âm
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#0a092d] border border-[#2e3856] rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Tự động phát âm khi lật thẻ
                      </p>
                      <p className="text-xs text-[#8e98b0]">
                        Tự động đọc to từ vựng tiếng Anh khi xem mặt sau thẻ
                        flashcard.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoPlay}
                      onClick={handleToggleAutoPlay}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#121420]",
                        autoPlay
                          ? "bg-indigo-600 shadow-sm shadow-indigo-600/40"
                          : "bg-[#2e3856]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                          autoPlay ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: PREFERENCES & LANGUAGE                             */}
            {/* ========================================================= */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Ngôn ngữ hiển thị (Interface Language)</span>
                  </h3>
                  <p className="text-xs text-[#8e98b0]">
                    Chọn ngôn ngữ cho toàn bộ thanh điều hướng, nút bấm và thông
                    báo.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Vietnamese */}
                    <button
                      type="button"
                      onClick={() => {
                        changeLanguage("vi");
                        dispatch(
                          addToast({
                            message: "Đã chuyển sang Tiếng Việt",
                            type: "info",
                          }),
                        );
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer",
                        currentLanguage === "vi"
                          ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30"
                          : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2]",
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇻🇳</span>
                          <span className="text-sm font-bold text-white">
                            Tiếng Việt (Mặc định)
                          </span>
                        </div>
                        <p className="text-xs text-[#8e98b0]">
                          Hiển thị toàn bộ giao diện học tập bằng tiếng Việt.
                        </p>
                      </div>
                      {currentLanguage === "vi" && (
                        <span className="p-1 rounded-full bg-indigo-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>

                    {/* English */}
                    <button
                      type="button"
                      onClick={() => {
                        changeLanguage("en");
                        dispatch(
                          addToast({
                            message: "Switched to English",
                            type: "info",
                          }),
                        );
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer",
                        currentLanguage === "en"
                          ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30"
                          : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2]",
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇺🇸</span>
                          <span className="text-sm font-bold text-white">
                            English (US)
                          </span>
                        </div>
                        <p className="text-xs text-[#8e98b0]">
                          Full English interface immersion for advanced
                          practice.
                        </p>
                      </div>
                      {currentLanguage === "en" && (
                        <span className="p-1 rounded-full bg-indigo-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Theme Mode Preview */}
                <div className="bg-[#121420] border border-[#2e3856] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Chủ đề giao diện (Theme)</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-[#0a092d] border border-[#2e3856] flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span>LexiFlash Deep Dark Theme</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          ACTIVE
                        </span>
                      </p>
                      <p className="text-xs text-[#8e98b0]">
                        Chế độ tối chuyên dụng bảo vệ mắt và tập trung cao độ
                        khi ghi nhớ từ vựng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Submodal for Changing Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Submodal for Changing Email */}
      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={currentUser?.email || ""}
      />
    </>
  );
};
