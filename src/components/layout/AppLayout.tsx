import React, { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { TopBannerNotification } from "./TopBannerNotification";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { ToastContainer } from "../common/ToastContainer";
import { Spinner } from "../common/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { checkCurrentUser } from "../../store/slices/authSlice";
import { fetchDueReviews } from "../../store/slices/studySlice";
import { systemApi } from "../../api/systemApi";
import { MaintenanceConfig } from "../../types/system.types";
import { MaintenancePage } from "../../pages/Maintenance/MaintenancePage";
import { UserRole } from "../../types";
import { Wrench, ArrowRight, AlertTriangle } from "lucide-react";

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchMaintenance = useCallback(async () => {
    try {
      const res = await systemApi.getMaintenance();
      setMaintenanceConfig(res.data.maintenance);
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
    const onMaintenanceUpdated = () => {
      fetchMaintenance();
    };
    window.addEventListener("lexiflash_maintenance_updated", onMaintenanceUpdated);
    return () => {
      window.removeEventListener("lexiflash_maintenance_updated", onMaintenanceUpdated);
    };
  }, [fetchMaintenance]);

  // When switching routes/pages, default to top of page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    }
  }, [location.pathname]);

  useEffect(() => {
    dispatch(checkCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDueReviews(undefined));
    }
  }, [dispatch, isAuthenticated]);

  const isMaintenanceActive = Boolean(maintenanceConfig?.isActive);

  // If maintenance is active and user is NOT an Admin
  if (isMaintenanceActive && !isAdmin) {
    // Keep /login and /admin/login open for administrators to log in
    if (location.pathname === "/login" || location.pathname === "/admin/login") {
      const isAdminLogin = location.pathname === "/admin/login";
      return (
        <div className="min-h-screen bg-[#131722] text-[#f1f3f9] flex flex-col selection:bg-[#4f5fd8]/30 selection:text-white">
          <div
            className={`${
              isAdminLogin ? "bg-purple-700" : "bg-amber-600"
            } text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isAdminLogin
                ? "Hệ thống đang bảo trì. Vui lòng đăng nhập bằng tài khoản Quản trị viên để quản lý hệ thống."
                : "Hệ thống đang ở chế độ bảo trì. Chỉ tài khoản Quản trị viên (Admin) mới có thể truy cập sau khi đăng nhập."}
            </span>
          </div>
          <main
            ref={mainRef}
            className="flex-1 p-3.5 sm:p-6 lg:p-8 flex items-center justify-center min-w-0"
          >
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[45vh] py-12">
                  <Spinner size="lg" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
          <ToastContainer />
        </div>
      );
    }

    // All other routes: display pure Maintenance Page without any navbars or sidebars
    return (
      <>
        <MaintenancePage
          config={maintenanceConfig}
          onRefresh={fetchMaintenance}
        />
        <ToastContainer />
      </>
    );
  }

  // Normal view (or Admin viewing the site during maintenance)
  return (
    <div className="min-h-screen bg-[#131722] text-[#f1f3f9] flex flex-col selection:bg-[#4f5fd8]/30 selection:text-white">
      {/* Sticky Top Warning Bar for Admins when maintenance is active */}
      {isMaintenanceActive && isAdmin && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 animate-bounce shrink-0" />
            <span>
              ⚠️ CHẾ ĐỘ BẢO TRÌ ĐANG BẬT — Người dùng thông thường và khách đang
              thấy màn hình bảo trì.
            </span>
          </div>
          <Link
            to="/admin"
            className="bg-black/20 hover:bg-black/30 border border-white/20 px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-bold shrink-0 ml-2"
          >
            <span>Quản lý bảo trì</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <Navbar />
      <TopBannerNotification />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main
          ref={mainRef}
          className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-32 sm:pb-28 md:pb-12 overflow-y-auto min-w-0"
        >
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[45vh] py-12">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
      <MobileNav />
      <ToastContainer />
    </div>
  );
};
