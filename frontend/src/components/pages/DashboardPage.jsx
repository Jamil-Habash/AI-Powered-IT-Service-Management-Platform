import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import TicketTable from "../TicketTable";

const tickets = [
  [
    "#TICK-1094",
    "MacBook Pro secondary monitor flickering via Thunderbolt dock",
    "Hardware",
    "In Progress",
    "High",
  ],
  [
    "#TICK-1091",
    "Request VPN certificate renewal & access for EMEA staging",
    "Network / VPN",
    "Open",
    "Medium",
  ],
  [
    "#TICK-1088",
    "Figma Enterprise license seat allocation for Design System team",
    "Software",
    "In Progress",
    "Medium",
  ],
  [
    "#TICK-1085",
    "SSO login issue with Internal Jira & Confluence workspace",
    "Access & Permissions",
    "Open",
    "Critical",
  ],
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const shown = tickets.filter(
    (ticket) =>
      ticket[1].toLowerCase().includes(search.toLowerCase()) ||
      ticket[0].toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE PORTAL  •  IT SUPPORT DESK"
        title="Welcome back, Alex"
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
          ["My Open Tickets", "3", "tickets"],
          ["In Progress", "2", "active"],
          ["Resolved", "14", "this quarter"],
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
        <TicketTable
          rows={shown}
          onSelect={() => navigate("/ticket/TICK-1094")}
        />
      </section>
    </Shell>
  );
}
