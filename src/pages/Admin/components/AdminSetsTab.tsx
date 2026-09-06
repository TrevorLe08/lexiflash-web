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
  Layers,
  Search,
  Star,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  BookOpen,
  Tag,
} from "lucide-react";

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

export const AdminSetsTable: React.FC<AdminSetsTableProps> = React.memo(
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
                type="button"
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
                  type="button"
                  onClick={() => onOpenTagModal(s)}
                  className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                  title="Chỉnh sửa Custom Tags cho bộ từ vựng này"
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  type="button"
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
// Admin Sets Tab Component
// ==========================================
export interface AdminSetsTabProps {
  setsList: any[];
  loadingSets: boolean;
  setsSearch: string;
  setSetsSearch: (val: string) => void;
  setsPrivacyFilter: string;
  setSetsPrivacyFilter: (val: string) => void;
  setsFeaturedFilter: string;
  setSetsFeaturedFilter: (val: string) => void;
  setsPage: number;
  setsTotalPages: number;
  onSearch: (page?: number) => void;
  onToggleFeatured: (set: any) => void;
  onOpenTagModal: (set: any) => void;
  onOpenDeleteModal: (set: any) => void;
}

export const AdminSetsTab: React.FC<AdminSetsTabProps> = React.memo(
  ({
    setsList,
    loadingSets,
    setsSearch,
    setSetsSearch,
    setsPrivacyFilter,
    setSetsPrivacyFilter,
    setsFeaturedFilter,
    setSetsFeaturedFilter,
    setsPage,
    setsTotalPages,
    onSearch,
    onToggleFeatured,
    onOpenTagModal,
    onOpenDeleteModal,
  }) => {
    return (
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
                if (e.key === "Enter") onSearch(1);
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
              onClick={() => onSearch(1)}
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
              onToggleFeatured={onToggleFeatured}
              onOpenTagModal={onOpenTagModal}
              onOpenDeleteModal={onOpenDeleteModal}
            />
          )}
        </div>

        {/* Pagination */}
        {setsTotalPages > 1 && (
          <Pagination
            currentPage={setsPage}
            totalPages={setsTotalPages}
            onPageChange={(p) => onSearch(p)}
          />
        )}
      </div>
    );
  },
);
