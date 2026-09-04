import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { folderApi } from "../../api/folderApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Pagination } from "../../components/common/Pagination";
import { studySetApi } from "../../api/studySetApi";
import {
  Folder as FolderIcon,
  ArrowLeft,
  Trash2,
  ArrowRight,
  Edit3,
  Plus,
  Search,
  Check,
} from "lucide-react";
import { Folder, StudySet } from "../../types";
import { useTranslation } from "../../i18n";
import { useDebounce } from "../../hooks/useDebounce";

export const FolderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Confirm Modals State
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [removeSetTargetId, setRemoveSetTargetId] = useState<string | null>(
    null,
  );
  const [isRemovingSet, setIsRemovingSet] = useState(false);

  // Add Sets Modal State
  const [isAddSetModalOpen, setIsAddSetModalOpen] = useState(false);
  const [mySets, setMySets] = useState<StudySet[]>([]);
  const [loadingMySets, setLoadingMySets] = useState(false);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [addingSets, setAddingSets] = useState(false);
  const [setSearchQuery, setSetSearchQuery] = useState("");
  const [setModalPage, setSetModalPage] = useState(1);
  const debouncedSearchQuery = useDebounce(setSearchQuery, 250);

  const filteredSets = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return mySets;
    return mySets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    );
  }, [mySets, debouncedSearchQuery]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setNotFound(false);
      folderApi
        .getById(id)
        .then((res) => {
          setFolder(res.data);
          setNotFound(false);
        })
        .catch(() => {
          setFolder(null);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleOpenEditModal = () => {
    if (!folder) return;
    setEditTitle(folder.title);
    setEditDescription(folder.description || "");
    setEditModalOpen(true);
  };

  const handleSaveEditFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const res = await folderApi.update(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setFolder(res.data);
      dispatch(
        addToast({
          message: t(
            "folders.updateSuccess",
            undefined,
            "Folder updated successfully!",
          ),
          type: "success",
        }),
      );
      setEditModalOpen(false);
    } catch (err: any) {
      dispatch(
        addToast({
          message:
            err.message ||
            t("folders.updateFailed", undefined, "Failed to update folder"),
          type: "error",
        }),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!id) return;
    setIsDeletingFolder(true);
    try {
      await folderApi.delete(id);
      dispatch(
        addToast({
          message: t(
            "folders.deleteToastSuccess",
            undefined,
            "Folder deleted successfully!",
          ),
          type: "info",
        }),
      );
      setDeleteFolderModalOpen(false);
      navigate("/folders");
    } catch {
      // ignore
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const handleConfirmRemoveSet = async () => {
    if (!id || !removeSetTargetId) return;
    setIsRemovingSet(true);
    try {
      const res = await folderApi.removeSets(id, [removeSetTargetId]);
      setFolder(res.data);
      dispatch(
        addToast({
          message: t(
            "folders.removeSetToastSuccess",
            undefined,
            "Set removed from folder!",
          ),
          type: "info",
        }),
      );
      setRemoveSetTargetId(null);
    } catch {
      // ignore
    } finally {
      setIsRemovingSet(false);
    }
  };

  const openAddSetModal = async () => {
    setIsAddSetModalOpen(true);
    setLoadingMySets(true);
    setSelectedSetIds([]);
    setSetSearchQuery("");
    setSetModalPage(1);
    try {
      const res = await studySetApi.getAll({ onlyMine: true, limit: 100 });
      setMySets(res.data || []);
    } catch {
      dispatch(
        addToast({
          message: "Failed to load your study sets",
          type: "error",
        }),
      );
    } finally {
      setLoadingMySets(false);
    }
  };

  const handleToggleSelectSet = (setId: string) => {
    setSelectedSetIds((prev) =>
      prev.includes(setId)
        ? prev.filter((i) => i !== setId)
        : [...prev, setId],
    );
  };

  const handleConfirmAddSets = async () => {
    if (!id || selectedSetIds.length === 0) return;
    setAddingSets(true);
    try {
      const res = await folderApi.addSets(id, selectedSetIds);
      setFolder(res.data);
      dispatch(
        addToast({
          message: t(
            "folders.addSetSuccess",
            undefined,
            "Added study set to folder!",
          ),
          type: "success",
        }),
      );
      setIsAddSetModalOpen(false);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to add study sets to folder",
          type: "error",
        }),
      );
    } finally {
      setAddingSets(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading folder details...")}
        className="py-24"
      />
    );
  }

  if (notFound || !folder) {
    return <EntityNotFound type="folder" className="py-16" />;
  }

  const isOwner = user && user.id === folder.creatorId;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/folders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("folders.title", undefined, "All Folders")}</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenEditModal}
              icon={<Edit3 className="w-4 h-4" />}
            >
              {t("folders.editFolderBtn", undefined, "Edit Folder")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteFolderModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t("common.delete", undefined, "Delete Folder")}
            </Button>
          </div>
        )}
      </div>

      {/* Folder Banner */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <FolderIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {folder.title}
            </h1>
            <span className="text-xs bg-[#4257B2]/20 text-[#6366F1] px-2.5 py-0.5 rounded-lg font-bold">
              {t(
                "folders.setsCount",
                { count: folder.setCount },
                `${folder.setCount} sets`,
              )}
            </span>
          </div>
          {folder.description && (
            <p className="text-sm text-[#939bb4] leading-relaxed">
              {folder.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-[#939bb4] pt-1">
            <span>{t("studySet.createdBy", undefined, "Created by")}:</span>
            <Link
              to={
                user &&
                (user.id === folder.creator.id ||
                  user.username === folder.creator.username)
                  ? "/profile"
                  : `/users/${folder.creator.id}`
              }
              className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1.5 transition-colors group"
            >
              <img
                src={
                  folder.creator.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                    folder.creator.username,
                  )}`
                }
                alt={folder.creator.name}
                className="w-4 h-4 rounded-full object-cover group-hover:scale-110 transition-transform"
              />
              <span className="group-hover:underline">
                {folder.creator.name}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sets List inside this folder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {t("folders.detailTitle", undefined, "Study Sets in this Folder")}
          </h2>
          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAddSetModal}
            >
              {t("folders.addSetsBtn", undefined, "Thêm học phần")}
            </Button>
          )}
        </div>

        {folder.studySets?.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1d36]/50 rounded-2xl border border-[#2e3856] text-sm text-[#939bb4] space-y-3">
            <p>
              {t(
                "folders.emptyFolderSets",
                undefined,
                "No study sets in this folder yet. Browse sets on Home page and click 'Add to Folder'.",
              )}
            </p>
            {isOwner && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={openAddSetModal}
              >
                {t("folders.addSetsBtn", undefined, "Thêm học phần")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folder.studySets?.map((set) => (
              <div
                key={set.id}
                className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 hover:border-[#4257B2] transition-colors flex items-center justify-between gap-3 shadow-md"
              >
                <Link to={`/sets/${set.id}`} className="space-y-1 block flex-1">
                  <span className="text-[11px] font-bold text-[#6366F1] bg-[#4257B2]/20 px-2 py-0.5 rounded">
                    {t(
                      "studySet.termsCount",
                      { count: set.cardCount || set.cards?.length || 0 },
                      `${set.cardCount || set.cards?.length || 0} terms`,
                    )}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {set.title}
                  </h3>
                  {set.description && (
                    <p className="text-xs text-[#939bb4] line-clamp-1">
                      {set.description}
                    </p>
                  )}
                </Link>

                <div className="flex items-center gap-2">
                  <Link to={`/sets/${set.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowRight className="w-4 h-4" />}
                    />
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => setRemoveSetTargetId(set.id)}
                      className="text-[#939bb4] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 text-xs cursor-pointer"
                      title="Remove from folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Folder Confirm Modal */}
      <ConfirmModal
        isOpen={deleteFolderModalOpen}
        onClose={() => setDeleteFolderModalOpen(false)}
        onConfirm={handleConfirmDeleteFolder}
        title={t(
          "folders.deleteModalTitle",
          undefined,
          "Confirm Delete Folder",
        )}
        message={t(
          "folders.deleteConfirm",
          undefined,
          "Are you sure you want to delete this folder? The study sets inside will remain safe in your library.",
        )}
        confirmText={t("common.delete", undefined, "Delete Folder")}
        cancelText={t("confirmModal.cancel", undefined, "Cancel")}
        loading={isDeletingFolder}
        isDanger={true}
      />

      {/* Remove Set from Folder Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(removeSetTargetId)}
        onClose={() => setRemoveSetTargetId(null)}
        onConfirm={handleConfirmRemoveSet}
        title={t(
          "folders.removeSetModalTitle",
          undefined,
          "Confirm Remove Set",
        )}
        message={t(
          "folders.removeSetModalMessage",
          undefined,
          "Are you sure you want to remove this study set from this folder?",
        )}
        confirmText={t("common.delete", undefined, "Remove")}
        cancelText={t("confirmModal.cancel", undefined, "Cancel")}
        loading={isRemovingSet}
        isDanger={true}
      />

      {/* Edit Folder Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t(
          "folders.editModalTitle",
          undefined,
          "Edit Folder Information",
        )}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditFolder} className="space-y-4">
          <Input
            label={t("folders.folderTitleLabel", undefined, "Folder Title")}
            placeholder={t(
              "folders.folderTitlePlaceholder",
              undefined,
              "e.g. IELTS Academic Vocabulary...",
            )}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#939bb4] uppercase tracking-wider">
              {t(
                "folders.folderDescLabel",
                undefined,
                "Description (optional)",
              )}
            </label>
            <textarea
              placeholder={t(
                "folders.folderDescPlaceholder",
                undefined,
                "Brief note about the purpose or contents of this folder...",
              )}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4257B2] resize-none h-24"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2e3856]">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setEditModalOpen(false)}
            >
              {t("confirmModal.cancel", undefined, "Cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isUpdating}
              disabled={!editTitle.trim()}
            >
              {t("folders.saveChanges", undefined, "Save Changes")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Study Sets to Folder Modal */}
      <Modal
        isOpen={isAddSetModalOpen}
        onClose={() => setIsAddSetModalOpen(false)}
        title={t("folders.addSetsBtn", undefined, "Thêm học phần")}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#939bb4]">
            {t(
              "folders.selectSetsPrompt",
              undefined,
              "Chọn học phần từ thư viện của bạn để thêm vào thư mục này:",
            )}
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t(
                "home.exploreSearchPlaceholder",
                undefined,
                "Tìm kiếm học phần...",
              )}
              value={setSearchQuery}
              onChange={(e) => {
                setSetSearchQuery(e.target.value);
                setSetModalPage(1);
              }}
              className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#4257B2]"
            />
          </div>

          {loadingMySets ? (
            <Spinner
              size="md"
              label={t("common.loading", undefined, "Loading your sets...")}
              className="py-12"
            />
          ) : mySets.length === 0 ? (
            <div className="text-center py-10 bg-[#0a092d] rounded-2xl border border-[#2e3856] space-y-2">
              <p className="text-sm text-[#939bb4]">
                {t(
                  "profile.noSets",
                  undefined,
                  "You haven't created any study sets yet.",
                )}
              </p>
              <Link to="/sets/create">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  {t("home.heroCreateBtn", undefined, "Create a Study Set")}
                </Button>
              </Link>
            </div>
          ) : (() => {
            const SETS_PER_PAGE = 5;
            const totalPages =
              Math.ceil(filteredSets.length / SETS_PER_PAGE) || 1;
            const paginatedSets = filteredSets.slice(
              (setModalPage - 1) * SETS_PER_PAGE,
              setModalPage * SETS_PER_PAGE,
            );

            if (filteredSets.length === 0) {
              return (
                <div className="text-center py-8 text-sm text-[#939bb4]">
                  {t(
                    "common.noResults",
                    undefined,
                    "No study sets found matching your search.",
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="space-y-2">
                  {paginatedSets.map((set) => {
                    const alreadyInFolder =
                      folder?.studySetIds?.includes(set.id) ||
                      folder?.studySets?.some((s) => s.id === set.id);
                    const isSelected = selectedSetIds.includes(set.id);

                    return (
                      <div
                        key={set.id}
                        onClick={() => {
                          if (!alreadyInFolder) handleToggleSelectSet(set.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          alreadyInFolder
                            ? "bg-[#0a092d]/40 border-[#2e3856]/40 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "bg-indigo-950/40 border-[#6366F1] ring-1 ring-[#6366F1] cursor-pointer"
                              : "bg-[#0a092d] border-[#2e3856] hover:border-[#4257B2] cursor-pointer"
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-bold text-white truncate">
                            {set.title}
                          </h4>
                          <p className="text-xs text-[#939bb4]">
                            {t(
                              "studySet.termsCount",
                              { count: set.cardCount || set.cards?.length || 0 },
                              `${set.cardCount || set.cards?.length || 0} terms`,
                            )}{" "}
                            • Level: {set.level || "INTERMEDIATE"}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {alreadyInFolder ? (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              {t(
                                "classes.alreadyAddedBadge",
                                undefined,
                                "Added ✓",
                              )}
                            </span>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-[#6366F1] border-[#6366F1] text-white"
                                  : "border-[#3c476c] bg-[#1a1d36]"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination (Max 5 items per page) */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#2e3856]/70">
                    <span className="text-xs text-[#939bb4]">
                      {t("common.page", undefined, "Page")} {setModalPage} /{" "}
                      {totalPages} ({filteredSets.length}{" "}
                      {t("home.studySetsTitle", undefined, "study sets")})
                    </span>
                    <Pagination
                      currentPage={setModalPage}
                      totalPages={totalPages}
                      onPageChange={setSetModalPage}
                    />
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3856]">
            <span className="text-xs text-[#939bb4]">
              {t(
                "classes.selectedSetsCount",
                { count: selectedSetIds.length },
                `${selectedSetIds.length} set(s) selected`,
              )}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddSetModalOpen(false)}
              >
                {t("common.cancel", undefined, "Cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedSetIds.length === 0 || addingSets}
                loading={addingSets}
                onClick={handleConfirmAddSets}
              >
                {t("folders.addSetsBtn", undefined, "Thêm học phần")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
