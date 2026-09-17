const priorityStyles = {
  LOW: "priority-badge low",
  MEDIUM: "priority-badge medium",
  HIGH: "priority-badge high",
  CRITICAL: "priority-badge critical",
};

export default function PriorityBadge({ priority }) {
  const styleClass = priorityStyles[priority] || "priority-badge default";

  return <span className={styleClass}>{priority}</span>;
}
