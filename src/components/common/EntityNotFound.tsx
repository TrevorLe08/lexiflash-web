import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import {
  FolderX,
  FileQuestion,
  UsersRound,
  Compass,
  ArrowLeft,
  Home,
  Plus,
  Search,
} from "lucide-react";
import { useTranslation } from "../../i18n";

export type NotFoundEntityType = "folder" | "set" | "group" | "general";

interface EntityNotFoundProps {
  type: NotFoundEntityType;
  title?: string;
  description?: string;
  customAction?: React.ReactNode;
  className?: string;
}

export const EntityNotFound: React.FC<EntityNotFoundProps> = ({
  type,
  title,
  description,
  customAction,
  className = "",
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const config = {
    folder: {
      defaultTitle: t(
        "notFound.folderTitle",
        undefined,
        "Không tìm thấy thư mục",
      ),
      defaultDesc: t(
        "notFound.folderDesc",
        undefined,
        "Thư mục bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.",
      ),
      icon: <FolderX className="w-12 h-12 text-amber-400" />,
      glowColor: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30",
      primaryBtnText: t(
        "notFound.exploreFolders",
        undefined,
        "Khám phá các thư mục",
      ),
      primaryBtnLink: "/folders",
      createBtnLink: "/folders",
      createBtnText: "Tạo thư mục mới",
    },
    set: {
      defaultTitle: t(
        "notFound.setTitle",
        undefined,
        "Không tìm thấy học phần",
      ),
      defaultDesc: t(
        "notFound.setDesc",
        undefined,
        "Học phần này không tồn tại, đã bị tác giả xóa hoặc đang được đặt ở chế độ riêng tư.",
      ),
      icon: <FileQuestion className="w-12 h-12 text-[#818cf8]" />,
      glowColor: "from-indigo-500/20 to-purple-500/10",
      borderColor: "border-indigo-500/30",
      primaryBtnText: t(
        "notFound.exploreSets",
        undefined,
        "Khám phá các học phần",
      ),
      primaryBtnLink: "/",
      createBtnLink: "/sets/create",
      createBtnText: "Tạo học phần mới",
    },
    group: {
      defaultTitle: t(
        "notFound.groupTitle",
        undefined,
        "Không tìm thấy nhóm học",
      ),
      defaultDesc: t(
        "notFound.groupDesc",
        undefined,
        "Lớp học / nhóm học này không tồn tại, mã tham gia không hợp lệ hoặc nhóm đã bị giải tán.",
      ),
      icon: <UsersRound className="w-12 h-12 text-cyan-400" />,
      glowColor: "from-cyan-500/20 to-blue-500/10",
      borderColor: "border-cyan-500/30",
      primaryBtnText: t(
        "notFound.exploreGroups",
        undefined,
        "Danh sách lớp học",
      ),
      primaryBtnLink: "/classes",
      createBtnLink: "/classes",
      createBtnText: "Tham gia hoặc tạo lớp",
    },
    general: {
      defaultTitle: t(
        "notFound.pageTitle",
        undefined,
        "Không tìm thấy trang này (404)",
      ),
      defaultDesc: t(
        "notFound.pageDesc",
        undefined,
        "Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ khác.",
      ),
      icon: <Compass className="w-12 h-12 text-rose-400" />,
      glowColor: "from-rose-500/20 to-pink-500/10",
      borderColor: "border-rose-500/30",
      primaryBtnText: t("notFound.goHome", undefined, "Về trang chủ"),
      primaryBtnLink: "/",
      createBtnLink: "/",
      createBtnText: "Tìm kiếm nội dung",
    },
  }[type];

  return (
    <div
      className={`max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center ${className}`}
    >
      <div
        className={`relative bg-[#1a1d36] border ${config.borderColor} rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br ${config.glowColor} rounded-full blur-3xl pointer-events-none`}
        />

        <div className="relative z-10 space-y-6">
          {/* Entity Icon Container */}
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#0f1225] border border-[#2e3856] shadow-inner shadow-black/40">
            {config.icon}
          </div>

          {/* Text Info */}
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title || config.defaultTitle}
            </h2>
            <p className="text-sm text-[#939bb4] max-w-md mx-auto leading-relaxed">
              {description || config.defaultDesc}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {customAction ? (
              customAction
            ) : (
              <>
                <Link to={config.primaryBtnLink} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto font-bold"
                    icon={<Search className="w-4 h-4" />}
                  >
                    {config.primaryBtnText}
                  </Button>
                </Link>

                <Link to={config.createBtnLink} className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full sm:w-auto font-medium"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    {config.createBtnText}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto text-[#939bb4] hover:text-white"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Quay lại
                </Button>
              </>
            )}
          </div>

          {/* Back to Home Link */}
          <div className="pt-4 border-t border-[#2e3856]/60">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#939bb4] hover:text-[#6366f1] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ LexiFlash</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
