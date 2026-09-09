import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { adminLoginUser } from "../../store/slices/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { UserRole } from "../../types";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export const AdminLoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth,
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as Admin, redirect directly to Admin Dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.ADMIN) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password) {
      setError(
        "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu quản trị.",
      );
      return;
    }

    const result = await dispatch(
      adminLoginUser({ loginIdentifier: trimmedIdentifier, password }),
    );

    if (adminLoginUser.fulfilled.match(result)) {
      navigate("/admin");
    } else {
      setError(
        (result.payload as string) ||
          "Thông tin đăng nhập không hợp lệ hoặc tài khoản không có quyền Quản trị viên.",
      );
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#939bb4] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Trở về Trang chủ LexiFlash</span>
        </Link>

        {/* Security Card */}
        <div className="bg-[#121526]/90 border border-purple-500/25 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-purple-950/30 backdrop-blur-xl space-y-6 relative overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Header & Icon */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/25 blur-xl rounded-2xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#231b42] to-[#16142a] border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-900/40">
                <ShieldCheck className="w-9 h-9" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Lock className="w-3 h-3 text-purple-400" />
                <span>Cổng Quản Trị Hệ Thống</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Đăng nhập Quản trị viên
              </h1>
              <p className="text-xs text-[#939bb4] mt-1.5 leading-relaxed">
                Khu vực kiểm soát bảo mật dành riêng cho Quản trị viên hệ thống
                LexiFlash.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-purple-200/90 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Chỉ các tài khoản có phân quyền{" "}
              <strong>Quản trị viên (ADMIN)</strong> mới có thể đăng nhập. Tài
              khoản học viên thông thường sẽ bị từ chối.
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-300 animate-fade-in leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên đăng nhập hoặc Email Quản trị"
              placeholder="admin hoặc admin@lexiflash.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#939bb4] mb-1.5">
                Mật khẩu Quản trị
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu tài khoản Admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#939bb4] hover:text-white transition-colors cursor-pointer p-1 rounded-lg focus:outline-none"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 font-bold mt-2"
              loading={loading}
              icon={<KeyRound className="w-4 h-4" />}
            >
              Xác thực & Truy cập Quản trị
            </Button>
          </form>

          {/* Regular Login Link */}
          <div className="text-center text-xs text-[#939bb4] pt-4 border-t border-white/[0.07] flex items-center justify-between">
            <span>Bạn là học viên thông thường?</span>
            <Link
              to="/login"
              className="text-purple-400 font-bold hover:text-purple-300 hover:underline transition-colors"
            >
              Đăng nhập thường →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
