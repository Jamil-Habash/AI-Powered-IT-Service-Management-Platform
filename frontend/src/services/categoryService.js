import api from "./api";

export const getCategories = () => api.get("/categories");
