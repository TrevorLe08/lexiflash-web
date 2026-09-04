import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { UserRole } from "../../types";
import { addToast } from "../../store/slices/uiSlice";
import { ShieldAlert } from "lucide-react";
import { Button } from "../common/Button";
import { Link } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated && user && user.role !== UserRole.ADMIN) {
      dispatch(
        addToast({
          message:
            "Access Denied: You must be an Administrator to view this page.",
          type: "error",
        }),
      );
    }
  }, [isAuthenticated, user, dispatch]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Administrator Access Required
          </h2>
          <p className="text-sm text-[#939bb4]">
            This portal is strictly restricted to system administrators. Your
            account does not have sufficient permissions.
          </p>
        </div>
        <Link to="/">
          <Button variant="secondary" size="md">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
