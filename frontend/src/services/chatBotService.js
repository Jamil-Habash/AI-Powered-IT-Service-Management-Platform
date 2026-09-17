import api from "./api";

export const chatWithAI = (message, conversationId = null) =>
  api.post("/ai/chat", { message, conversationId });

export const getChatHistory = (conversationId) =>
  api.get(`/ai/chat/${conversationId}`);

export const createTicketFromChat = (conversationId, ticketData) =>
  api.post("/ai/chat/ticket", { conversationId, ...ticketData });
