import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute } from "./components/auth/AdminRoute";

// Lazy-loaded page components for optimal bundle splitting and performance
const HomePage = lazy(() =>
  import("./pages/Home/HomePage").then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import("./pages/Auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/Auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
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
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
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
