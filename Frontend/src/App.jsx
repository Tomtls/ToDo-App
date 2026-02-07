import { useEffect, useMemo, useState } from "react";
import Login from "./Login";
import {
  compareTasks,
  formatDate,
  formatTime,
  formatTimeInput,
  getTodayIso,
  hasMeaningfulTime,
  labelKey,
  mergeLabels,
  normalizeLabel,
  normalizePriority,
  normalizeTask,
  toLocalDateIso,
} from "./logic/tasks";
import { loadLabels, loadTasks, saveLabels, saveTasks } from "./logic/storage";
import "./App.css";

function App() {
  // State
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [labelInput, setLabelInput] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelModalInput, setLabelModalInput] = useState("");

  const [view, setView] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");

  // Effects
  useEffect(() => {
    if (currentUser) {
      const userTasks = loadTasks(currentUser.username).map((task) =>
        normalizeTask(task, currentUser.username)
      );
      setTasks(userTasks);
      const storedLabels = loadLabels(currentUser.username);
      const derivedLabels = userTasks.flatMap((t) => t.task_labels || []);
      setLabels(mergeLabels(storedLabels, derivedLabels));
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

  // Auth
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setTasks([]);
    setLabels([]);
  };

  // Labels
  const ensureLabel = (value) => {
    const normalized = normalizeLabel(value || "");
    if (!normalized) return "";
    const existing = labels.find((l) => labelKey(l) === labelKey(normalized));
    if (existing) {
      return existing;
    }
    setLabels((prev) => mergeLabels(prev, [normalized]));
    return normalized;
  };

  const addLabelFromInput = () => {
    const value = ensureLabel(labelInput);
    if (!value) return;
    setSelectedLabels((prev) => mergeLabels(prev, [value]));
    setLabelInput("");
  };

  const addLabelFromModal = () => {
    const value = ensureLabel(labelModalInput);
    if (!value) return;
    setLabelModalInput("");
  };

  const openLabelModal = () => setIsLabelModalOpen(true);
  const closeLabelModal = () => {
    setIsLabelModalOpen(false);
    setLabelModalInput("");
  };

  const toggleSelectedLabel = (label) => {
    setSelectedLabels((prev) => {
      const exists = prev.some((l) => labelKey(l) === labelKey(label));
      if (exists) {
        return prev.filter((l) => labelKey(l) !== labelKey(label));
      }
      return mergeLabels(prev, [label]);
    });
  };

  // Tasks
  const addTask = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!title.trim()) return;

    const extraLabel = ensureLabel(labelInput);
    const taskLabels = mergeLabels(selectedLabels, extraLabel ? [extraLabel] : []);

    const nowIso = new Date().toISOString();
    const dueAt = dueDate
      ? new Date(`${dueDate}T${dueTime || "00:00"}:00`).toISOString()
      : null;
    const priorityValue = normalizePriority(priority);

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== editingTaskId) return task;
          return {
            ...task,
            title: title.trim(),
            description: description.trim() ? description.trim() : null,
            priority: priorityValue,
            due_at: dueAt,
            updated_at: nowIso,
            task_labels: taskLabels,
          };
        })
      );
    } else {
      const newTask = {
        id: String(Date.now()),
        owner_id: currentUser?.username || "dev-user",
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        status: "open",
        priority: priorityValue,
        due_at: dueAt,
        created_at: nowIso,
        updated_at: nowIso,
        completed_at: null,
        task_labels: taskLabels,
      };
      setTasks((prev) => [...prev, newTask]);
    }

    closeModal();
  };

  const toggleTask = (id) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isCompleted = t.status === "completed" || t.completed_at;
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
          status: "completed",
          completed_at: nowIso,
          updated_at: nowIso,
        };
      })
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openModal = () => {
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(normalizePriority(task.priority ?? 2));
    setDueDate(task.due_at ? toLocalDateIso(new Date(task.due_at)) : "");
    setDueTime(
      task.due_at && hasMeaningfulTime(task.due_at)
        ? formatTimeInput(task.due_at)
        : ""
    );
    setSelectedLabels(task.task_labels || []);
    setLabelInput("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setDescription("");
    setPriority(2);
    setLabelInput("");
    setSelectedLabels([]);
  };

  // Filtering
  const todayIso = getTodayIso();
  const isSearching = searchQuery.trim().length > 0;

  const getTaskStatusLabel = (task) => {
    const isCompleted = task.status === "completed" || task.completed_at;
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

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return tasks
      .filter((task) => {
        const taskLabels = task.task_labels || [];
        const searchText = [task.title, task.description, taskLabels.join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, 6);
  }, [tasks, searchQuery]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const nowMs = Date.now();

    return tasks.filter((task) => {
      const taskLabels = task.task_labels || [];
      const searchText = [task.title, task.description, taskLabels.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchText.includes(query);

      const matchesLabel =
        !activeLabel ||
        taskLabels.some((l) => labelKey(l) === labelKey(activeLabel));

      const isCompleted = task.status === "completed" || task.completed_at;
      const dueDate = task.due_at ? new Date(task.due_at) : null;
      const dueMs =
        dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.getTime() : null;
      const dueDateIso =
        dueDate && !Number.isNaN(dueDate.getTime())
          ? toLocalDateIso(dueDate)
          : "";

      const isExpired = !isCompleted && dueMs && dueMs < nowMs;
      const isToday = !isCompleted && dueDateIso === todayIso && !isExpired;
      const isUpcoming =
        !isCompleted && (!dueDateIso || dueDateIso > todayIso);

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

  const labelCount = (label) =>
    tasks.filter((t) =>
      (t.task_labels || []).some((l) => labelKey(l) === labelKey(label))
    ).length;

  // UI
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="sidebar-add" onClick={openModal} type="button">
          + Aufgabe hinzufügen
        </button>

        <div className="sidebar-search">
          <input
            className="search-input"
            type="text"
            placeholder="Suchen"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="search-suggestions">
              {searchSuggestions.map((task) => {
                const statusLabel = getTaskStatusLabel(task);
                const dueLabel = task.due_at
                  ? hasMeaningfulTime(task.due_at)
                    ? `${formatTime(task.due_at)} Uhr`
                    : formatDate(task.due_at)
                  : "";
                return (
                  <button
                    key={task.id}
                    type="button"
                    className="suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchQuery(task.title);
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="suggestion-title">{task.title}</span>
                    <span className="suggestion-meta">
                      {statusLabel}
                      {dueLabel ? ` • ${dueLabel}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === "today" ? "active" : ""}`}
            onClick={() => setView("today")}
            type="button"
          >
            Heute
          </button>
          <button
            className={`nav-item ${view === "upcoming" ? "active" : ""}`}
            onClick={() => setView("upcoming")}
            type="button"
          >
            Demnächst
          </button>
          <button
            className={`nav-item ${view === "completed" ? "active" : ""}`}
            onClick={() => setView("completed")}
            type="button"
          >
            Erledigte Aufgaben
          </button>
          <button
            className={`nav-item ${view === "expired" ? "active" : ""}`}
            onClick={() => setView("expired")}
            type="button"
          >
            Abgelaufene Aufgaben
          </button>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-title-row">
            <div className="sidebar-title">Labels</div>
            <button className="label-plus" type="button" onClick={openLabelModal}>
              +
            </button>
          </div>
          <button
            className={`label-clear ${activeLabel ? "" : "active"}`}
            onClick={() => {
              setActiveLabel("");
              setView("today");
            }}
            type="button"
          >
            Alle Labels
          </button>
          <ul className="label-list">
            {labels.length === 0 && (
              <li className="label-empty">Noch keine Labels</li>
            )}
            {labels.map((label) => (
              <li key={label} className="label-group">
                <button
                  className={`label-item ${
                    labelKey(activeLabel) === labelKey(label) ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveLabel(label);
                    setView("label");
                  }}
                  type="button"
                >
                  <span className="label-name">#{label}</span>
                  <span className="label-count">{labelCount(label)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="main">
        <div className="top-bar">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            <div className="page-subtitle">
              {filteredTasks.length} {taskCountLabel}
            </div>
          </div>
          <button className="logout-link" onClick={logout} type="button">
            Logout
          </button>
        </div>

        <ul className="task-list">
          {sortedTasks.map((task) => {
            const taskLabels = task.task_labels || [];
            const showTime = hasMeaningfulTime(task.due_at);
            return (
              <li
                key={task.id}
                className="task-item"
                onClick={() => openEditModal(task)}
              >
                <button
                  className={`task-check ${
                    task.status === "completed" ? "checked" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  aria-label="Aufgabe abhaken"
                  type="button"
                />
                <div className="task-body">
                  <div className="task-row">
                    <div
                      className={`task-title ${
                        task.status === "completed" ? "completed" : ""
                      }`}
                    >
                      {task.title}
                    </div>
                    {taskLabels.length > 0 && (
                      <div className="task-tags">
                        {taskLabels.map((label) => (
                          <span key={label} className="task-tag">
                            #{label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {(task.due_at || task.description) && (
                    <div className="task-meta">
                      {task.due_at && showTime && (
                        <span className="task-time">
                          {formatTime(task.due_at)} Uhr
                        </span>
                      )}
                      {task.due_at && !showTime && (
                        <span className="task-time">
                          {formatDate(task.due_at)}
                        </span>
                      )}
                      {task.description && (
                        <span className="task-desc">{task.description}</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="task-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  aria-label="Aufgabe löschen"
                  type="button"
                >
                  x
                </button>
              </li>
            );
          })}
          {filteredTasks.length === 0 && (
            <li className="task-empty">Keine Aufgaben gefunden.</li>
          )}
        </ul>

        <button className="add-task-link" onClick={openModal} type="button">
          <span className="add-plus">+</span> Aufgabe hinzufügen
        </button>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <form className="modal-form modal-form-compact" onSubmit={addTask}>
              <div className="modal-header">
                <input
                  className="modal-title-input"
                  type="text"
                  placeholder="Aufgabe hinzufügen"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <textarea
                className="modal-desc-input"
                placeholder="Beschreibung"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="modal-toolbar">
                <div className="chip-group">
                  <span className="chip-label">Fällig</span>
                  <input
                    className="chip-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <input
                    className="chip-input"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
                <div className="chip-group">
                  <span className="chip-label">Priorität</span>
                  <select
                    className="chip-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>

              <div className="label-field">
                <label>Label</label>
                <div className="label-input-row">
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Neues Label"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLabelFromInput();
                      }
                    }}
                  />
                  <button
                    className="label-add-btn"
                    type="button"
                    onClick={addLabelFromInput}
                  >
                    Hinzufügen
                  </button>
                </div>
                {labels.length > 0 && (
                  <div className="label-pills">
                    {labels.map((label) => {
                      const selected = selectedLabels.some(
                        (l) => labelKey(l) === labelKey(label)
                      );
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`label-pill ${selected ? "selected" : ""}`}
                          onClick={() => toggleSelectedLabel(label)}
                        >
                          #{label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <div className="footer-actions">
                  <button
                    className="modal-cancel-btn"
                    onClick={closeModal}
                    type="button"
                  >
                    Abbrechen
                  </button>
                  <button className="modal-add-btn" type="submit">
                    {editingTaskId ? "Aktualisieren" : "Aufgabe hinzufügen"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLabelModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                addLabelFromModal();
              }}
            >
              <h2 className="modal-title">Label hinzufügen</h2>
              <div className="label-field">
                <label>Label</label>
                <div className="label-input-row">
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="Neues Label"
                    value={labelModalInput}
                    onChange={(e) => setLabelModalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLabelFromModal();
                      }
                    }}
                    autoFocus
                  />
                  <button className="label-add-btn" type="submit">
                    Hinzufügen
                  </button>
                </div>
                {labels.length > 0 && (
                  <div className="label-pills">
                    {labels.map((label) => (
                      <span key={label} className="label-pill">
                        #{label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <div className="footer-actions">
                  <button
                    className="modal-cancel-btn"
                    onClick={closeLabelModal}
                    type="button"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
