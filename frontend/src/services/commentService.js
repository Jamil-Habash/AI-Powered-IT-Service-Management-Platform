import api from "./api";

export const getComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

export const addComment = (ticketId, content) =>
  api.post(`/tickets/${ticketId}/comments`, { content });
