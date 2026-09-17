const statusStyles = {
  OPEN: "status-badge open",
  IN_PROGRESS: "status-badge in-progress",
  RESOLVED: "status-badge resolved",
};

export default function StatusBadge({ status }) {
  const normalized = status
    ?.toLowerCase()
    ?.replace("in progress", "in-progress");
  const styleClass = statusStyles[status] || "status-badge default";

  return (
    <span className={styleClass}>
      {normalized || status?.replace("_", " ")}
    </span>
  );
}
