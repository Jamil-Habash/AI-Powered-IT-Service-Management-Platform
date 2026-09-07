import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import TicketTable from "../TicketTable";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketService";

export default function TicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTickets()
      .then((response) => setTickets(response.data))
      .catch(() => setError("Unable to load tickets. Please try again."));
  }, []);

  const unassignedCount = tickets.filter((t) => !t.assignedAgentName).length;
  const highCriticalCount = tickets.filter((t) => t.priority === "HIGH" || t.priority === "CRITICAL").length;
  const myAssignedCount = tickets.filter((t) => t.assignedAgentName === user?.name).length;

  const rows = tickets
    .filter((ticket) => !filter || ticket.status === filter.toUpperCase().replace(" ", "_"))
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
    ]);
  return (
    <Shell>
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
      <div className="stats-grid queue-stats">
        {[
          ["Unassigned Tickets", unassignedCount, "Action Required"],
          ["High / Critical Queue", highCriticalCount, "Needs Attention"],
          ["My Assigned Queue", myAssignedCount, "Active"],
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
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ticket ID, title, requester..."
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <button className="secondary-button" onClick={() => setFilter("")}>
            Reset Filters
          </button>
        </div>
        <div className="tabs">
          {["", "Open", "In Progress", "Resolved"].map((value) => (
            <button
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
              key={value}
            >
              {value || "All Tickets"}
            </button>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        {!error && rows.length > 0 && (
          <TicketTable
            rows={rows}
            onSelect={(ticketId) => navigate(`/ticket/${ticketId}`)}
          />
        )}
        {!error && rows.length === 0 && <p>No tickets found.</p>}
      </section>
    </Shell>
  );
}
