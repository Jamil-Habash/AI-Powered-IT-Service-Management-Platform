import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import TicketTable from "../TicketTable";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketService";
import { adminUpdateUser, deactivateUser, getUsers } from "../../services/userService";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role == "ADMIN") {
    return <AdminDashboard  />;
  }

  if (user?.role !== "EMPLOYEE") {
    return <AgentDashboard user={user} />;
  }

  return <EmployeeDashboard user={user} />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("employees");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
  const [userModalError, setUserModalError] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const pageSize = 7;

  useEffect(() => {
    Promise.all([getUsers(), getTickets()])
      .then(([usersResponse, ticketsResponse]) => {
        const userData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const ticketData = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : ticketsResponse.data?.content || [];
        setUsers(userData);
        setTickets(ticketData);
      })
      .catch(() => setError("Unable to load the user directory."))
      .finally(() => setLoading(false));
  }, []);

  const employees = users.filter((item) => item.role === "EMPLOYEE");
  const agents = users.filter((item) => item.role === "IT_AGENT");
  const activeAccounts = users.filter((item) => item.active !== false).length;
  const tabUsers = tab === "employees" ? employees : agents ;
  const departments = [...new Set(tabUsers.map((item) => item.department || item.categoryName).filter(Boolean))];
  const filtered = tabUsers.filter((item) => {
    const name = item.name || item.createdByName || item.assignedAgentName || "";
    const email = item.email || "";
    const itemStatus = item.active === false ? "INACTIVE" : "ACTIVE";
    return (
      (!search || `${name} ${email}`.toLowerCase().includes(search.toLowerCase())) &&
      (!department || (item.department || item.categoryName) === department) &&
      (!status || itemStatus === status)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  const openUserEditor = (item) => {
    if (tab === "assigned" || !item.id) return;
    setSelectedUser(item);
    setUserForm({ name: item.name || "", email: item.email || "", password: "", role: item.role || "EMPLOYEE" });
    setUserModalError("");
  };

  const updateUserField = (field) => (event) =>
    setUserForm((current) => ({ ...current, [field]: event.target.value }));

  const saveUser = async (event) => {
    event.preventDefault();
    setUserModalError("");
    setSavingUser(true);
    try {
      const response = await adminUpdateUser(
        selectedUser.id,
        userForm.name.trim(),
        userForm.email.trim(),
        userForm.password,
        userForm.role,
      );
      setUsers((current) => current.map((item) => item.id === selectedUser.id ? response.data : item));
      setSelectedUser(null);
    } catch (err) {
      setUserModalError(err.response?.data?.error || "Unable to update this account.");
    } finally {
      setSavingUser(false);
    }
  };

  const deactivateSelectedUser = async () => {
    if (!selectedUser || !window.confirm(`Deactivate ${selectedUser.name || "this account"}?`)) return;
    setUserModalError("");
    setSavingUser(true);
    try {
      const response = await deactivateUser(selectedUser.id);
      setUsers((current) => current.map((item) => item.id === selectedUser.id ? response.data : item));
      setSelectedUser(null);
    } catch (err) {
      setUserModalError(err.response?.data?.error || "Unable to deactivate this account.");
    } finally {
      setSavingUser(false);
    }
  };

  const exportDirectory = () => {
    const csv = ["Name,Email,Role", ...users.map((item) => `${item.name},${item.email},${item.role}`)].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "smartdesk-directory.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Shell>
      <div className="admin-dashboard">
        <section className="panel admin-hero">
          <div>
            <p className="eyebrow">USER ADMINISTRATION <span>•</span> SYSTEM ACCESS CONTROL</p>
            <h1>Manage Users</h1>
            <p>View, manage, and provision employee and IT agent accounts across the enterprise workspace.</p>
          </div>
          <div className="page-actions">
            <button className="secondary-button" onClick={exportDirectory}><Icon>download</Icon>Export Directory</button>
            <button className="secondary-button" onClick={() => navigate("/tickets")}><Icon>confirmation_number</Icon>Manage Tickets</button>
            <button className="primary-button" onClick={() => navigate("/register")}><Icon>person_add</Icon>Add New User</button>
          </div>
        </section>

        <div className="stats-grid admin-stats">
          {[
            ["Total Employees", employees.length, "onboarded this calendar month", "group"],
            ["Total IT Agents", agents.length, `${agents.length ? Math.min(agents.length, 8) : 0} active on duty triage queue now`, "support_agent"],
            ["Active Accounts", activeAccounts, "synced directory accounts", "verified_user"],
          ].map(([label, value, note, icon]) => (
            <section className="stat-card admin-stat" key={label}>
              <div><span>{label}</span><strong>{value.toLocaleString()}</strong></div>
              <Icon>{icon}</Icon>
              <small>{note}</small>
            </section>
          ))}
        </div>

        <section className="panel admin-directory">
          <div className="admin-tabs">
            {[["employees", "Employees", employees.length, "badge"], ["agents", "IT Agents", agents.length, "support_agent"]].map(([value, label, count, icon]) => (
              <button className={tab === value ? "selected" : ""} key={value} onClick={() => { setTab(value); setPage(1); }}>
                <Icon>{icon}</Icon>{label}<b>{count}</b>
              </button>
            ))}
            <span className="directory-live"><i />Live Directory Feed</span>
          </div>
          <div className="admin-filters">
            <label className="admin-search"><Icon>search</Icon><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or email..." /></label>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Status: All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
            <button className="secondary-button" onClick={resetFilters}><Icon>restart_alt</Icon>Reset Filters</button>
          </div>
          {error && <p className="form-error">{error}</p>}
          {loading && <p>Loading user directory...</p>}
          {!loading && !error && <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee / Dept</th>
                  <th>Email Address</th>
                  <th>Account Status</th>
                  <th>Role</th>
                  <th>Tickets Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => { const itemTickets = tickets.filter((ticket) => ticket.createdById === item.id || ticket.assignedAgentId === item.id); const isUser = tab !== "assigned" && item.id; const isActive = item.active !== false; return <tr key={item.id} className={isUser ? "admin-user-row" : ""} onClick={() => openUserEditor(item)}><td><strong>{item.name || item.assignedAgentName}</strong><small>{item.department || (item.role === "IT_AGENT" ? "IT Operations" : "Employee")}</small></td><td>{item.email || "Not available"}</td><td><span className={`account-status ${isActive ? "active" : "inactive"}`}><i />{isActive ? "Active" : "Inactive"}</span></td><td>{item.role?.replace("_", " ") || "Ticket assignment"}</td><td><b>{itemTickets.length}</b> tickets</td><td>{isUser ? <button className="secondary-button deactivate-button" disabled={!isActive} onClick={(event) => { event.stopPropagation(); openUserEditor(item); }} >{isActive ? "Deactivate" : "Inactive"}</button> : <button className="icon-button" title="View details" onClick={() => item.id && navigate(`/settings?user=${item.id}`)}><Icon>more_vert</Icon></button>}</td></tr>; })}</tbody></table></div>}
          {!loading && !error && visible.length === 0 && <p>No directory records match these filters.</p>}
          <div className="queue-pagination"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="current">{page}</button><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
        </section>
        {selectedUser && <div className="modal-backdrop" role="presentation" onClick={() => !savingUser && setSelectedUser(null)}><form className="modal user-editor-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} onSubmit={saveUser}><div className="panel-heading"><div><span className="eyebrow">ACCOUNT PROFILE</span><h2>Edit {selectedUser.role === "IT_AGENT" ? "IT Agent" : "Employee"}</h2></div><button type="button" className="icon-button" aria-label="Close user editor" onClick={() => setSelectedUser(null)}><Icon>close</Icon></button></div><p className="modal-lead">Update directory details for {selectedUser.name || "this account"}. You can also change this account's access role.</p><label>Full Name<input value={userForm.name} onChange={updateUserField("name")} required /></label><label>Work Email<input type="email" value={userForm.email} onChange={updateUserField("email")} required /></label><label>Access Role<select value={userForm.role} onChange={updateUserField("role")} required><option value="EMPLOYEE">Employee</option><option value="IT_AGENT">IT Agent</option><option value="ADMIN">Administrator</option></select></label><label>New Password<input type="password" value={userForm.password} onChange={updateUserField("password")} minLength="8" placeholder="Leave blank to keep current password" /></label>{userModalError && <p className="form-error">{userModalError}</p>}<div className="form-actions"><button type="button" className="danger-button" disabled={savingUser || selectedUser.active === false} onClick={deactivateSelectedUser}>Deactivate</button><span className="form-actions-spacer" /><button type="button" className="secondary-button" disabled={savingUser} onClick={() => setSelectedUser(null)}>Cancel</button><button type="submit" className="primary-button" disabled={savingUser}>{savingUser ? "Saving..." : "Save Changes"}</button></div></form></div>}
      </div>
    </Shell>
  );
}

function AgentDashboard({ user }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getTickets()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        if (active) setTickets(data);
      })
      .catch(() => {
        if (active) setError("Unable to load the operations dashboard.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const assignedToMe = tickets.filter(
    (ticket) => ticket.assignedAgentName === user?.name,
  );
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const unassignedTickets = tickets.filter((ticket) => !ticket.assignedAgentName);
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );
  const shown = tickets
    .slice()
    .sort((first, second) => {
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondDate - firstDate || Number(second.id) - Number(first.id);
    })
    .filter((ticket) => {
      const query = search.toLowerCase();
      return (
        ticket.title?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query) ||
        ticket.createdByName?.toLowerCase().includes(query)
      );
    })
    .slice(0, 5)
    .map((ticket) => [
      `#TICK-${ticket.id}`,
      ticket.title,
      ticket.categoryName || "Uncategorized",
      (ticket.status || "OPEN").replace("_", " "),
      ticket.priority,
      ticket.id,
      ticket.description,
      ticket.createdAt,
    ]);

  return (
    <Shell>
      <PageHeader
        eyebrow="IT OPERATIONS  •  AGENT WORKSPACE"
        title={`Welcome back, ${user?.name || "there"}`}
        description="Monitor the support queue, prioritize incidents, and keep assigned work moving."
        action={
          <button className="primary-button" onClick={() => navigate("/tickets")}>
            <Icon>confirmation_number</Icon>Open Ticket Queue
          </button>
        }
      />
      <div className="stats-grid">
        {[
          ["Open Queue", openTickets.length, "tickets awaiting action"],
          ["Unassigned", unassignedTickets.length, "need an owner"],
          ["My Assigned", assignedToMe.length, "assigned to you"],
          ["In Progress", inProgressTickets.length, "actively being handled"],
        ].map(([label, value, note]) => (
          <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Latest Support Activity</h2>
            <p>Review the newest requests across the support operation.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
          />
        </div>
        {loading && <p>Loading operations dashboard...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && shown.length === 0 && <p>No tickets found.</p>}
        {!loading && !error && shown.length > 0 && (
          <TicketTable
            rows={shown}
            onSelect={(ticketId) => navigate(`/ticket/${ticketId}`)}
          />
        )}
      </section>
    </Shell>
  );
}

function EmployeeDashboard({ user }) {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getTickets()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        if (active) setTickets(data);
      })
      .catch(() => {
        if (active) setError("Unable to load your tickets. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");
  const shown = tickets
    .slice()
    .sort((first, second) => {
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return secondDate - firstDate || Number(second.id) - Number(first.id);
    })
    .filter((ticket) => {
      const query = search.toLowerCase();
      return (
        ticket.title?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query)
      );
    })
    .slice(0, 3)
    .map((ticket) => [
      `#TICK-${ticket.id}`,
      ticket.title,
      ticket.categoryName || "Uncategorized",
      (ticket.status || "OPEN").replace("_", " "),
      ticket.priority,
      ticket.id,
      ticket.description,
      ticket.createdAt,
    ]);

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE PORTAL  •  IT SUPPORT DESK"
        title={`Welcome back, ${user?.name || "there"}`}
        description="Here is an overview of your IT service requests and real-time support status."
        action={
          <div className="page-actions">
            <button className="secondary-button" onClick={() => navigate("/knowledge-base")}>
              <Icon>menu_book</Icon>Browse Knowledge Base
            </button>
            <button className="primary-button" onClick={() => navigate("/create-ticket")}>
              <Icon>add</Icon>New Ticket
            </button>
          </div>
        }
      />
      <div className="stats-grid">
        {[
          ["My Open Tickets", openTickets.length, "tickets"],
          ["In Progress", inProgressTickets.length, "active"],
          ["Resolved", resolvedTickets.length, "this quarter"],
        ].map(([label, value, suffix]) => (
          <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{suffix}</small>
            <p>{label === "Resolved" ? "100% CSAT" : "Avg. 18m SLA"}</p>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Tickets</h2>
            <p>
              Track ongoing service requests, incident updates, and hardware
              provisioning.
            </p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
          />
        </div>
        {loading && <p>Loading your tickets...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && shown.length === 0 && <p>No tickets found.</p>}
        {!loading && !error && shown.length > 0 && (
          <TicketTable
            rows={shown}
            onSelect={(ticketId) => navigate(`/ticket/${ticketId}`)}
          />
        )}
      </section>
    </Shell>
  );
}
