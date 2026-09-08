import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import TicketTable from "../TicketTable";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketService";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role !== "EMPLOYEE") {
    return <AgentDashboard user={user} />;
  }

  return <EmployeeDashboard user={user} />;
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
        title={`Good morning, ${user?.name || "there"}`}
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
