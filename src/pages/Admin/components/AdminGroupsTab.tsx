import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../components/common/Button";
import { Spinner } from "../../../components/common/Spinner";
import { Pagination } from "../../../components/common/Pagination";
import { Search, GraduationCap, ExternalLink } from "lucide-react";

// ==========================================
// TanStack Headless Groups Table Component
// ==========================================
interface AdminGroupsTableProps {
  data: any[];
  onCopyJoinCode: (code: string) => void;
}

const groupColumnHelper = createColumnHelper<any>();

export const AdminGroupsTable: React.FC<AdminGroupsTableProps> = React.memo(
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
// Admin Groups Tab Component
// ==========================================
export interface AdminGroupsTabProps {
  groupsList: any[];
  loadingGroups: boolean;
  groupsSearch: string;
  setGroupsSearch: (val: string) => void;
  groupsPage: number;
  groupsTotalPages: number;
  onSearch: (page?: number) => void;
  onCopyJoinCode: (code: string) => void;
}

export const AdminGroupsTab: React.FC<AdminGroupsTabProps> = React.memo(
  ({
    groupsList,
    loadingGroups,
    groupsSearch,
    setGroupsSearch,
    groupsPage,
    groupsTotalPages,
    onSearch,
    onCopyJoinCode,
  }) => {
    return (
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
                if (e.key === "Enter") onSearch(1);
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
              onCopyJoinCode={onCopyJoinCode}
            />
          )}
        </div>

        {groupsTotalPages > 1 && (
          <Pagination
            currentPage={groupsPage}
            totalPages={groupsTotalPages}
            onPageChange={(p) => onSearch(p)}
          />
        )}
      </div>
    );
  },
);
