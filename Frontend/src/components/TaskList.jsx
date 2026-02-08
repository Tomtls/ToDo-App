import {
  formatDate,
  formatTime,
  getLabelName,
  hasMeaningfulTime,
  isPriorityLabel,
  labelKey,
} from "../logic/tasks";

export default function TaskList({
  pageTitle,
  filteredCount,
  taskCountLabel,
  tasks,
  onLogout,
  onOpenEdit,
  onToggle,
  onDelete,
  onAddTask,
}) {
  // #region Render
  return (
    <main className="main">
      <div className="top-bar">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <div className="page-subtitle">
            {filteredCount} {taskCountLabel}
          </div>
        </div>
        <button className="logout-link" onClick={onLogout} type="button">
          Logout
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => {
          const taskLabels = (task.task_labels || []).filter(
            (label) => !isPriorityLabel(label)
          );
          const showTime = hasMeaningfulTime(task.due_at);
          return (
            <li
              key={task.id}
              className="task-item"
              onClick={() => onOpenEdit(task)}
            >
              <button
                className={`task-check ${
                  task.status === "done" ? "checked" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(task.id);
                }}
                aria-label="Aufgabe abhaken"
                type="button"
              />
              <div className="task-body">
                <div className="task-row">
                  <div
                    className={`task-title ${
                      task.status === "done" ? "completed" : ""
                    }`}
                  >
                    {task.title}
                  </div>
                  {taskLabels.length > 0 && (
                    <div className="task-tags">
                      {taskLabels.map((label) => {
                        const labelName = getLabelName(label);
                        return (
                          <span key={labelKey(label)} className="task-tag">
                            #{labelName}
                          </span>
                        );
                      })}
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
                  onDelete(task.id);
                }}
                aria-label="Aufgabe löschen"
                type="button"
              >
                x
              </button>
            </li>
          );
        })}
        {filteredCount === 0 && (
          <li className="task-empty">Keine Aufgaben gefunden.</li>
        )}
      </ul>

      <button className="add-task-link" onClick={onAddTask} type="button">
        <span className="add-plus">+</span> Aufgabe hinzufügen
      </button>
    </main>
  );
  // #endregion Render
}
