import { apiFetch } from "./client";

export const taskLabelsApi = {
  async list(taskId) {
    return apiFetch(`/tasks/${taskId}/labels`);
  },

  async add(taskId, labelId) {
    return apiFetch(`/tasks/${taskId}/labels`, {
      method: "POST",
      body: { label_id: labelId },
    });
  },

  async remove(taskId, labelId) {
    await apiFetch(`/tasks/${taskId}/labels/${labelId}`, {
      method: "DELETE",
    });
  },
};
