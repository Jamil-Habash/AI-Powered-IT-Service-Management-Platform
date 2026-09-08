import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { useAuth } from "../../context/AuthContext";
import {
  getAgents,
  getTicket,
  assignTicket,
  resolveTicket,
  updateTicketPriority,
  updateTicketStatus,
} from "../../services/ticketService";
import { getComments, addComment } from "../../services/commentService";

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [agents, setAgents] = useState([]);

  const initials = (ticket?.createdByName || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    getTicket(id)
      .then((response) => setTicket(response.data))
      .catch(() => setError("Unable to load this ticket."));
    getComments(id)
      .then((response) => setComments(Array.isArray(response.data) ? response.data : []))
      .catch(() => {});
  }, [id, user?.role]);

  useEffect(() => {
      getAgents()
        .then((response) => {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.content || [];
          setAgents(data);
        })
        .catch(() => setError("Unable to load Agents. Please try again."));
    }, []);

  const updateTicket = async (update) => {
    setError("");
    setSaving(true);
    try {
      const response = await update;
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update this ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = (event) => {
    const agentId = event.target.value;
    if (!agentId) return;
    updateTicket(assignTicket(id, Number(agentId)));
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      await addComment(id, reply);
      setReply("");
      loadComments();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to post comment.");
    } finally {
      setSendingReply(false);
    }
  };

  if (error) return <Shell><p className="form-error">{error}</p></Shell>;
  if (!ticket) return <Shell><p>Loading ticket...</p></Shell>;

  const status = ticket.status || "OPEN";
  const priority = ticket.priority || "MEDIUM";
  const statusLabel = status.replace("_", " ");
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
          <div className="detail-actions">
            <button className="secondary-button" onClick={() => navigate("/tickets")}>
              <Icon>arrow_back</Icon>Back to Tickets
            </button>
            <button className="secondary-button" onClick={() => window.print()}>
              <Icon>print</Icon>Print Summary
            </button>
            <button className="secondary-button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              <Icon>share</Icon>Share
            </button>
          </div>
        }
      />
      <div className="content-grid detail-grid">
        <div>
          <section className="panel ticket-overview">
            <span className="status">{statusLabel}</span>
            <span className={`priority ${priority.toLowerCase()}`}>
              {priority} Priority
            </span>
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
              <small>{comments.length === 0 ? "No messages" : `${comments.length} message${comments.length > 1 ? "s" : ""}`}</small>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="av-com">
                  <span className="avatar">{initials}</span>
                </div>
                <div>
                  <strong>{c.authorName}</strong>
                  <div>
                    <small>{new Date(c.createdAt).toLocaleString()}</small>
                  </div>
                  <p>{c.content}</p>
                </div>
              </div>
            ))}

            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Type your response to the employee..."
              rows="3"
            />
            <button className="primary-button" onClick={handleSendReply} disabled={sendingReply}>
              {sendingReply ? "Sending..." : "Send Reply"}
            </button>
          </section>
        </div>
        {user?.role !== "EMPLOYEE" && (
          <aside className="panel side-panel">
            <h2>Agent Controls</h2>
            <label>
              Assignee
              <select
                value={ticket.assignedAgentId || ""}
                disabled={saving || agents.length === 0}
                onChange={handleAssign}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option value={agent.id} key={agent.id}>
                    {agent.name} {agent.role ? `(${agent.role.replace("_", " ")})` : ""}
                  </option>
                ))}
              </select>
              {!agents.length && <small>Loading available agents...</small>}
            </label>
            <label>
              Ticket Status
              <select
                value={status}
                disabled={saving}
                onChange={(event) =>
                  updateTicket(updateTicketStatus(id, event.target.value))
                }
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </label>
            <label>
              Ticket Priority
              <select
                value={priority}
                disabled={saving}
                onChange={(event) =>
                  updateTicket(updateTicketPriority(id, event.target.value))
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
            <h2>Requester Profile</h2>
            <div className="profile large">
              <b>{initials}</b>
              <span>
                <strong>{ticket.createdByName || "Unknown"}</strong><br></br>
                <small>Requester</small>
              </span>
            </div>
            <button
              className="success-button"
              disabled={saving || status === "RESOLVED"}
              onClick={() => updateTicket(resolveTicket(id))}
            >
              {saving ? "Saving..." : "Resolve Ticket"}
            </button>
          </aside>
        )}
      </div>
    </Shell>
  );
}
