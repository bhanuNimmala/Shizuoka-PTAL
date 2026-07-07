function LayerControls({
  showPTAL,
  setShowPTAL,
  showPopulation,
  setShowPopulation,
  showRoutes,
  setShowRoutes,
  showStops,
  setShowStops,
}) {
  return (
    <div className="layer-toggle-panel">
      <h3>Map Layers</h3>

      <label>
        <input
          type="checkbox"
          checked={showPTAL}
          onChange={(e) => setShowPTAL(e.target.checked)}
        />
        PTAL Grid
      </label>

      <label>
        <input
          type="checkbox"
          checked={showPopulation}
          onChange={(e) => setShowPopulation(e.target.checked)}
        />
        Population
      </label>

      <label>
        <input
          type="checkbox"
          checked={showRoutes}
          onChange={(e) => setShowRoutes(e.target.checked)}
        />
        Bus Routes
      </label>

      <label>
        <input
          type="checkbox"
          checked={showStops}
          onChange={(e) => setShowStops(e.target.checked)}
        />
        Bus Stops
      </label>
    </div>
  );
}

export default LayerControls;