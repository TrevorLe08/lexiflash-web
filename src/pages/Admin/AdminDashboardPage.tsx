import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { adminApi, AdminOverviewStats } from "../../api/adminApi";
import { UserRole, PrivacyLevel } from "../../types";
import { useAppDispatch } from "../../store/store";
import { addToast } from "../../store/slices/uiSlice";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { Modal } from "../../components/common/Modal";
import { useForm } from "react-hook-form";
import { Pagination } from "../../components/common/Pagination";
import { Select } from "../../components/common/Select";
import { cn } from "../../utils/cn";
import {
  ShieldCheck,
  BarChart3,
  Users,
  Layers,
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  Lock,
  Globe,
  Flame,
  Award,
  RefreshCw,
  ExternalLink,
  BookOpen,
  BrainCircuit,
  Headphones,
  FileCheck2,
  Gamepad2,
  PenLine,
  UserX,
  UserCheck,
  Crown,
  Sparkles,
  Tag,
  Plus,
  RotateCcw,
  Save,
  Hash,
  Eye,
} from "lucide-react";

type AdminTab = "overview" | "users" | "sets" | "groups" | "topics";

// ==========================================
// TanStack Headless Users Table Component
// ==========================================
interface AdminUsersTableProps {
  data: any[];
  onOpenVipModal: (user: any) => void;
  onOpenRoleModal: (user: any) => void;
  onOpenBanModal: (user: any) => void;
}

const userColumnHelper = createColumnHelper<any>();

const AdminUsersTable: React.FC<AdminUsersTableProps> = React.memo(
  ({ data, onOpenVipModal, onOpenRoleModal, onOpenBanModal }) => {
    const columns = useMemo(
      () => [
        userColumnHelper.accessor("name", {
          header: "User",
          cell: (info) => {
            const u = info.row.original;
            return (
              <div className="flex items-center gap-3">
                <img
                  src={
                    u.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      u.username,
                    )}`
                  }
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover bg-[#2e3856] shrink-0"
                />
                <div className="min-w-0">
                  <Link
                    to={`/users/${u.id}`}
                    className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1 transition-colors"
                  >
                    <span>{u.name}</span>
                    <ExternalLink className="w-3 h-3 text-[#939bb4]" />
                  </Link>
                  <p className="text-[11px] text-[#939bb4] truncate">
                    @{u.username} • {u.email}
                  </p>
                </div>
              </div>
            );
          },
        }),
        userColumnHelper.accessor("role", {
          header: "Role",
          cell: (info) => {
            const role = info.getValue();
            return (
              <span
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                  role === UserRole.ADMIN
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                }`}
              >
                {role}
              </span>
            );
          },
        }),
        userColumnHelper.accessor("isVip", {
          header: "VIP & Limits",
          cell: (info) => {
            const u = info.row.original;
            if (u.role === UserRole.ADMIN) {
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>Admin</span>
                </span>
              );
            }
            if (
              u.isVip ||
              (u.vipExpiresAt &&
                new Date(u.vipExpiresAt).getTime() > Date.now())
            ) {
              return (
                <div className="space-y-0.5">
                  {u.vipPlan === "1_YEAR" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>VIP Diamond</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>VIP Gold</span>
                    </span>
                  )}
                  <p className="text-[10px] text-[#939bb4]">
                    HSD:{" "}
                    {u.vipExpiresAt
                      ? new Date(u.vipExpiresAt).toLocaleDateString("vi-VN")
                      : "Hoạt động"}
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-[#939bb4]">
                  Miễn phí
                </span>
                <p className="text-[10px] text-[#6c7289]">
                  {u.stats?.totalCardsOwned || 0}/300 từ
                </p>
              </div>
            );
          },
        }),
        userColumnHelper.accessor("streakCount", {
          header: "Study Streak",
          cell: (info) => {
            const u = info.row.original;
            return (
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Flame
                  className={`w-4 h-4 ${
                    u.isStreakActiveToday && u.streakCount > 0
                      ? "text-amber-400 fill-amber-400 animate-pulse"
                      : u.streakCount > 0
                        ? "text-slate-400 fill-slate-500/40"
                        : "text-gray-600 fill-gray-700/20"
                  }`}
                />
                <span>{u.streakCount} days</span>
              </div>
            );
          },
        }),
        userColumnHelper.accessor((row) => row.stats?.totalSetsCreated || 0, {
          id: "setsCreated",
          header: "Sets Created",
          cell: (info) => (
            <span className="font-semibold text-white">{info.getValue()}</span>
          ),
        }),
        userColumnHelper.accessor((row) => row.stats?.totalCardsMastered || 0, {
          id: "mastered",
          header: "Mastered",
          cell: (info) => (
            <span className="font-semibold text-emerald-400">
              {info.getValue()} cards
            </span>
          ),
        }),
        userColumnHelper.accessor("isBanned", {
          header: "Status",
          cell: (info) => {
            const isBanned = info.getValue();
            return isBanned ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                <XCircle className="w-3 h-3" />
                Suspended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            );
          },
        }),
        userColumnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: (info) => {
            const u = info.row.original;
            return (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onOpenVipModal(u)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cấp hoặc Gia hạn gói VIP"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP</span>
                </button>
                <button
                  onClick={() => onOpenRoleModal(u)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0a092d] hover:bg-[#2e3856] text-[#d9dde8] font-semibold text-xs border border-[#2e3856] transition-colors cursor-pointer"
                  title="Promote or Demote Role"
                >
                  {u.role === UserRole.ADMIN ? "Demote" : "Make Admin"}
                </button>
                <button
                  onClick={() => onOpenBanModal(u)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    u.isBanned
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                  }`}
                  title={u.isBanned ? "Reactivate User" : "Suspend User"}
                >
                  {u.isBanned ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          },
        }),
      ],
      [onOpenVipModal, onOpenRoleModal, onOpenBanModal],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[#2e3856] bg-[#0a092d]/60 text-[#939bb4] uppercase tracking-wider font-bold"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#2e3856]/60 text-[#d9dde8]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#202547]/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

// ==========================================
// TanStack Headless Sets Table Component
// ==========================================
interface AdminSetsTableProps {
  data: any[];
  onToggleFeatured: (set: any) => void;
  onOpenTagModal: (set: any) => void;
  onOpenDeleteModal: (set: any) => void;
}

const setColumnHelper = createColumnHelper<any>();

const AdminSetsTable: React.FC<AdminSetsTableProps> = React.memo(
  ({ data, onToggleFeatured, onOpenTagModal, onOpenDeleteModal }) => {
    const columns = useMemo(
      () => [
        setColumnHelper.accessor("title", {
          header: "Study Set",
          cell: (info) => {
            const s = info.row.original;
            return (
              <div>
                <Link
                  to={`/sets/${s.id}`}
                  className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1.5 transition-colors"
                >
                  <span>{s.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#939bb4]" />
                </Link>
                <div className="flex items-center gap-2 text-[10px] text-[#939bb4] mt-0.5">
                  <span>{s.level}</span>
                  <span>•</span>
                  <span>{s.viewCount || 0} views</span>
                </div>
                {s.tags && s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.tags.slice(0, 3).map((tg: string) => (
                      <span
                        key={tg}
                        className="text-[10px] font-medium text-[#9cb1ff] bg-[#4f5fd8]/15 border border-[#4f5fd8]/25 px-1.5 py-0.2 rounded"
                      >
                        #{tg}
                      </span>
                    ))}
                    {s.tags.length > 3 && (
                      <span className="text-[10px] text-[#8e98b0]">
                        +{s.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          },
        }),
        setColumnHelper.accessor((row) => row.creator?.name || "Unknown", {
          id: "creator",
          header: "Creator",
          cell: (info) => (
            <span className="font-medium text-white">{info.getValue()}</span>
          ),
        }),
        setColumnHelper.accessor(
          (row) => row.cardCount || row.cards?.length || 0,
          {
            id: "cardCount",
            header: "Cards",
            cell: (info) => (
              <span className="font-bold text-indigo-400">
                {info.getValue()} terms
              </span>
            ),
          },
        ),
        setColumnHelper.accessor("privacy", {
          header: "Privacy",
          cell: (info) => {
            const privacy = info.getValue();
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#939bb4]">
                {privacy === PrivacyLevel.PUBLIC ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Private</span>
                  </>
                )}
              </span>
            );
          },
        }),
        setColumnHelper.accessor("isFeatured", {
          header: "Featured Badge",
          cell: (info) => {
            const s = info.row.original;
            return (
              <button
                onClick={() => onToggleFeatured(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  s.isFeatured
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                    : "bg-[#0a092d] text-[#6b7280] border border-[#2e3856] hover:text-[#d9dde8]"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${s.isFeatured ? "fill-amber-300" : ""}`}
                />
                <span>{s.isFeatured ? "Featured ⭐" : "Standard"}</span>
              </button>
            );
          },
        }),
        setColumnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Moderation Actions</div>,
          cell: (info) => {
            const s = info.row.original;
            return (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onOpenTagModal(s)}
                  className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                  title="Chỉnh sửa Custom Tags cho bộ từ vựng này"
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenDeleteModal(s)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                  title="Delete this set (Spam/Inappropriate content)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          },
        }),
      ],
      [onToggleFeatured, onOpenTagModal, onOpenDeleteModal],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[#2e3856] bg-[#0a092d]/60 text-[#939bb4] uppercase tracking-wider font-bold"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#2e3856]/60 text-[#d9dde8]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#202547]/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

// ==========================================
// TanStack Headless Groups Table Component
// ==========================================
interface AdminGroupsTableProps {
  data: any[];
  onCopyJoinCode: (code: string) => void;
}

const groupColumnHelper = createColumnHelper<any>();

const AdminGroupsTable: React.FC<AdminGroupsTableProps> = React.memo(
  ({ data, onCopyJoinCode }) => {
    const columns = useMemo(
      () => [
        groupColumnHelper.accessor("name", {
          header: "Study Group",
          cell: (info) => {
            const g = info.row.original;
            return (
              <div>
                <Link
                  to={`/classes/${g.id}`}
                  className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1.5 transition-colors"
                >
                  <span>{g.name}</span>
                  <ExternalLink className="w-3 h-3 text-[#939bb4]" />
                </Link>
                {g.description && (
                  <p className="text-[11px] text-[#939bb4] truncate max-w-xs mt-0.5">
                    {g.description}
                  </p>
                )}
              </div>
            );
          },
        }),
        groupColumnHelper.accessor("joinCode", {
          header: "Join Code",
          cell: (info) => {
            const code = info.getValue();
            return (
              <span
                onClick={() => code && onCopyJoinCode(code)}
                className="font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/25 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Click to copy join code"
              >
                <span>{code || "N/A"}</span>
                <span className="text-[10px] text-amber-400/70">📋</span>
              </span>
            );
          },
        }),
        groupColumnHelper.accessor((row) => row.creator?.name || "Unknown", {
          id: "creator",
          header: "Creator",
          cell: (info) => (
            <span className="font-medium text-white">{info.getValue()}</span>
          ),
        }),
        groupColumnHelper.accessor((row) => row.members?.length || 0, {
          id: "members",
          header: "Members",
          cell: (info) => (
            <span className="font-semibold text-emerald-400">
              {info.getValue()} members
            </span>
          ),
        }),
        groupColumnHelper.accessor((row) => row.studySets?.length || 0, {
          id: "studySets",
          header: "Study Sets",
          cell: (info) => (
            <span className="font-semibold text-indigo-400">
              {info.getValue()} sets
            </span>
          ),
        }),
        groupColumnHelper.display({
          id: "actions",
          header: () => <div className="text-right">View</div>,
          cell: (info) => {
            const g = info.row.original;
            return (
              <div className="text-right">
                <Link to={`/classes/${g.id}`}>
                  <Button variant="secondary" size="sm">
                    Open Group
                  </Button>
                </Link>
              </div>
            );
          },
        }),
      ],
      [onCopyJoinCode],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[#2e3856] bg-[#0a092d]/60 text-[#939bb4] uppercase tracking-wider font-bold"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#2e3856]/60 text-[#d9dde8]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#202547]/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

// ==========================================
// TanStack / React Hook Form Custom Tags Modal
// ==========================================
interface AdminCustomTagsModalProps {
  isOpen: boolean;
  selectedSet: any | null;
  onClose: () => void;
  onSave: (tags: string[]) => Promise<void>;
  isSaving: boolean;
}

const AdminCustomTagsModal: React.FC<AdminCustomTagsModalProps> = React.memo(
  ({ isOpen, selectedSet, onClose, onSave, isSaving }) => {
    const { register, handleSubmit, reset } = useForm<{ tags: string }>({
      defaultValues: {
        tags: "",
      },
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Custom Tags"
      >
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
// Admin Featured Topics Management Component
// ==========================================
const DEFAULT_TOPICS_LIST = [
  "Speaking",
  "IELTS",
  "Daily English",
  "Business",
  "Workplace",
  "Academic",
  "Writing",
  "Reading",
  "Negotiation",
  "Communication",
];

interface AdminTopicsManagementProps {
  topics: string[];
  onChangeTopics: (newTopics: string[]) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

const AdminTopicsManagement: React.FC<AdminTopicsManagementProps> = React.memo(
  ({ topics, onChangeTopics, onSave, onReset, isSaving, isLoading }) => {
    const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm<{ topic: string }>({
      defaultValues: { topic: "" },
    });

    const handleAddTopic = (data: { topic: string }) => {
      const clean = data.topic.trim().replace(/^#+/, "");
      if (!clean) {
        setError("topic", { message: "Vui lòng nhập tên chủ đề" });
        return;
      }
      if (topics.some((t) => t.toLowerCase() === clean.toLowerCase())) {
        setError("topic", { message: `Chủ đề "${clean}" đã có trong danh sách` });
        return;
      }
      onChangeTopics([...topics, clean]);
      reset({ topic: "" });
    };

    const handleRemoveTopic = (indexToRemove: number) => {
      onChangeTopics(topics.filter((_, idx) => idx !== indexToRemove));
    };

    const handleMoveTopic = (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= topics.length) return;
      const copy = [...topics];
      const [moved] = copy.splice(index, 1);
      if (moved) {
        copy.splice(newIndex, 0, moved);
        onChangeTopics(copy);
      }
    };

    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[#9cb1ff] text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Quản lý chủ đề trang chủ (Featured Topics)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Tùy chỉnh danh sách chủ đề nổi bật trên Homepage
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] max-w-2xl">
                Các hashtag chủ đề này sẽ được hiển thị trực tiếp ở thanh lọc khám phá đầu trang chủ.
                Người học có thể bấm vào để lọc nhanh các học phần tương ứng.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={onReset}
                icon={<RotateCcw className="w-4 h-4 text-[#939bb4]" />}
                className="cursor-pointer"
              >
                Khôi phục mặc định
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onSave}
                disabled={isSaving || isLoading}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Homepage Preview */}
        <div className="bg-[#0f111a] border border-[#2e3856] rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>Xem trước trên Trang chủ (Live Homepage Preview)</span>
            </div>
            <span className="text-xs text-[#939bb4] font-mono">
              {topics.length} chủ đề đang hoạt động
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0a092d] border border-white/[0.08] overflow-x-auto">
            <div className="flex flex-wrap items-center gap-1.5 min-w-max">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#4f5fd8]/20 text-[#9cb1ff] border border-[#4f5fd8]/40">
                Tất cả chủ đề
              </span>
              {topics.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#121420] text-[#8e98b0] border border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
              {topics.length === 0 && (
                <span className="text-xs text-[#545d78] italic py-1">
                  Chưa có chủ đề nào được chọn. Hãy thêm chủ đề bên dưới.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add and Manage Tags Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Add New Topic Form */}
          <div className="lg:col-span-5 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Plus className="w-4 h-4 text-[#6366F1]" />
              <span>Thêm chủ đề mới</span>
            </div>
            <p className="text-xs text-[#939bb4]">
              Nhập tên chủ đề (VD: TOEIC, Travel, Pronunciation, Phrasal Verbs) rồi bấm Thêm hoặc nhấn Enter.
            </p>

            <form onSubmit={handleSubmit(handleAddTopic)} className="space-y-3">
              <div className="relative">
                <Hash className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ví dụ: Daily English"
                  {...register("topic")}
                  className="w-full bg-[#0a092d] text-white placeholder-[#545d78] border border-[#2e3856] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#4257B2]"
                />
              </div>
              {errors.topic && (
                <p className="text-xs text-rose-400 font-medium">
                  {errors.topic.message}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center cursor-pointer"
                icon={<Plus className="w-4 h-4" />}
              >
                Thêm vào danh sách
              </Button>
            </form>

            <div className="pt-4 border-t border-[#2e3856] space-y-2">
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Gợi ý phổ biến:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Grammar",
                  "Vocabulary",
                  "TOEIC 800+",
                  "Travel",
                  "Phrasal Verbs",
                  "Idioms",
                  "Pronunciation",
                  "Oxford 3000",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    disabled={topics.some((t) => t.toLowerCase() === sug.toLowerCase())}
                    onClick={() => {
                      if (!topics.some((t) => t.toLowerCase() === sug.toLowerCase())) {
                        onChangeTopics([...topics, sug]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      topics.some((t) => t.toLowerCase() === sug.toLowerCase())
                        ? "bg-[#0a092d]/50 text-[#545d78] border border-transparent cursor-not-allowed"
                        : "bg-[#0a092d] text-[#939bb4] hover:text-white border border-[#2e3856] hover:border-[#6366F1]"
                    }`}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Current Topic Items List */}
          <div className="lg:col-span-7 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Danh sách chủ đề hiện tại ({topics.length})</span>
              </div>
              <span className="text-xs text-[#939bb4]">
                Kéo hoặc chuyển vị trí để sắp xếp thứ tự hiển thị
              </span>
            </div>

            {isLoading ? (
              <Spinner size="md" label="Đang tải chủ đề..." className="py-12" />
            ) : topics.length === 0 ? (
              <div className="text-center py-12 bg-[#0a092d] rounded-xl border border-dashed border-[#2e3856] space-y-2">
                <Tag className="w-8 h-8 text-[#545d78] mx-auto" />
                <p className="text-sm font-semibold text-white">Chưa có chủ đề nào</p>
                <p className="text-xs text-[#939bb4]">
                  Nhập chủ đề ở khung bên trái hoặc nhấn "Khôi phục mặc định"
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {topics.map((topic, index) => (
                  <div
                    key={`${topic}-${index}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a092d] border border-[#2e3856] hover:border-[#4257B2] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-[#1a1d36] text-[#939bb4] font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-[#9cb1ff] transition-colors truncate">
                        #{topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveTopic(index, "up")}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          index === 0
                            ? "text-[#545d78] cursor-not-allowed opacity-40"
                            : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
                        }`}
                        title="Di chuyển lên trước"
                      >
                        ▲
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === topics.length - 1}
                        onClick={() => handleMoveTopic(index, "down")}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          index === topics.length - 1
                            ? "text-[#545d78] cursor-not-allowed opacity-40"
                            : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
                        }`}
                        title="Di chuyển xuống sau"
                      >
                        ▼
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(index)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors ml-1 cursor-pointer"
                        title="Xóa chủ đề này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

// ==========================================
// Pure SVG Interactive Donut Chart for Study Modes
// Zero external libraries, maximum render performance
// ==========================================
interface StudyModesDonutSectionProps {
  modeDistribution?: Record<string, { count: number; percentage: number }>;
  totalSessions: number;
}

const STUDY_MODES_CONFIG = [
  {
    key: "FLASHCARDS",
    label: "Flashcards Mode",
    subLabel: "Basic memorization",
    shortLabel: "Flashcards",
    color: "#6366F1", // Indigo
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Icon: BookOpen,
  },
  {
    key: "LEARN",
    label: "Learn Mode (SRS)",
    subLabel: "Spaced repetition (SRS)",
    shortLabel: "Learn SRS",
    color: "#8B5CF6", // Purple
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Icon: BrainCircuit,
  },
  {
    key: "WRITE",
    label: "Listening & Dictation",
    subLabel: "Audio listening & spelling",
    shortLabel: "Dictation",
    color: "#10B981", // Emerald Green
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Icon: Headphones,
  },
  {
    key: "CLOZE",
    label: "Fill in the Blanks",
    subLabel: "Contextual cloze sentences",
    shortLabel: "Cloze",
    color: "#06B6D4", // Cyan
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Icon: PenLine,
  },
  {
    key: "TEST",
    label: "Practice Test",
    subLabel: "Exam simulation",
    shortLabel: "Test",
    color: "#F59E0B", // Amber
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Icon: FileCheck2,
  },
  {
    key: "MATCH",
    label: "Match Speed Game",
    subLabel: "Timed tile pairing",
    shortLabel: "Match",
    color: "#EC4899", // Pink
    badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Icon: Gamepad2,
  },
];

const CIRCUMFERENCE = 2 * Math.PI * 56; // Radius = 56, circumference ≈ 351.86

const StudyModesDonutSection: React.FC<StudyModesDonutSectionProps> = React.memo(
  ({ modeDistribution = {}, totalSessions = 0 }) => {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    // Calculate arc slices
    const { slices, totalCount } = useMemo(() => {
      let sum = 0;
      STUDY_MODES_CONFIG.forEach((m) => {
        sum += modeDistribution[m.key]?.count || 0;
      });

      const effectiveTotal = sum > 0 ? sum : totalSessions;
      let accumulated = 0;

      const computed = STUDY_MODES_CONFIG.map((m) => {
        const item = modeDistribution[m.key];
        const count = item?.count || 0;
        const percentage =
          effectiveTotal > 0
            ? Math.round((count / effectiveTotal) * 1000) / 10
            : 0;
        const ratio = effectiveTotal > 0 ? count / effectiveTotal : 0;
        const arcLength = ratio * CIRCUMFERENCE;
        const offset = -accumulated;
        accumulated += arcLength;

        return {
          ...m,
          count,
          percentage,
          arcLength,
          offset,
        };
      });

      return { slices: computed, totalCount: effectiveTotal };
    }, [modeDistribution, totalSessions]);

    const activeHoveredSlice = useMemo(
      () => slices.find((s) => s.key === hoveredKey) || null,
      [slices, hoveredKey],
    );

    // Active slices count for spacing
    const nonZeroSlices = useMemo(
      () => slices.filter((s) => s.count > 0),
      [slices],
    );

    return (
      <div className="lg:col-span-2 bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Study Modes Activity Distribution
            </h3>
            <p className="text-xs text-[#939bb4]">
              Interactive breakdown of student sessions across all 5 learning modalities
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {totalCount} Total Runs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          {/* Donut Chart SVG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full transform -rotate-90 origin-center select-none"
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#232a45"
                  strokeWidth="14"
                />

                {/* Slices */}
                {totalCount > 0 &&
                  slices.map((slice) => {
                    if (slice.count <= 0) return null;
                    const isHovered = hoveredKey === slice.key;
                    const gap = nonZeroSlices.length > 1 ? 2 : 0;
                    const strokeDash = Math.max(0, slice.arcLength - gap);

                    return (
                      <circle
                        key={slice.key}
                        cx="80"
                        cy="80"
                        r="56"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 18 : 14}
                        strokeDasharray={`${strokeDash} ${CIRCUMFERENCE - strokeDash}`}
                        strokeDashoffset={slice.offset}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          opacity: hoveredKey ? (isHovered ? 1 : 0.35) : 1,
                          filter: isHovered
                            ? `drop-shadow(0 0 6px ${slice.color}90)`
                            : "none",
                        }}
                        onMouseEnter={() => setHoveredKey(slice.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                      />
                    );
                  })}
              </svg>

              {/* Central Hole Info Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                {activeHoveredSlice ? (
                  <div className="flex flex-col items-center px-2 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#939bb4] truncate max-w-[85px]">
                      {activeHoveredSlice.shortLabel}
                    </span>
                    <span className="text-2xl font-black text-white leading-tight">
                      {activeHoveredSlice.count}
                    </span>
                    <span
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 border"
                      style={{
                        color: activeHoveredSlice.color,
                        backgroundColor: `${activeHoveredSlice.color}15`,
                        borderColor: `${activeHoveredSlice.color}30`,
                      }}
                    >
                      {activeHoveredSlice.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white tracking-tight leading-none">
                      {totalCount}
                    </span>
                    <span className="text-[11px] font-semibold text-[#939bb4] uppercase tracking-wider mt-1">
                      Runs
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#939bb4] text-center mt-2">
              Di chuột để xem chi tiết
            </p>
          </div>

          {/* Interactive Legend List */}
          <div className="md:col-span-7 space-y-2">
            {slices.map((item) => {
              const isHovered = hoveredKey === item.key;
              const IconComp = item.Icon;

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredKey(item.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className={cn(
                    "p-2.5 rounded-xl border transition-all duration-200 cursor-pointer space-y-1.5",
                    isHovered
                      ? "bg-[#252b47] border-[#4b5580] shadow-md translate-x-1"
                      : "bg-[#14172b]/60 border-[#252c48] hover:bg-[#1e233d]",
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <IconComp
                        className="w-4 h-4 shrink-0"
                        style={{ color: item.color }}
                      />
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="font-bold text-white">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#939bb4] hidden sm:inline">
                          • {item.subLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-white">
                        {item.count}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                          item.badgeBg,
                        )}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#0a092d] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

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

  // Debounced search states to prevent UI lag while typing
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState(usersSearch);
  const [debouncedSetsSearch, setDebouncedSetsSearch] = useState(setsSearch);
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

  // 4. Fetch Groups
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

  // 5. Fetch Featured Topics
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers(1);
    if (activeTab === "sets") fetchSets(1);
    if (activeTab === "groups") fetchGroups(1);
    if (activeTab === "topics") fetchFeaturedTopics();
  }, [activeTab, fetchUsers, fetchSets, fetchGroups, fetchFeaturedTopics]);

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
              if (activeTab === "groups") fetchGroups(groupsPage);
              if (activeTab === "topics") fetchFeaturedTopics();
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
      </div>

      {/* 3. TAB CONTENT */}

      {/* --- TAB 1: OVERVIEW & ANALYTICS --- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {loadingStats && !stats ? (
            <Spinner
              size="lg"
              label="Loading system metrics..."
              className="py-20"
            />
          ) : stats ? (
            <>
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Users Metric */}
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#4257B2]/20 border border-[#4257B2]/40 text-[#6366F1] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {stats.users.activeTodayCount} Active Today
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                      Total Accounts
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {stats.users.totalUsers}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#2e3856]/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1 text-cyan-300 font-bold">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>VIP Diamond:</span>
                        </span>
                        <span className="font-mono font-bold text-white">
                          {stats.users.vipDiamondCount ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>VIP Gold:</span>
                        </span>
                        <span className="font-mono font-bold text-white">
                          {stats.users.vipGoldCount ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#939bb4]">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Active Streaks:</span>
                        </span>
                        <span className="font-mono font-bold text-white">
                          {stats.users.activeStreakCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Study Sets Metric */}
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" />
                      {stats.content.featuredSets} Featured
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                      Study Sets
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {stats.content.totalStudySets}
                    </div>
                    <p className="text-[11px] text-[#939bb4] mt-1">
                      {stats.content.publicSets} Public •{" "}
                      {stats.content.privateSets} Private
                    </p>
                  </div>
                </div>

                {/* Vocabulary Cards Metric */}
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-md">
                      {stats.content.totalFolders} Folders
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                      Vocabulary Cards
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {stats.content.totalCards}
                    </div>
                    <p className="text-[11px] text-[#939bb4] mt-1">
                      Average ~
                      {stats.content.totalStudySets > 0
                        ? Math.round(
                            stats.content.totalCards /
                              stats.content.totalStudySets,
                          )
                        : 0}{" "}
                      cards/set
                    </p>
                  </div>
                </div>

                {/* Study Sessions Metric */}
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md">
                      Avg Score {stats.activity.averageTestScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                      Study Sessions
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {stats.activity.totalStudySessions}
                    </div>
                    <p className="text-[11px] text-[#939bb4] mt-1">
                      {stats.activity.totalTestsTaken} tests completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Distribution & Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 5 Study Modes Usage Breakdown (Interactive Pure SVG Donut Chart) */}
                <StudyModesDonutSection
                  modeDistribution={stats.activity.modeDistribution}
                  totalSessions={stats.activity.totalStudySessions}
                />

                {/* Recent Registrations Quick Card */}
                <div className="bg-[#1a1d36] border border-[#2e3856] rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">
                      Recent Signups
                    </h3>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-xs text-[#6366F1] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stats.recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a092d] border border-[#2e3856]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              u.avatarUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                u.username,
                              )}`
                            }
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#2e3856]"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-[#939bb4] truncate">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === UserRole.ADMIN
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* --- TAB 2: USER MANAGEMENT --- */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Controls Filter Bar */}
          <div className="bg-[#1a1f30] border border-[#262e48] rounded-2xl p-4 space-y-3.5 shadow-sm">
            {/* Top row: Search input + Selects + Apply */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#939bb4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search user by name, username or email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchUsers(1);
                  }}
                  className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none transition-colors"
                />
              </div>

              {/* Role, Status & VIP Tier Custom Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Select
                  value={usersRoleFilter}
                  onChange={(val) => setUsersRoleFilter(val)}
                  options={[
                    {
                      value: "ALL",
                      label: "All Roles",
                      icon: <Users className="w-3.5 h-3.5 text-[#939bb4]" />,
                    },
                    {
                      value: UserRole.USER,
                      label: "Learners (USER)",
                      icon: <UserCheck className="w-3.5 h-3.5 text-blue-400" />,
                    },
                    {
                      value: UserRole.ADMIN,
                      label: "Admins (ADMIN)",
                      icon: (
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      ),
                    },
                  ]}
                />

                <Select
                  value={usersStatusFilter}
                  onChange={(val) => setUsersStatusFilter(val)}
                  options={[
                    {
                      value: "ALL",
                      label: "All Status",
                      icon: <Users className="w-3.5 h-3.5 text-[#939bb4]" />,
                    },
                    {
                      value: "ACTIVE",
                      label: "Active Accounts",
                      icon: (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ),
                    },
                    {
                      value: "BANNED",
                      label: "Suspended Accounts",
                      icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
                    },
                  ]}
                />

                <Select
                  value={usersVipFilter}
                  onChange={(val) => {
                    setUsersVipFilter(val);
                  }}
                  options={[
                    {
                      value: "ALL",
                      label: "All Tiers",
                      icon: <Users className="w-3.5 h-3.5 text-[#939bb4]" />,
                    },
                    {
                      value: "VIP_DIAMOND",
                      label: "VIP Diamond",
                      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
                    },
                    {
                      value: "VIP_GOLD",
                      label: "VIP Gold",
                      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
                    },
                    {
                      value: "FREE",
                      label: "Free Learners",
                      icon: <UserCheck className="w-3.5 h-3.5 text-[#939bb4]" />,
                    },
                    {
                      value: "ADMIN",
                      label: "Admin",
                      icon: (
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      ),
                    },
                  ]}
                />

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => fetchUsers(1)}
                  className="h-9 px-4 font-bold"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Quick VIP Tier Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#262e48]/60">
              <span className="text-xs text-[#939bb4] font-medium mr-1.5 flex items-center gap-1">
                Lọc nhanh theo hạng:
              </span>
              {[
                { id: "ALL", label: "Tất cả" },
                {
                  id: "VIP_DIAMOND",
                  label: "VIP Diamond 💎",
                  activeCls:
                    "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs shadow-cyan-500/20",
                },
                {
                  id: "VIP_GOLD",
                  label: "VIP Gold 👑",
                  activeCls:
                    "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs shadow-amber-500/20",
                },
                {
                  id: "FREE",
                  label: "Miễn phí",
                  activeCls: "bg-white/15 text-white border-white/30",
                },
                {
                  id: "ADMIN",
                  label: "Admin 🛡️",
                  activeCls:
                    "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-xs shadow-purple-500/20",
                },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    setUsersVipFilter(pill.id);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                    usersVipFilter === pill.id
                      ? pill.activeCls ||
                          "bg-[#4f5fd8] text-white border-[#4f5fd8]"
                      : "bg-[#131722] text-[#939bb4] border-[#262e48] hover:text-white hover:bg-[#242b42]",
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl overflow-hidden shadow-xl">
            {loadingUsers ? (
              <Spinner size="lg" label="Loading users..." className="py-20" />
            ) : usersList.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Users className="w-10 h-10 text-[#586380] mx-auto" />
                <p className="text-sm text-[#939bb4]">
                  No users found matching query.
                </p>
              </div>
            ) : (
              <AdminUsersTable
                data={usersList}
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
          </div>

          {/* Pagination */}
          {usersTotalPages > 1 && (
            <Pagination
              currentPage={usersPage}
              totalPages={usersTotalPages}
              onPageChange={(p) => fetchUsers(p)}
            />
          )}
        </div>
      )}

      {/* --- TAB 3: CONTENT MODERATION (STUDY SETS) --- */}
      {activeTab === "sets" && (
        <div className="space-y-4">
          {/* Filter controls */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-4 bg-[#1a1f30] border border-[#262e48] rounded-2xl shadow-sm">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#939bb4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sets by title or tags..."
                value={setsSearch}
                onChange={(e) => setSetsSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchSets(1);
                }}
                className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none transition-colors"
              />
            </div>

            {/* Privacy & Featured Custom Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Select
                value={setsPrivacyFilter}
                onChange={(val) => setSetsPrivacyFilter(val)}
                options={[
                  {
                    value: "ALL",
                    label: "All Privacy",
                    icon: <Layers className="w-3.5 h-3.5 text-[#939bb4]" />,
                  },
                  {
                    value: PrivacyLevel.PUBLIC,
                    label: "Public",
                    icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
                  },
                  {
                    value: PrivacyLevel.PRIVATE,
                    label: "Private",
                    icon: <Lock className="w-3.5 h-3.5 text-amber-400" />,
                  },
                  {
                    value: PrivacyLevel.PASSWORD,
                    label: "Password Protected",
                    icon: <Lock className="w-3.5 h-3.5 text-indigo-400" />,
                  },
                ]}
              />

              <Select
                value={setsFeaturedFilter}
                onChange={(val) => setSetsFeaturedFilter(val)}
                options={[
                  {
                    value: "ALL",
                    label: "All Sets",
                    icon: <Layers className="w-3.5 h-3.5 text-[#939bb4]" />,
                  },
                  {
                    value: "FEATURED",
                    label: "⭐ Featured Only",
                    icon: (
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    ),
                  },
                  {
                    value: "NORMAL",
                    label: "Regular Only",
                    icon: <BookOpen className="w-3.5 h-3.5 text-[#939bb4]" />,
                  },
                ]}
              />

              <Button
                variant="primary"
                size="sm"
                onClick={() => fetchSets(1)}
                className="h-9 px-4 font-bold"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Sets Table */}
          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl overflow-hidden shadow-xl">
            {loadingSets ? (
              <Spinner
                size="lg"
                label="Loading study sets..."
                className="py-20"
              />
            ) : setsList.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Layers className="w-10 h-10 text-[#586380] mx-auto" />
                <p className="text-sm text-[#939bb4]">No study sets found.</p>
              </div>
            ) : (
              <AdminSetsTable
                data={setsList}
                onToggleFeatured={handleToggleFeatured}
                onOpenTagModal={handleOpenTagModal}
                onOpenDeleteModal={(s) => {
                  setSetToDelete(s);
                  setDeleteSetModalOpen(true);
                }}
              />
            )}
          </div>

          {/* Pagination */}
          {setsTotalPages > 1 && (
            <Pagination
              currentPage={setsPage}
              totalPages={setsTotalPages}
              onPageChange={(p) => fetchSets(p)}
            />
          )}
        </div>
      )}

      {/* --- TAB 4: STUDY GROUPS --- */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#1a1f30] border border-[#262e48] rounded-2xl shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-[#939bb4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search study groups by name..."
                value={groupsSearch}
                onChange={(e) => setGroupsSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchGroups(1);
                }}
                className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl overflow-hidden shadow-xl">
            {loadingGroups ? (
              <Spinner
                size="lg"
                label="Loading study groups..."
                className="py-20"
              />
            ) : groupsList.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <GraduationCap className="w-10 h-10 text-[#586380] mx-auto" />
                <p className="text-sm text-[#939bb4]">No study groups found.</p>
              </div>
            ) : (
              <AdminGroupsTable
                data={groupsList}
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
          </div>

          {groupsTotalPages > 1 && (
            <Pagination
              currentPage={groupsPage}
              totalPages={groupsTotalPages}
              onPageChange={(p) => fetchGroups(p)}
            />
          )}
        </div>
      )}

      {/* --- TAB 5: FEATURED TOPICS MANAGEMENT --- */}
      {activeTab === "topics" && (
        <AdminTopicsManagement
          topics={featuredTopics}
          onChangeTopics={setFeaturedTopics}
          onSave={handleSaveFeaturedTopics}
          onReset={handleResetFeaturedTopics}
          isSaving={savingTopics}
          isLoading={loadingTopics}
        />
      )}

      {/* --- ROLE CHANGE MODAL --- */}
      {actionUser && (
        <Modal
          isOpen={userRoleModalOpen}
          onClose={() => {
            setUserRoleModalOpen(false);
            setActionUser(null);
          }}
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
                onClick={() => {
                  setUserRoleModalOpen(false);
                  setActionUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmRoleChange}
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
          onClose={() => {
            setUserVipModalOpen(false);
            setActionUser(null);
          }}
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
                    onChange={() => setVipPlanToAssign("1_MONTH")}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Cấp Gói VIP Gold (1 Tháng)</span>
                    </p>
                    <p className="text-[11px] text-[#939bb4]">
                      20 lượt AI/ngày, không giới hạn thẻ học, huy hiệu Gold 👑
                      (+30 ngày).
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
                    onChange={() => setVipPlanToAssign("1_YEAR")}
                    className="accent-cyan-400 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Cấp Gói VIP Diamond Elite (1 Năm)</span>
                    </p>
                    <p className="text-[11px] text-[#939bb4]">
                      40 lượt AI/ngày (gấp đôi), Early Access Beta, huy hiệu
                      Diamond 💎 (+365 ngày).
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
                    onChange={() => setVipPlanToAssign("CANCEL")}
                    className="accent-rose-400 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-rose-400">
                      Hủy gói VIP (Chuyển về Miễn phí)
                    </p>
                    <p className="text-[11px] text-[#939bb4]">
                      Thu hồi quyền tạo trên 300 thẻ và tắt quyền sử dụng AI
                      ngay lập tức.
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
                onClick={() => {
                  setUserVipModalOpen(false);
                  setActionUser(null);
                }}
              >
                Đóng
              </Button>
              <Button
                variant={vipPlanToAssign === "CANCEL" ? "danger" : "primary"}
                size="md"
                onClick={handleConfirmVipChange}
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
          onClose={() => {
            setUserBanModalOpen(false);
            setActionUser(null);
          }}
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
                onClick={() => {
                  setUserBanModalOpen(false);
                  setActionUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionUser.isBanned ? "primary" : "danger"}
                size="md"
                onClick={handleConfirmBanToggle}
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
          onClose={() => {
            setDeleteSetModalOpen(false);
            setSetToDelete(null);
          }}
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
                onClick={() => {
                  setDeleteSetModalOpen(false);
                  setSetToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDeleteSet}
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
        onClose={() => {
          setTagModalOpen(false);
          setSelectedSetForTags(null);
        }}
        onSave={handleSaveCustomTags}
        isSaving={savingTags}
      />
    </div>
  );
};
