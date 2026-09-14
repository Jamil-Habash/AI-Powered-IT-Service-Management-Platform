import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import TicketTable from "../components/TicketTable";
import { getTickets } from "../services/ticketService";

export default function AgentDashboard({ user }) {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    let active = true;

    getTickets()
        .then((response) => {
        const data = Array.isArray(response.data)
            ? response.data
            : response.data?.content || [];
        if (active) setTickets(data);
        })
        .catch(() => {
        if (active) setError("Unable to load the operations dashboard.");
        })
        .finally(() => {
        if (active) setLoading(false);
        });

    return () => {
        active = false;
    };
    }, []);

    const assignedToMe = tickets.filter(
    (ticket) => ticket.assignedAgentName === user?.name,
    );
    const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
    const unassignedTickets = tickets.filter((ticket) => !ticket.assignedAgentName);
    const inProgressTickets = tickets.filter((ticket) => ticket.status === "IN_PROGRESS");
    const resolvedTickets = tickets.filter((tickets) => tickets.status === "RESOLVED");
    const shown = tickets
    .slice()
    .sort((first, second) => {
        const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondDate - firstDate || Number(second.id) - Number(first.id);
    })
    .filter((ticket) => {
        const query = search.toLowerCase();
        return (
        ticket.title?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query) ||
        ticket.createdByName?.toLowerCase().includes(query)
        );
    })
    .slice(0, 5)
    .map((ticket) => [
        `#TICK-${ticket.id}`,
        ticket.title,
        ticket.categoryName || "Uncategorized",
        (ticket.status || "OPEN").replace("_", " "),
        ticket.priority,
        ticket.id,
        ticket.description,
        ticket.createdAt,
    ]);

    return (
    <Shell>
        <PageHeader
        eyebrow="IT OPERATIONS  •  AGENT WORKSPACE"
        title={`Welcome back, ${user?.name || "there"}`}
        description="Monitor the support queue, prioritize incidents, and keep assigned work moving."
        action={
            <button className="primary-button" onClick={() => navigate("/tickets")}>
            <Icon>confirmation_number</Icon>Open Ticket Queue
            </button>
        }
        />
        <div className="agent-dashboard">
        <section className="stat-card agent-primary-stat">
            <span>My Assigned</span>
            <strong>{assignedToMe.length}</strong>
            <small>assigned to you</small>
        </section>
        <div className="agent-secondary-stats">
        {[
            ["Open Queue", openTickets.length, "tickets awaiting action"],
            ["In Progress", inProgressTickets.length, "actively being handled"],
            ["Resolved Tickets", resolvedTickets.length, "already handled"],
            ["Unassigned", unassignedTickets.length, "need an owner"]
        ].map(([label, value, note]) => (
            <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
            </section>
        ))}
        </div>
        </div>
        <section className="panel">
        <div className="panel-heading">
            <div>
            <h2>Latest Support Activity</h2>
            <p>Review the newest requests across the support operation.</p>
            </div>
            <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            />
        </div>
        {loading && <p>Loading operations dashboard...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && shown.length === 0 && <p>No tickets found.</p>}
        {!loading && !error && shown.length > 0 && (
            <TicketTable
            rows={shown}
            onSelect={(ticketId) => navigate(`/ticket/${ticketId}`)}
            />
        )}
        </section>
    </Shell>
    );
}