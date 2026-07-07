function DashboardToolbar({
  selectedPeriod,
  setSelectedPeriod,
  clearSelection,
  showPTAL,
  setShowPTAL,
  showPopulation,
  setShowPopulation,
  showStops,
  setShowStops,
  showRoutes,
  setShowRoutes,
}) {
  return (
    <div className="dashboard-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Analysis</span>

        <select
          className="toolbar-select"
          value={selectedPeriod}
          onChange={(e) => {
            setSelectedPeriod(e.target.value);
            clearSelection();
          }}
        >
          <option value="monday_full_day">Monday</option>
          <option value="tuesday_full_day">Tuesday</option>
          <option value="wednesday_full_day">Wednesday</option>
          <option value="thursday_full_day">Thursday</option>
          <option value="friday_full_day">Friday</option>
          <option value="saturday_full_day">Saturday</option>
          <option value="sunday_full_day">Sunday</option>
        </select>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <span className="toolbar-label">Layers</span>

        <button
          className={`layer-chip ${showPTAL ? "active" : ""}`}
          onClick={() => setShowPTAL((prev) => !prev)}
        >
          PTAL
        </button>

        <button
          className={`layer-chip ${showPopulation ? "active" : ""}`}
          onClick={() => setShowPopulation((prev) => !prev)}
        >
          Population
        </button>

        <button
          className={`layer-chip ${showStops ? "active" : ""}`}
          onClick={() => setShowStops((prev) => !prev)}
        >
          Bus Stops
        </button>

        <button
          className={`layer-chip ${showRoutes ? "active" : ""}`}
          onClick={() => setShowRoutes((prev) => !prev)}
        >
          Bus Routes
        </button>
      </div>
    </div>
  );
}

export default DashboardToolbar;