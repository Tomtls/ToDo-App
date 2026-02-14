import type { AttachLabelDto, CreateLabelDto, UpdateLabelDto } from "./labels.types.js";
import { LabelsRepository } from "./labels.repository.js";

export class LabelsService {
  constructor(private readonly repo: LabelsRepository) { }

  async list(owner_id: string) {
    return this.repo.listByOwner(owner_id);
  }

  async getById(owner_id: string, id: bigint) {
    const label = await this.repo.findLabelById(id, owner_id);
    if (!label) {
      const err: any = new Error("Label not found");
      err.statusCode = 404;
      throw err;
    }
    return label;
  }

  async create(owner_id: string, dto: CreateLabelDto) {
    const existing = await this.repo.findByName(owner_id, dto.name);
    if (existing) {
      const err: any = new Error("Label already exists");
      err.statusCode = 409;
      throw err;
    }
    return this.repo.create(owner_id, dto.name);
  }

  async update(id: bigint, owner_id: string, dto: UpdateLabelDto) {
    await this.getById(owner_id, id);
    if (dto.name) {
      const existing = await this.repo.findByName(owner_id, dto.name);
      if (existing && existing.id !== id) {
        const err: any = new Error("Label already exists");
        err.statusCode = 409;
        throw err;
      }
      return this.repo.update(id, dto.name);
    }
    return this.repo.findLabelById(id, owner_id);
  }

  async delete(owner_id: string, id: bigint) {
    await this.getById(owner_id, id);
    return this.repo.delete(id);
  }

  async listForTask(owner_id: string, task_id: bigint) {
    const task = await this.repo.findTaskById(task_id, owner_id);
    if (!task) {
      const err: any = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }
    return this.repo.listLabelsForTask(task_id, owner_id);
  }

  async attachToTask(owner_id: string, task_id: bigint, dto: AttachLabelDto) {
    const task = await this.repo.findTaskById(task_id, owner_id);
    if (!task) {
      const err: any = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }

    const label_id = BigInt(dto.label_id);
    const label = await this.repo.findLabelById(label_id, owner_id);
    if (!label) {
      const err: any = new Error("Label not found");
      err.statusCode = 404;
      throw err;
    }

    const existing = await this.repo.findTaskLabel(task_id, label_id);
    if (existing) return existing;

    return this.repo.addLabelToTask(task_id, label_id);
  }

  async detachFromTask(owner_id: string, task_id: bigint, label_id: bigint) {
    const task = await this.repo.findTaskById(task_id, owner_id);
    if (!task) {
      const err: any = new Error("Task not found");
      err.statusCode = 404;
      throw err;
    }

    const label = await this.repo.findLabelById(label_id, owner_id);
    if (!label) {
      const err: any = new Error("Label not found");
      err.statusCode = 404;
      throw err;
    }

    const existing = await this.repo.findTaskLabel(task_id, label_id);
    if (!existing) {
      const err: any = new Error("Label not attached to task");
      err.statusCode = 404;
      throw err;
    }

    return this.repo.removeLabelFromTask(task_id, label_id);
  }
}
