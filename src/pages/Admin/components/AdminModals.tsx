import React, { useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { UserRole } from "../../../types";
import { ShieldCheck, Crown, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

// ==========================================
// Custom Tags Modal
// ==========================================
export interface AdminCustomTagsModalProps {
  isOpen: boolean;
  selectedSet: any | null;
  onClose: () => void;
  onSave: (tags: string[]) => Promise<void>;
  isSaving: boolean;
}

export const AdminCustomTagsModal: React.FC<AdminCustomTagsModalProps> = React.memo(
  ({ isOpen, selectedSet, onClose, onSave, isSaving }) => {
    const { register, handleSubmit, reset } = useForm<{ tags: string }>({
      defaultValues: { tags: "" },
    });

    useEffect(() => {
      if (isOpen && selectedSet) {
        reset({ tags: (selectedSet.tags || []).join(", ") });
      } else {
        reset({ tags: "" });
      }
    }, [isOpen, selectedSet, reset]);

    if (!selectedSet) return null;

    const onSubmit = (data: { tags: string }) => {
      const tagsArray = (data.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      onSave(tagsArray);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Custom Tags">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-[#d9dde8]">
            Manage tags for{" "}
            <strong className="text-white font-bold">
              "{selectedSet.title}"
            </strong>
            . These tags enhance search indexing and content discovery for learners.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#939bb4]">
              Tags (comma separated)
            </label>
            <input
              type="text"
              {...register("tags")}
              placeholder="ielts, toeic, technology, beginner..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a092d] border border-[#2e3856] text-white text-sm focus:outline-none focus:border-[#4257b2] transition-colors"
              autoFocus
            />
            <p className="text-xs text-[#939bb4]">
              Separate multiple tags with a comma (e.g. <code>ielts, academic, band-7</code>)
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Tags"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  },
);

// ==========================================
// Combined Admin Modals Component
// ==========================================
export interface AdminModalsProps {
  // User Role Modal
  actionUser: any | null;
  userRoleModalOpen: boolean;
  onCloseRoleModal: () => void;
  onConfirmRoleChange: () => void;

  // VIP Subscription Modal
  userVipModalOpen: boolean;
  vipPlanToAssign: "1_MONTH" | "1_YEAR" | "CANCEL";
  onChangeVipPlan: (plan: "1_MONTH" | "1_YEAR" | "CANCEL") => void;
  onCloseVipModal: () => void;
  onConfirmVipChange: () => void;

  // Ban Toggle Modal
  userBanModalOpen: boolean;
  onCloseBanModal: () => void;
  onConfirmBanToggle: () => void;

  // Delete Set Modal
  setToDelete: any | null;
  deleteSetModalOpen: boolean;
  onCloseDeleteSetModal: () => void;
  onConfirmDeleteSet: () => void;

  // Delete Folder Modal
  folderToDelete: any | null;
  deleteFolderModalOpen: boolean;
  onCloseDeleteFolderModal: () => void;
  onConfirmDeleteFolder: () => void;

  // Custom Tags Modal
  tagModalOpen: boolean;
  selectedSetForTags: any | null;
  onCloseTagModal: () => void;
  onSaveCustomTags: (tags: string[]) => Promise<void>;
  savingTags: boolean;

  // Global processing state
  isProcessing: boolean;
}

export const AdminModals: React.FC<AdminModalsProps> = React.memo(
  ({
    actionUser,
    userRoleModalOpen,
    onCloseRoleModal,
    onConfirmRoleChange,
    userVipModalOpen,
    vipPlanToAssign,
    onChangeVipPlan,
    onCloseVipModal,
    onConfirmVipChange,
    userBanModalOpen,
    onCloseBanModal,
    onConfirmBanToggle,
    setToDelete,
    deleteSetModalOpen,
    onCloseDeleteSetModal,
    onConfirmDeleteSet,
    folderToDelete,
    deleteFolderModalOpen,
    onCloseDeleteFolderModal,
    onConfirmDeleteFolder,
    tagModalOpen,
    selectedSetForTags,
    onCloseTagModal,
    onSaveCustomTags,
    savingTags,
    isProcessing,
  }) => {
    return (
      <>
        {/* --- ROLE CHANGE MODAL --- */}
        {actionUser && (
          <Modal
            isOpen={userRoleModalOpen}
            onClose={onCloseRoleModal}
            title="Change User Role"
          >
            <div className="space-y-4">
              <p className="text-sm text-[#d9dde8]">
                Are you sure you want to change the role of{" "}
                <strong className="text-white">{actionUser.name}</strong> (@
                {actionUser.username}) to{" "}
                <strong className="text-[#6366F1]">
                  {actionUser.role === UserRole.ADMIN
                    ? UserRole.USER
                    : UserRole.ADMIN}
                </strong>
                ?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onCloseRoleModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onConfirmRoleChange}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Updating..." : "Confirm Role Change"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* --- USER VIP SUBSCRIPTION MODAL --- */}
        {actionUser && (
          <Modal
            isOpen={userVipModalOpen}
            onClose={onCloseVipModal}
            title="Quản lý gói VIP thành viên"
          >
            <div className="space-y-5">
              {/* User Info Header */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0a092d] border border-[#2e3856]">
                <img
                  src={
                    actionUser.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      actionUser.username,
                    )}`
                  }
                  alt={actionUser.name}
                  className="w-10 h-10 rounded-full object-cover bg-[#2e3856] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">
                    {actionUser.name}
                  </p>
                  <p className="text-xs text-[#939bb4] truncate">
                    @{actionUser.username} • {actionUser.email}
                  </p>
                </div>
                <div>
                  {actionUser.isVip ||
                  (actionUser.vipExpiresAt &&
                    new Date(actionUser.vipExpiresAt).getTime() > Date.now()) ? (
                    actionUser.vipPlan === "1_YEAR" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>VIP Diamond</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>VIP Gold</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] font-semibold text-[#939bb4] bg-[#1a1d36] px-2 py-0.5 rounded border border-[#2e3856]">
                      Gói Miễn Phí
                    </span>
                  )}
                </div>
              </div>

              {/* Current Expiration Note if applicable */}
              {actionUser.vipExpiresAt && (
                <div className="text-xs text-[#939bb4] bg-[#1a1d36] p-3 rounded-xl border border-[#2e3856] flex items-center justify-between">
                  <span>Hạn dùng hiện tại:</span>
                  <strong className="text-white font-mono">
                    {new Date(actionUser.vipExpiresAt).toLocaleString("vi-VN")}
                  </strong>
                </div>
              )}

              {/* Plan Choice Radios */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#939bb4]">
                  Chọn tác vụ gói VIP:
                </label>

                {/* 1 Month - VIP GOLD */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    vipPlanToAssign === "1_MONTH"
                      ? "bg-amber-500/15 border-amber-400 text-white ring-2 ring-amber-500/20"
                      : "bg-[#0a092d] border-[#2e3856] text-[#d9dde8] hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vipPlan"
                      value="1_MONTH"
                      checked={vipPlanToAssign === "1_MONTH"}
                      onChange={() => onChangeVipPlan("1_MONTH")}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Cấp Gói VIP Gold (1 Tháng)</span>
                      </p>
                      <p className="text-[11px] text-[#939bb4]">
                        20 lượt AI/ngày, không giới hạn thẻ học, huy hiệu Gold 👑 (+30 ngày).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    +30 Ngày
                  </span>
                </label>

                {/* 1 Year - VIP DIAMOND ELITE */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    vipPlanToAssign === "1_YEAR"
                      ? "bg-cyan-500/15 border-cyan-400 text-white ring-2 ring-cyan-500/20"
                      : "bg-[#0a092d] border-[#2e3856] text-[#d9dde8] hover:border-cyan-400/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vipPlan"
                      value="1_YEAR"
                      checked={vipPlanToAssign === "1_YEAR"}
                      onChange={() => onChangeVipPlan("1_YEAR")}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Cấp Gói VIP Diamond Elite (1 Năm)</span>
                      </p>
                      <p className="text-[11px] text-[#939bb4]">
                        40 lượt AI/ngày (gấp đôi), Early Access Beta, huy hiệu Diamond 💎 (+365 ngày).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300">
                    +365 Ngày
                  </span>
                </label>

                {/* Cancel VIP */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    vipPlanToAssign === "CANCEL"
                      ? "bg-rose-500/15 border-rose-400 text-white ring-2 ring-rose-500/20"
                      : "bg-[#0a092d] border-[#2e3856] text-[#d9dde8] hover:border-rose-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vipPlan"
                      value="CANCEL"
                      checked={vipPlanToAssign === "CANCEL"}
                      onChange={() => onChangeVipPlan("CANCEL")}
                      className="accent-rose-400 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-bold text-rose-400">
                        Hủy gói VIP (Chuyển về Miễn phí)
                      </p>
                      <p className="text-[11px] text-[#939bb4]">
                        Thu hồi quyền tạo trên 300 thẻ và tắt quyền sử dụng AI ngay lập tức.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400">Hủy VIP</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#2e3856]">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onCloseVipModal}
                >
                  Đóng
                </Button>
                <Button
                  variant={vipPlanToAssign === "CANCEL" ? "danger" : "primary"}
                  size="md"
                  onClick={onConfirmVipChange}
                  disabled={isProcessing}
                  icon={
                    vipPlanToAssign === "CANCEL" ? undefined : (
                      <Crown className="w-4 h-4" />
                    )
                  }
                >
                  {isProcessing
                    ? "Đang xử lý..."
                    : vipPlanToAssign === "CANCEL"
                      ? "Xác nhận Hủy VIP"
                      : `Xác nhận Cấp VIP (${vipPlanToAssign === "1_YEAR" ? "1 Năm" : "1 Tháng"})`}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* --- BAN TOGGLE MODAL --- */}
        {actionUser && (
          <Modal
            isOpen={userBanModalOpen}
            onClose={onCloseBanModal}
            title={
              actionUser.isBanned
                ? "Reactivate User Account"
                : "Suspend User Account"
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-[#d9dde8]">
                {actionUser.isBanned ? (
                  <>
                    Are you sure you want to reactivate the account for{" "}
                    <strong className="text-white">{actionUser.name}</strong>?
                    They will be able to log in and use all features again.
                  </>
                ) : (
                  <>
                    Are you sure you want to suspend{" "}
                    <strong className="text-white">{actionUser.name}</strong>?
                    They will be immediately blocked from accessing their account.
                  </>
                )}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onCloseBanModal}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionUser.isBanned ? "primary" : "danger"}
                  size="md"
                  onClick={onConfirmBanToggle}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : actionUser.isBanned
                      ? "Reactivate Account"
                      : "Suspend Account"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* --- DELETE SET MODAL --- */}
        {setToDelete && (
          <Modal
            isOpen={deleteSetModalOpen}
            onClose={onCloseDeleteSetModal}
            title="Delete Study Set Permanently"
          >
            <div className="space-y-4">
              <p className="text-sm text-[#d9dde8]">
                Are you sure you want to remove the study set{" "}
                <strong className="text-white font-bold">
                  "{setToDelete.title}"
                </strong>
                ? This will delete all cards and associated user progress
                permanently. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onCloseDeleteSetModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={onConfirmDeleteSet}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Deleting..." : "Delete Permanently"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* --- DELETE FOLDER MODAL --- */}
        {folderToDelete && (
          <Modal
            isOpen={deleteFolderModalOpen}
            onClose={onCloseDeleteFolderModal}
            title="Delete Folder Permanently"
          >
            <div className="space-y-4">
              <p className="text-sm text-[#d9dde8]">
                Are you sure you want to remove the folder{" "}
                <strong className="text-white font-bold">
                  "{folderToDelete.title}"
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onCloseDeleteFolderModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={onConfirmDeleteFolder}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Deleting..." : "Delete Permanently"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* --- CUSTOM TAGS MODAL --- */}
        <AdminCustomTagsModal
          isOpen={tagModalOpen}
          selectedSet={selectedSetForTags}
          onClose={onCloseTagModal}
          onSave={onSaveCustomTags}
          isSaving={savingTags}
        />
      </>
    );
  },
);
