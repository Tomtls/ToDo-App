import { useState } from "react";
import {
  formatTimeInput,
  getPriorityFromLabels,
  hasMeaningfulTime,
  isPriorityLabel,
  mergeLabels,
  toLocalDateIso,
} from "../logic/tasks";

export function useTaskForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState(2);
  const [labelInput, setLabelInput] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);

  const openCreate = () => {
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(getPriorityFromLabels(task.task_labels));
    setDueDate(task.due_at ? toLocalDateIso(new Date(task.due_at)) : "");
    setDueTime(
      task.due_at && hasMeaningfulTime(task.due_at)
        ? formatTimeInput(task.due_at)
        : ""
    );
    const taskLabels = mergeLabels([], task.task_labels || []).filter(
      (label) => !isPriorityLabel(label)
    );
    setSelectedLabels(taskLabels);
    setLabelInput("");
    setIsModalOpen(true);
  };

  const close = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setPriority(2);
    setLabelInput("");
    setSelectedLabels([]);
  };

  return {
    isModalOpen,
    editingTaskId,
    title,
    description,
    dueDate,
    dueTime,
    priority,
    labelInput,
    selectedLabels,
    setTitle,
    setDescription,
    setDueDate,
    setDueTime,
    setPriority,
    setLabelInput,
    setSelectedLabels,
    openCreate,
    openEdit,
    close,
  };
}
