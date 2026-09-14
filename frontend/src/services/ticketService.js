import api from "./api";

export const getTickets = () => api.get("/tickets");
export const getAgents = () => api.get("/agents");
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const createTicket = (ticket, files = []) => {
  const formData = new FormData();
  formData.append("ticket", new Blob([JSON.stringify(ticket)], { type: "application/json" }));
  files.forEach((file) => formData.append("files", file));
  return api.post("/tickets", formData, { headers: { "Content-Type": undefined } });
};
export const downloadAttachment = (ticketId, attachmentId) =>
  api.get(`/tickets/${ticketId}/attachments/${attachmentId}`, { responseType: "blob" });
export const assignTicket = (id, agentId) =>
  api.patch(`/tickets/${id}/assign`, { agentId });

export const updateTicketStatus = (id, status) =>
  api.patch(`/tickets/${id}/status`, { status });

export const updateTicketPriority = (id, priority) =>
  api.patch(`/tickets/${id}/priority`, { priority });

export const resolveTicket = (id) => api.patch(`/tickets/${id}/resolve`);