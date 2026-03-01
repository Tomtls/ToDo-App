import { TasksRepository } from "./tasks.repository.js";
import { ActivityService } from "../activity/activity.service.js";
import type { CreateTaskDto, UpdateTaskDto, TaskListFilters } from "./tasks.types.js";

export class TasksService {
  constructor(
    private readonly repo: TasksRepository,
    private readonly activity: ActivityService
  ) { }

  async listLatest(owner_id: string, filters?: TaskListFilters) {
    return this.repo.listLatest(owner_id, filters);
  }

  async getById(owner_id: string, id: bigint) {
    const task = await this.repo.findById(owner_id, id);
    if (!task) {
      const err: any = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  async create(owner_id: string, dto: CreateTaskDto) {
    const task = await this.repo.create(owner_id, { ...dto, title: dto.title.trim() });
    await this.activity.logTaskCreated(owner_id, task.id, {
      title: task.title,
      description: task.description,
      status: task.status,
      due_at: task.due_at,
    });
    return task;
  }

  async update(owner_id: string, id: bigint, dto: UpdateTaskDto) {
    // ensure exists first for nicer 404
    const before = await this.getById(owner_id, id);
    const normalized: UpdateTaskDto = { ...dto };
    if (normalized.status === "open" && normalized.completed_at === undefined) {
      normalized.completed_at = null;
    }
    const task = await this.repo.update(id, normalized);

    const changePayload: Record<string, { before: unknown; after: unknown }> = {};
    const normalize = (value: unknown) =>
      value instanceof Date ? value.toISOString() : value;

    if (before.title !== task.title)
      changePayload.title = { before: before.title, after: task.title };

    if (before.description !== task.description)
      changePayload.description = {
        before: before.description,
        after: task.description,
      };

    if (before.status !== task.status)
      changePayload.status = { before: before.status, after: task.status };

    if (normalize(before.due_at) !== normalize(task.due_at))
      changePayload.due_at = {
        before: normalize(before.due_at),
        after: normalize(task.due_at),
      };

    if (Object.keys(changePayload).length > 0)
      await this.activity.logTaskUpdated(owner_id, task.id, changePayload);

    return task;
  }

  async delete(owner_id: string, id: bigint) {
    // ensure exists first for nicer 404
    const task = await this.getById(owner_id, id);
    await this.activity.logTaskDeleted(owner_id, task.id);
    await this.repo.delete(task.id);
    return task;
  }
}
