import api from "./api";

export const getArticles = () => api.get("/knowledge-base");
export const getArticleById = (id) => api.get(`/knowledge-base/${id}`);
export const createArticle = (data) => api.post("/knowledge-base", data);
export const updateArticle = (id, data) =>
  api.put(`/knowledge-base/${id}`, data);
export const deleteArticle = (id) => api.delete(`/knowledge-base/${id}`);
