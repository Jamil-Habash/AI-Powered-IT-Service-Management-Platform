const statusStyles = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
