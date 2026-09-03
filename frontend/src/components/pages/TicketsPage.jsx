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
  [
    "#TICK-1087",
    "Outlook calendar sync looping after Office 365 migration",
    "Software",
    "Resolved",
    "Low",
  ],
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const rows = tickets.filter((row) => !filter || row[3] === filter);
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
          ["Unassigned Tickets", "6", "Action Required"],
          ["High / Critical Queue", "8", "Needs Attention"],
          ["My Assigned Queue", "5", "3 In Progress"],
          ["SLA At Risk (< 2h)", "3", "91.4% Target"],
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
          <input placeholder="Search ticket ID, title, requester..." />
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
        <TicketTable
          rows={rows}
          onSelect={() => navigate("/ticket/TICK-1094")}
        />
      </section>
    </Shell>
  );
}
