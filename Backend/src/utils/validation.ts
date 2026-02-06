export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; details: Record<string, unknown> };
