import { getAdminDb } from "../../firebaseAdmin.js";

type LabelDoc = {
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type LabelRecord = LabelDoc & { id: string };

type TaskLabelEntry = {
  label_id: string;
  labels: { id: string; name: string };
};

type TaskDoc = {
  owner_id: string;
  task_labels?: TaskLabelEntry[];
};

function getUserRef(owner_id: string) {
  return getAdminDb().collection("users").doc(owner_id);
}

function getLabelsRef(owner_id: string) {
  return getUserRef(owner_id).collection("labels");
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

function normalizeLabel(id: string, data: Partial<LabelDoc>): LabelRecord {
  return {
    id,
    owner_id: data.owner_id ?? "dev-user",
    name: data.name ?? "",
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? data.created_at ?? new Date().toISOString(),
  };
}

export class LabelsRepository {
  async listByOwner(owner_id: string) {
    const snap = await getLabelsRef(owner_id).orderBy("name", "asc").get();
    return snap.docs.map((doc) => normalizeLabel(doc.id, doc.data() as LabelDoc));
  }

  async findById(id: string, owner_id: string) {
    const snap = await getLabelsRef(owner_id).doc(id).get();
    if (!snap.exists) return null;
    return normalizeLabel(snap.id, snap.data() as LabelDoc);
  }

  async findByName(owner_id: string, name: string) {
    const snap = await getLabelsRef(owner_id)
      .where("name", "==", name)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return normalizeLabel(doc.id, doc.data() as LabelDoc);
  }

  async create(owner_id: string, name: string) {
    await ensureOwner(owner_id);
    const now = new Date().toISOString();
    const ref = getLabelsRef(owner_id).doc();
    const data: LabelDoc = {
      owner_id,
      name,
      created_at: now,
      updated_at: now,
    };
    await ref.set(data);
    return normalizeLabel(ref.id, data);
  }

  async update(id: string, owner_id: string, name: string) {
    const ref = getLabelsRef(owner_id).doc(id);
    const now = new Date().toISOString();
    await ref.set({ name, updated_at: now }, { merge: true });
    const snap = await ref.get();
    if (!snap.exists) return null;
    return normalizeLabel(snap.id, snap.data() as LabelDoc);
  }

  async delete(id: string, owner_id: string) {
    await getLabelsRef(owner_id).doc(id).delete();
  }

  async findTaskById(task_id: string, owner_id: string) {
    const snap = await getTasksRef(owner_id).doc(task_id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() as TaskDoc) };
  }

  async findLabelById(label_id: string, owner_id: string) {
    const snap = await getLabelsRef(owner_id).doc(label_id).get();
    if (!snap.exists) return null;
    return normalizeLabel(snap.id, snap.data() as LabelDoc);
  }

  async findTaskLabel(task_id: string, label_id: string, owner_id: string) {
    const task = await this.findTaskById(task_id, owner_id);
    if (!task) return null;
    const entries = Array.isArray(task.task_labels) ? task.task_labels : [];
    return entries.find((entry) => entry.label_id === label_id) ?? null;
  }

  async addLabelToTask(task_id: string, label_id: string, owner_id: string) {
    const taskRef = getTasksRef(owner_id).doc(task_id);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return null;
    const task = taskSnap.data() as TaskDoc;

    const label = await this.findLabelById(label_id, owner_id);
    if (!label) return null;

    const existing = Array.isArray(task.task_labels) ? task.task_labels : [];
    if (existing.some((entry) => entry.label_id === label_id)) {
      return existing.find((entry) => entry.label_id === label_id) ?? null;
    }

    const entry: TaskLabelEntry = {
      label_id,
      labels: { id: label.id, name: label.name },
    };

    const updated = [...existing, entry];
    await taskRef.set({ task_labels: updated, updated_at: new Date().toISOString() }, { merge: true });
    return entry;
  }

  async removeLabelFromTask(task_id: string, label_id: string, owner_id: string) {
    const taskRef = getTasksRef(owner_id).doc(task_id);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return null;
    const task = taskSnap.data() as TaskDoc;
    const existing = Array.isArray(task.task_labels) ? task.task_labels : [];
    const updated = existing.filter((entry) => entry.label_id !== label_id);
    await taskRef.set({ task_labels: updated, updated_at: new Date().toISOString() }, { merge: true });
    return true;
  }

  async listLabelsForTask(task_id: string, owner_id: string) {
    const task = await this.findTaskById(task_id, owner_id);
    if (!task) return [];
    const entries = Array.isArray(task.task_labels) ? task.task_labels : [];
    return entries
      .map((entry) => entry.labels ?? { id: entry.label_id, name: "" })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
