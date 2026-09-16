import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import Shell from "../components/Shell";
import PageHeader from "../components/PageHeader";
import { getTickets } from "../services/ticketService";
import {
  adminUpdateUser,
  deactivateUser,
  getUsers,
  activateUser,
} from "../services/userService";
import usePageTitle from "../hooks/usePageTitle";

export default function AdminManageUsers() {
  usePageTitle("Manage Users");
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
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [userModalError, setUserModalError] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkRole, setBulkRole] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const pageSize = 7;

  useEffect(() => {
    Promise.all([getUsers(), getTickets()])
      .then(([usersResponse, ticketsResponse]) => {
        const userData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : [];
        const ticketData = Array.isArray(ticketsResponse.data)
          ? ticketsResponse.data
          : ticketsResponse.data?.content || [];
        setUsers(userData);
        setTickets(ticketData);
      })
      .catch(() => setError("Unable to load the user directory."))
      .finally(() => setLoading(false));
  }, []);

  const employees = users.filter((item) => item.role === "EMPLOYEE");
  const agents = users.filter((item) => item.role === "IT_AGENT");
  const activeAccounts = users.filter((item) => item.active !== false).length;
  const tabUsers = tab === "employees" ? employees : agents;
  const filtered = tabUsers.filter((item) => {
    const name =
      item.name || item.createdByName || item.assignedAgentName || "";
    const email = item.email || "";
    const itemStatus = item.active === false ? "INACTIVE" : "ACTIVE";
    return (
      (!search ||
        `${name} ${email}`.toLowerCase().includes(search.toLowerCase())) &&
      (!department || (item.department || item.categoryName) === department) &&
      (!status || itemStatus === status)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const visibleUserIds = visible
    .filter((item) => item.id)
    .map((item) => item.id);
  const selectedUsers = users.filter((item) =>
    selectedUserIds.includes(item.id),
  );
  const allVisibleSelected =
    visibleUserIds.length > 0 &&
    visibleUserIds.every((id) => selectedUserIds.includes(id));

  const resetFilters = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedUserIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleUserIds.includes(id))
        : [...new Set([...current, ...visibleUserIds])],
    );
  };

  const bulkDeactivateUsers = async () => {
    if (
      !selectedUsers.length ||
      !window.confirm(
        `Deactivate ${selectedUsers.length} selected account${selectedUsers.length === 1 ? "" : "s"}?`,
      )
    )
      return;
    setBulkSaving(true);
    setError("");
    try {
      const responses = await Promise.all(
        selectedUsers.map((item) => deactivateUser(item.id)),
      );
      setUsers((current) =>
        current.map((item) => {
          const response = responses.find(({ data }) => data.id === item.id);
          return response ? response.data : item;
        }),
      );
      setSelectedUserIds([]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to deactivate all selected accounts.",
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const bulkActivateUsers = async () => {
    if (
      !selectedUsers.length ||
      !window.confirm(
        `Deactivate ${selectedUsers.length} selected account${selectedUsers.length === 1 ? "" : "s"}?`,
      )
    )
      return;
    setBulkSaving(true);
    setError("");
    try {
      const responses = await Promise.all(
        selectedUsers.map((item) => activateUser(item.id)),
      );
      setUsers((current) =>
        current.map((item) => {
          const response = responses.find(({ data }) => data.id === item.id);
          return response ? response.data : item;
        }),
      );
      setSelectedUserIds([]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to activate all selected accounts.",
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const bulkChangeRole = async () => {
    if (!selectedUsers.length || !bulkRole) return;
    setBulkSaving(true);
    setError("");
    try {
      const responses = await Promise.all(
        selectedUsers.map((item) =>
          adminUpdateUser(
            item.id,
            item.name || "",
            item.email || "",
            "",
            bulkRole,
          ),
        ),
      );
      setUsers((current) =>
        current.map((item) => {
          const response = responses.find(({ data }) => data.id === item.id);
          return response ? response.data : item;
        }),
      );
      setSelectedUserIds([]);
      setBulkRole("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to change the role for all selected accounts.",
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const openUserEditor = (item) => {
    if (tab === "assigned" || !item.id) return;
    setSelectedUser(item);
    setUserForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "EMPLOYEE",
    });
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
      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id ? response.data : item,
        ),
      );
      setSelectedUser(null);
    } catch (err) {
      setUserModalError(
        err.response?.data?.error || "Unable to update this account.",
      );
    } finally {
      setSavingUser(false);
    }
  };

  const deactivateSelectedUser = async () => {
    if (
      !selectedUser ||
      !window.confirm(`Deactivate ${selectedUser.name || "this account"}?`)
    )
      return;
    setUserModalError("");
    setSavingUser(true);
    try {
      const response = await deactivateUser(selectedUser.id);
      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id ? response.data : item,
        ),
      );
      setSelectedUser(null);
    } catch (err) {
      setUserModalError(
        err.response?.data?.error || "Unable to deactivate this account.",
      );
    } finally {
      setSavingUser(false);
    }
  };

  const activateSelectedUser = async () => {
    if (
      !selectedUser ||
      !window.confirm(`Activate ${selectedUser.name || "this account"}?`)
    )
      return;
    setUserModalError("");
    setSavingUser(true);
    try {
      const response = await activateUser(selectedUser.id);
      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id ? response.data : item,
        ),
      );
      setSelectedUser(null);
    } catch (err) {
      setUserModalError(
        err.response?.data?.error || "Unable to activate this account.",
      );
    } finally {
      setSavingUser(false);
    }
  };

  const exportDirectory = () => {
    const csv = [
      "Name,Email,Role",
      ...users.map((item) => `${item.name},${item.email},${item.role}`),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "smartdesk-directory.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Shell>
      <div className="admin-dashboard">
        <PageHeader
          eyebrow="USER ADMINISTRATION  •  SYSTEM ACCESS CONTROL"
          title="Manage Users Accounts"
          description="View, manage, and provision employee and IT agent accounts across the enterprise workspace."
          action={
            <div className="page-actions">
              <button className="secondary-button" onClick={exportDirectory}>
                <Icon>download</Icon>Export Directory
              </button>
              <button
                className="primary-button"
                onClick={() => navigate("/register")}
              >
                <Icon>person_add</Icon>Add New User
              </button>
            </div>
          }
        />

        <div className="stats-grid admin-stats">
          {[
            [
              "Total Employees",
              employees.length,
              "onboarded this calendar month",
              "group",
            ],
            [
              "Total IT Agents",
              agents.length,
              `${agents.length ? Math.min(agents.length, 8) : 0} active on duty triage queue now`,
              "support_agent",
            ],
            [
              "Active Accounts",
              activeAccounts,
              "synced directory accounts",
              "verified_user",
            ],
          ].map(([label, value, note, icon]) => (
            <section className="stat-card admin-stat" key={label}>
              <div>
                <span>{label}</span>
                <strong>{value.toLocaleString()}</strong>
              </div>
              <Icon>{icon}</Icon>
              <small>{note}</small>
            </section>
          ))}
        </div>

        <section className="panel admin-directory">
          <div className="admin-tabs">
            {[
              ["employees", "Employees", employees.length, "badge"],
              ["agents", "IT Agents", agents.length, "support_agent"],
            ].map(([value, label, count, icon]) => (
              <button
                className={tab === value ? "selected" : ""}
                key={value}
                onClick={() => {
                  setTab(value);
                  setPage(1);
                  setSelectedUserIds([]);
                }}
              >
                <Icon>{icon}</Icon>
                {label}
                <b>{count}</b>
              </button>
            ))}
            <span className="directory-live">
              <i />
              Live Directory Feed
            </span>
          </div>

          <div className="admin-filters">
            <label className="admin-search">
              <Icon>search</Icon>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
              />
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Status: All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="secondary-button" onClick={resetFilters}>
              <Icon>restart_alt</Icon>Reset Filters
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {loading && <p>Loading user directory...</p>}

          {selectedUsers.length > 0 && (
            <div className="bulk-toolbar" aria-live="polite">
              <strong>{selectedUsers.length} selected</strong>
              <button
                className="danger-button"
                onClick={bulkDeactivateUsers}
                disabled={bulkSaving}
              >
                <Icon>block</Icon>Deactivate Selected
              </button>
              <button
                className="success-button"
                onClick={bulkActivateUsers}
                disabled={bulkSaving}
              >
                <Icon>check_circle</Icon>Activate Selected
              </button>
              <select
                value={bulkRole}
                onChange={(event) => setBulkRole(event.target.value)}
                disabled={bulkSaving}
                aria-label="New role for selected users"
              >
                <option value="">Change Role...</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="IT_AGENT">IT Agent</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <button
                className="primary-button"
                onClick={bulkChangeRole}
                disabled={bulkSaving || !bulkRole}
              >
                {bulkSaving ? "Applying..." : "Apply Role"}
              </button>
              <button
                className="text-button"
                onClick={() => setSelectedUserIds([])}
                disabled={bulkSaving}
              >
                Clear
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="selection-cell">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleVisibleSelection}
                        aria-label="Select all visible users"
                      />
                    </th>
                    <th>Employee / Dept</th>
                    <th>Email Address</th>
                    <th>Account Status</th>
                    <th>Role</th>
                    <th>Tickets Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const itemTickets = tickets.filter(
                      (ticket) =>
                        ticket.createdById === item.id ||
                        ticket.assignedAgentId === item.id,
                    );
                    const isUser = tab !== "assigned" && item.id;
                    const isActive = item.active !== false;
                    const isVerified = item.emailVerified !== false;
                    const isSelected = selectedUserIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={isUser ? "admin-user-row" : ""}
                        onClick={() => openUserEditor(item)}
                      >
                        <td className="selection-cell">
                          {isUser && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(item.id)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${item.name || "user"}`}
                            />
                          )}
                        </td>
                        <td>
                          <strong>{item.name || item.assignedAgentName}</strong>
                          <small>
                            {item.department ||
                              (item.role === "IT_AGENT"
                                ? "IT Operations"
                                : "Employee")}
                          </small>
                        </td>
                        <td>{item.email || "Not available"}</td>
                        <td>
                          <span
                            className={`account-status ${isActive ? "active" : "inactive"}`}
                          >
                            <i />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`account-status ${isVerified ? "active" : "inactive"}`}
                          >
                            <i />
                            {isVerified ? "Verified" : "Not Verified"}
                          </span>
                        </td>
                        <td>
                          {item.role?.replace("_", " ") || "Ticket assignment"}
                        </td>
                        <td>
                          <b>{itemTickets.length}</b> tickets
                        </td>
                        <td>
                          {isUser ? (
                            <button
                              className="secondary-button deactivate-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openUserEditor(item);
                              }}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                          ) : (
                            <button
                              className="icon-button"
                              title="View details"
                              onClick={() =>
                                item.id && navigate(`/settings?user=${item.id}`)
                              }
                            >
                              <Icon>more_vert</Icon>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <p>No directory records match these filters.</p>
          )}

          <div className="queue-pagination">
            <span>
              Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
              records
            </span>
            <div>
              <button
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>
              <button className="current">{page}</button>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {selectedUser && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => !savingUser && setSelectedUser(null)}
          >
            <form
              className="modal user-editor-modal"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
              onSubmit={saveUser}
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">ACCOUNT PROFILE</span>
                  <h2>
                    Edit{" "}
                    {selectedUser.role === "IT_AGENT" ? "IT Agent" : "Employee"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Close user editor"
                  onClick={() => setSelectedUser(null)}
                >
                  <Icon>close</Icon>
                </button>
              </div>
              <p className="modal-lead">
                Update directory details for{" "}
                {selectedUser.name || "this account"}. You can also change this
                account's access role.
              </p>
              <label>
                Full Name
                <input
                  value={userForm.name}
                  onChange={updateUserField("name")}
                  required
                />
              </label>
              <label>
                Work Email
                <input
                  type="email"
                  value={userForm.email}
                  onChange={updateUserField("email")}
                  required
                />
              </label>
              <label>
                Access Role
                <select
                  value={userForm.role}
                  onChange={updateUserField("role")}
                  required
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="IT_AGENT">IT Agent</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={userForm.password}
                  onChange={updateUserField("password")}
                  minLength="8"
                  placeholder="Leave blank to keep current password"
                />
              </label>
              {userModalError && <p className="form-error">{userModalError}</p>}
              <div className="form-actions">
                <button
                  type="button"
                  className="danger-button"
                  disabled={savingUser || selectedUser.active === false}
                  onClick={deactivateSelectedUser}
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  className="success-button"
                  disabled={savingUser || selectedUser.active === true}
                  onClick={activateSelectedUser}
                >
                  Activate
                </button>
                <span className="form-actions-spacer" />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={savingUser}
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingUser}
                >
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}
