import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import TicketTable from "../components/TicketTable";
import { useAuth } from "../context/AuthContext";
import {
  assignTicket,
  getTickets,
  getAgents,
  updateTicketPriority,
  updateTicketStatus,
} from "../services/ticketService";
import usePageTitle from "../hooks/usePageTitle";

export default function TicketsPage() {
  usePageTitle("All Tickets");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [selectedTicketsIds, setSelectedTicketsIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    getTickets()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        setTickets(data);
      })
      .catch(() => setError("Unable to load tickets. Please try again."));
  }, []);

  useEffect(() => {
    getAgents()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        setAgents(data);
      })
      .catch(() => {});
  }, []);

  const unassignedCount = tickets.filter((t) => !t.assignedAgentName).length;
  const highCriticalCount = tickets.filter(
    (ticket) =>
      ticket.status !== "RESOLVED" &&
      (ticket.priority === "HIGH" || ticket.priority === "CRITICAL"),
  ).length;
  const isAgent = user?.role === "IT_AGENT";
  const myAssignedCount = tickets.filter(
    (t) => t.assignedAgentName === user?.name,
  ).length;

  const rows = tickets
    .filter(
      (ticket) =>
        !filter || ticket.status === filter.toUpperCase().replace(" ", "_"),
    )
    .filter((ticket) => !priorityFilter || ticket.priority === priorityFilter)
    .filter(
      (ticket) => !categoryFilter || ticket.categoryName === categoryFilter,
    )
    .filter((ticket) => {
      if (quickFilter === "unassigned") return !ticket.assignedAgentName;
      if (quickFilter === "mine")
        return ticket.assignedAgentName === user?.name;
      if (quickFilter === "high") {
        return (
          ticket.status !== "RESOLVED" &&
          (ticket.priority === "HIGH" || ticket.priority === "CRITICAL")
        );
      }
      if (quickFilter === "sla")
        return ticket.status !== "RESOLVED" && ticket.priority === "CRITICAL";
      return true;
    })
    .filter((ticket) => {
      if (assigneeFilter === "unassigned") return !ticket.assignedAgentName;
      if (assigneeFilter === "mine")
        return ticket.assignedAgentName === user?.name;
      return true;
    })
    .filter((ticket) => {
      const query = search.toLowerCase();
      return (
        ticket.title?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query) ||
        ticket.createdByName?.toLowerCase().includes(query)
      );
    })
    .map((ticket) => [
      `#TICK-${ticket.id}`,
      ticket.title,
      ticket.categoryName || "Uncategorized",
      ticket.status.replace("_", " "),
      ticket.priority,
      ticket.id,
      ticket.description,
      ticket.createdAt,
      ticket.createdByName,
    ]);

  const selectedTickets = tickets.filter((ticket) =>
    selectedTicketsIds.includes(ticket.id),
  );

  const updateSelectedTickets = (responses) => {
    const updates = responses.map(({ data }) => data);
    setTickets((current) =>
      current.map((ticket) => {
        const updated = updates.find((item) => item.id === ticket.id);
        return updated || ticket;
      }),
    );
    setSelectedTicketsIds([]);
  };

  const applyBulkAction = async () => {
    if (
      !selectedTickets.length ||
      (!bulkAssignee && !bulkPriority && !bulkStatus)
    )
      return;
    setBulkSaving(true);
    setError("");
    try {
      const responses = await Promise.all(
        selectedTickets.map((ticket) => {
          if (bulkAssignee)
            return assignTicket(ticket.id, Number(bulkAssignee));
          if (bulkPriority)
            return updateTicketPriority(ticket.id, bulkPriority);
          return updateTicketStatus(ticket.id, bulkStatus);
        }),
      );
      updateSelectedTickets(responses);
      setBulkAssignee("");
      setBulkPriority("");
      setBulkStatus("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to update all selected tickets.",
      );
    } finally {
      setBulkSaving(false);
    }
  };
  return (
    <Shell>
      {user?.role == "EMPLOYEE" && (
        <PageHeader
          eyebrow="INCIDENT & SERVICE MANAGEMENT  •  QUEUE LIVE STATUS"
          title="IT Incident & Service Queue"
          description="Manage, triage, and reassign incoming service requests and incident tickets across IT tiers."
          action={
            <button
              className="primary-button"
              onClick={() => navigate("/create-ticket")}
            >
              <Icon>add</Icon>Create Ticket
            </button>
          }
        />
      )}
      {user?.role !== "EMPLOYEE" && (
        <PageHeader
          eyebrow="INCIDENT & SERVICE MANAGEMENT  •  QUEUE LIVE STATUS"
          title="IT Incident & Service Queue"
          description="Manage, triage, and reassign incoming service requests and incident tickets across IT tiers."
        />
      )}
      <div className="stats-grid">
        {[
          ["Unassigned Tickets", unassignedCount, "Action Required"],
          ["High / Critical Queue", highCriticalCount, "Needs Attention"],
          ...(isAgent
            ? [["My Assigned Queue", myAssignedCount, "Active"]]
            : []),
        ].map(([label, value, note]) => (
          <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="filter-row">
          <label className="queue-search">
            <Icon>search</Icon>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket ID, title, requester..."
              aria-label="Search tickets"
            />
            <kbd>⌘K</kbd>
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">All Categories</option>
            {[
              ...new Set(
                tickets.map((ticket) => ticket.categoryName).filter(Boolean),
              ),
            ].map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          >
            <option value="">All Agents</option>
            <option value="unassigned">Unassigned</option>
            {isAgent && <option value="mine">Assigned to Me</option>}
          </select>
        </div>
        <div className="tabs">
          {[
            ["all", "All Tickets", tickets.length],
            ["unassigned", "Unassigned", unassignedCount],
            ...(isAgent ? [["mine", "Assigned to Me", myAssignedCount]] : []),
            ["high", "High Priority", highCriticalCount],
            [
              "sla",
              "SLA Breaching",
              tickets.filter((ticket) => ticket.priority === "CRITICAL").length,
            ],
          ].map(([value, label, count]) => (
            <button
              className={quickFilter === value ? "selected" : ""}
              onClick={() => {
                setQuickFilter(value);
                setFilter("");
              }}
              key={value}
            >
              {label} <span className="tab-count">{count}</span>
            </button>
          ))}
          <button
            className="secondary-button"
            onClick={() => {
              setFilter("");
              setQuickFilter("all");
              setPriorityFilter("");
              setCategoryFilter("");
              setAssigneeFilter("");
              setSearch("");
            }}
          >
            Reset Filters
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
        {user?.role !== "EMPLOYEE" && selectedTickets.length > 0 && (
          <div className="bulk-toolbar" aria-live="polite">
            <strong>{selectedTickets.length} selected</strong>
            <select
              value={bulkAssignee}
              onChange={(event) => {
                setBulkAssignee(event.target.value);
                setBulkPriority("");
                setBulkStatus("");
              }}
              disabled={bulkSaving}
              aria-label="Assign selected tickets"
            >
              <option value="">Assign to...</option>
              {agents.map((agent) => (
                <option value={agent.id} key={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <select
              value={bulkPriority}
              onChange={(event) => {
                setBulkPriority(event.target.value);
                setBulkAssignee("");
                setBulkStatus("");
              }}
              disabled={bulkSaving}
              aria-label="Set priority for selected tickets"
            >
              <option value="">Set priority...</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={bulkStatus}
              onChange={(event) => {
                setBulkStatus(event.target.value);
                setBulkAssignee("");
                setBulkPriority("");
              }}
              disabled={bulkSaving}
              aria-label="Set status for selected tickets"
            >
              <option value="">Set status...</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <button
              className="primary-button"
              onClick={applyBulkAction}
              disabled={
                bulkSaving || (!bulkAssignee && !bulkPriority && !bulkStatus)
              }
            >
              {bulkSaving ? "Applying..." : "Apply"}
            </button>
            <button
              className="text-button"
              onClick={() => setSelectedTicketsIds([])}
              disabled={bulkSaving}
            >
              Clear
            </button>
          </div>
        )}
        {!error && rows.length > 0 && (
          <TicketTable
            role={user?.role}
            rows={rows}
            onSelect={(ticketId) => navigate(`/ticket/${ticketId}`)}
            selectable={user?.role !== "EMPLOYEE"}
            selectedIds={selectedTicketsIds}
            onToggleSelection={(ticketId) =>
              setSelectedTicketsIds((current) =>
                current.includes(ticketId)
                  ? current.filter((id) => id !== ticketId)
                  : [...current, ticketId],
              )
            }
            onSelectionChange={setSelectedTicketsIds}
          />
        )}
        {!error && rows.length === 0 && <p>No tickets found.</p>}
      </section>
    </Shell>
  );
}
