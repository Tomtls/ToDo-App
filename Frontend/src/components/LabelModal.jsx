import { getLabelName, labelKey } from "../logic/tasks";

export default function LabelModal({
  labelModalInput,
  onLabelModalInputChange,
  labels,
  onSubmit,
  onClose,
}) {
  // #region Render
  return (
    <div className="modal-overlay">
      <div className="modal modal-small">
        <form className="modal-form" onSubmit={onSubmit}>
          <h2 className="modal-title">Label hinzufügen</h2>
          <div className="label-field">
            <label>Label</label>
            <div className="label-input-row">
              <input
                className="modal-input"
                type="text"
                placeholder="Neues Label"
                value={labelModalInput}
                onChange={(e) => onLabelModalInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmit(e);
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
                {labels.map((label) => {
                  const labelName = getLabelName(label);
                  return (
                    <span key={labelKey(label)} className="label-pill">
                      #{labelName}
                    </span>
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
                Schließen
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  // #endregion Render
}
