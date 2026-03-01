import { getLabelName, labelKey } from "../logic/tasks";

const NAV_ITEMS = [
  { id: "all", label: "Alle Aufgaben" },
  { id: "today", label: "Heute" },
  { id: "upcoming", label: "Demnächst" },
  { id: "completed", label: "Erledigte Aufgaben" },
  { id: "expired", label: "Abgelaufene Aufgaben" },
];

export default function Sidebar({
  onAddTask,
  searchQuery,
  onSearchQueryChange,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  onSuggestionSelect,
  view,
  onViewChange,
  labels,
  activeLabel,
  onActiveLabelChange,
  onAddLabel,
  getLabelCount,
}) {
  // #region Render
  return (
    <aside className="sidebar">
      <button className="sidebar-add" onClick={onAddTask} type="button">
        + Aufgabe hinzufügen
      </button>

      <div className="sidebar-search">
        <input
          className="search-input"
          type="text"
          placeholder="Suchen"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setShowSuggestions(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSuggestionSelect(suggestion)}
              >
                <span className="suggestion-title">{suggestion.title}</span>
                {suggestion.meta && (
                  <span className="suggestion-meta">{suggestion.meta}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => {
              if (item.id === "all") {
                onActiveLabelChange("");
              }
              onViewChange(item.id);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-title-row">
          <div className="sidebar-title">Labels</div>
          <button className="label-plus" type="button" onClick={onAddLabel}>
            +
          </button>
        </div>
        <button
          className={`label-clear ${activeLabel ? "" : "active"}`}
          onClick={() => {
            onActiveLabelChange("");
            onViewChange("today");
          }}
          type="button"
        >
          Alle Labels
        </button>
        <ul className="label-list">
          {labels.length === 0 && (
            <li className="label-empty">Noch keine Labels</li>
          )}
          {labels.map((label) => {
            const labelName = getLabelName(label);
            return (
              <li key={labelKey(label)} className="label-group">
                <button
                  className={`label-item ${
                    labelKey(activeLabel) === labelKey(label) ? "active" : ""
                  }`}
                  onClick={() => {
                    onActiveLabelChange(labelName);
                    onViewChange("label");
                  }}
                  type="button"
                >
                  <span className="label-name">#{labelName}</span>
                  <span className="label-count">{getLabelCount(label)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
  // #endregion Render
}
