import { apiFetch } from "./client";

export const labelsApi = {
  async list() {
    return apiFetch("/labels");
  },

  async create(name) {
    const normalized = typeof name === "string" ? name.trim() : name;
    return apiFetch("/labels", { method: "POST", body: { name: normalized } });
  },

  async update(id, name) {
    const normalized = typeof name === "string" ? name.trim() : name;
    return apiFetch(`/labels/${id}`, { method: "PATCH", body: { name: normalized }, });
  },

  async remove(id) {
    await apiFetch(`/labels/${id}`, { method: "DELETE" });
  },
};
