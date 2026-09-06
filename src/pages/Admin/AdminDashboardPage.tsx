import React, { useEffect, useState, useCallback } from "react";
import { adminApi, AdminOverviewStats } from "../../api/adminApi";
import { UserRole, PrivacyLevel } from "../../types";
import { useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import {
  ShieldCheck,
  BarChart3,
  Users,
  Layers,
  GraduationCap,
  RefreshCw,
  Tag,
  Megaphone,
  Wrench,
  Folder as FolderIcon,
} from "lucide-react";
import { BannerNotificationConfig, MaintenanceConfig } from "../../types/system.types";
import { AdminOverviewTab } from "./components/AdminOverviewTab";
import { AdminUsersTab } from "./components/AdminUsersTab";
import { AdminSetsTab } from "./components/AdminSetsTab";
import { AdminFoldersTab } from "./components/AdminFoldersTab";
import { AdminGroupsTab } from "./components/AdminGroupsTab";
import { AdminTopicsTab, DEFAULT_TOPICS_LIST } from "./components/AdminTopicsTab";
import { AdminBannerTab } from "./components/AdminBannerTab";
import { AdminMaintenanceTab } from "./components/AdminMaintenanceTab";
import { AdminModals } from "./components/AdminModals";

export type AdminTab =
  | "overview"
  | "users"
  | "sets"
  | "folders"
  | "groups"
  | "topics"
  | "banner"
  | "maintenance";

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Users Tab State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("ALL");
  const [usersStatusFilter, setUsersStatusFilter] = useState<string>("ALL");
  const [usersVipFilter, setUsersVipFilter] = useState<string>("ALL");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Sets Tab State
  const [setsList, setSetsList] = useState<any[]>([]);
  const [setsPage, setSetsPage] = useState(1);
  const [setsTotalPages, setSetsTotalPages] = useState(1);
  const [setsSearch, setSetsSearch] = useState("");
  const [setsPrivacyFilter, setSetsPrivacyFilter] = useState<string>("ALL");
  const [setsFeaturedFilter, setSetsFeaturedFilter] = useState<string>("ALL");
  const [loadingSets, setLoadingSets] = useState(false);

  // Folders Tab State
  const [foldersList, setFoldersList] = useState<any[]>([]);
  const [foldersPage, setFoldersPage] = useState(1);
  const [foldersTotalPages, setFoldersTotalPages] = useState(1);
  const [foldersSearch, setFoldersSearch] = useState("");
  const [foldersFeaturedFilter, setFoldersFeaturedFilter] = useState<string>("ALL");
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Groups Tab State
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsTotalPages, setGroupsTotalPages] = useState(1);
  const [groupsSearch, setGroupsSearch] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Topics Tab State
  const [featuredTopics, setFeaturedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [savingTopics, setSavingTopics] = useState(false);

  // Banner Tab State
  const [bannerConfig, setBannerConfig] = useState<BannerNotificationConfig | null>(null);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  // Maintenance Tab State
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig | null>(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // Debounced search states to prevent UI lag while typing
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState(usersSearch);
  const [debouncedSetsSearch, setDebouncedSetsSearch] = useState(setsSearch);
  const [debouncedFoldersSearch, setDebouncedFoldersSearch] = useState(foldersSearch);
  const [debouncedGroupsSearch, setDebouncedGroupsSearch] = useState(groupsSearch);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsersSearch(usersSearch), 500);
    return () => clearTimeout(t);
  }, [usersSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSetsSearch(setsSearch), 500);
    return () => clearTimeout(t);
  }, [setsSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFoldersSearch(foldersSearch), 500);
    return () => clearTimeout(t);
  }, [foldersSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedGroupsSearch(groupsSearch), 500);
    return () => clearTimeout(t);
  }, [groupsSearch]);

  // Modals state
  const [actionUser, setActionUser] = useState<any | null>(null);
  const [userRoleModalOpen, setUserRoleModalOpen] = useState(false);
  const [userBanModalOpen, setUserBanModalOpen] = useState(false);
  const [userVipModalOpen, setUserVipModalOpen] = useState(false);
  const [vipPlanToAssign, setVipPlanToAssign] = useState<
    "1_MONTH" | "1_YEAR" | "CANCEL"
  >("1_MONTH");

  const [deleteSetModalOpen, setDeleteSetModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<any | null>(null);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedSetForTags, setSelectedSetForTags] = useState<any | null>(null);
  const [savingTags, setSavingTags] = useState(false);

  // 1. Fetch Overview Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch {
      dispatch(
        addToast({ message: "Failed to load platform stats", type: "error" }),
      );
    } finally {
      setLoadingStats(false);
    }
  }, [dispatch]);

  // 2. Fetch Users
  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoadingUsers(true);
      try {
        const roleParam =
          usersRoleFilter !== "ALL" ? (usersRoleFilter as UserRole) : undefined;
        const bannedParam =
          usersStatusFilter === "BANNED"
            ? true
            : usersStatusFilter === "ACTIVE"
              ? false
              : undefined;

        const res = await adminApi.getUsers({
          page,
          limit: 10,
          search: debouncedUsersSearch,
          role: roleParam,
          isBanned: bannedParam,
          vipTier: usersVipFilter !== "ALL" ? usersVipFilter : undefined,
        });

        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.items || [];
        const currentPage =
          (res.data as any)?.pagination?.page || res.meta?.currentPage || page;
        const totalPages =
          (res.data as any)?.pagination?.totalPages ||
          res.meta?.totalPages ||
          1;

        setUsersList(items);
        setUsersPage(currentPage);
        setUsersTotalPages(totalPages);
      } catch {
        dispatch(addToast({ message: "Failed to fetch users", type: "error" }));
      } finally {
        setLoadingUsers(false);
      }
    },
    [
      dispatch,
      debouncedUsersSearch,
      usersRoleFilter,
      usersStatusFilter,
      usersVipFilter,
    ],
  );

  // 3. Fetch Sets
  const fetchSets = useCallback(
    async (page = 1) => {
      setLoadingSets(true);
      try {
        const privacyParam =
          setsPrivacyFilter !== "ALL"
            ? (setsPrivacyFilter as PrivacyLevel)
            : undefined;
        const featuredParam =
          setsFeaturedFilter === "FEATURED"
            ? true
            : setsFeaturedFilter === "NORMAL"
              ? false
              : undefined;

        const res = await adminApi.getSets({
          page,
          limit: 10,
          search: debouncedSetsSearch,
          privacy: privacyParam,
          isFeatured: featuredParam,
        });

        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.items || [];
        const currentPage =
          (res.data as any)?.pagination?.page || res.meta?.currentPage || page;
        const totalPages =
          (res.data as any)?.pagination?.totalPages ||
          res.meta?.totalPages ||
          1;

        setSetsList(items);
        setSetsPage(currentPage);
        setSetsTotalPages(totalPages);
      } catch {
        dispatch(
          addToast({ message: "Failed to fetch study sets", type: "error" }),
        );
      } finally {
        setLoadingSets(false);
      }
    },
    [dispatch, debouncedSetsSearch, setsPrivacyFilter, setsFeaturedFilter],
  );

  // 4. Fetch Folders
  const fetchFolders = useCallback(
    async (page = 1) => {
      setLoadingFolders(true);
      try {
        const featuredParam =
          foldersFeaturedFilter === "FEATURED"
            ? true
            : foldersFeaturedFilter === "NORMAL"
              ? false
              : undefined;

        const res = await adminApi.getFolders({
          page,
          limit: 10,
          search: debouncedFoldersSearch,
          isFeatured: featuredParam,
        });

        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.items || [];
        const currentPage =
          (res.data as any)?.pagination?.page || res.meta?.currentPage || page;
        const totalPages =
          (res.data as any)?.pagination?.totalPages ||
          res.meta?.totalPages ||
          1;

        setFoldersList(items);
        setFoldersPage(currentPage);
        setFoldersTotalPages(totalPages);
      } catch {
        dispatch(
          addToast({ message: "Failed to fetch folders", type: "error" }),
        );
      } finally {
        setLoadingFolders(false);
      }
    },
    [dispatch, debouncedFoldersSearch, foldersFeaturedFilter],
  );

  // 5. Fetch Groups
  const fetchGroups = useCallback(
    async (page = 1) => {
      setLoadingGroups(true);
      try {
        const res = await adminApi.getGroups({
          page,
          limit: 10,
          search: debouncedGroupsSearch,
        });

        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.items || [];
        const currentPage =
          (res.data as any)?.pagination?.page || res.meta?.currentPage || page;
        const totalPages =
          (res.data as any)?.pagination?.totalPages ||
          res.meta?.totalPages ||
          1;

        setGroupsList(items);
        setGroupsPage(currentPage);
        setGroupsTotalPages(totalPages);
      } catch {
        dispatch(
          addToast({ message: "Failed to fetch study groups", type: "error" }),
        );
      } finally {
        setLoadingGroups(false);
      }
    },
    [dispatch, debouncedGroupsSearch],
  );

  // 6. Fetch Featured Topics
  const fetchFeaturedTopics = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const res = await adminApi.getFeaturedTopics();
      if (res.data && Array.isArray(res.data.topics)) {
        setFeaturedTopics(res.data.topics);
      }
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Không thể tải danh sách chủ đề nổi bật",
          type: "error",
        }),
      );
    } finally {
      setLoadingTopics(false);
    }
  }, [dispatch]);

  const handleSaveFeaturedTopics = async () => {
    setSavingTopics(true);
    try {
      const res = await adminApi.updateFeaturedTopics(featuredTopics);
      if (res.data && Array.isArray(res.data.topics)) {
        setFeaturedTopics(res.data.topics);
      }
      dispatch(
        addToast({
          message: "Đã cập nhật và lưu danh sách chủ đề nổi bật thành công! ✨",
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Không thể lưu danh sách chủ đề",
          type: "error",
        }),
      );
    } finally {
      setSavingTopics(false);
    }
  };

  const handleResetFeaturedTopics = () => {
    setFeaturedTopics([...DEFAULT_TOPICS_LIST]);
    dispatch(
      addToast({
        message:
          "Đã nạp 10 chủ đề mặc định (nhấn Lưu cấu hình để áp dụng lên hệ thống)",
        type: "info",
      }),
    );
  };

  // 7. Fetch Banner Config
  const fetchBannerConfig = useCallback(async () => {
    setLoadingBanner(true);
    try {
      const res = await adminApi.getBanner();
      setBannerConfig(res.data.banner);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Không thể tải cấu hình thông báo",
          type: "error",
        }),
      );
    } finally {
      setLoadingBanner(false);
    }
  }, [dispatch]);

  const handleSaveBanner = async (
    data: Omit<BannerNotificationConfig, "id" | "updatedAt">,
  ) => {
    setSavingBanner(true);
    try {
      const res = await adminApi.updateBanner(data);
      setBannerConfig(res.data.banner);
      window.dispatchEvent(new Event("lexiflash_banner_updated"));
      dispatch(
        addToast({
          message: "Đã lưu và cập nhật Banner thông báo đầu trang thành công!",
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Lỗi lưu cấu hình thông báo",
          type: "error",
        }),
      );
    } finally {
      setSavingBanner(false);
    }
  };

  // 8. Fetch Maintenance Config
  const fetchMaintenanceConfig = useCallback(async () => {
    setLoadingMaintenance(true);
    try {
      const res = await adminApi.getMaintenance();
      setMaintenanceConfig(res.data.maintenance);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Không thể tải cấu hình bảo trì",
          type: "error",
        }),
      );
    } finally {
      setLoadingMaintenance(false);
    }
  }, [dispatch]);

  const handleSaveMaintenance = async (
    data: Omit<MaintenanceConfig, "updatedAt">,
  ) => {
    setSavingMaintenance(true);
    try {
      const res = await adminApi.updateMaintenance(data);
      setMaintenanceConfig(res.data.maintenance);
      window.dispatchEvent(new Event("lexiflash_maintenance_updated"));
      dispatch(
        addToast({
          message: res.data.maintenance?.isActive
            ? "⚠️ Đã KÍCH HOẠT chế độ bảo trì hệ thống thành công!"
            : "✅ Đã TẮT chế độ bảo trì. Hệ thống trở lại bình thường!",
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Lỗi cập nhật cấu hình bảo trì",
          type: "error",
        }),
      );
    } finally {
      setSavingMaintenance(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchBannerConfig();
    fetchMaintenanceConfig();
  }, [fetchStats, fetchBannerConfig, fetchMaintenanceConfig]);

  // Tab activation load
  useEffect(() => {
    if (activeTab === "users") fetchUsers(1);
    if (activeTab === "sets") fetchSets(1);
    if (activeTab === "folders") fetchFolders(1);
    if (activeTab === "groups") fetchGroups(1);
    if (activeTab === "topics") fetchFeaturedTopics();
    if (activeTab === "banner") fetchBannerConfig();
    if (activeTab === "maintenance") fetchMaintenanceConfig();
  }, [
    activeTab,
    fetchUsers,
    fetchSets,
    fetchFolders,
    fetchGroups,
    fetchFeaturedTopics,
    fetchBannerConfig,
    fetchMaintenanceConfig,
  ]);

  // Handle User Role Change
  const handleConfirmRoleChange = async () => {
    if (!actionUser) return;
    setIsProcessing(true);
    const newRole =
      actionUser.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    try {
      await adminApi.updateUserRole(actionUser.id, newRole);
      dispatch(
        addToast({
          message: `User ${actionUser.name} role changed to ${newRole}`,
          type: "success",
        }),
      );
      setUserRoleModalOpen(false);
      setActionUser(null);
      fetchUsers(usersPage);
      fetchStats();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to update role",
          type: "error",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle User Ban/Unban
  const handleConfirmBanToggle = async () => {
    if (!actionUser) return;
    setIsProcessing(true);
    const newBannedState = !actionUser.isBanned;
    try {
      await adminApi.toggleUserBan(actionUser.id, newBannedState);
      dispatch(
        addToast({
          message: `User ${actionUser.name} ${newBannedState ? "suspended" : "reactivated"}`,
          type: "success",
        }),
      );
      setUserBanModalOpen(false);
      setActionUser(null);
      fetchUsers(usersPage);
      fetchStats();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to change user status",
          type: "error",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle User VIP Grant/Extension/Cancellation
  const handleConfirmVipChange = async () => {
    if (!actionUser) return;
    setIsProcessing(true);
    try {
      await adminApi.updateUserVip(actionUser.id, vipPlanToAssign);
      dispatch(
        addToast({
          message:
            vipPlanToAssign === "CANCEL"
              ? `Hủy gói VIP thành công cho người dùng ${actionUser.name}`
              : `Đã cấp gói VIP ${vipPlanToAssign === "1_YEAR" ? "Diamond (1 Năm 💎)" : "Gold (1 Tháng 👑)"} cho ${actionUser.name}!`,
          type: "success",
        }),
      );
      setUserVipModalOpen(false);
      setActionUser(null);
      fetchUsers(usersPage);
      fetchStats();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to update VIP subscription",
          type: "error",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Toggle Featured Set
  const handleToggleFeatured = async (set: any) => {
    const newFeatured = !set.isFeatured;
    try {
      await adminApi.toggleFeaturedSet(set.id, newFeatured);
      dispatch(
        addToast({
          message: `Set "${set.title}" ${newFeatured ? "marked as Featured ⭐" : "unfeatured"}`,
          type: "success",
        }),
      );
      setSetsList((prev) =>
        prev.map((s) =>
          s.id === set.id ? { ...s, isFeatured: newFeatured } : s,
        ),
      );
      fetchStats();
    } catch {
      dispatch(
        addToast({
          message: "Failed to toggle featured status",
          type: "error",
        }),
      );
    }
  };

  // Handle Open Custom Tags Modal
  const handleOpenTagModal = (set: any) => {
    setSelectedSetForTags(set);
    setTagModalOpen(true);
  };

  // Handle Save Custom Tags
  const handleSaveCustomTags = async (tagsArray: string[]) => {
    if (!selectedSetForTags) return;
    setSavingTags(true);
    try {
      const res = await adminApi.updateSetTags(selectedSetForTags.id, tagsArray);
      setSetsList((prev) =>
        prev.map((s) =>
          s.id === selectedSetForTags.id
            ? { ...s, tags: res.data.tags || tagsArray }
            : s,
        ),
      );
      dispatch(
        addToast({
          message: `Tags for "${selectedSetForTags.title}" updated successfully!`,
          type: "success",
        }),
      );
      setTagModalOpen(false);
      setSelectedSetForTags(null);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to update custom tags",
          type: "error",
        }),
      );
    } finally {
      setSavingTags(false);
    }
  };

  // Handle Delete Set
  const handleConfirmDeleteSet = async () => {
    if (!setToDelete) return;
    setIsProcessing(true);
    try {
      await adminApi.deleteSet(setToDelete.id);
      dispatch(
        addToast({
          message: `Study set "${setToDelete.title}" removed permanently`,
          type: "info",
        }),
      );
      setDeleteSetModalOpen(false);
      setSetToDelete(null);
      fetchSets(setsPage);
      fetchStats();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to delete study set",
          type: "error",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Toggle Featured Folder
  const handleToggleFeaturedFolder = async (folder: any) => {
    const newFeatured = !folder.isFeatured;
    try {
      await adminApi.toggleFeaturedFolder(folder.id, newFeatured);
      dispatch(
        addToast({
          message: `Folder "${folder.title}" ${newFeatured ? "marked as Featured ⭐" : "unfeatured"}`,
          type: "success",
        }),
      );
      setFoldersList((prev) =>
        prev.map((f) =>
          f.id === folder.id ? { ...f, isFeatured: newFeatured } : f,
        ),
      );
      fetchStats();
    } catch {
      dispatch(
        addToast({
          message: "Failed to toggle featured status on folder",
          type: "error",
        }),
      );
    }
  };

  // Handle Delete Folder
  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsProcessing(true);
    try {
      await adminApi.deleteFolder(folderToDelete.id);
      dispatch(
        addToast({
          message: `Folder "${folderToDelete.title}" removed permanently`,
          type: "info",
        }),
      );
      setDeleteFolderModalOpen(false);
      setFolderToDelete(null);
      fetchFolders(foldersPage);
      fetchStats();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || "Failed to delete folder",
          type: "error",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1d36] via-[#1f2347] to-[#14162e] border border-[#2e3856] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LexiFlash Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Platform Administration & Content Moderation
            </h1>
            <p className="text-sm text-[#939bb4]">
              Monitor system analytics, manage user roles & security, and curate
              study content.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              fetchStats();
              if (activeTab === "users") fetchUsers(usersPage);
              if (activeTab === "sets") fetchSets(setsPage);
              if (activeTab === "folders") fetchFolders(foldersPage);
              if (activeTab === "groups") fetchGroups(groupsPage);
              if (activeTab === "topics") fetchFeaturedTopics();
              if (activeTab === "banner") fetchBannerConfig();
              if (activeTab === "maintenance") fetchMaintenanceConfig();
            }}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0a092d] border border-[#2e3856] rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "users"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          {stats && (
            <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 text-white font-mono">
              {stats.users.totalUsers}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "sets"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Content Moderation</span>
          {stats && (
            <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 text-white font-mono">
              {stats.content.totalStudySets}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("folders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "folders"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <FolderIcon className="w-4 h-4" />
          <span>Folders</span>
          {stats && (
            <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 text-white font-mono">
              {stats.content.totalFolders}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "groups"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Study Groups</span>
          {stats && (
            <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 text-white font-mono">
              {stats.content.totalStudyGroups}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("topics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "topics"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Featured Topics</span>
          {featuredTopics.length > 0 && (
            <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-white/20 text-white font-mono">
              {featuredTopics.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("banner")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "banner"
              ? "bg-[#4257B2] text-white shadow-lg shadow-indigo-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Top Banner Alert</span>
          {bannerConfig?.isEnabled ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active" />
          ) : (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-[#939bb4]">Off</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "maintenance"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40"
              : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Bảo Trì Hệ Thống</span>
          {maintenanceConfig?.isActive ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Đang bảo trì" />
          ) : (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-[#939bb4]">Tắt</span>
          )}
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "overview" && (
        <AdminOverviewTab
          stats={stats}
          loadingStats={loadingStats}
          onViewAllUsers={() => setActiveTab("users")}
        />
      )}

      {activeTab === "users" && (
        <AdminUsersTab
          usersList={usersList}
          loadingUsers={loadingUsers}
          usersSearch={usersSearch}
          setUsersSearch={setUsersSearch}
          usersRoleFilter={usersRoleFilter}
          setUsersRoleFilter={setUsersRoleFilter}
          usersStatusFilter={usersStatusFilter}
          setUsersStatusFilter={setUsersStatusFilter}
          usersVipFilter={usersVipFilter}
          setUsersVipFilter={setUsersVipFilter}
          usersPage={usersPage}
          usersTotalPages={usersTotalPages}
          onSearch={fetchUsers}
          onOpenVipModal={(u) => {
            setActionUser(u);
            setVipPlanToAssign("1_MONTH");
            setUserVipModalOpen(true);
          }}
          onOpenRoleModal={(u) => {
            setActionUser(u);
            setUserRoleModalOpen(true);
          }}
          onOpenBanModal={(u) => {
            setActionUser(u);
            setUserBanModalOpen(true);
          }}
        />
      )}

      {activeTab === "sets" && (
        <AdminSetsTab
          setsList={setsList}
          loadingSets={loadingSets}
          setsSearch={setsSearch}
          setSetsSearch={setSetsSearch}
          setsPrivacyFilter={setsPrivacyFilter}
          setSetsPrivacyFilter={setSetsPrivacyFilter}
          setsFeaturedFilter={setsFeaturedFilter}
          setSetsFeaturedFilter={setSetsFeaturedFilter}
          setsPage={setsPage}
          setsTotalPages={setsTotalPages}
          onSearch={fetchSets}
          onToggleFeatured={handleToggleFeatured}
          onOpenTagModal={handleOpenTagModal}
          onOpenDeleteModal={(s) => {
            setSetToDelete(s);
            setDeleteSetModalOpen(true);
          }}
        />
      )}

      {activeTab === "folders" && (
        <AdminFoldersTab
          foldersList={foldersList}
          loadingFolders={loadingFolders}
          foldersSearch={foldersSearch}
          setFoldersSearch={setFoldersSearch}
          foldersFeaturedFilter={foldersFeaturedFilter}
          setFoldersFeaturedFilter={setFoldersFeaturedFilter}
          foldersPage={foldersPage}
          foldersTotalPages={foldersTotalPages}
          onSearch={fetchFolders}
          onToggleFeatured={handleToggleFeaturedFolder}
          onOpenDeleteModal={(f) => {
            setFolderToDelete(f);
            setDeleteFolderModalOpen(true);
          }}
        />
      )}

      {activeTab === "groups" && (
        <AdminGroupsTab
          groupsList={groupsList}
          loadingGroups={loadingGroups}
          groupsSearch={groupsSearch}
          setGroupsSearch={setGroupsSearch}
          groupsPage={groupsPage}
          groupsTotalPages={groupsTotalPages}
          onSearch={fetchGroups}
          onCopyJoinCode={(code) => {
            navigator.clipboard.writeText(code);
            dispatch(
              addToast({
                message: `Copied join code: ${code}`,
                type: "success",
              }),
            );
          }}
        />
      )}

      {activeTab === "topics" && (
        <AdminTopicsTab
          topics={featuredTopics}
          onChangeTopics={setFeaturedTopics}
          onSave={handleSaveFeaturedTopics}
          onReset={handleResetFeaturedTopics}
          isSaving={savingTopics}
          isLoading={loadingTopics}
        />
      )}

      {activeTab === "banner" && (
        <AdminBannerTab
          banner={bannerConfig}
          onSave={handleSaveBanner}
          isLoading={loadingBanner}
          isSaving={savingBanner}
        />
      )}

      {activeTab === "maintenance" && (
        <AdminMaintenanceTab
          config={maintenanceConfig}
          onSave={handleSaveMaintenance}
          isLoading={loadingMaintenance}
          isSaving={savingMaintenance}
        />
      )}

      {/* 4. Modals Container */}
      <AdminModals
        actionUser={actionUser}
        userRoleModalOpen={userRoleModalOpen}
        onCloseRoleModal={() => {
          setUserRoleModalOpen(false);
          setActionUser(null);
        }}
        onConfirmRoleChange={handleConfirmRoleChange}
        userVipModalOpen={userVipModalOpen}
        vipPlanToAssign={vipPlanToAssign}
        onChangeVipPlan={setVipPlanToAssign}
        onCloseVipModal={() => {
          setUserVipModalOpen(false);
          setActionUser(null);
        }}
        onConfirmVipChange={handleConfirmVipChange}
        userBanModalOpen={userBanModalOpen}
        onCloseBanModal={() => {
          setUserBanModalOpen(false);
          setActionUser(null);
        }}
        onConfirmBanToggle={handleConfirmBanToggle}
        setToDelete={setToDelete}
        deleteSetModalOpen={deleteSetModalOpen}
        onCloseDeleteSetModal={() => {
          setDeleteSetModalOpen(false);
          setSetToDelete(null);
        }}
        onConfirmDeleteSet={handleConfirmDeleteSet}
        folderToDelete={folderToDelete}
        deleteFolderModalOpen={deleteFolderModalOpen}
        onCloseDeleteFolderModal={() => {
          setDeleteFolderModalOpen(false);
          setFolderToDelete(null);
        }}
        onConfirmDeleteFolder={handleConfirmDeleteFolder}
        tagModalOpen={tagModalOpen}
        selectedSetForTags={selectedSetForTags}
        onCloseTagModal={() => {
          setTagModalOpen(false);
          setSelectedSetForTags(null);
        }}
        onSaveCustomTags={handleSaveCustomTags}
        savingTags={savingTags}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default AdminDashboardPage;
