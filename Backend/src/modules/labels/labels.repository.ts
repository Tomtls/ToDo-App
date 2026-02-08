import { prisma } from "../../db/prisma.js";

export class LabelsRepository {
  private async ensureOwner(owner_id: string) {
    await prisma.users.upsert({
      where: { id: owner_id },
      update: {},
      create: { id: owner_id },
    });
  }
  async listByOwner(owner_id: string) {
    return prisma.labels.findMany({
      where: { owner_id },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: bigint) {
    return prisma.labels.findUnique({
      where: { id },
    });
  }

  async findByName(owner_id: string, name: string) {
    return prisma.labels.findFirst({
      where: { owner_id, name },
    });
  }

  async create(owner_id: string, name: string) {
    await this.ensureOwner(owner_id);
    return prisma.labels.create({
      data: { owner_id, name },
    });
  }

  async update(id: bigint, name: string) {
    return prisma.labels.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: bigint) {
    return prisma.labels.delete({
      where: { id },
    });
  }

  async findTaskById(task_id: bigint, owner_id: string) {
    return prisma.tasks.findFirst({
      where: { id: task_id, owner_id },
    });
  }

  async findLabelById(label_id: bigint, owner_id: string) {
    return prisma.labels.findFirst({
      where: { id: label_id, owner_id },
    });
  }

  async findTaskLabel(task_id: bigint, label_id: bigint) {
    return prisma.task_labels.findUnique({
      where: { task_id_label_id: { task_id, label_id } },
    });
  }

  async addLabelToTask(task_id: bigint, label_id: bigint) {
    return prisma.task_labels.create({
      data: { task_id, label_id },
    });
  }

  async removeLabelFromTask(task_id: bigint, label_id: bigint) {
    return prisma.task_labels.delete({
      where: { task_id_label_id: { task_id, label_id } },
    });
  }

  async listLabelsForTask(task_id: bigint, owner_id: string) {
    return prisma.labels.findMany({
      where: { owner_id, task_labels: { some: { task_id } } },
      orderBy: { name: "asc" },
    });
  }
}
