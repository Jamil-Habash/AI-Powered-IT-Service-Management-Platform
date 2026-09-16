import api from "./api";

export const getAgents = () => api.get("/agents");
export const getUsers = () => api.get("/users");
export const updateUser = (id, name, email, password) =>
  api.patch(`/user/${id}/update`, {
    name,
    email,
    password: password || undefined,
  });
export const adminUpdateUser = (id, name, email, password, role) =>
  api.patch(`/admin/users/${id}`, {
    name,
    email,
    password: password || undefined,
    role,
  });
export const deactivateUser = (id) =>
  api.patch(`/admin/users/${id}/deactivate`);
export const activateUser = (id) => api.patch(`/admin/users/${id}/activate`);
