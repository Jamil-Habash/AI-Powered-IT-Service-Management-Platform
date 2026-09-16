import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AnalyticsPage from "./pages/AdminAnalyticsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import AgentDashboard from "./pages/AgentDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketsPage from "./pages/TicketsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import KnowledgeBaseArticlePage from "./pages/KnowledgeBaseArticlePage";
import AdminAuditLog from "./pages/AdminAuditLog";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminManageUsers from "./pages/AdminManageUsers";
import DashboardRedirect from "./components/DashboardRedirect";
import AdminKnowledgeBase from "./pages/AdminKnowledgeBase";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminAuditLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/knowledge-base"
            element={
              <ProtectedRoute>
                <KnowledgeBaseArticlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute role="IT_AGENT">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <ProtectedRoute role="EMPLOYEE">
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ticket/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute>
                <KnowledgeBasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-base/:id"
            element={
              <ProtectedRoute>
                <KnowledgeBaseArticlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
