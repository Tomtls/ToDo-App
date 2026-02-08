import { useMemo } from "react";
import {
  compareTasks,
  formatDate,
  formatTime,
  getLabelName,
  getTodayIso,
  hasMeaningfulTime,
  isPriorityLabel,
  labelKey,
  toLocalDateIso,
} from "../logic/tasks";

export function useTaskFilters({ tasks, view, searchQuery, activeLabel }) {
  // #region Derived State
  const todayIso = getTodayIso();
  const isSearching = searchQuery.trim().length > 0;

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const getStatusLabel = (task) => {
      const isCompleted = task.status === "done" || task.completed_at;
      if (isCompleted) return "Erledigt";
      const dueDate = task.due_at ? new Date(task.due_at) : null;
      const dueMs =
        dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.getTime() : null;
      if (dueMs && dueMs < Date.now()) return "Abgelaufen";
      const dueDateIso =
        dueDate && !Number.isNaN(dueDate.getTime())
          ? toLocalDateIso(dueDate)
          : "";
      if (dueDateIso === todayIso) return "Heute";
      if (!dueDateIso || dueDateIso > todayIso) return "Demnächst";
      return "Offen";
    };

    return tasks
      .filter((task) => {
        const taskLabels = (task.task_labels || []).filter(
          (label) => !isPriorityLabel(label)
        );
        const taskLabelNames = taskLabels
          .map((label) => getLabelName(label))
          .filter(Boolean);
        const searchText = [
          task.title,
          task.description,
          taskLabelNames.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, 6)
      .map((task) => {
        const statusLabel = getStatusLabel(task);
        const dueLabel = task.due_at
          ? hasMeaningfulTime(task.due_at)
            ? `${formatTime(task.due_at)} Uhr`
            : formatDate(task.due_at)
          : "";
        const meta = [statusLabel, dueLabel].filter(Boolean).join(" • ");
        return {
          id: task.id,
          title: task.title,
          meta,
        };
      });
  }, [tasks, searchQuery, todayIso]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const nowMs = Date.now();

    return tasks.filter((task) => {
      const taskLabels = (task.task_labels || []).filter(
        (label) => !isPriorityLabel(label)
      );
      const taskLabelNames = taskLabels
        .map((label) => getLabelName(label))
        .filter(Boolean);
      const searchText = [
        task.title,
        task.description,
        taskLabelNames.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchText.includes(query);

      const matchesLabel =
        !activeLabel ||
        taskLabels.some((label) => labelKey(label) === labelKey(activeLabel));

      const isCompleted = task.status === "done" || task.completed_at;
      const dueDate = task.due_at ? new Date(task.due_at) : null;
      const dueMs =
        dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.getTime() : null;
      const dueDateIso =
        dueDate && !Number.isNaN(dueDate.getTime())
          ? toLocalDateIso(dueDate)
          : "";

      const isExpired = !isCompleted && dueMs && dueMs < nowMs;
      const isToday = !isCompleted && dueDateIso === todayIso && !isExpired;
      const isUpcoming = !isCompleted && (!dueDateIso || dueDateIso > todayIso);

      const matchesView = isSearching
        ? true
        : view === "label" ||
          (view === "today" && isToday) ||
          (view === "upcoming" && isUpcoming) ||
          (view === "completed" && isCompleted) ||
          (view === "expired" && isExpired);

      return matchesSearch && matchesLabel && matchesView;
    });
  }, [tasks, searchQuery, activeLabel, view, todayIso, isSearching]);

  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    list.sort(compareTasks);
    return list;
  }, [filteredTasks]);

  const pageTitle = isSearching
    ? "Suchergebnisse"
    : view === "label"
      ? activeLabel
        ? `#${activeLabel}`
        : "Labels"
      : view === "completed"
        ? "Erledigte Aufgaben"
        : view === "expired"
          ? "Abgelaufene Aufgaben"
          : view === "upcoming"
            ? "Demnächst"
            : "Heute";

  const taskCountLabel = filteredTasks.length === 1 ? "Aufgabe" : "Aufgaben";

  const labelCounts = useMemo(() => {
    const counts = new Map();
    tasks.forEach((task) => {
      (task.task_labels || []).forEach((label) => {
        if (isPriorityLabel(label)) return;
        const key = labelKey(label);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return counts;
  }, [tasks]);

  const getLabelCount = (label) => labelCounts.get(labelKey(label)) || 0;
  // #endregion Derived State

  // #region Return
  return {
    searchSuggestions,
    filteredTasks,
    sortedTasks,
    pageTitle,
    taskCountLabel,
    getLabelCount,
  };
  // #endregion Return
}
