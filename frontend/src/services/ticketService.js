import api from "./api";

export const getTickets = () => api.get("/tickets");
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const createTicket = (ticket) => api.post("/tickets", ticket);
export const assignTicket = (id, agentId) =>
  api.patch(`/tickets/${id}/assign`, { agentId });

export const updateTicketStatus = (id, status) =>
  api.patch(`/tickets/${id}/status`, { status });

export const updateTicketPriority = (id, priority) =>
  api.patch(`/tickets/${id}/priority`, { priority });

export const resolveTicket = (id) => api.patch(`/tickets/${id}/resolve`);