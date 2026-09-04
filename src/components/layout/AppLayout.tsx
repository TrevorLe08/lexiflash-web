import React, { useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { ToastContainer } from "../common/ToastContainer";
import { Spinner } from "../common/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { checkCurrentUser } from "../../store/slices/authSlice";
import { fetchDueReviews } from "../../store/slices/studySlice";

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(checkCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDueReviews(undefined));
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#131722] text-[#f1f3f9] flex flex-col selection:bg-[#4f5fd8]/30 selection:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-32 sm:pb-28 md:pb-12 overflow-y-auto min-w-0">
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
