import api from "./api";

export const registerUser = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });

export const verifyEmail = (email, code) =>
  api.post("/auth/verify-email", { email, code });

export const resendVerificationCode = (email) =>
  api.post("/auth/resend-verification", { email });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword });

export const validateResetToken = (token) =>
  api.get("auth/validate-reset-token", { params: { token } });
