import { prisma } from "../../db/prisma.js";
import type { CreateTaskDto, UpdateTaskDto, TaskListFilters } from "./tasks.types.js";

export class TasksRepository {
  async listLatest(owner_id: string, filters?: TaskListFilters) {
    const where: any = { owner_id };
    if (filters?.status) where.status = filters.status;
    if (filters?.due_after || filters?.due_before) {
      where.due_at = {};
      if (filters.due_after) where.due_at.gte = new Date(filters.due_after);
      if (filters.due_before) where.due_at.lt = new Date(filters.due_before);
    }
    if (filters?.cursor) where.id = { lt: filters.cursor };

    return prisma.tasks.findMany({
      where,
      include: { task_labels: { include: { labels: true } } },
      orderBy: { id: "desc" },
      take: filters?.limit ?? 100,
    });
  }

  async findById(owner_id: string, id: bigint) {
    return prisma.tasks.findFirst({
      where: { id, owner_id },
      include: { task_labels: { include: { labels: true } } },
    });
  }

  async create(owner_id: string, dto: CreateTaskDto) {
    return prisma.tasks.create({
      data: {
        owner_id,
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status,
        due_at: dto.due_at ? new Date(dto.due_at) : null,
        completed_at:
          dto.completed_at === undefined
            ? null
            : dto.completed_at === null
              ? null
              : new Date(dto.completed_at),
      },
    });
  }

  async update(id: bigint, dto: UpdateTaskDto) {
    return prisma.tasks.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        due_at:
          dto.due_at === undefined
            ? undefined
            : dto.due_at === null
              ? null
              : new Date(dto.due_at),
        completed_at:
          dto.completed_at === undefined
            ? undefined
            : dto.completed_at === null
              ? null
              : new Date(dto.completed_at),
      },
    });
  }

  async delete(id: bigint) {
    return prisma.tasks.delete({ where: { id } });
  }
}
