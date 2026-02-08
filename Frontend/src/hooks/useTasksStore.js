import { useCallback, useEffect, useState } from "react";
import {
  applyPriorityLabel,
  isPriorityLabel,
  labelKey,
  mergeLabels,
  normalizeLabel,
  normalizePriority,
} from "../logic/tasks";
import { labelsApi } from "../api/labels";
import { taskLabelsApi } from "../api/taskLabels";
import { tasksApi } from "../api/tasks";

const getTaskLabelId = (entry) => {
  if (!entry) return null;
  if (entry.label_id !== undefined && entry.label_id !== null)
    return String(entry.label_id);
  if (entry.labels && entry.labels.id !== undefined && entry.labels.id !== null)
    return String(entry.labels.id);
  return null;
};

export function useTasksStore(currentUser) {
  // #region State
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  // #endregion State

  // #region Effects
  useEffect(() => {
    let canceled = false;
    if (!currentUser) {
      setTasks([]);
      setLabels([]);
      return undefined;
    }

    const loadData = async () => {
      try {
        const [taskItems, labelItems] = await Promise.all([
          tasksApi.list(),
          labelsApi.list(),
        ]);
        if (canceled) return;
        setTasks(taskItems);
        const fullLabels = labelItems || [];
        setAllLabels(fullLabels);
        const filteredLabels = fullLabels.filter(
          (label) => !isPriorityLabel(label)
        );
        setLabels(filteredLabels);
      } catch (error) {
        if (!canceled) {
          console.error("Failed to load tasks/labels", error);
        }
      }
    };

    loadData();

    return () => {
      canceled = true;
    };
  }, [currentUser]);
  // #endregion Effects

  // #region Actions
  const ensureLabel = useCallback(
    async (value, options = {}) => {
      const allowPriority = Boolean(options.allowPriority);
      const normalized = normalizeLabel(value || "");
      if (!normalized) return null;
      if (!allowPriority && isPriorityLabel(normalized)) return null;
      const existing = allLabels.find(
        (label) => labelKey(label) === labelKey(normalized)
      );
      if (existing) return existing;
      try {
        const created = await labelsApi.create(normalized);
        if (!isPriorityLabel(normalized)) {
          setLabels((prev) => [...prev, created]);
        }
        setAllLabels((prev) => [...prev, created]);
        return created;
      } catch (error) {
        console.error("Failed to create label", error);
        return null;
      }
    },
    [allLabels]
  );

  const resolveLabels = useCallback(
    async (labelNames) => {
      const list = Array.isArray(labelNames) ? labelNames : [];
      const unique = mergeLabels([], list);
      const resolved = [];
      for (const name of unique) {
        const label = await ensureLabel(name, { allowPriority: true });
        if (label) resolved.push(label);
      }
      return resolved;
    },
    [ensureLabel]
  );

  const syncTaskLabels = useCallback(
    async (taskId, desiredLabelNames, existingTaskLabels) => {
      const resolved = await resolveLabels(desiredLabelNames);
      const desiredIds = new Set(resolved.map((label) => String(label.id)));
      const existingIds = new Set(
        (existingTaskLabels || [])
          .map((entry) => getTaskLabelId(entry))
          .filter(Boolean)
      );

      const attachTasks = resolved
        .filter((label) => !existingIds.has(String(label.id)))
        .map((label) => taskLabelsApi.add(taskId, label.id));

      const detachTasks = Array.from(existingIds)
        .filter((labelId) => !desiredIds.has(labelId))
        .map((labelId) => taskLabelsApi.remove(taskId, labelId));

      await Promise.all([...attachTasks, ...detachTasks]);
    },
    [resolveLabels]
  );

  const addOrUpdateTask = useCallback(
    async ({
      editingTaskId,
      title,
      description,
      dueDate,
      dueTime,
      priority,
      selectedLabels,
      labelInput,
    }) => {
      if (!title.trim()) return false;

      try {
        const extraLabel = labelInput ? normalizeLabel(labelInput) : "";
        const taskLabels = mergeLabels(
          selectedLabels,
          extraLabel ? [extraLabel] : []
        );
        const priorityValue = normalizePriority(priority);
        const labelsWithPriority = applyPriorityLabel(
          taskLabels,
          priorityValue
        );

        const dueAt = dueDate
          ? new Date(`${dueDate}T${dueTime || "00:00"}:00`).toISOString()
          : null;

        if (editingTaskId) {
          await tasksApi.update(editingTaskId, {
            title: title.trim(),
            description: description.trim() ? description.trim() : null,
            due_at: dueAt,
          });

          const currentTask = tasks.find((task) => task.id === editingTaskId);
          await syncTaskLabels(
            editingTaskId,
            labelsWithPriority,
            currentTask?.task_labels || []
          );

          const refreshed = await tasksApi.get(editingTaskId);
          setTasks((prev) =>
            prev.map((task) => (task.id === editingTaskId ? refreshed : task))
          );
          return true;
        }

        const created = await tasksApi.create({
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          status: "open",
          due_at: dueAt,
        });

        await syncTaskLabels(created.id, labelsWithPriority, []);

        const refreshed = await tasksApi.get(created.id);
        setTasks((prev) => [...prev, refreshed]);
        return true;
      } catch (error) {
        console.error("Failed to save task", error);
        return false;
      }
    },
    [resolveLabels, syncTaskLabels, tasks]
  );

  const toggleTask = useCallback(
    async (id) => {
      const nowIso = new Date().toISOString();
      const current = tasks.find((task) => task.id === id);
      if (!current) return;
      try {
        const isCompleted = current.status === "done" || current.completed_at;
        const status = isCompleted ? "open" : "done";
        const payload = {
          title: current.title,
          status,
        };
        if (status === "done") {
          payload.completed_at = nowIso;
        }
        await tasksApi.update(id, payload);
        const refreshed = await tasksApi.get(id);
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? refreshed : task))
        );
      } catch (error) {
        console.error("Failed to toggle task", error);
      }
    },
    [tasks]
  );

  const deleteTask = useCallback(async (id) => {
    try {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  }, []);
  // #endregion Actions

  // #region Return
  return {
    tasks,
    labels,
    setTasks,
    setLabels,
    ensureLabel,
    addOrUpdateTask,
    toggleTask,
    deleteTask,
  };
  // #endregion Return
}
