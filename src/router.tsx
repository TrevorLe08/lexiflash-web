/* eslint-disable react-refresh/only-export-components */
import React, { lazy } from "react";
import {
  createBrowserRouter,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute } from "./components/auth/AdminRoute";

function RouteErrorBoundary() {
  const error = useRouteError();
  let errorMessage = "Đã xảy ra sự cố không mong muốn khi tải trang.";

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}: ${String(error.data || "Không thể tải tài nguyên")}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Đã xảy ra sự cố</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 break-words">
          {errorMessage}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại trang
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

// Lazy-loaded page components for optimal bundle splitting and performance
const HomePage = lazy(() =>
  import("./pages/Home/HomePage").then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import("./pages/Auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const AdminLoginPage = lazy(() =>
  import("./pages/Auth/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("./pages/Auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/Auth/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/Auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const VIPPricingPage = lazy(() =>
  import("./pages/VIP/VIPPricingPage").then((m) => ({
    default: m.VIPPricingPage,
  })),
);
const StudyRoomPage = lazy(() =>
  import("./pages/StudyRoom/StudyRoomPage").then((m) => ({
    default: m.StudyRoomPage,
  })),
);
const SetEditorPage = lazy(() =>
  import("./pages/SetEditor/SetEditorPage").then((m) => ({
    default: m.SetEditorPage,
  })),
);
const StudySetDetailPage = lazy(() =>
  import("./pages/StudySet/StudySetDetailPage").then((m) => ({
    default: m.StudySetDetailPage,
  })),
);
const FlashcardsMode = lazy(() =>
  import("./pages/Modes/FlashcardsMode").then((m) => ({
    default: m.FlashcardsMode,
  })),
);
const LearnMode = lazy(() =>
  import("./pages/Modes/LearnMode").then((m) => ({ default: m.LearnMode })),
);
const WriteMode = lazy(() =>
  import("./pages/Modes/WriteMode").then((m) => ({ default: m.WriteMode })),
);
const TestMode = lazy(() =>
  import("./pages/Modes/TestMode").then((m) => ({ default: m.TestMode })),
);
const MatchMode = lazy(() =>
  import("./pages/Modes/MatchMode").then((m) => ({ default: m.MatchMode })),
);
const ClozeMode = lazy(() =>
  import("./pages/Modes/ClozeMode").then((m) => ({ default: m.ClozeMode })),
);
const AIGeneratorPage = lazy(() =>
  import("./pages/AI/AIGeneratorPage").then((m) => ({
    default: m.AIGeneratorPage,
  })),
);
const FoldersPage = lazy(() =>
  import("./pages/Folders/FoldersPage").then((m) => ({
    default: m.FoldersPage,
  })),
);
const FolderDetailPage = lazy(() =>
  import("./pages/Folders/FolderDetailPage").then((m) => ({
    default: m.FolderDetailPage,
  })),
);
const ClassesPage = lazy(() =>
  import("./pages/Classes/ClassesPage").then((m) => ({
    default: m.ClassesPage,
  })),
);
const ClassDetailPage = lazy(() =>
  import("./pages/Classes/ClassDetailPage").then((m) => ({
    default: m.ClassDetailPage,
  })),
);
const DueReviewsPage = lazy(() =>
  import("./pages/Reviews/DueReviewsPage").then((m) => ({
    default: m.DueReviewsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/Profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const UserProfilePage = lazy(() =>
  import("./pages/Profile/UserProfilePage").then((m) => ({
    default: m.UserProfilePage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("./pages/Admin/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFound/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);
const FolderNotFoundPage = lazy(() =>
  import("./pages/NotFound/FolderNotFoundPage").then((m) => ({
    default: m.FolderNotFoundPage,
  })),
);
const SetNotFoundPage = lazy(() =>
  import("./pages/NotFound/SetNotFoundPage").then((m) => ({
    default: m.SetNotFoundPage,
  })),
);
const GroupNotFoundPage = lazy(() =>
  import("./pages/NotFound/GroupNotFoundPage").then((m) => ({
    default: m.GroupNotFoundPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "admin/login", Component: AdminLoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
      { path: "vip", Component: VIPPricingPage },
      { path: "pricing", Component: VIPPricingPage },
      { path: "study-room", Component: StudyRoomPage },
      { path: "sets/create", Component: SetEditorPage },
      { path: "sets/:id", Component: StudySetDetailPage },
      { path: "sets/:id/edit", Component: SetEditorPage },
      { path: "sets/:id/flashcards", Component: FlashcardsMode },
      { path: "sets/:id/learn", Component: LearnMode },
      { path: "sets/:id/write", Component: WriteMode },
      { path: "sets/:id/test", Component: TestMode },
      { path: "sets/:id/match", Component: MatchMode },
      { path: "sets/:id/cloze", Component: ClozeMode },
      { path: "ai-generator", Component: AIGeneratorPage },
      { path: "folders", Component: FoldersPage },
      { path: "folders/:id", Component: FolderDetailPage },
      { path: "classes", Component: ClassesPage },
      { path: "classes/:id", Component: ClassDetailPage },
      { path: "reviews", Component: DueReviewsPage },
      { path: "profile", Component: ProfilePage },
      { path: "users/:id", Component: UserProfilePage },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      { path: "not-found/folder", Component: FolderNotFoundPage },
      { path: "not-found/set", Component: SetNotFoundPage },
      { path: "not-found/group", Component: GroupNotFoundPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
