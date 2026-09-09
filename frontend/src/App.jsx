import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AnalyticsPage from "./components/pages/AnalyticsPage";
import CreateTicketPage from "./components/pages/CreateTicketPage";
import DashboardPage from "./components/pages/DashboardPage";
import KnowledgeBasePage from "./components/pages/KnowledgeBasePage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import SettingsPage from "./components/pages/SettingsPage";
import TicketDetailPage from "./components/pages/TicketDetailPage";
import TicketsPage from "./components/pages/TicketsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-ticket" element={<ProtectedRoute><CreateTicketPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute role="ADMIN"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
