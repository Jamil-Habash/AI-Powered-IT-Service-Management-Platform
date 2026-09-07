const priorityStyles = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyles[priority] || "bg-gray-100 text-gray-700"}`}>
      {priority}
    </span>
  );
}