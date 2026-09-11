import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import lightLogo from "../assets/light_logo.png";
import darkLogo from "../assets/dark_logo.png";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/ticketService";
import { getComments } from "../services/commentService";

const navigation = [
  ["/dashboard", "dashboard", "Dashboard"],
  ["/analytics", "analytics", "Analytics & Ops"],
  ["/tickets", "confirmation_number", "Tickets"],
  ["/create-ticket", "add_circle", "Create Ticket"],
  ["/knowledge-base", "menu_book", "Knowledge Base"],
  ["/settings", "settings", "Settings"],
];

export const Light_LOGO_SRC = lightLogo;
export const Dark_LOGO_SRC = darkLogo;

export default function Shell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const isEmployee = user?.role === "EMPLOYEE";
  const isAdmin = user?.role === "ADMIN";
  const initials = (user?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user?.userId) return undefined;

    const storageKey = `smartdesk_notifications_${user.userId}`;
    const snapshotKey = `${storageKey}_snapshot`;
    const storedNotifications = JSON.parse(localStorage.getItem(storageKey) || "null");
    const storedSnapshot = JSON.parse(localStorage.getItem(snapshotKey) || "null");
    let currentSnapshot = storedSnapshot;
    let currentUnreadCount = storedNotifications?.unreadCount || 0;
    let cancelled = false;
    const sameUser = (firstId, secondId) =>
      firstId != null && secondId != null && String(firstId) === String(secondId);

    setNotifications(storedNotifications?.items || []);
    setUnreadCount(storedNotifications?.unreadCount || 0);

    const refreshNotifications = async () => {
      try {
        const response = await getTickets();
        const tickets = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        const previousTickets = currentSnapshot?.tickets || {};
        const previousComments = currentSnapshot?.comments || {};
        const nextTickets = Object.fromEntries(
          tickets.map((ticket) => [ticket.id, {
            title: ticket.title,
            assignedAgentId: ticket.assignedAgentId,
            assignedAgentName: ticket.assignedAgentName,
            status: ticket.status,
            priority: ticket.priority,
            resolvedAt: ticket.resolvedAt,
          }]),
        );
        const relevantTickets = tickets.filter((ticket) =>
          user.role === "EMPLOYEE" || user.role === "ADMIN" ||
          !ticket.assignedAgentId || sameUser(ticket.assignedAgentId, user.userId),
        );
        const nextComments = {};
        const commentResults = await Promise.all(
          relevantTickets.map(async (ticket) => {
            try {
              const commentResponse = await getComments(ticket.id);
              const comments = Array.isArray(commentResponse.data) ? commentResponse.data : [];
              const latest = comments[comments.length - 1];
              return [ticket.id, latest ? { id: latest.id, createdAt: latest.createdAt, authorId: latest.authorId } : null];
            } catch {
              return [ticket.id, null];
            }
          }),
        );
        commentResults.forEach(([ticketId, comment]) => { nextComments[ticketId] = comment; });

        if (!currentSnapshot) {
          currentSnapshot = { tickets: nextTickets, comments: nextComments };
          localStorage.setItem(snapshotKey, JSON.stringify({ tickets: nextTickets, comments: nextComments }));
          return;
        }

        const created = [];
        tickets.forEach((ticket) => {
          const previous = previousTickets[ticket.id];
          const isAssignedToUser = sameUser(ticket.assignedAgentId, user.userId);
          const isRelevant = user.role === "ADMIN" || user.role === "EMPLOYEE" || isAssignedToUser || !ticket.assignedAgentId;
          if (!isRelevant) return;

          if (!previous && user.role !== "EMPLOYEE" && !ticket.assignedAgentId) {
            created.push({ ticket, text: `New unassigned ticket: ${ticket.title}` });
            return;
          }
          if (!previous) return;

          if (ticket.assignedAgentId !== previous.assignedAgentId) {
            if (user.role === "EMPLOYEE" || user.role === "ADMIN" || isAssignedToUser || !ticket.assignedAgentId) {
              created.push({ ticket, text: ticket.assignedAgentName ? `${ticket.title} was assigned to ${ticket.assignedAgentName}` : `${ticket.title} is now unassigned` });
            }
          }
          if (ticket.status !== previous.status && ticket.status !== "RESOLVED") {
            created.push({ ticket, text: `${ticket.title} status changed to ${ticket.status.replace("_", " ")}` });
          }
          if (ticket.priority !== previous.priority) {
            created.push({ ticket, text: `${ticket.title} priority changed to ${ticket.priority}` });
          }
          if (ticket.resolvedAt && !previous.resolvedAt) {
            created.push({ ticket, text: `${ticket.title} was resolved` });
          }
        });

        relevantTickets.forEach((ticket) => {
          const latest = nextComments[ticket.id];
          const previous = previousComments[ticket.id];
          if (latest && latest.id !== previous?.id && !sameUser(latest.authorId, user.userId)) {
            created.push({ ticket, text: `New comment on ${ticket.title}` });
          }
        });

        if (!cancelled) {
          const newNotifications = created.map(({ ticket, text }) => ({
            id: `${ticket.id}-${Date.now()}-${text}`,
            ticketId: ticket.id,
            text,
            createdAt: new Date().toISOString(),
          }));
          if (newNotifications.length) {
            setNotifications((current) => {
              const items = [...newNotifications, ...current].slice(0, 20);
              currentUnreadCount = JSON.parse(localStorage.getItem(storageKey) || "null")?.unreadCount || 0;
              const unread = currentUnreadCount + newNotifications.length;
              localStorage.setItem(storageKey, JSON.stringify({ items, unreadCount: unread }));
              setUnreadCount(unread);
              currentUnreadCount = unread;
              return items;
            });
          }
          currentSnapshot = { tickets: nextTickets, comments: nextComments };
          localStorage.setItem(snapshotKey, JSON.stringify(currentSnapshot));
        }
      } catch {
        // Notification polling should not interrupt the rest of the application.
      }
    };

    refreshNotifications();
    const interval = window.setInterval(refreshNotifications, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user?.role, user?.userId]);

  const openNotifications = () => {
    setShowNotifications((visible) => !visible);
    if (unreadCount) {
      setUnreadCount(0);
      localStorage.setItem(`smartdesk_notifications_${user.userId}`, JSON.stringify({ items: notifications, unreadCount: 0 }));
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <Link to="/dashboard" className="brand">
            {theme == "light" && <img src={Light_LOGO_SRC} alt="SmartDesk logo" />}
            {theme == "dark" && <img src={Dark_LOGO_SRC} alt="SmartDesk logo" />}
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
            .filter(([path]) => (isEmployee || path !== "/create-ticket") && (isAdmin || path !== "/analytics"))
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
            <button aria-label="Toggle dark mode" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              <Icon>{theme === "light" ? "dark_mode" : "light_mode"}</Icon>
            </button>
            <button aria-label="Help and documentation" onClick={() => navigate("/knowledge-base")}>
              <Icon>help</Icon>
            </button>
            <div className="notification-wrap">
              <button
                aria-label="Notifications"
                onClick={openNotifications}
              >
                <Icon>notifications</Icon>
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="notification-heading">
                    <strong>Notifications</strong>
                    {notifications.length > 0 && (
                      <button type="button" onClick={() => { setNotifications([]); localStorage.setItem(`smartdesk_notifications_${user.userId}`, JSON.stringify({ items: [], unreadCount: 0 })); }}>Clear</button>
                    )}
                  </div>
                  {notifications.length === 0 && <p>No new ticket updates.</p>}
                  {notifications.length > 0 && (
                    <div className="notification-list">
                      {notifications.map((notification) => (
                        <button
                          type="button"
                          className="notification-item"
                          key={notification.id}
                          onClick={() => { setShowNotifications(false); navigate(`/ticket/${notification.ticketId}`); }}
                        >
                          <span>{notification.text}</span>
                          <small>{new Date(notification.createdAt).toLocaleString()}</small>
                        </button>
                      ))}
                    </div>
                  )}
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