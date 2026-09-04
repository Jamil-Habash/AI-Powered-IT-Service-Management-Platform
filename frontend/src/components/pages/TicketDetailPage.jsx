import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { getTicket } from "../../services/ticketService";

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getTicket(id)
      .then((response) => setTicket(response.data))
      .catch(() => setError("Unable to load this ticket."));
  }, [id]);

  if (error) return <Shell><p className="form-error">{error}</p></Shell>;
  if (!ticket) return <Shell><p>Loading ticket...</p></Shell>;

  const status = ticket.status.replace("_", " ");
  const priority = ticket.priority.toLowerCase();
  const created = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : "Date unavailable";
  return (
    <Shell>
      <PageHeader
        eyebrow={`TICKETS  /  #TICK-${ticket.id}  /  DETAILS`}
        title={ticket.title}
        description={`Created ${created}`}
        action={
          <button className="secondary-button" onClick={() => window.print()}>
            <Icon>print</Icon>Print Summary
          </button>
        }
      />
      <div className="content-grid detail-grid">
        <div>
          <section className="panel ticket-overview">
            <span className="status">{status}</span>
            <span className={`priority ${priority}`}>{ticket.priority} Priority</span>
            <div className="metadata">
              <span>
                <small>Ticket ID</small>
                  <b>#TICK-{ticket.id}</b>
              </span>
              <span>
                <small>Requester</small>
                  <b>{ticket.createdByName || "Unknown"}</b>
              </span>
              <span>
                <small>Assignee</small>
                  <b>{ticket.assignedAgentName || "Unassigned"}</b>
              </span>
              <span>
                <small>Category</small>
                  <b>{ticket.categoryName || "Uncategorized"}</b>
              </span>
            </div>
          </section>
          <section className="panel ai-panel">
            <h2>
              <Icon>auto_awesome</Icon>SmartDesk AI Copilot Analysis
            </h2>
            <p>Review the ticket description and support history for recommended next steps.</p>
            <div className="progress">
              <span />
            </div>
            <button className="primary-button">Apply Firmware Patch</button>
          </section>
          <section className="panel">
            <h2>Issue Description</h2>
            <p>
              {ticket.description}
            </p>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Activity & Discussion</h2>
              <small>No messages</small>
            </div>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Type your response to the employee..."
              rows="3"
            />
            <button
              className="primary-button"
              onClick={() => {
                setReply("");
              }}
            >
              Send Reply
            </button>
          </section>
        </div>
        <aside className="panel side-panel">
          <h2>Agent Controls</h2>
          <label>
            Assignee
            <select>
              <option>Sarah Jenkins (Tier 2 Hardware)</option>
              <option>Alex Morgan</option>
            </select>
          </label>
          <label>
            Ticket Status
            <select>
              <option>{status}</option>
            </select>
          </label>
          <h2>Requester Profile</h2>
          <div className="profile large">
            <b>AM</b>
            <span>
                <strong>{ticket.createdByName || "Unknown"}</strong>
                <small>Requester</small>
            </span>
          </div>
          <button className="secondary-button">Request Screen Share</button>
          <button className="success-button">Resolve Ticket</button>
        </aside>
      </div>
    </Shell>
  );
}
