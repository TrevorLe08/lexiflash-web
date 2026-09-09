import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { UserRole } from "../../types";
import { addToast } from "../../store/slices/uiSlice";
import { parseJwt, checkCurrentUser } from "../../store/slices/authSlice";
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
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Re-verify against server-side session whenever entering Admin routes
    if (isAuthenticated) {
      setIsVerifying(true);
      dispatch(checkCurrentUser()).finally(() => {
        setIsVerifying(false);
      });
    }
  }, [dispatch, isAuthenticated]);

  const token = localStorage.getItem("lexiflash_access_token");
  const jwtData = token ? parseJwt(token) : null;
  const isTokenAdmin =
    jwtData?.role === UserRole.ADMIN &&
    (!jwtData.exp || jwtData.exp * 1000 > Date.now());
  const isUserAdmin = user?.role === UserRole.ADMIN;
  const isAuthorizedAdmin = isAuthenticated && isTokenAdmin && isUserAdmin;

  useEffect(() => {
    if (isAuthenticated && !isVerifying && !isAuthorizedAdmin) {
      dispatch(
        addToast({
          message:
            "Access Denied: You must be an Administrator to view this page.",
          type: "error",
        }),
      );
    }
  }, [isAuthenticated, isVerifying, isAuthorizedAdmin, dispatch]);

  if (loading || isVerifying) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorizedAdmin) {
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
            This portal is strictly restricted to verified system
            administrators. Your account does not have sufficient permissions.
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
