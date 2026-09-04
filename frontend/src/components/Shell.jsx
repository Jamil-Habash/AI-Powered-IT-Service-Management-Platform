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
  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <img src={LOGO_SRC} alt="SmartDesk logo" />
          <span>
            <strong>SmartDesk</strong>
            <small>ITSM PLATFORM</small>
          </span>
        </Link>
        <p className="nav-label">Workspace</p>
        <nav>
          {navigation.map(([path, icon, label]) => (
            <Link
              className={location.pathname === path ? "active" : ""}
              key={path}
              to={path}
            >
              <Icon>{icon}</Icon>
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => { logout(); navigate("/login"); }}>
            <Icon>logout</Icon>Logout
          </button>
          <div className="profile">
            <b>{initials}</b>
            <span>
              <strong>{user?.name || "User"}</strong>
              <small>{user?.email || ""}</small>
            </span>
            <em>{user?.role || "User"}</em>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <input placeholder="Search tickets, articles, incident logs" />
          <div className="top-actions">
            <button aria-label="Help">
              <Icon>help</Icon>
            </button>
            <button aria-label="Notifications">
              <Icon>notifications</Icon>
            </button>
            <span className="avatar">{initials}</span>
            <span className="user-name">
              {user?.name || "User"}<small>{user?.role || ""}</small>
            </span>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
