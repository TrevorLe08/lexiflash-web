import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Plus, Timer, User } from "lucide-react";
import { useAppSelector } from "../../store/store";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

export const MobileNav: React.FC = () => {
  const { isVietnamese } = useTranslation();
  const dueReviews = useAppSelector((state) => state.study.dueReviews);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const items = [
    {
      to: "/",
      label: isVietnamese ? "Trang chủ" : "Home",
      icon: Home,
    },
    {
      to: "/reviews",
      label: isVietnamese ? "Ôn tập" : "Reviews",
      icon: BookOpen,
      badge:
        dueReviews.length > 0
          ? dueReviews.length > 99
            ? "99+"
            : dueReviews.length
          : null,
    },
    {
      to: "/sets/create",
      label: isVietnamese ? "Tạo thẻ" : "Create",
      icon: Plus,
      isAction: true,
    },
    {
      to: "/study-room",
      label: isVietnamese ? "Góc học" : "Study",
      icon: Timer,
    },
    {
      to: isAuthenticated ? "/profile" : "/login",
      label: isAuthenticated
        ? isVietnamese
          ? "Cá nhân"
          : "Profile"
        : isVietnamese
          ? "Đăng nhập"
          : "Log in",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#131722] border-t border-white/[0.08] px-2 py-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-3.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-[#4f5fd8] text-white flex items-center justify-center shadow-lg shadow-[#4f5fd8]/30 border-2 border-[#131722] active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-[#8e98b0] group-hover:text-white mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative w-full active:scale-95",
                  isActive ? "text-white" : "text-[#8e98b0] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-transform",
                        isActive
                          ? "text-[#4f5fd8] scale-105"
                          : "text-[#8e98b0]",
                      )}
                    />
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[14px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-0.5 whitespace-nowrap tracking-tight",
                      isActive ? "font-bold text-white" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#4f5fd8] mt-0.5 absolute bottom-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
