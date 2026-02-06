import { TASK_STATUS } from "./tasks.types.js";
import type { CreateTaskDto, TaskStatus, UpdateTaskDto } from "./tasks.types.js";
import type { ValidationResult } from "../../utils/validation.js";

const ALLOWED_STATUS = new Set<TaskStatus>(TASK_STATUS);

type TaskInput = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDateTime(value: string): boolean {
  // Strict ISO-8601 with UTC "Z"
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value);
}

function validateBase(body: unknown): { ok: false; error: string; details: Record<string, unknown> } | { ok: true; value: TaskInput } {
  if (!isPlainObject(body))
    return {
      ok: false,
      error: "Invalid request body",
      details: { body: "Expected JSON object" },
    };
  return { ok: true, value: body };
}

function validateTitle(value: unknown, details: Record<string, unknown>): string | undefined {
  if (value === undefined) {
    details.title = "title is required and must be a non-empty string";
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    details.title = "title is required and must be a non-empty string";
    return undefined;
  }

  return value.trim();
}

function validateDescription(value: unknown, details: Record<string, unknown>): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    details.description = "description must be a string or null";
    return undefined;
  }

  return value;
}

function validateStatus(value: unknown, details: Record<string, unknown>): TaskStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !ALLOWED_STATUS.has(value as TaskStatus)) {
    details.status = `status must be one of: ${Array.from(ALLOWED_STATUS).join(", ")}`;
    return undefined;
  }
  return value as TaskStatus;
}

function validateIsoField(value: unknown, field: "due_at" | "completed_at", details: Record<string, unknown>): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string" || !isIsoDateTime(value)) {
    details[field] = `${field} must be an ISO-8601 UTC string or null`;
    return undefined;
  }
  return value;
}

export function validateCreateTask(body: unknown): ValidationResult<CreateTaskDto> {
  const base = validateBase(body);
  if (!base.ok) return base;

  const details: Record<string, unknown> = {};

  const title = validateTitle(base.value.title, details);
  const description = validateDescription(base.value.description, details);
  const status = validateStatus(base.value.status, details);
  const due_at = validateIsoField(base.value.due_at, "due_at", details);
  const completed_at = validateIsoField(base.value.completed_at, "completed_at", details);

  if (completed_at !== undefined && status !== "done")
    details.completed_at = "completed_at is only allowed when status is done";

  if (status === "done" && (completed_at === undefined || completed_at === null))
    details.completed_at = "completed_at is required when status is done";

  if (status === "open" && completed_at !== undefined && completed_at !== null)
    details.completed_at = "completed_at must be null when status is open";


  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  return {
    ok: true,
    value: {
      title: title as string,
      description: description as string | undefined,
      status,
      due_at: due_at as string | undefined,
      completed_at,
    },
  };
}

export function validateUpdateTask(body: unknown): ValidationResult<UpdateTaskDto> {
  const base = validateBase(body);
  if (!base.ok) return base;

  const details: Record<string, unknown> = {};

  const title = validateTitle(base.value.title, details);
  const description = validateDescription(base.value.description, details);
  const status = validateStatus(base.value.status, details);
  const due_at = validateIsoField(base.value.due_at, "due_at", details);
  const completed_at = validateIsoField(base.value.completed_at, "completed_at", details);

  if (completed_at !== undefined && status !== "done")
    details.completed_at = "completed_at requires status to be done";

  if (status === "done" && (completed_at === undefined || completed_at === null))
    details.completed_at = "completed_at is required when status is done";

  if (status === "open" && completed_at !== undefined && completed_at !== null)
    details.completed_at = "completed_at must be null when status is open";

  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  return {
    ok: true,
    value: {
      title,
      description,
      status,
      due_at,
      completed_at,
    },
  };
}
