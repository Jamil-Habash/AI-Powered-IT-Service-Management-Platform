import api from "./api";

export const getAgents = () => api.get("/agents");
export const getUsers = () => api.get("/users");
export const updateUser = (id, name, email, password) =>
  api.patch(`/user/${id}/update`, { name, email, password: password || undefined });