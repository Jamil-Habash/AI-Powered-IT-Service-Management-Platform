import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import TicketTable from "../TicketTable";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getTickets()
      .then((response) => {
        if (active) setTickets(response.data);
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
    .filter((ticket) => {
      const query = search.toLowerCase();
      return (
        ticket.title?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query)
      );
    })
    .slice(0, 4)
    .map((ticket) => [
      `#TICK-${ticket.id}`,
      ticket.title,
      ticket.categoryName || "Uncategorized",
      ticket.status.replace("_", " "),
      ticket.priority,
      ticket.id,
    ]);

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE PORTAL  •  IT SUPPORT DESK"
        title={`Welcome back, ${user?.name || "there"}`}
        description="Here is an overview of your IT service requests and real-time support status."
        action={
          <button
            className="primary-button"
            onClick={() => navigate("/create-ticket")}
          >
            <Icon>add</Icon>New Ticket
          </button>
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
