import { apiFetch } from "./client";

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const tasksApi = {
  async list(filters) {
    const data = await apiFetch(`/tasks${buildQuery(filters)}`);
    return data?.items ?? [];
  },

  async get(id) {
    return apiFetch(`/tasks/${id}`);
  },

  async create(payload) {
    return apiFetch("/tasks", { method: "POST", body: payload });
  },

  async update(id, payload) {
    return apiFetch(`/tasks/${id}`, { method: "PATCH", body: payload });
  },

  async remove(id) {
    await apiFetch(`/tasks/${id}`, { method: "DELETE" });
  },
};
