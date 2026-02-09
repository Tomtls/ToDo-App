export const TASK_STATUS = ["open", "done"] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export type CreateTaskDto = {
  title: string;
  description?: string;
  due_at?: string; // ISO string from frontend, e.g. "2026-02-06T12:00:00.000Z"
  status?: TaskStatus;
  completed_at?: string | null;
};

export type UpdateTaskDto = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  due_at?: string | null; // null = clear
  completed_at?: string | null;
};

export type TaskListResponse<T> = {
  items: T[];
  next_cursor: string | null;
};

export type TaskListFilters = {
  status?: TaskStatus;
  due_before?: string;
  due_after?: string;
  limit?: number;
  cursor?: string;
};
