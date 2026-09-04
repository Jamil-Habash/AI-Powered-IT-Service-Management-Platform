import api from "./api";

export const getTickets = () => api.get("/tickets");
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const createTicket = (ticket) => api.post("/tickets", ticket);
