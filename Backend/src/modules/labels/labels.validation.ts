import type { AttachLabelDto, CreateLabelDto, UpdateLabelDto } from "./labels.types.js";
import type { ValidationResult } from "../../utils/validation.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateName(value: unknown, required: boolean, details: Record<string, unknown>): string | undefined {
  if (value === undefined) {
    if (required) details.name = "name is required and must be a non-empty string";
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    details.name = required
      ? "name is required and must be a non-empty string"
      : "name must be a non-empty string if provided";
    return undefined;
  }

  return value.trim();
}

function validateBase(body: unknown): { ok: false; error: string; details: Record<string, unknown> } | { ok: true; value: Record<string, unknown> } {
  if (!isPlainObject(body))
    return {
      ok: false,
      error: "Invalid request body",
      details: { body: "Expected JSON object" },
    };

  return { ok: true, value: body };
}

export function validateCreateLabel(body: unknown): ValidationResult<CreateLabelDto> {
  const base = validateBase(body);
  if (!base.ok) return base;

  const details: Record<string, unknown> = {};
  const name = validateName(base.value.name, true, details);

  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  return { ok: true, value: { name: name as string } };
}

export function validateUpdateLabel(body: unknown): ValidationResult<UpdateLabelDto> {
  const base = validateBase(body);
  if (!base.ok) return base;

  const details: Record<string, unknown> = {};
  const name = validateName(base.value.name, false, details);

  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  return { ok: true, value: { name } };
}

export function validateAttachLabel(body: unknown): ValidationResult<AttachLabelDto> {
  const base = validateBase(body);
  if (!base.ok) return base;

  const details: Record<string, unknown> = {};
  const raw = base.value.label_id;
  let label_id: string | undefined;

  if (typeof raw !== "string" || raw.trim().length === 0)
    details.label_id = "label_id is required and must be a string";
  else label_id = raw.trim();

  if (Object.keys(details).length > 0)
    return { ok: false, error: "Validation failed", details };

  return { ok: true, value: { label_id: label_id as string } };
}
