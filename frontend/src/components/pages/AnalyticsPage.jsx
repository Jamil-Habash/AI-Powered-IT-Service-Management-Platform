import { useState } from "react";
import PageHeader from "../PageHeader";
import Shell from "../Shell";

export default function AnalyticsPage() {
  const [metric, setMetric] = useState("volume");
  const [date, setDate] = useState("Last 30 Days");
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
      <div className="stats-grid analytics-stats">
        {[
          ["Open Tickets", "42", "+8%"],
          ["High / Critical Priority", "9", "Needs Attention"],
          ["In Progress", "28", "On Track"],
          ["Resolved (Period)", "184", "96.2% SLA"],
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
          {[
            ["Network & VPN", 78],
            ["Software & Applications", 64],
            ["Hardware & Peripherals", 52],
            ["Accounts & Access", 41],
            ["Security & Compliance", 28],
          ].map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>
                  {metric === "volume"
                    ? `${value} tickets`
                    : `${Math.round(value / 8)}% breach`}
                </b>
              </span>
              <i>
                <em
                  style={{
                    width: `${metric === "volume" ? value : value / 2}%`,
                  }}
                />
              </i>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Agent Workload & Allocation</h2>
          {[
            ["Sarah Jenkins", 100],
            ["Marcus Cole", 88],
            ["David Chen", 63],
            ["Emily Taylor", 63],
            ["Jessica Lin", 38],
          ].map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>{value}%</b>
              </span>
              <i>
                <em style={{ width: `${value}%` }} />
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
        {[
          "Network & VPN",
          "Software & Applications",
          "Hardware & Peripherals",
          "Accounts & Identity",
          "Security & Compliance",
        ].map((category) => (
          <div className="category-row" key={category}>
            <strong>{category}</strong>
            <span>Tier 1 Service Desk</span>
            <span>Response &lt; 1h · Resolve &lt; 8h</span>
            <button className="secondary-button">Active</button>
          </div>
        ))}
      </section>
    </Shell>
  );
}
