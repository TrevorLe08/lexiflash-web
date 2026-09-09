import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { classApi } from "../../api/classApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Users, Plus, KeyRound, School, ArrowRight } from "lucide-react";
import { Pagination } from "../../components/common/Pagination";
import { ClassGroup } from "../../types";
import { useTranslation } from "../../i18n";
import { useForm } from "react-hook-form";

export const ClassesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Toggles
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await classApi.getAll({ page, limit: 12 });
      setClasses(res.data);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.totalItems || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateClass = async (data: {
    name: string;
    description: string;
    schoolName?: string;
  }) => {
    if (!data.name.trim()) return;

    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to create classes",
          ),
          type: "info",
        }),
      );
      return;
    }

    setIsCreating(true);
    try {
      await classApi.create(data);
      dispatch(
        addToast({
          message: t(
            "classes.createSuccess",
            undefined,
            "Class created successfully!",
          ),
          type: "success",
        }),
      );
      setCreateModalOpen(false);
      loadClasses();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to create class",
          type: "error",
        }),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinClass = async (data: { joinCode: string }) => {
    if (!data.joinCode.trim()) return;

    if (!isAuthenticated) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to join classes",
          ),
          type: "info",
        }),
      );
      return;
    }

    setIsJoining(true);
    try {
      const res = await classApi.joinByCode(data.joinCode);
      dispatch(
        addToast({
          message: t(
            "classes.joinSuccess",
            { name: res.data.name },
            `Joined ${res.data.name} successfully!`,
          ),
          type: "success",
        }),
      );
      setJoinModalOpen(false);
      loadClasses();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to join class",
          type: "error",
        }),
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {t("classes.title", undefined, "Study Groups")}
          </h1>
          <p className="text-sm text-[#939bb4]">
            {t(
              "classes.subtitle",
              undefined,
              "Collaborate and share vocabulary sets with your study peers",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setJoinModalOpen(true)}
            icon={<KeyRound className="w-4 h-4 text-amber-400" />}
          >
            {t("classes.joinByCodeBtn", undefined, "Join with Code")}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            {t("classes.createGroupBtn", undefined, "Create Group")}
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner
          size="lg"
          label={t("common.loading", undefined, "Loading study groups...")}
          className="py-20"
        />
      ) : classes.length === 0 ? (
        <div className="text-center py-16 px-4 sm:px-8 bg-[#1a1d36]/50 rounded-3xl border border-[#2e3856] space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818cf8] flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {t("classes.noClassesTitle", undefined, "No study groups yet")}
          </h3>
          <p className="text-sm text-[#939bb4] max-w-md mx-auto leading-relaxed">
            {t(
              "classes.noClassesDesc",
              undefined,
              "Create a group for your study partners or join an existing study group with an invitation code.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => setJoinModalOpen(true)}>
              {t("classes.joinByCodeBtn", undefined, "Join with Code")}
            </Button>
            <Button
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              {t("classes.createGroupBtn", undefined, "Create Group")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="group bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-mono font-bold bg-[#0a092d] text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    Code: {cls.joinCode}
                  </span>
                </div>

                <Link to={`/classes/${cls.id}`} className="block group">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#6366F1] transition-colors line-clamp-1">
                    {cls.name}
                  </h3>
                  {cls.schoolName && (
                    <p className="text-xs text-[#939bb4] flex items-center gap-1 mt-0.5">
                      <School className="w-3.5 h-3.5 text-[#586380]" />
                      <span>{cls.schoolName}</span>
                    </p>
                  )}
                  {cls.description && (
                    <p className="text-xs text-[#939bb4] line-clamp-2 mt-2 leading-relaxed">
                      {cls.description}
                    </p>
                  )}
                </Link>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2e3856] mt-4 text-xs">
                <Link
                  to={
                    user &&
                    (user.id === cls.creator.id ||
                      user.username === cls.creator.username)
                      ? "/profile"
                      : `/users/${cls.creator.id}`
                  }
                  className="flex items-center gap-1.5 text-[#939bb4] hover:text-[#6366F1] group/creator transition-colors"
                >
                  <img
                    src={
                      cls.creator.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        cls.creator.username,
                      )}`
                    }
                    alt={cls.creator.name}
                    className="w-5 h-5 rounded-full object-cover bg-[#2e3856]"
                  />
                  <span className="font-medium truncate max-w-[120px]">
                    {cls.creator.name}
                    {user &&
                      (user.id === cls.creator.id ||
                        user.username === cls.creator.username) && (
                        <span className="text-[#939bb4] ml-1 font-normal">
                          ({t("common.you", undefined, "You")})
                        </span>
                      )}
                  </span>
                </Link>

                <Link
                  to={`/classes/${cls.id}`}
                  className="text-[#6366F1] font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                >
                  <span>
                    {cls.memberCount}{" "}
                    {t("nav.searchFilterUsers", undefined, "members")}
                  </span>
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

      {/* Create Study Group Modal */}
      <CreateClassModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        isCreating={isCreating}
      />

      {/* Join Study Group by Code Modal */}
      <JoinClassModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSubmit={handleJoinClass}
        isJoining={isJoining}
      />
    </div>
  );
};

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    schoolName?: string;
  }) => Promise<void>;
  isCreating: boolean;
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    schoolName?: string;
  }) => Promise<void>;
  isCreating: boolean;
}

interface CreateClassFormValues {
  name: string;
  schoolName: string;
  description: string;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<CreateClassFormValues>({
    defaultValues: {
      name: "",
      schoolName: "",
      description: "",
    },
  });

  // Reset when modal toggles
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = (data: CreateClassFormValues) => {
    const finalName = data.name.trim();
    if (!finalName) return;
    onSubmit({
      name: finalName,
      description: data.description.trim(),
      schoolName: data.schoolName.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("classes.createModalTitle", undefined, "Create New Study Group")}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label={t("classes.groupNameLabel", undefined, "Group Name")}
          placeholder={t(
            "classes.groupNamePlaceholder",
            undefined,
            'e.g. "IELTS Band 7.5+ Intensive Group"',
          )}
          {...register("name", { required: true })}
          autoFocus
        />

        <Input
          label={t(
            "classes.schoolLabel",
            undefined,
            "School / Organization / Topic (optional)",
          )}
          placeholder='e.g. "Oxford English Center"'
          {...register("schoolName")}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4]">
            {t("classes.groupDescLabel", undefined, "Description (optional)")}
          </label>
          <textarea
            rows={3}
            placeholder="Information for group members..."
            {...register("description")}
            className="w-full bg-[#131722] text-white placeholder-[#586380] border border-[#262e48] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4f5fd8] transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel", undefined, "Cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isCreating}>
            {t("classes.createGroupBtn", undefined, "Create Group")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { joinCode: string }) => Promise<void>;
  isJoining: boolean;
}

interface JoinClassFormValues {
  joinCode: string;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isJoining,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<JoinClassFormValues>({
    defaultValues: {
      joinCode: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = (data: JoinClassFormValues) => {
    const finalCode = data.joinCode.trim().toUpperCase();
    if (!finalCode) return;
    onSubmit({ joinCode: finalCode });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t(
        "classes.joinModalTitle",
        undefined,
        "Join Study Group with Code",
      )}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label={t(
            "classes.joinCodeLabel",
            undefined,
            "Enter 6-Character Group Code",
          )}
          placeholder={t(
            "classes.joinCodePlaceholder",
            undefined,
            "e.g. IELTS80 or BIZENG",
          )}
          {...register("joinCode", { required: true })}
          maxLength={10}
          className="text-center font-mono font-bold tracking-widest text-lg uppercase"
          autoFocus
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel", undefined, "Cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isJoining}>
            {t("classes.joinSubmitBtn", undefined, "Join Group")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
