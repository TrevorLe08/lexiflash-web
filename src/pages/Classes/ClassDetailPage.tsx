import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { classApi } from "../../api/classApi";
import { studySetApi } from "../../api/studySetApi";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Checkbox } from "../../components/common/Checkbox";
import { Spinner } from "../../components/common/Spinner";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { EntityNotFound } from "../../components/common/EntityNotFound";
import { Pagination } from "../../components/common/Pagination";
import {
  Users,
  ArrowLeft,
  Trash2,
  School,
  ArrowRight,
  Flame,
  Crown,
  ShieldCheck,
  UserCheck,
  Lock,
  LogIn,
  BookOpen,
  Plus,
  Search,
  Check,
  X,
  Edit3,
  KeyRound,
} from "lucide-react";
import { ClassGroup, ClassRole, UserRole, StudySet } from "../../types";
import { useTranslation } from "../../i18n";

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Edit Group Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editAllowAddSets, setEditAllowAddSets] = useState(true);
  const [editAllowInvite, setEditAllowInvite] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Sets Modal State
  const [isAddSetModalOpen, setIsAddSetModalOpen] = useState(false);
  const [mySets, setMySets] = useState<StudySet[]>([]);
  const [loadingMySets, setLoadingMySets] = useState(false);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [addingSets, setAddingSets] = useState(false);
  const [setSearchQuery, setSetSearchQuery] = useState("");
  const [setModalPage, setSetModalPage] = useState(1);

  const filteredSets = useMemo(() => {
    const q = setSearchQuery.trim().toLowerCase();
    if (!q) return mySets;
    return mySets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    );
  }, [mySets, setSearchQuery]);

  // Confirmation Modals State
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [removeSetTargetId, setRemoveSetTargetId] = useState<string | null>(
    null,
  );
  const [isRemovingSet, setIsRemovingSet] = useState(false);

  const handleOpenEditModal = () => {
    if (!classGroup) return;
    setEditName(classGroup.name);
    setEditDescription(classGroup.description || "");
    setEditSchoolName(classGroup.schoolName || "");
    setEditAllowAddSets(classGroup.allowMemberAddSets ?? true);
    setEditAllowInvite(classGroup.allowMemberInvite ?? true);
    setEditModalOpen(true);
  };

  const handleSaveEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const res = await classApi.update(id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        schoolName: editSchoolName.trim() || undefined,
        allowMemberAddSets: editAllowAddSets,
        allowMemberInvite: editAllowInvite,
      });
      setClassGroup(res.data);
      dispatch(
        addToast({
          message: t(
            "classes.updateSuccess",
            undefined,
            "Study group updated successfully!",
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
            t(
              "classes.updateFailed",
              undefined,
              "Failed to update study group",
            ),
          type: "error",
        }),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchClassDetails = React.useCallback(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    classApi
      .getById(id)
      .then((res) => {
        setClassGroup(res.data);
        setNotFound(false);
      })
      .catch(() => {
        setClassGroup(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  const handleConfirmDeleteGroup = async () => {
    if (!id) return;
    setIsDeletingGroup(true);
    try {
      await classApi.delete(id);
      dispatch(
        addToast({
          message: t(
            "classes.deleteGroupSuccess",
            undefined,
            "Study group disbanded successfully!",
          ),
          type: "info",
        }),
      );
      setDeleteGroupModalOpen(false);
      navigate("/classes");
    } catch {
      // ignore
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const copyJoinCode = () => {
    if (classGroup?.joinCode) {
      navigator.clipboard.writeText(classGroup.joinCode);
      dispatch(
        addToast({
          message: t(
            "classes.copyCodeSuccess",
            { code: classGroup.joinCode },
            `Copied class invite code: ${classGroup.joinCode}`,
          ),
          type: "success",
        }),
      );
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      dispatch(
        addToast({
          message: t(
            "studySet.loginRequiredAction",
            undefined,
            "Please log in to join classes!",
          ),
          type: "info",
        }),
      );
      navigate("/login");
      return;
    }

    const code = inputJoinCode.trim().toUpperCase();
    if (!code) {
      dispatch(
        addToast({
          message: t(
            "classes.joinCodePlaceholder",
            undefined,
            "Please enter join code!",
          ),
          type: "error",
        }),
      );
      return;
    }

    setJoining(true);
    try {
      await classApi.joinByCode(code);
      dispatch(
        addToast({
          message: t(
            "classes.joinSuccess",
            undefined,
            "Joined study group successfully! 🎉",
          ),
          type: "success",
        }),
      );
      setInputJoinCode("");
      fetchClassDetails();
    } catch (err: unknown) {
      let errMsg = "Mã tham gia không chính xác. Vui lòng kiểm tra lại!";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        errMsg = String(err.response.data.message);
      }
      dispatch(
        addToast({
          message: errMsg,
          type: "error",
        }),
      );
    } finally {
      setJoining(false);
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
        ? prev.filter((sId) => sId !== setId)
        : [...prev, setId],
    );
  };

  const handleAddSetsToClass = async () => {
    if (!id || selectedSetIds.length === 0) return;
    setAddingSets(true);
    try {
      await classApi.addSets(id, selectedSetIds);
      dispatch(
        addToast({
          message: t(
            "classes.addSetsSuccess",
            { count: selectedSetIds.length },
            `Added ${selectedSetIds.length} study sets to class! 🎉`,
          ),
          type: "success",
        }),
      );
      setIsAddSetModalOpen(false);
      fetchClassDetails();
    } catch (err: unknown) {
      let errMsg = "Failed to add study sets to class";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        errMsg = String(err.response.data.message);
      }
      dispatch(addToast({ message: errMsg, type: "error" }));
    } finally {
      setAddingSets(false);
    }
  };

  const handleConfirmRemoveSet = async () => {
    if (!id || !removeSetTargetId) return;
    setIsRemovingSet(true);
    try {
      await classApi.removeSets(id, [removeSetTargetId]);
      dispatch(
        addToast({
          message: t(
            "classes.removeSetSuccess",
            undefined,
            "Study set removed from class!",
          ),
          type: "info",
        }),
      );
      setRemoveSetTargetId(null);
      fetchClassDetails();
    } catch {
      // ignore
    } finally {
      setIsRemovingSet(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        size="lg"
        label={t("common.loading", undefined, "Loading class details...")}
        className="py-24"
      />
    );
  }

  if (notFound || !classGroup) {
    return <EntityNotFound type="group" className="py-16" />;
  }

  const isOwner = user && user.id === classGroup.creatorId;
  const isMember =
    Boolean(classGroup.isCurrentUserMember) ||
    Boolean(
      user &&
      (user.id === classGroup.creatorId ||
        classGroup.members?.some((m) => m.userId === user.id)),
    );
  const isSystemAdmin = user?.role === UserRole.ADMIN;
  const canViewContents = isMember || isSystemAdmin;

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>ADMIN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>LEARNER</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/classes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#939bb4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("classes.title", undefined, "All Study Groups")}</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenEditModal}
              icon={<Edit3 className="w-4 h-4" />}
            >
              {t("classes.editGroupBtn", undefined, "Edit Group")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteGroupModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t("classes.deleteGroup", undefined, "Delete Group")}
            </Button>
          </div>
        )}
      </div>

      {/* Class Banner */}
      <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {classGroup.name}
            </h1>
            {classGroup.schoolName && (
              <p className="text-xs text-[#939bb4] flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-[#586380]" />
                <span>{classGroup.schoolName}</span>
              </p>
            )}
            {classGroup.description && (
              <p className="text-sm text-[#939bb4] leading-relaxed pt-1">
                {classGroup.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-[#939bb4] pt-1">
              <span>Admin:</span>
              <Link
                to={
                  user &&
                  (user.id === classGroup.creator.id ||
                    user.username === classGroup.creator.username)
                    ? "/profile"
                    : `/users/${classGroup.creator.id}`
                }
                className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1.5 transition-colors group"
              >
                <img
                  src={
                    classGroup.creator.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      classGroup.creator.username,
                    )}`
                  }
                  alt={classGroup.creator.name}
                  className="w-4 h-4 rounded-full object-cover group-hover:scale-110 transition-transform"
                />
                <span className="group-hover:underline">
                  {classGroup.creator.name}
                </span>
              </Link>
              <span>
                •{" "}
                {t(
                  "classes.membersCount",
                  { count: classGroup.memberCount },
                  `${classGroup.memberCount} members`,
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Invite Code Card for Members VS Join Input for Non-Members */}
        {isMember ? (
          <div className="bg-[#0a092d] border border-[#2e3856] rounded-2xl p-4 text-center shrink-0 space-y-2 min-w-[180px]">
            <span className="text-[11px] font-bold text-[#939bb4] uppercase tracking-wider block">
              {t("classes.joinCodeLabel", undefined, "Invite Code")}
            </span>
            <div className="font-mono text-xl font-black text-amber-300 tracking-widest">
              {classGroup.joinCode}
            </div>
            <button
              onClick={copyJoinCode}
              className="text-xs text-[#6366F1] font-bold hover:underline block w-full cursor-pointer"
            >
              {t("classes.copyCode", undefined, "Copy Code 📋")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleJoinClass}
            className="bg-[#0a092d]/90 border border-amber-500/30 hover:border-amber-500/50 transition-colors rounded-2xl p-5 shrink-0 space-y-3.5 max-w-xs w-full shadow-lg shadow-black/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-amber-300 block truncate">
                  {t(
                    "classes.joinModalTitle",
                    undefined,
                    "Join this Study Group",
                  )}
                </span>
                <p className="text-[11px] text-[#939bb4] truncate">
                  {t(
                    "classes.joinCodePlaceholder",
                    undefined,
                    "Enter code (e.g. IELTS80 or BIZENG)",
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                value={inputJoinCode}
                onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={10}
                className="w-full bg-[#1a1d36] border border-[#2e3856] focus:border-amber-400 text-amber-300 text-base font-mono font-black tracking-widest px-4 py-2.5 rounded-xl outline-none text-center uppercase placeholder-[#586380] transition-colors shadow-inner"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center text-xs font-bold"
                disabled={joining || !inputJoinCode.trim()}
                loading={joining}
                icon={<LogIn className="w-4 h-4" />}
              >
                {t("classes.joinSubmitBtn", undefined, "Join Group Now")}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Main Content Area: Show Members & Sets if Member or System Admin, or Show Lock Screen for Non-Member */}
      {canViewContents ? (
        <>
          {/* Class Members Section with interactive Avatars */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>
                  {t(
                    "classes.membersSection",
                    {
                      count:
                        classGroup.memberDetails?.length ||
                        classGroup.memberCount,
                    },
                    `Class Members (${classGroup.memberDetails?.length || classGroup.memberCount})`,
                  )}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {(classGroup.memberDetails || []).map((m) => {
                const isSelf =
                  user &&
                  (user.id === m.userId || user.username === m.username);
                const targetUrl = isSelf ? "/profile" : `/users/${m.userId}`;

                return (
                  <Link
                    key={m.userId}
                    to={targetUrl}
                    className="bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-md group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Interactive Hover Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={
                            m.avatarUrl ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                              m.username,
                            )}`
                          }
                          alt={m.name}
                          className="w-11 h-11 rounded-full object-cover bg-[#2e3856] border-2 border-[#3c476c] group-hover:scale-115 group-hover:ring-2 group-hover:ring-[#6366F1] group-hover:border-transparent transition-all duration-200"
                        />
                        {m.role === ClassRole.ADMIN && (
                          <div
                            className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow"
                            title="Class Admin"
                          >
                            <Crown className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-sm text-white group-hover:text-[#6366F1] transition-colors truncate">
                            {m.name}
                            {isSelf && (
                              <span className="text-[#939bb4] ml-1 font-normal">
                                ({t("common.you", undefined, "You")})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {renderRoleBadge(m.userRole)}
                          <span className="text-[11px] text-[#939bb4] truncate">
                            @{m.username}
                          </span>
                        </div>
                      </div>
                    </div>

                    {m.streakCount > 0 && (
                      <div
                        className="flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0"
                        title={`${m.streakCount} day streak`}
                      >
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{m.streakCount}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sets in Class */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>
                  {t(
                    "classes.setsSection",
                    { count: classGroup.studySets?.length || 0 },
                    `Study Sets for this Class (${classGroup.studySets?.length || 0})`,
                  )}
                </span>
              </h2>

              {isMember &&
                (classGroup.isCurrentUserAdmin ||
                  classGroup.allowMemberAddSets) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openAddSetModal}
                    icon={<Plus className="w-4 h-4 text-indigo-400" />}
                  >
                    {t(
                      "classes.addSetsToClassBtn",
                      undefined,
                      "Add Study Sets",
                    )}
                  </Button>
                )}
            </div>

            {classGroup.studySets?.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1d36]/50 rounded-2xl border border-[#2e3856] text-sm text-[#939bb4] space-y-3">
                <p>
                  {t(
                    "classes.noSetsInClass",
                    undefined,
                    "No study sets assigned to this class yet.",
                  )}
                </p>
                {isMember &&
                  (classGroup.isCurrentUserAdmin ||
                    classGroup.allowMemberAddSets) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={openAddSetModal}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      {t(
                        "classes.addFirstSetBtn",
                        undefined,
                        "Add First Study Set",
                      )}
                    </Button>
                  )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classGroup.studySets?.map((set) => (
                  <div
                    key={set.id}
                    className="bg-[#1a1d36] hover:bg-[#202545] border border-[#2e3856] hover:border-[#4257B2] rounded-2xl p-5 transition-all flex items-center justify-between gap-3 shadow-md group relative"
                  >
                    <Link
                      to={`/sets/${set.id}`}
                      className="min-w-0 flex-1 space-y-1 block"
                    >
                      <span className="text-[11px] font-bold text-[#6366F1] bg-[#4257B2]/20 px-2 py-0.5 rounded">
                        {t(
                          "studySet.termsCount",
                          { count: set.cardCount || set.cards?.length || 0 },
                          `${set.cardCount || set.cards?.length || 0} terms`,
                        )}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-[#6366F1] transition-colors truncate">
                        {set.title}
                      </h3>
                      <p className="text-xs text-[#939bb4] truncate">
                        {t("studySet.createdBy", undefined, "By")}{" "}
                        {set.creator?.name}
                      </p>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      {classGroup.isCurrentUserAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRemoveSetTargetId(set.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                          title="Remove set from class"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <Link to={`/sets/${set.id}`}>
                        <ArrowRight className="w-4 h-4 text-[#939bb4] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Protected Member Content Locked State */
        <div className="bg-[#1a1d36]/80 border border-[#2e3856] rounded-3xl p-10 text-center space-y-6 shadow-xl max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              {t(
                "classes.protectedContentTitle",
                undefined,
                "Protected Class Content",
              )}
            </h3>
            <p className="text-sm text-[#939bb4] max-w-md mx-auto leading-relaxed">
              {t(
                "classes.protectedContentDesc",
                undefined,
                "Only members of this study group can view flashcards and members. Enter the invite code to join.",
              )}
            </p>
          </div>

          <form
            onSubmit={handleJoinClass}
            className="flex flex-col items-center gap-3 max-w-xs mx-auto pt-2 w-full"
          >
            <input
              type="text"
              value={inputJoinCode}
              onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={10}
              className="w-full bg-[#0a092d] border border-[#2e3856] focus:border-amber-400 text-amber-300 text-base font-mono font-black tracking-widest px-4 py-3 rounded-xl outline-none text-center uppercase placeholder-[#586380] transition-colors shadow-inner"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-bold"
              disabled={joining || !inputJoinCode.trim()}
              loading={joining}
              icon={<LogIn className="w-4 h-4" />}
            >
              {t("classes.joinSubmitBtn", undefined, "Join Group Now")}
            </Button>
          </form>
        </div>
      )}

      {/* Add Study Sets to Class Modal */}
      <Modal
        isOpen={isAddSetModalOpen}
        onClose={() => setIsAddSetModalOpen(false)}
        title={t(
          "classes.addSetsToClassBtn",
          undefined,
          "Add Study Sets to Class",
        )}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#939bb4]">
            Select study sets from your library to assign to{" "}
            <strong>{classGroup.name}</strong>.
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t(
                "home.exploreSearchPlaceholder",
                undefined,
                "Search your study sets...",
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
          ) : (
            (() => {
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
                      const alreadyInClass = classGroup.studySets?.some(
                        (cs) => cs.id === set.id,
                      );
                      const isSelected = selectedSetIds.includes(set.id);

                      return (
                        <div
                          key={set.id}
                          onClick={() => {
                            if (!alreadyInClass) handleToggleSelectSet(set.id);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            alreadyInClass
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
                                {
                                  count:
                                    set.cardCount || set.cards?.length || 0,
                                },
                                `${set.cardCount || set.cards?.length || 0} terms`,
                              )}{" "}
                              • Level: {set.level || "INTERMEDIATE"}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {alreadyInClass ? (
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
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5" />
                                )}
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
            })()
          )}

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
                onClick={handleAddSetsToClass}
                icon={<Plus className="w-4 h-4" />}
              >
                {addingSets
                  ? t("common.loading", undefined, "Adding...")
                  : t("classes.addToClassSubmitBtn", undefined, "Add to Class")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Group Confirm Modal */}
      <ConfirmModal
        isOpen={deleteGroupModalOpen}
        onClose={() => setDeleteGroupModalOpen(false)}
        onConfirm={handleConfirmDeleteGroup}
        title={t(
          "classes.deleteModalTitle",
          undefined,
          "Confirm Disband Group",
        )}
        message={t(
          "classes.deleteModalMessage",
          undefined,
          "Are you sure you want to disband this study group? All members and shared study set links will be permanently removed.",
        )}
        confirmText={t("classes.deleteGroup", undefined, "Disband Group")}
        cancelText={t("confirmModal.cancel", undefined, "Cancel")}
        loading={isDeletingGroup}
        isDanger={true}
      />

      {/* Remove Set from Group Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(removeSetTargetId)}
        onClose={() => setRemoveSetTargetId(null)}
        onConfirm={handleConfirmRemoveSet}
        title={t(
          "classes.removeSetModalTitle",
          undefined,
          "Confirm Remove Study Set",
        )}
        message={t(
          "classes.removeSetModalMessage",
          undefined,
          "Are you sure you want to remove this study set from the group?",
        )}
        confirmText={t("common.delete", undefined, "Remove")}
        cancelText={t("confirmModal.cancel", undefined, "Cancel")}
        loading={isRemovingSet}
        isDanger={true}
      />

      {/* Edit Group Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t(
          "classes.editModalTitle",
          undefined,
          "Edit Study Group Information",
        )}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditGroup} className="space-y-4">
          <Input
            label={t("classes.groupNameLabel", undefined, "Group Name")}
            placeholder={t(
              "classes.groupNamePlaceholder",
              undefined,
              "e.g. IELTS Master 7.5+...",
            )}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#939bb4] uppercase tracking-wider">
              {t(
                "classes.groupDescLabel",
                undefined,
                "Group Description (optional)",
              )}
            </label>
            <textarea
              placeholder={t(
                "classes.groupDescPlaceholder",
                undefined,
                "Describe group rules, goals or study plan...",
              )}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-[#0a092d] text-white placeholder-[#586380] border border-[#2e3856] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4257B2] resize-none h-20"
            />
          </div>

          <Input
            label={t(
              "classes.schoolLabel",
              undefined,
              "School / Organization / Topic (optional)",
            )}
            placeholder={t(
              "classes.schoolPlaceholder",
              undefined,
              "e.g. High School for Gifted, Foreign Trade Univ...",
            )}
            value={editSchoolName}
            onChange={(e) => setEditSchoolName(e.target.value)}
          />

          <div className="space-y-3 pt-2 border-t border-[#2e3856]">
            <Checkbox
              checked={editAllowAddSets}
              onChange={setEditAllowAddSets}
              label={t(
                "classes.allowAddSets",
                undefined,
                "Allow members to contribute study sets",
              )}
            />

            <Checkbox
              checked={editAllowInvite}
              onChange={setEditAllowInvite}
              label={t(
                "classes.allowInvite",
                undefined,
                "Allow members to invite others",
              )}
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
              disabled={!editName.trim()}
            >
              {t("classes.saveChanges", undefined, "Save Changes")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
