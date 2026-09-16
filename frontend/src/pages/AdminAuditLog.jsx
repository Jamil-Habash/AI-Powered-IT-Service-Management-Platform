import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import PageHeader from "../components/PageHeader";
import Icon from "../components/Icon";
import { getAuditLogs } from "../services/auditLogService";

export default function AdminAuditLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then((res) => setLogs(res.data))
      .catch((requestError) => {
        setError(
          requestError.response?.status === 403
            ? "Administrator access is required to view audit logs."
            : "Unable to load audit logs.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <PageHeader
        eyebrow="ADMIN • SYSTEM ACTIVITY"
        title="Audit Log"
        description="A chronological record of ticket actions taken by agents and admins."
        action={
          <button
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            <Icon>arrow_back</Icon>Back to Manage Users
          </button>
        }
      />
      <section className="panel">
        {loading && <p>Loading...</p>}
        {!loading && error && <p className="form-error">{error}</p>}
        {!loading && !error && logs.length === 0 && (
          <p>No activity recorded yet.</p>
        )}
        {!loading && !error && logs.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="py-2">When</th>
                <th className="py-2">Action</th>
                <th className="py-2">Target</th>
                <th className="py-2">Details</th>
                <th className="py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b text-sm">
                  <td className="py-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2">{log.action}</td>
                  <td className="py-2">
                    {log.targetType} #{log.targetId}
                  </td>
                  <td className="py-2">{log.details}</td>
                  <td className="py-2">{log.performedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Shell>
  );
}
