import { useState } from "react";
import Login from "./Login";
import { labelKey, mergeLabels } from "./logic/tasks";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import LabelModal from "./components/LabelModal";
import { useAuth } from "./hooks/useAuth";
import { useLabelModal } from "./hooks/useLabelModal";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { useTaskForm } from "./hooks/useTaskForm";
import { useTasksStore } from "./hooks/useTasksStore";
import "./App.css";

function App() {
  // #region Hooks & State
  const { currentUser, setCurrentUser, logout, authReady } = useAuth();
  const {
    tasks,
    labels,
    ensureLabel,
    addOrUpdateTask,
    toggleTask,
    deleteTask,
  } = useTasksStore(currentUser);
  const taskForm = useTaskForm();
  const labelModal = useLabelModal();

  const [view, setView] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");

  const {
    searchSuggestions,
    filteredTasks,
    sortedTasks,
    pageTitle,
    taskCountLabel,
    getLabelCount,
  } = useTaskFilters({ tasks, view, searchQuery, activeLabel });
  // #endregion Hooks & State

  if (!authReady) {
    return null;
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // #region Handlers
  const addLabelFromInput = async () => {
    const value = await ensureLabel(taskForm.labelInput);
    if (!value) return;
    taskForm.setSelectedLabels((prev) => mergeLabels(prev, [value]));
    taskForm.setLabelInput("");
  };

  const addLabelFromModal = async () => {
    const value = await ensureLabel(labelModal.labelModalInput);
    if (!value) return;
    labelModal.setLabelModalInput("");
  };

  const toggleSelectedLabel = (label) => {
    taskForm.setSelectedLabels((prev) => {
      const exists = prev.some((item) => labelKey(item) === labelKey(label));
      if (exists) {
        return prev.filter((item) => labelKey(item) !== labelKey(label));
      }
      return mergeLabels(prev, [label]);
    });
  };

  const handleTaskSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!taskForm.title.trim()) {
      alert("Bitte geben Sie einen Titel für die Aufgabe ein.");
      return;
    }

    const didSave = await addOrUpdateTask({
      editingTaskId: taskForm.editingTaskId,
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      dueTime: taskForm.dueTime,
      priority: taskForm.priority,
      selectedLabels: taskForm.selectedLabels,
      labelInput: taskForm.labelInput,
    });
    if (didSave) {
      taskForm.close();
    } else {
      alert("Fehler beim Speichern der Aufgabe. Bitte versuchen Sie es erneut.");
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
  };
  // #endregion Handlers

  // #region Render
  return (
    <div className="app-shell">
      <Sidebar
        onAddTask={taskForm.openCreate}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestions={searchSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        view={view}
        onViewChange={setView}
        labels={labels}
        activeLabel={activeLabel}
        onActiveLabelChange={setActiveLabel}
        onAddLabel={labelModal.open}
        getLabelCount={getLabelCount}
      />

      <TaskList
        pageTitle={pageTitle}
        filteredCount={filteredTasks.length}
        taskCountLabel={taskCountLabel}
        tasks={sortedTasks}
        view={view}
        onLogout={logout}
        onOpenEdit={taskForm.openEdit}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onAddTask={taskForm.openCreate}
      />

      {taskForm.isModalOpen && (
        <TaskModal
          title={taskForm.title}
          onTitleChange={taskForm.setTitle}
          description={taskForm.description}
          onDescriptionChange={taskForm.setDescription}
          dueDate={taskForm.dueDate}
          onDueDateChange={taskForm.setDueDate}
          dueTime={taskForm.dueTime}
          onDueTimeChange={taskForm.setDueTime}
          priority={taskForm.priority}
          onPriorityChange={taskForm.setPriority}
          labelInput={taskForm.labelInput}
          onLabelInputChange={taskForm.setLabelInput}
          labels={labels}
          selectedLabels={taskForm.selectedLabels}
          onAddLabelFromInput={addLabelFromInput}
          onToggleSelectedLabel={toggleSelectedLabel}
          onClose={taskForm.close}
          onSubmit={handleTaskSubmit}
          isEditing={Boolean(taskForm.editingTaskId)}
        />
      )}

      {labelModal.isLabelModalOpen && (
        <LabelModal
          labelModalInput={labelModal.labelModalInput}
          onLabelModalInputChange={labelModal.setLabelModalInput}
          labels={labels}
          onSubmit={(e) => {
            e.preventDefault();
            addLabelFromModal();
          }}
          onClose={labelModal.close}
        />
      )}
    </div>
  );
  // #endregion Render
}

export default App;
