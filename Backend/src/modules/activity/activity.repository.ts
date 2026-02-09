import { getAdminDb } from "../../firebaseAdmin.js";

export class ActivityRepository {
  async create(
    owner_id: string,
    type: string,
    task_id?: string | null,
    payload?: unknown
  ) {
    const db = getAdminDb();
    const now = new Date().toISOString();

    const ref = db
      .collection("users")
      .doc(owner_id)
      .collection("activity_log")
      .doc();

    const data = {
      owner_id,
      task_id: task_id ?? null,
      type,
      payload: payload ?? null,
      created_at: now,
    };

    await ref.set(data);
    return { id: ref.id, ...data };
  }
}
