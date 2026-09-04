import api from "./api";

export const registerUser = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });