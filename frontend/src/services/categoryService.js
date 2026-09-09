import api from "./api";

export const getCategories = () => api.get("/categories");
export const addCategory = (name, description) =>
    api.post("/categories", { name, description});
