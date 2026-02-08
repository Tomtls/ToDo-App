import { useCallback, useEffect, useState } from "react";
import {
  applyPriorityLabel,
  isPriorityLabel,
  labelKey,
  mergeLabels,
  normalizeLabel,
  normalizePriority,
  normalizeTask,
} from "../logic/tasks";
import { loadLabels, loadTasks, saveLabels, saveTasks } from "../logic/storage";

export function useTasksStore(currentUser) {
  // #region State
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  // #endregion State

  // #region Effects
  useEffect(() => {
    if (currentUser) {
      const userTasks = loadTasks(currentUser.username).map((task) =>
        normalizeTask(task, currentUser.username)
      );
      setTasks(userTasks);
      const storedLabels = loadLabels(currentUser.username);
      const derivedLabels = userTasks.flatMap((t) => t.task_labels || []);
      const mergedLabels = mergeLabels(storedLabels, derivedLabels).filter(
        (label) => !isPriorityLabel(label)
      );
      setLabels(mergedLabels);
    } else {
      setTasks([]);
      setLabels([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveLabels(currentUser.username, labels);
    }
  }, [labels, currentUser]);
  // #endregion Effects

  // #region Actions
  const ensureLabel = useCallback(
    (value) => {
      const normalized = normalizeLabel(value || "");
      if (!normalized || isPriorityLabel(normalized)) return "";
      const existing = labels.find(
        (label) => labelKey(label) === labelKey(normalized)
      );
      if (existing) return existing;
      setLabels((prev) => mergeLabels(prev, [normalized]));
      return normalized;
    },
    [labels]
  );

  const addOrUpdateTask = useCallback(
    ({
      editingTaskId,
      title,
      description,
      dueDate,
      dueTime,
      priority,
      selectedLabels,
      labelInput,
      ownerId,
    }) => {
      if (!title.trim()) return false;

      const extraLabel = ensureLabel(labelInput);
      const taskLabels = mergeLabels(
        selectedLabels,
        extraLabel ? [extraLabel] : []
      );
      const priorityValue = normalizePriority(priority);
      const labelsWithPriority = applyPriorityLabel(taskLabels, priorityValue);

      const nowIso = new Date().toISOString();
      const dueAt = dueDate
        ? new Date(`${dueDate}T${dueTime || "00:00"}:00`).toISOString()
        : null;

      if (editingTaskId) {
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id !== editingTaskId) return task;
            return {
              ...task,
              title: title.trim(),
              description: description.trim() ? description.trim() : null,
              due_at: dueAt,
              updated_at: nowIso,
              task_labels: labelsWithPriority,
            };
          })
        );
        return true;
      }

      const newTask = {
        id: String(Date.now()),
        owner_id: ownerId || "dev-user",
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        status: "open",
        due_at: dueAt,
        created_at: nowIso,
        updated_at: nowIso,
        completed_at: null,
        task_labels: labelsWithPriority,
      };
      setTasks((prev) => [...prev, newTask]);
      return true;
    },
    [ensureLabel]
  );

  const toggleTask = useCallback((id) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isCompleted = t.status === "done" || t.completed_at;
        if (isCompleted) {
          return {
            ...t,
            status: "open",
            completed_at: null,
            updated_at: nowIso,
          };
        }
        return {
          ...t,
          status: "done",
          completed_at: nowIso,
          updated_at: nowIso,
        };
      })
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
