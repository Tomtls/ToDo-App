export const getLabelName = (label) => {
  if (typeof label === "string") return label;
  if (!label || typeof label !== "object") return "";
  if (label.labels && typeof label.labels.name === "string") {
    return label.labels.name;
  }
  if (typeof label.name === "string") return label.name;
  return "";
};

export const labelKey = (label = "") =>
  getLabelName(label).trim().toLowerCase();

export const normalizeLabel = (label = "") =>
  getLabelName(label).trim().replace(/^#/, "");

export const mergeLabels = (base = [], extra = []) => {
  const all = [...(base || []), ...(extra || [])];
  const map = new Map();
  all.forEach((label) => {
    const normalized = normalizeLabel(label || "");
    if (!normalized) return;
    const key = labelKey(normalized);
    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });
  return Array.from(map.values());
};

export const normalizePriority = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 2;
  if (num < 1) return 1;
  if (num > 4) return 4;
  return Math.round(num);
};

const PRIORITY_PREFIX = "prio:";

export const isPriorityLabel = (label) =>
  labelKey(label).startsWith(PRIORITY_PREFIX);

export const getPriorityFromLabels = (labels, fallback = 2) => {
  const normalizedFallback = normalizePriority(fallback);
  const list = Array.isArray(labels) ? labels : [];
  const priorityLabel = list.find((label) => isPriorityLabel(label));
  if (!priorityLabel) return normalizedFallback;
  const name = getLabelName(priorityLabel);
  const value = Number(name.slice(PRIORITY_PREFIX.length));
  return normalizePriority(value);
};

export const applyPriorityLabel = (labels, priority) => {
  const normalizedPriority = normalizePriority(priority);
  const list = Array.isArray(labels) ? labels : [];
  const filtered = list.filter((label) => !isPriorityLabel(label));
  return mergeLabels(filtered, [`${PRIORITY_PREFIX}${normalizedPriority}`]);
};

export const getDueMs = (task) => {
  if (!task?.due_at) return Number.POSITIVE_INFINITY;
  const date = new Date(task.due_at);
  return Number.isNaN(date.getTime())
    ? Number.POSITIVE_INFINITY
    : date.getTime();
};

export const compareTasks = (a, b) => {
  const priorityDiff =
    getPriorityFromLabels(b.task_labels) - getPriorityFromLabels(a.task_labels);
  if (priorityDiff !== 0) return priorityDiff;
  const dueDiff = getDueMs(a) - getDueMs(b);
  if (dueDiff !== 0) return dueDiff;
  return String(b.created_at || "").localeCompare(String(a.created_at || ""));
};

export const toLocalDateIso = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().slice(0, 10);
};

export const getTodayIso = (now = new Date()) => toLocalDateIso(now);

export const toIsoOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export const hasMeaningfulTime = (iso) => {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getHours() !== 0 || date.getMinutes() !== 0;
};

export const formatTime = (iso, locale = "de-DE") => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTimeInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatDate = (iso, locale = "de-DE") => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale);
};

export const normalizeTask = (task, ownerId) => {
  const nowIso = new Date().toISOString();
  const legacyDue = task.dueDate
    ? new Date(`${task.dueDate}T${task.dueTime || "00:00"}:00`)
    : null;
  const dueAt =
    toIsoOrNull(task.due_at) ||
    (legacyDue && !Number.isNaN(legacyDue.getTime())
      ? legacyDue.toISOString()
      : null);

  const createdAt = toIsoOrNull(task.created_at) || nowIso;
  const updatedAt = toIsoOrNull(task.updated_at) || createdAt;
  const completed =
    task.status === "done" ||
    task.status === "completed" ||
    task.completed === true ||
    task.completed_at;

  const taskLabels = Array.isArray(task.task_labels)
    ? task.task_labels
    : Array.isArray(task.labels)
      ? task.labels
      : [];
  const baseLabels = mergeLabels([], taskLabels);
  const normalizedLabels =
    task.priority === undefined || task.priority === null
      ? baseLabels
      : applyPriorityLabel(baseLabels, task.priority);

  return {
    id: String(task.id ?? Date.now()),
    owner_id: task.owner_id || ownerId || "dev-user",
    title: (task.title || "").trim(),
    description: task.description ?? null,
    status: completed ? "done" : "open",
    due_at: dueAt,
    created_at: createdAt,
    updated_at: updatedAt,
    completed_at: completed
      ? toIsoOrNull(task.completed_at) || updatedAt
      : null,
    task_labels: normalizedLabels,
  };
};
