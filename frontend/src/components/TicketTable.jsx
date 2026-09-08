import { useState } from "react";
import Icon from "./Icon";

export default function TicketTable({ rows, onSelect, variant = "default" }) {
  if (variant === "queue") {
    return <QueueTicketTable rows={rows} onSelect={onSelect} />;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Ticket Details</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(([id, title, category, status, priority, ticketId, description, createdAt]) => (
            <tr key={id} onClick={() => onSelect(ticketId ?? id)}>
              <td>
                <b className="ticket-id">{id}</b>
                <strong>{title}</strong>
                <small>
                  {description || "No description provided."}
                </small>
              </td>
              <td>
                <span className="tag">{category}</span>
              </td>
              <td>
                <span className="status">{status}</span>
              </td>
              <td>
                <span className={`priority ${priority.toLowerCase()}`}>
                  {priority}
                </span>
              </td>
              <td>
                <small>
                  {createdAt
                    ? new Date(createdAt).toLocaleString()
                    : "Date unavailable"}
                </small>
              </td>
              <td>
                <Icon>chevron_right</Icon>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QueueTicketTable({ rows, onSelect }) {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const visibleIds = visibleRows.map(([id]) => id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleAll = () => {
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="queue-table-wrap">
      <div className="table-scroll queue-table-scroll">
        <table className="queue-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject / Issue Preview</th>
              <th>Employee / Requester</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody >
            {visibleRows.map(([id, title, category, status, priority, ticketId, description, createdAt, requester]) => (
              <tr key={id} onClick={() => onSelect(ticketId ?? id)}>
                <td><button className="queue-ticket-id">{id}</button></td>
                <td>
                  <button className="queue-subject" >{title}</button>
                  <small>{description || "No description provided."}</small>
                </td>
                <td><strong className="requester-name">{requester || "Unknown requester"}</strong><small>{createdAt ? new Date(createdAt).toLocaleDateString() : ""}</small></td>
                <td><span className="queue-tag">{category}</span></td>
                <td><span className={`queue-status ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span></td>
                <td><span className={`queue-priority ${priority.toLowerCase()}`}><i />{priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="queue-pagination">
      <span>Showing {rows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, rows.length)} of {rows.length} tickets</span>
      <div className="pagination-controls">
        <label className="rows-per-page">
          Rows per page:
          <select value={pageSize} disabled>
            <option>{pageSize}</option>
          </select>
        </label>
        <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹ Previous</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 4).map((value) => (
          <button className={page === value ? "current" : ""} key={value} onClick={() => setPage(value)}>{value}</button>
        ))}
        <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next ›</button>
      </div>
    </div>
    </div>
  );
}
