import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UserRole } from "../../../types";
import { Button } from "../../../components/common/Button";
import { Spinner } from "../../../components/common/Spinner";
import { Pagination } from "../../../components/common/Pagination";
import { Select } from "../../../components/common/Select";
import { cn } from "../../../utils/cn";
import {
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Flame,
  ExternalLink,
  UserX,
  UserCheck,
  Crown,
  Sparkles,
} from "lucide-react";

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

export const AdminUsersTable: React.FC<AdminUsersTableProps> = React.memo(
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
                  type="button"
                  onClick={() => onOpenVipModal(u)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cấp hoặc Gia hạn gói VIP"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRoleModal(u)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0a092d] hover:bg-[#2e3856] text-[#d9dde8] font-semibold text-xs border border-[#2e3856] transition-colors cursor-pointer"
                  title="Promote or Demote Role"
                >
                  {u.role === UserRole.ADMIN ? "Demote" : "Make Admin"}
                </button>
                <button
                  type="button"
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
// Admin Users Tab Component
// ==========================================
export interface AdminUsersTabProps {
  usersList: any[];
  loadingUsers: boolean;
  usersSearch: string;
  setUsersSearch: (val: string) => void;
  usersRoleFilter: string;
  setUsersRoleFilter: (val: string) => void;
  usersStatusFilter: string;
  setUsersStatusFilter: (val: string) => void;
  usersVipFilter: string;
  setUsersVipFilter: (val: string) => void;
  usersPage: number;
  usersTotalPages: number;
  onSearch: (page?: number) => void;
  onOpenVipModal: (user: any) => void;
  onOpenRoleModal: (user: any) => void;
  onOpenBanModal: (user: any) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = React.memo(
  ({
    usersList,
    loadingUsers,
    usersSearch,
    setUsersSearch,
    usersRoleFilter,
    setUsersRoleFilter,
    usersStatusFilter,
    setUsersStatusFilter,
    usersVipFilter,
    setUsersVipFilter,
    usersPage,
    usersTotalPages,
    onSearch,
    onOpenVipModal,
    onOpenRoleModal,
    onOpenBanModal,
  }) => {
    return (
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
                  if (e.key === "Enter") onSearch(1);
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
                onChange={(val) => setUsersVipFilter(val)}
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
                onClick={() => onSearch(1)}
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
                type="button"
                key={pill.id}
                onClick={() => setUsersVipFilter(pill.id)}
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
              onOpenVipModal={onOpenVipModal}
              onOpenRoleModal={onOpenRoleModal}
              onOpenBanModal={onOpenBanModal}
            />
          )}
        </div>

        {/* Pagination */}
        {usersTotalPages > 1 && (
          <Pagination
            currentPage={usersPage}
            totalPages={usersTotalPages}
            onPageChange={(p) => onSearch(p)}
          />
        )}
      </div>
    );
  },
);
