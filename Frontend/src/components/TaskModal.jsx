import { getLabelName, labelKey } from "../logic/tasks";

export default function TaskModal({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  dueTime,
  onDueTimeChange,
  priority,
  onPriorityChange,
  labelInput,
  onLabelInputChange,
  labels,
  selectedLabels,
  onAddLabelFromInput,
  onToggleSelectedLabel,
  onClose,
  onSubmit,
  isEditing,
}) {
  // #region Render
  return (
    <div className="modal-overlay">
      <div className="modal">
        <form className="modal-form modal-form-compact" onSubmit={onSubmit}>
          <div className="modal-header">
            <input
              className="modal-title-input"
              type="text"
              placeholder="Aufgabe hinzufügen"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
            />
          </div>

          <textarea
            className="modal-desc-input"
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />

          <div className="modal-toolbar">
            <div className="chip-group">
              <span className="chip-label">Fällig</span>
              <input
                className="chip-input"
                type="date"
                value={dueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
              />
              <input
                className="chip-input"
                type="time"
                value={dueTime}
                onChange={(e) => onDueTimeChange(e.target.value)}
              />
            </div>
            <div className="chip-group">
              <span className="chip-label">Priorität</span>
              <select
                className="chip-select"
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
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
                onChange={(e) => onLabelInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddLabelFromInput();
                  }
                }}
              />
              <button
                className="label-add-btn"
                type="button"
                onClick={onAddLabelFromInput}
              >
                Hinzufügen
              </button>
            </div>
            {labels.length > 0 && (
              <div className="label-pills">
                {labels.map((label) => {
                  const selected = selectedLabels.some(
                    (item) => labelKey(item) === labelKey(label)
                  );
                  const labelName = getLabelName(label);
                  return (
                    <button
                      key={labelKey(label)}
                      type="button"
                      className={`label-pill ${selected ? "selected" : ""}`}
                      onClick={() => onToggleSelectedLabel(labelName)}
                    >
                      #{labelName}
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
                onClick={onClose}
                type="button"
              >
                Abbrechen
              </button>
              <button className="modal-add-btn" type="submit">
                {isEditing ? "Aktualisieren" : "Aufgabe hinzufügen"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  // #endregion Render
}
