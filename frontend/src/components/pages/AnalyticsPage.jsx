import { useEffect, useState } from "react";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { getTickets } from "../../services/ticketService";

export default function AnalyticsPage() {
  const [metric, setMetric] = useState("volume");
  const [date, setDate] = useState("Last 30 Days");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTickets()
      .then((response) => setTickets(response.data))
      .catch(() => setError("Unable to load analytics data."));
  }, []);

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const priorityTickets = tickets.filter(
    (ticket) => ticket.priority === "HIGH" || ticket.priority === "CRITICAL",
  );
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");
  const categoryCounts = Object.entries(
    tickets.reduce((counts, ticket) => {
      const name = ticket.categoryName || "Uncategorized";
      counts[name] = (counts[name] || 0) + 1;
      return counts;
    }, {}),
  );
  const agentCounts = Object.entries(
    tickets.reduce((counts, ticket) => {
      if (ticket.assignedAgentName) {
        counts[ticket.assignedAgentName] = (counts[ticket.assignedAgentName] || 0) + 1;
      }
      return counts;
    }, {}),
  );
  return (
    <Shell>
      <PageHeader
        eyebrow="ITSM OPERATIONAL INTELLIGENCE  •  LIVE TELEMETRY"
        title="IT Operations & Analytics"
        description="Real-time performance tracking, ticket volume trends, agent allocation, and service category management."
        action={
          <select
            value={date}
            onChange={(event) => setDate(event.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
        }
      />
      {error && <p className="form-error">{error}</p>}
      <div className="stats-grid analytics-stats">
        {[
          ["Open Tickets", openTickets.length, "Current records"],
          ["High / Critical Priority", priorityTickets.length, "Current records"],
          ["In Progress", inProgressTickets.length, "Current records"],
          ["Resolved (Period)", resolvedTickets.length, "Current records"],
        ].map(([label, value, note]) => (
          <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </section>
        ))}
      </div>
      <div className="content-grid analytics-grid">
        <section className="panel chart">
          <div className="panel-heading">
            <h2>Tickets by Category</h2>
            <div className="tabs">
              <button
                className={metric === "volume" ? "selected" : ""}
                onClick={() => setMetric("volume")}
              >
                Volume
              </button>
              <button
                className={metric === "sla" ? "selected" : ""}
                onClick={() => setMetric("sla")}
              >
                SLA Breach %
              </button>
            </div>
          </div>
          {categoryCounts.map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>
                  {metric === "volume"
                    ? `${value} tickets`
                    : "Unavailable"}
                </b>
              </span>
              <i>
                <em
                  style={{
                    width: `${metric === "volume" ? Math.min(value * 10, 100) : 0}%`,
                  }}
                />
              </i>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Agent Workload & Allocation</h2>
          {agentCounts.map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>{value} tickets</b>
              </span>
              <i>
                <em style={{ width: `${Math.min(value * 20, 100)}%` }} />
              </i>
            </div>
          ))}
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Manage Ticket Categories</h2>
            <p>
              Configure routing queues, SLA commitments, and activation
              statuses.
            </p>
          </div>
          <button className="primary-button">+ Add Service Category</button>
        </div>
        {categoryCounts.map(([category, count]) => (
          <div className="category-row" key={category}>
            <strong>{category}</strong>
            <span>{count} tickets</span>
            <span>SLA data unavailable</span>
            <button className="secondary-button">Active</button>
          </div>
        ))}
      </section>
    </Shell>
  );
}
