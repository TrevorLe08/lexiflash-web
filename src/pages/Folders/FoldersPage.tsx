import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { folderApi } from "../../api/folderApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Folder as FolderIcon, Plus, Layers, ArrowRight } from "lucide-react";
import { Pagination } from "../../components/common/Pagination";
import { Folder } from "../../types";
import { useTranslation } from "../../i18n";
import { useForm } from "react-hook-form";

export const FoldersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await folderApi.getAll({ page, limit: 12 });
      setFolders(res.data);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.totalItems || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleCreateFolder = async (data: {
    title: string;
    description: string;
  }) => {
    if (!data.title.trim()) return;

    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to create folders",
          ),
          type: "info",
        }),
      );
      return;
    }

    setIsCreating(true);
    try {
      await folderApi.create(data);
      dispatch(
        addToast({
          message: t(
            "folders.createSuccess",
            undefined,
            "Folder created successfully!",
          ),
          type: "success",
        }),
      );
      setCreateModalOpen(false);
      loadFolders();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to create folder",
          type: "error",
        }),
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fade-in">
        <FolderIcon className="w-12 h-12 text-[#586380] mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          {t("folders.title", undefined, "Your Folders")}
        </h2>
        <p className="text-sm text-[#939bb4]">
          {t(
            "folders.subtitle",
            undefined,
            "Organize your study sets by subject or exam level.",
          )}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="lg">
              {t("nav.login", undefined, "Log In Now")}
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              {t("nav.signup", undefined, "Sign Up")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {t("folders.title", undefined, "Your Folders")}
          </h1>
          <p className="text-sm text-[#939bb4]">
            {t(
              "folders.subtitle",
              undefined,
              "Organize your study sets by subject or exam level",
            )}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          {t("folders.createFolderBtn", undefined, "Create Folder")}
        </Button>
      </div>

      {loading ? (
        <Spinner
          size="lg"
          label={t("common.loading", undefined, "Loading folders...")}
          className="py-20"
        />
      ) : folders.length === 0 ? (
        <div className="text-center py-16 px-4 sm:px-8 bg-[#1a1d36]/50 rounded-3xl border border-[#2e3856] space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <FolderIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {t("folders.noFoldersTitle", undefined, "No folders yet")}
          </h3>
          <p className="text-sm text-[#939bb4] max-w-md mx-auto leading-relaxed">
            {t(
              "folders.noFoldersDesc",
              undefined,
              "Group your study sets together into organized collections.",
            )}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              {t("folders.createFolderBtn", undefined, "Create First Folder")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <FolderIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#6366F1] bg-[#4257B2]/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {folder.setCount}{" "}
                    {t("nav.searchFilterSets", undefined, "sets")}
                  </span>
                </div>

                <Link to={`/folders/${folder.id}`} className="block group">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#6366F1] transition-colors line-clamp-1">
                    {folder.title}
                  </h3>
                  {folder.description && (
                    <p className="text-xs text-[#939bb4] line-clamp-2 mt-1 leading-relaxed">
                      {folder.description}
                    </p>
                  )}
                </Link>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2e3856] mt-4 text-xs">
                <Link
                  to={
                    user &&
                    (user.id === folder.creator.id ||
                      user.username === folder.creator.username)
                      ? "/profile"
                      : `/users/${folder.creator.id}`
                  }
                  className="flex items-center gap-1.5 text-[#939bb4] hover:text-[#6366F1] group/creator transition-colors"
                >
                  <img
                    src={
                      folder.creator.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        folder.creator.username,
                      )}`
                    }
                    alt={folder.creator.name}
                    className="w-5 h-5 rounded-full object-cover bg-[#2e3856] group-hover/creator:scale-120 group-hover/creator:ring-2 group-hover/creator:ring-[#6366F1] transition-all"
                  />
                  <span className="group-hover/creator:underline">
                    {t("common.by", undefined, "By")} {folder.creator.name}{" "}
                    {user &&
                      (user.id === folder.creator.id ||
                        user.username === folder.creator.username) && (
                        <span className="text-[#939bb4] ml-1">
                          ({t("common.you", undefined, "You")})
                        </span>
                      )}
                  </span>
                </Link>
                <Link
                  to={`/folders/${folder.id}`}
                  className="text-[#6366F1] font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                >
                  {t("common.studyNow", undefined, "View")}{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          className="mt-8"
        />
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
        isCreating={isCreating}
      />
    </div>
  );
};

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  isCreating: boolean;
}

interface CreateFolderFormValues {
  title: string;
  description: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<CreateFolderFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = (data: CreateFolderFormValues) => {
    const finalTitle = data.title.trim();
    if (!finalTitle) return;
    onSubmit({
      title: finalTitle,
      description: data.description.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("folders.createModalTitle", undefined, "Create New Folder")}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label={t("folders.folderTitleLabel", undefined, "Folder Title")}
          placeholder={t(
            "folders.folderTitlePlaceholder",
            undefined,
            'e.g. "IELTS Academic 2026"',
          )}
          {...register("title", { required: true })}
          autoFocus
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
            {t("folders.folderDescLabel", undefined, "Description (optional)")}
          </label>
          <textarea
            rows={3}
            placeholder={t(
              "folders.folderDescPlaceholder",
              undefined,
              "What's this folder about?",
            )}
            {...register("description")}
            className="w-full bg-[#131722] text-white placeholder-[#586380] border border-[#262e48] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4f5fd8] transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel", undefined, "Cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isCreating}>
            {t("folders.createFolderBtn", undefined, "Create Folder")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
