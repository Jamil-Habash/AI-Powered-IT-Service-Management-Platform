import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import lightLogo from "../assets/light_logo.png";
import darkLogo from "../assets/dark_logo.png";
import lightpng from "../assets/smartdesk_light.png";
import darkpng from "../assets/smartdesk_dark.png";

import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/ticketService";
import { getComments } from "../services/commentService";

export const Light_LOGO_SRC = lightLogo;
export const Dark_LOGO_SRC = darkLogo;
export const Light_PNG_SRC = lightpng;
export const Dark_PNG_SRC = darkpng;

const NAV_GROUPS = [
  {
    label: "Administration",
    items: [
      {
        path: "/admin/analytics",
        icon: "analytics",
        label: "Analytics & Ops",
        roles: ["ADMIN"],
      },
      {
        path: "/admin/users",
        icon: "manage_accounts",
        label: "Manage Users",
        roles: ["ADMIN"],
      },
      {
        path: "/admin/audit-logs",
        icon: "history",
        label: "Audit Log",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        path: "/agent/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        roles: ["IT_AGENT"],
      },
      {
        path: "/employee/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        roles: ["EMPLOYEE", "IT_AGENT"],
      },
      {
        path: "/tickets",
        icon: "confirmation_number",
        label: "Tickets",
        roles: ["EMPLOYEE", "IT_AGENT", "ADMIN"],
      },
      {
        path: "/create-ticket",
        icon: "add_circle",
        label: "Create Ticket",
        roles: ["EMPLOYEE"],
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        path: "/knowledge-base",
        icon: "menu_book",
        label: "Knowledge Base",
        roles: ["EMPLOYEE", "IT_AGENT", "ADMIN"],
      },
    ],
  },
];

export default function Shell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("smartdesk_theme") || "light";
  });

  const role = user?.role || "";

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  /*
   * Theme
   */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("smartdesk_theme", theme);
  }, [theme]);

  /*
   * Notifications
   */
  useEffect(() => {
    if (!user?.userId) return;

    let cancelled = false;

    const storageKey = `smartdesk_notifications_${user.userId}`;
    const snapshotKey = `smartdesk_notification_snapshot_${user.userId}`;

    const loadStoredNotifications = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey));

        if (stored) {
          setNotifications(stored.items || []);
          setUnreadCount(stored.unreadCount || 0);
        }
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    const saveNotifications = (items, unread) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          items,
          unreadCount: unread,
        }),
      );
    };

    const createSnapshot = async (tickets) => {
      const relevantTickets = tickets.filter((ticket) => {
        if (role === "ADMIN") return true;

        if (role === "IT_AGENT") {
          return ticket.assignedAgentId === user.userId;
        }

        return ticket.createdById === user.userId;
      });

      const commentsByTicket = {};

      await Promise.all(
        relevantTickets.map(async (ticket) => {
          try {
            commentsByTicket[ticket.id] = await getComments(ticket.id);
          } catch {
            commentsByTicket[ticket.id] = [];
          }
        }),
      );

      return relevantTickets.reduce((acc, ticket) => {
        acc[ticket.id] = {
          title: ticket.title,
          assignedAgentId: ticket.assignedAgentId,
          assignedAgentName: ticket.assignedAgentName,
          status: ticket.status,
          priority: ticket.priority,
          resolvedAt: ticket.resolvedAt,
          comments: (commentsByTicket[ticket.id] || []).map((comment) => ({
            id: comment.id,
            userId: comment.userId,
            createdAt: comment.createdAt,
          })),
        };

        return acc;
      }, {});
    };

    const checkForUpdates = async () => {
      try {
        const tickets = await getTickets();

        if (cancelled || !Array.isArray(tickets)) return;

        const currentSnapshot = await createSnapshot(tickets);

        let previousSnapshot = {};

        try {
          previousSnapshot =
            JSON.parse(localStorage.getItem(snapshotKey)) || {};
        } catch {
          previousSnapshot = {};
        }

        /*
         * First load:
         * Save the snapshot but don't generate a huge batch
         * of notifications for existing tickets.
         */
        if (!Object.keys(previousSnapshot).length) {
          localStorage.setItem(snapshotKey, JSON.stringify(currentSnapshot));
          return;
        }

        const newNotifications = [];

        Object.entries(currentSnapshot).forEach(([ticketId, current]) => {
          const previous = previousSnapshot[ticketId];

          if (!previous) {
            /*
             * New unassigned ticket for agents/admins.
             */
            if (
              (role === "IT_AGENT" || role === "ADMIN") &&
              !current.assignedAgentId
            ) {
              newNotifications.push({
                id: `${ticketId}-new-${Date.now()}`,
                ticketId,
                text: `New unassigned ticket: ${current.title}`,
                createdAt: new Date().toISOString(),
              });
            }

            return;
          }

          /*
           * Assignment changed
           */
          if (
            current.assignedAgentId !== previous.assignedAgentId &&
            current.assignedAgentId
          ) {
            const shouldNotify =
              role === "ADMIN" || current.assignedAgentId === user.userId;

            if (shouldNotify) {
              newNotifications.push({
                id: `${ticketId}-assignment-${Date.now()}`,
                ticketId,
                text: `Ticket assigned to ${
                  current.assignedAgentName || "an agent"
                }: ${current.title}`,
                createdAt: new Date().toISOString(),
              });
            }
          }

          /*
           * Status changed
           */
          if (
            current.status !== previous.status &&
            current.status !== "RESOLVED"
          ) {
            newNotifications.push({
              id: `${ticketId}-status-${Date.now()}`,
              ticketId,
              text: `Ticket status changed to ${current.status}: ${current.title}`,
              createdAt: new Date().toISOString(),
            });
          }

          /*
           * Priority changed
           */
          if (current.priority !== previous.priority) {
            newNotifications.push({
              id: `${ticketId}-priority-${Date.now()}`,
              ticketId,
              text: `Ticket priority changed to ${current.priority}: ${current.title}`,
              createdAt: new Date().toISOString(),
            });
          }

          /*
           * Ticket resolved
           */
          if (
            current.resolvedAt &&
            current.resolvedAt !== previous.resolvedAt
          ) {
            newNotifications.push({
              id: `${ticketId}-resolved-${Date.now()}`,
              ticketId,
              text: `Ticket resolved: ${current.title}`,
              createdAt: new Date().toISOString(),
            });
          }

          /*
           * New comments
           */
          const previousCommentIds = new Set(
            (previous.comments || []).map((comment) => comment.id),
          );

          const newComments = (current.comments || []).filter(
            (comment) =>
              !previousCommentIds.has(comment.id) &&
              comment.userId !== user.userId,
          );

          newComments.forEach(() => {
            newNotifications.push({
              id: `${ticketId}-comment-${Date.now()}-${Math.random()}`,
              ticketId,
              text: `New comment on: ${current.title}`,
              createdAt: new Date().toISOString(),
            });
          });
        });

        if (newNotifications.length > 0) {
          const updatedNotifications = [
            ...newNotifications,
            ...notifications,
          ].slice(0, 20);

          const updatedUnread = unreadCount + newNotifications.length;

          setNotifications(updatedNotifications);
          setUnreadCount(updatedUnread);

          saveNotifications(updatedNotifications, updatedUnread);
        }

        localStorage.setItem(snapshotKey, JSON.stringify(currentSnapshot));
      } catch (error) {
        console.error("Notification polling failed:", error);
      }
    };

    loadStoredNotifications();
    checkForUpdates();

    const interval = setInterval(checkForUpdates, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.userId, role]);

  /*
   * Notifications popover
   */
  const openNotifications = () => {
    setShowNotifications((previous) => !previous);

    if (unreadCount > 0) {
      setUnreadCount(0);

      if (user?.userId) {
        localStorage.setItem(
          `smartdesk_notifications_${user.userId}`,
          JSON.stringify({
            items: notifications,
            unreadCount: 0,
          }),
        );
      }
    }
  };

  /*
   * Clear notifications
   */
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);

    if (user?.userId) {
      localStorage.setItem(
        `smartdesk_notifications_${user.userId}`,
        JSON.stringify({
          items: [],
          unreadCount: 0,
        }),
      );
    }
  };

  /*
   * Role-based navigation
   */
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.roles || item.roles.includes(role),
    ),
  })).filter((group) => group.items.length > 0);

  /*
   * Workspace label
   */
  const workspaceLabel =
    role === "ADMIN"
      ? "Admin Console"
      : role === "IT_AGENT"
        ? "Agent Workspace"
        : "Employee Portal";

  /*
   * Active route
   */
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  /*
   * Logout
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-inner">
          {/* Brand */}
          <div className="sidebar-header">
            <Link to="/dashboard" className="brand">
              <span className="brand-logo">
                {theme === "light" ? (
                  <img src={Light_LOGO_SRC} alt="SmartDesk logo" />
                ) : (
                  <img src={Dark_LOGO_SRC} alt="SmartDesk logo" />
                )}
              </span>

              <span className="brand-content">
                <strong>SmartDesk</strong>
                <small>{workspaceLabel}</small>
              </span>
            </Link>

            <button
              className="sidebar-toggle"
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon>
                {collapsed ? "keyboard_arrow_right" : "keyboard_arrow_left"}
              </Icon>
            </button>
          </div>

          {/* Workspace badge */}
          {!collapsed && (
            <div className="workspace-badge">
              <span className="workspace-status-dot" />
              <span>{workspaceLabel}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="sidebar-navigation">
            {visibleGroups.map((group, groupIndex) => (
              <div className="nav-group" key={group.label}>
                {groupIndex > 0 && <div className="nav-divider" />}

                {!collapsed && <p className="nav-label">{group.label}</p>}

                <nav>
                  {group.items.map(({ path, icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`nav-item ${isActive(path) ? "active" : ""}`}
                      title={collapsed ? label : undefined}
                    >
                      <span className="nav-icon">
                        <Icon>{icon}</Icon>
                      </span>

                      <span className="nav-text">{label}</span>

                      <span className="nav-active-indicator" />
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar bottom */}
          <div className="sidebar-bottom">
            <Link
              to="/settings"
              className={`nav-item ${isActive("/settings") ? "active" : ""}`}
              title={collapsed ? "Settings" : undefined}
            >
              <span className="nav-icon">
                <Icon>settings</Icon>
              </span>

              <span className="nav-text">Settings</span>

              <span className="nav-active-indicator" />
            </Link>

            <button
              type="button"
              className="nav-item logout-button"
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
            >
              <span className="nav-icon">
                <Icon>logout</Icon>
              </span>

              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN
      ========================== */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-inner">
            {/* Left side */}
            <div className="topbar-context">
              <span className="context-label">Workspace</span>

              <span className="context-value">{workspaceLabel}</span>
            </div>

            {/* Right side */}
            <div className="top-actions">
              {/* Theme */}
              <button
                type="button"
                className="topbar-button"
                aria-label="Toggle dark mode"
                title={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                onClick={() =>
                  setTheme((current) =>
                    current === "light" ? "dark" : "light",
                  )
                }
              >
                <Icon>{theme === "light" ? "dark_mode" : "light_mode"}</Icon>
              </button>

              {/* Help */}
              <button
                type="button"
                className="topbar-button"
                aria-label="Help and documentation"
                title="Knowledge Base"
                onClick={() => navigate("/knowledge-base")}
              >
                <Icon>help</Icon>
              </button>

              {/* Notifications */}
              <div className="notification-wrap">
                <button
                  type="button"
                  className={`topbar-button notification-button ${
                    showNotifications ? "notification-open" : ""
                  }`}
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  title="Notifications"
                  onClick={openNotifications}
                >
                  <Icon>notifications</Icon>

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-popover">
                    <div className="notification-heading">
                      <div>
                        <strong>Notifications</strong>

                        <span>
                          {notifications.length > 0
                            ? `${notifications.length} recent update${
                                notifications.length === 1 ? "" : "s"
                              }`
                            : "You're all caught up"}
                        </span>
                      </div>

                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className="notification-clear"
                          onClick={clearNotifications}
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 && (
                      <div className="notification-empty">
                        <span className="notification-empty-icon">
                          <Icon>notifications_none</Icon>
                        </span>

                        <strong>No new updates</strong>

                        <p>Ticket activity will appear here.</p>
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <button
                            type="button"
                            className="notification-item"
                            key={notification.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(`/ticket/${notification.ticketId}`);
                            }}
                          >
                            <span className="notification-item-icon">
                              <Icon>notifications</Icon>
                            </span>

                            <span className="notification-item-content">
                              <span className="notification-item-text">
                                {notification.text}
                              </span>

                              <small>
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString()}
                              </small>
                            </span>

                            <Icon>keyboard_arrow_right</Icon>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User */}
              <button
                type="button"
                className="user-profile"
                onClick={() => navigate("/settings")}
                title="Open profile settings"
              >
                <span className="avatar">{initials}</span>

                <span className="user-profile-info">
                  <strong>{user?.name || "User"}</strong>

                  <small>{user?.role || ""}</small>
                </span>

                <span className="user-profile-chevron">
                  <Icon>keyboard_arrow_down</Icon>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
