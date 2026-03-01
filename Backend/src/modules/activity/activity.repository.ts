import { prisma } from "../../db/prisma.js";

export class ActivityRepository {
  async create(owner_id: string, type: string, task_id?: bigint | null, payload?: unknown) {
    return prisma.activity_log.create({
      data: {
        owner_id,
        task_id: task_id ?? null,
        type,
        payload: payload ?? undefined,
      },
    });
  }
}
