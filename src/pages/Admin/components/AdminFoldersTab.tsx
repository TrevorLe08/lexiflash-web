import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PrivacyLevel } from "../../../types";
import { Button } from "../../../components/common/Button";
import { Spinner } from "../../../components/common/Spinner";
import { Pagination } from "../../../components/common/Pagination";
import { Select } from "../../../components/common/Select";
import {
  Search,
  Star,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  Folder as FolderIcon,
} from "lucide-react";

// ==========================================
// TanStack Headless Folders Table Component
// ==========================================
interface AdminFoldersTableProps {
  data: any[];
  onToggleFeatured: (folder: any) => void;
  onOpenDeleteModal: (folder: any) => void;
}

const folderColumnHelper = createColumnHelper<any>();

export const AdminFoldersTable: React.FC<AdminFoldersTableProps> = React.memo(
  ({ data, onToggleFeatured, onOpenDeleteModal }) => {
    const columns = useMemo(
      () => [
        folderColumnHelper.accessor("title", {
          header: "Folder",
          cell: (info) => {
            const f = info.row.original;
            return (
              <div>
                <Link
                  to={`/folders/${f.id}`}
                  className="font-bold text-white hover:text-[#6366F1] flex items-center gap-1.5 transition-colors"
                >
                  <FolderIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{f.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#939bb4]" />
                </Link>
                {f.description && (
                  <p className="text-[11px] text-[#939bb4] truncate max-w-xs mt-0.5">
                    {f.description}
                  </p>
                )}
              </div>
            );
          },
        }),
        folderColumnHelper.accessor((row) => row.creator?.name || "Unknown", {
          id: "creator",
          header: "Creator",
          cell: (info) => (
            <span className="font-medium text-white">{info.getValue()}</span>
          ),
        }),
        folderColumnHelper.accessor(
          (row) =>
            row.setCount ??
            row.studySetIds?.length ??
            row.studySets?.length ??
            0,
          {
            id: "setCount",
            header: "Sets",
            cell: (info) => (
              <span className="font-bold text-indigo-400">
                {info.getValue()} sets
              </span>
            ),
          },
        ),
        folderColumnHelper.accessor("privacy", {
          header: "Privacy",
          cell: (info) => {
            const privacy = info.getValue();
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#939bb4]">
                {privacy === PrivacyLevel.PUBLIC || !privacy ? (
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
        folderColumnHelper.accessor("isFeatured", {
          header: "Featured Badge",
          cell: (info) => {
            const f = info.row.original;
            return (
              <button
                type="button"
                onClick={() => onToggleFeatured(f)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  f.isFeatured
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                    : "bg-[#0a092d] text-[#6b7280] border border-[#2e3856] hover:text-[#d9dde8]"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${f.isFeatured ? "fill-amber-300" : ""}`}
                />
                <span>{f.isFeatured ? "Featured ⭐" : "Standard"}</span>
              </button>
            );
          },
        }),
        folderColumnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Moderation Actions</div>,
          cell: (info) => {
            const f = info.row.original;
            return (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDeleteModal(f)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                  title="Delete this folder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          },
        }),
      ],
      [onToggleFeatured, onOpenDeleteModal],
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
// Admin Folders Tab Component
// ==========================================
export interface AdminFoldersTabProps {
  foldersList: any[];
  loadingFolders: boolean;
  foldersSearch: string;
  setFoldersSearch: (val: string) => void;
  foldersFeaturedFilter: string;
  setFoldersFeaturedFilter: (val: string) => void;
  foldersPage: number;
  foldersTotalPages: number;
  onSearch: (page?: number) => void;
  onToggleFeatured: (folder: any) => void;
  onOpenDeleteModal: (folder: any) => void;
}

export const AdminFoldersTab: React.FC<AdminFoldersTabProps> = React.memo(
  ({
    foldersList,
    loadingFolders,
    foldersSearch,
    setFoldersSearch,
    foldersFeaturedFilter,
    setFoldersFeaturedFilter,
    foldersPage,
    foldersTotalPages,
    onSearch,
    onToggleFeatured,
    onOpenDeleteModal,
  }) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#1a1f30] border border-[#262e48] rounded-2xl shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#939bb4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search folders by title..."
              value={foldersSearch}
              onChange={(e) => setFoldersSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch(1);
              }}
              className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none transition-colors"
            />
          </div>

          {/* Featured Filter */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Select
              value={foldersFeaturedFilter}
              onChange={(val) => setFoldersFeaturedFilter(val)}
              options={[
                {
                  value: "ALL",
                  label: "All Folders",
                  icon: <FolderIcon className="w-3.5 h-3.5 text-[#939bb4]" />,
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
                  icon: <FolderIcon className="w-3.5 h-3.5 text-[#939bb4]" />,
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

        {/* Folders Table */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl overflow-hidden shadow-xl">
          {loadingFolders ? (
            <Spinner
              size="lg"
              label="Loading folders..."
              className="py-20"
            />
          ) : foldersList.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <FolderIcon className="w-10 h-10 text-[#586380] mx-auto" />
              <p className="text-sm text-[#939bb4]">No folders found.</p>
            </div>
          ) : (
            <AdminFoldersTable
              data={foldersList}
              onToggleFeatured={onToggleFeatured}
              onOpenDeleteModal={onOpenDeleteModal}
            />
          )}
        </div>

        {/* Pagination */}
        {foldersTotalPages > 1 && (
          <Pagination
            currentPage={foldersPage}
            totalPages={foldersTotalPages}
            onPageChange={(p) => onSearch(p)}
          />
        )}
      </div>
    );
  },
);
