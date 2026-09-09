import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/smartdesk_logo.png";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const navigation = [
  ["/dashboard", "dashboard", "Dashboard"],
  ["/tickets", "confirmation_number", "Tickets"],
  ["/create-ticket", "add_circle", "Create Ticket"],
  ["/analytics", "analytics", "Analytics & Ops"],
  ["/knowledge-base", "menu_book", "Knowledge Base"],
  ["/settings", "settings", "Settings"],
];

export const LOGO_SRC = logo;

export default function Shell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // ← new
  const isEmployee = user?.role === "EMPLOYEE";
  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <Link to="/dashboard" className="brand">
            <img src={LOGO_SRC} alt="SmartDesk logo" />
            <span className="brand-text">
              <strong>SmartDesk</strong>
              <small>ITSM PLATFORM</small>
            </span>
          </Link>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <Icon>{collapsed ? "chevron_right" : "chevron_left"}</Icon>
          </button>
        </div>

        <p className="nav-label">{!collapsed && "Workspace"}</p>
        <nav>
          {navigation
            .filter(([path]) => isEmployee || path !== "/create-ticket")
            .map(([path, icon, label]) => (
            <Link
              className={location.pathname === path ? "active" : ""}
              key={path}
              to={path}
              title={collapsed ? label : undefined}
            >
              <Icon>{icon}</Icon>
              <span className="nav-text">{label}</span>
            </Link>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => { logout(); navigate("/login"); }}>
            <Icon>logout</Icon>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="top-actions">
            <button aria-label="Help and documentation" onClick={() => navigate("/knowledge-base")}>
              <Icon>help</Icon>
            </button>
            <div className="notification-wrap">
              <button
                aria-label="Notifications"
                onClick={() => setShowNotifications((visible) => !visible)}
              >
                <Icon>notifications</Icon>
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  <p>No new ticket updates.</p>
                </div>
              )}
            </div>
            <span className="avatar">{initials}</span>
            <button className="user-name user-menu-button" onClick={() => navigate("/settings")}>
              {user?.name || "User"}<small>{user?.role || ""}</small>
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}