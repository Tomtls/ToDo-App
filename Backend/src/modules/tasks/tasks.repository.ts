import { getAdminDb } from "../../firebaseAdmin.js";
import type { CreateTaskDto, UpdateTaskDto, TaskListFilters } from "./tasks.types.js";

type TaskDoc = {
  owner_id: string;
  title: string;
  description: string | null;
  status: string;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  task_labels: Array<{
    label_id: string;
    labels: { id: string; name: string };
  }>;
};

type TaskRecord = TaskDoc & { id: string };

function getUserRef(owner_id: string) {
  return getAdminDb().collection("users").doc(owner_id);
}

function getTasksRef(owner_id: string) {
  return getUserRef(owner_id).collection("tasks");
}

async function ensureOwner(owner_id: string) {
  const userRef = getUserRef(owner_id);
  const snap = await userRef.get();
  if (!snap.exists) {
    await userRef.set({ created_at: new Date().toISOString() }, { merge: true });
  }
}

function normalizeTask(id: string, data: Partial<TaskDoc>): TaskRecord {
  return {
    id,
    owner_id: data.owner_id ?? "dev-user",
    title: data.title ?? "",
    description: data.description ?? null,
    status: data.status ?? "open",
    due_at: data.due_at ?? null,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? data.created_at ?? new Date().toISOString(),
    completed_at: data.completed_at ?? null,
    task_labels: Array.isArray(data.task_labels) ? data.task_labels : [],
  };
}

export class TasksRepository {
  async listLatest(owner_id: string, filters?: TaskListFilters) {
    const ref = getTasksRef(owner_id);
    const snap = await ref.orderBy("created_at", "desc").get();
    let tasks = snap.docs.map((doc) => normalizeTask(doc.id, doc.data() as TaskDoc));

    if (filters?.status) {
      tasks = tasks.filter((task) => task.status === filters.status);
    }

    const dueAfter = filters?.due_after;
    if (dueAfter) {
      tasks = tasks.filter((task) => task.due_at && task.due_at >= dueAfter);
    }

    const dueBefore = filters?.due_before;
    if (dueBefore) {
      tasks = tasks.filter((task) => task.due_at && task.due_at < dueBefore);
    }

    if (filters?.cursor) {
      const index = tasks.findIndex((task) => task.id === filters.cursor);
      if (index >= 0) {
        tasks = tasks.slice(index + 1);
      }
    }

    if (filters?.limit) {
      tasks = tasks.slice(0, filters.limit);
    }

    return tasks;
  }

  async findById(owner_id: string, id: string) {
    const docRef = getTasksRef(owner_id).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;
    return normalizeTask(snap.id, snap.data() as TaskDoc);
  }

  async create(owner_id: string, dto: CreateTaskDto) {
    await ensureOwner(owner_id);
    const now = new Date().toISOString();
    const ref = getTasksRef(owner_id).doc();
    const data: TaskDoc = {
      owner_id,
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? "open",
      due_at: dto.due_at ?? null,
      created_at: now,
      updated_at: now,
      completed_at:
        dto.completed_at === undefined ? null : dto.completed_at ?? null,
      task_labels: [],
    };

    await ref.set(data);
    return normalizeTask(ref.id, data);
  }

  async update(owner_id: string, id: string, dto: UpdateTaskDto) {
    const ref = getTasksRef(owner_id).doc(id);
    const now = new Date().toISOString();

    const updates: Partial<TaskDoc> = {
      updated_at: now,
    };

    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description ?? null;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.due_at !== undefined) updates.due_at = dto.due_at ?? null;
    if (dto.completed_at !== undefined)
      updates.completed_at = dto.completed_at ?? null;

    await ref.set(updates, { merge: true });
    const snap = await ref.get();
    if (!snap.exists) return null;
    return normalizeTask(snap.id, snap.data() as TaskDoc);
  }

  async delete(owner_id: string, id: string) {
    await getTasksRef(owner_id).doc(id).delete();
  }
}
