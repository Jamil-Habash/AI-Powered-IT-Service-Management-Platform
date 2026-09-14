import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import AgentDashboard from "./AgentDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function DashboardPage() {
  usePageTitle("Dashboard");

  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user?.role === "IT_AGENT") {
    return <AgentDashboard user={user} />;
  }

  return <EmployeeDashboard user={user} />;
}