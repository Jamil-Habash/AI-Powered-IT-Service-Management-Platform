import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function DashboardRedirect() {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <Navigate to="/admin/analytics" replace />;

    case "IT_AGENT":
      return <Navigate to="/agent/dashboard" replace />;

    case "EMPLOYEE":
      return <Navigate to="/employee/dashboard" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}