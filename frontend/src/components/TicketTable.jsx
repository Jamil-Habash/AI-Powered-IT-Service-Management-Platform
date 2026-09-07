import Icon from "./Icon";

export default function TicketTable({ rows, onSelect }) {
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
