import { createBrowserRouter } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import NotFoundPage from "@/components/layout/NotFoundPage";
import RootLayout from "@/components/layout/RootLayout";
import GuestOnly from "@/features/auth/GuestOnly";
import LoginPage from "@/features/auth/LoginPage";
import RequireAuth from "@/features/auth/RequireAuth";
import SignupPage from "@/features/auth/SignupPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import LeadDetailPage from "@/features/leads/LeadDetailPage";
import LeadsPage from "@/features/leads/LeadsPage";
import PipelinePage from "@/features/pipeline/PipelinePage";
import FollowUpsPage from "@/features/follow-ups/FollowUpsPage";
import ProjectDetailPage from "@/features/projects/ProjectDetailPage";
import ProjectsPage from "@/features/projects/ProjectsPage";
import AiOutreachPage from "@/features/ai-outreach/AiOutreachPage";
import ReportsPage from "@/features/reports/ReportsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import RequirePasswordRecovery from "@/features/auth/RequirePasswordRecovery";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      {
        element: <RequirePasswordRecovery />,
        children: [
          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "leads", element: <LeadsPage /> },
              { path: "leads/:leadId", element: <LeadDetailPage /> },
              { path: "pipeline", element: <PipelinePage /> },
              { path: "follow-ups", element: <FollowUpsPage /> },
              { path: "projects", element: <ProjectsPage /> },
              { path: "projects/:projectId", element: <ProjectDetailPage /> },
              { path: "ai-outreach", element: <AiOutreachPage /> },
              { path: "reports", element: <ReportsPage /> },
              { path: "settings", element: <SettingsPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
