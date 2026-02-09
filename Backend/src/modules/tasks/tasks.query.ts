import type { ParsedQs } from "qs";
import type { ValidationResult } from "../../utils/validation.js";
import { TASK_STATUS, type TaskListFilters, type TaskStatus } from "./tasks.types.js";

type TaskView = "today" | "overdue";

function isIsoDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value);
}

function parseLimit(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) return undefined;

  return Math.min(num, 200);
}

function parseCursor(value: unknown): string | undefined {
  if (value === undefined) return undefined;

  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.trim().length === 0) return undefined;

  return raw.trim();
}

function parseStatus(value: unknown): TaskStatus | undefined {
  if (value === undefined) return undefined;

  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return undefined;

  return TASK_STATUS.includes(raw as TaskStatus)
    ? (raw as TaskStatus)
    : undefined;
}

function parseDueBefore(value: unknown): string | undefined {
  if (value === undefined) return undefined;

  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !isIsoDateTime(raw)) return undefined;

  return raw;
}

function parseView(value: unknown): TaskView | undefined {
  if (value === undefined) return undefined;

  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "today" || raw === "overdue") return raw;

  return undefined;
}

function startOfTodayUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function parseTaskListQuery(query: ParsedQs): ValidationResult<TaskListFilters> {
  const details: Record<string, unknown> = {};

  const status = parseStatus(query.status);
  const due_before = parseDueBefore(query.due_before);
  const limit = parseLimit(query.limit);
  const cursor = parseCursor(query.cursor);
  const view = parseView(query.view);

  if (query.status !== undefined && !status)
    details.status = "Invalid status";

  if (query.due_before !== undefined && !due_before)
    details.due_before = "due_before must be ISO-8601 UTC string";

  if (query.limit !== undefined && limit === undefined)
    details.limit = "limit must be a positive integer <= 200";

  if (query.cursor !== undefined && cursor === undefined)
    details.cursor = "cursor must be a valid task id";

  if (query.view !== undefined && !view)
    details.view = "view must be one of: today, overdue";

  if (view && status && status !== "open")
    details.status = "status must be 'open' when view is used";


  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  const filters: TaskListFilters = { status, due_before, limit, cursor };

  if (view === "today") {
    const now = new Date();
    const start = startOfTodayUtc(now);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    filters.due_after = start.toISOString();
    filters.due_before = end.toISOString();
    filters.status = filters.status ?? "open";
  }

  if (view === "overdue") {
    const now = new Date();
    filters.due_before = now.toISOString();
    filters.status = filters.status ?? "open";
  }

  return { ok: true, value: filters };
}
