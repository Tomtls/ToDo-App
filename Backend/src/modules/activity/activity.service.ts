import { ActivityRepository } from "./activity.repository.js";

export class ActivityService {
  constructor(private readonly repo: ActivityRepository) { }

  async logTaskCreated(owner_id: string, task_id: string, payload?: unknown) {
    return this.repo.create(owner_id, "TaskCreated", task_id, payload);
  }

  async logTaskUpdated(owner_id: string, task_id: string, payload?: unknown) {
    return this.repo.create(owner_id, "TaskUpdated", task_id, payload);
  }

  async logTaskDeleted(owner_id: string, task_id: string, payload?: unknown) {
    return this.repo.create(owner_id, "TaskDeleted", task_id, payload);
  }
}
