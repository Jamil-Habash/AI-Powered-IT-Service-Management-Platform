import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  getTicket,
  downloadAttachment,
  assignTicket,
  resolveTicket,
  updateTicketPriority,
  updateTicketStatus,
} from "../services/ticketService";
import MarkdownContent from "../components/MarkdownContent";
import { getAgents } from "../services/userService";
import { getComments, addComment } from "../services/commentService";
import usePageTitle from "../hooks/usePageTitle";
import { exportTicketPdf } from "../utils/exportTicketPdf";

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
  const [attachmentError, setAttachmentError] = useState("");

  usePageTitle(ticket ? `Ticket ${id} ${ticket.title}` : `Ticket ${id}`);

  const initials = (name) =>
    (name || "User")
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
      .then((response) =>
        setComments(Array.isArray(response.data) ? response.data : []),
      )
      .catch(() => {});
    // Poll every 3 seconds until AI analysis appears, stop after ~30 seconds
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      getTicket(id).then((response) => {
        setTicket(response.data);
        if (response.data.aiSummary || attempts > 10) {
          clearInterval(interval);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [id, user?.role]);

  const loadComments = async () => {
    const response = await getComments(id);
    setComments(Array.isArray(response.data) ? response.data : []);
  };

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
      await loadComments();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to post comment.");
    } finally {
      setSendingReply(false);
    }
  };

  const openAttachment = async (attachment) => {
    setAttachmentError("");
    try {
      const response = await downloadAttachment(id, attachment.id);
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setAttachmentError("Unable to open this attachment.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (error)
    return (
      <Shell>
        <p className="form-error">{error}</p>
      </Shell>
    );
  if (!ticket)
    return (
      <Shell>
        <p>Loading ticket...</p>
      </Shell>
    );

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
            <button
              className="secondary-button"
              onClick={() => navigate("/tickets")}
            >
              <Icon>arrow_back</Icon>Back to Tickets
            </button>
            <button
              className="secondary-button"
              onClick={() => exportTicketPdf(ticket, comments)}
            >
              <Icon>picture_as_pdf</Icon>Export PDF
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
          <section className="panel">
            <h2>Issue Description</h2>
            <MarkdownContent>{ticket.description}</MarkdownContent>
            {ticket.attachments?.length > 0 && (
              <div className="attachments-section">
                <div className="panel-heading">
                  <h3>Attachments</h3>
                  <small>
                    {ticket.attachments.length} file
                    {ticket.attachments.length === 1 ? "" : "s"}
                  </small>
                </div>
                <div className="attachments-list">
                  {ticket.attachments.map((attachment) => (
                    <div className="attachment-item" key={attachment.id}>
                      <Icon>
                        {attachment.contentType?.startsWith("image/")
                          ? "image"
                          : "description"}
                      </Icon>
                      <div>
                        <strong>{attachment.fileName}</strong>
                        <small>{formatFileSize(attachment.fileSize)}</small>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        title="Open attachment"
                        onClick={() => openAttachment(attachment)}
                      >
                        <Icon>open_in_new</Icon>
                      </button>
                    </div>
                  ))}
                </div>
                {attachmentError && (
                  <p className="form-error">{attachmentError}</p>
                )}
              </div>
            )}
          </section>
          <section className="panel ai-panel">
            <h2>
              <Icon>auto_awesome</Icon>SmartDesk AI Copilot Analysis
            </h2>
            {ticket.aiSummary ? (
              <>
                <p>{ticket.aiSummary}</p>
                <div className="ai-suggestions">
                  <span>
                    Suggested category:{" "}
                    <strong>{ticket.aiSuggestedCategory}</strong>
                  </span>
                  <br></br>
                  <span>
                    Suggested priority:{" "}
                    <strong>{ticket.aiSuggestedPriority}</strong>
                  </span>
                </div>
                <ul>
                  {ticket.aiSuggestedActions?.map((action, i) => (
                    <li key={i}>{action}.</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Analyzing ticket... this usually takes a few seconds.</p>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Activity & Discussion</h2>
              <small>
                {comments.length === 0
                  ? "No messages"
                  : `${comments.length} message${comments.length > 1 ? "s" : ""}`}
              </small>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="av-com">
                  <span className="avatar">{initials(c.authorName)}</span>
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
              placeholder="Type your response..."
              rows="3"
            />
            <button
              className="primary-button"
              onClick={handleSendReply}
              disabled={sendingReply}
            >
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
                    {agent.name}{" "}
                    {agent.role ? `(${agent.role.replace("_", " ")})` : ""}
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
