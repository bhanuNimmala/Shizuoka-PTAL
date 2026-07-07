import PTALCard from "./cards/PTALCard";
import PopulationCard from "./cards/PopulationCard";
import StopCard from "./cards/StopCard";
import RouteCard from "./cards/RouteCard";
import { ANALYSIS_PERIODS } from "./utils/mapUtils";
import { useState } from "react";
import AboutPTALModal from "./AboutPTALModal";

function Sidebar({
  selectedPeriod,
  setSelectedPeriod,
  selectedType,
  selectedFeature,
  showPTAL,
  setShowPTAL,
  showPopulation,
  setShowPopulation,
  showRoutes,
  setShowRoutes,
  showStops,
  setShowStops,
  clearSelection,
}) {
  const [showPTALInfo, setShowPTALInfo] = useState(false);
  return (
    <aside className="sidebar">
      <h1 className="dashboard-title">
        Shizuoka PTAL Dashboard
      </h1>

      <div className="period-selector">
        <label>Analysis Period</label>

        <select
          value={selectedPeriod}
          onChange={(e) => {
            setSelectedPeriod(e.target.value);
            clearSelection();
          }}
        >
          {Object.entries(ANALYSIS_PERIODS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

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

      <div className="about-ptal-card">
        <h3>About PTAL</h3>
        <p>
          Learn how the PTAL score is calculated and what the values mean.
        </p>
        <button onClick={() => setShowPTALInfo(true)}>
          View Methodology
        </button>
      </div>

      <section className="panel-section">
        <h3>Selected Feature</h3>

        {!selectedFeature && (
          <div className="empty-card">
            Click a PTAL grid, population mesh,
            bus stop or route.
          </div>
        )}

        {selectedType === "ptal" && (
          <PTALCard feature={selectedFeature} />
        )}

        {selectedType === "population" && (
          <PopulationCard feature={selectedFeature} />
        )}

        {selectedType === "stop" && (
          <StopCard feature={selectedFeature} />
        )}

        {selectedType === "route" && (
          <RouteCard feature={selectedFeature} />
        )}
      </section>

      <section className="panel-section">
        <h3>Calculation Parameters</h3>

        <div className="info-card left-text">
          <p>
            <strong>Analysis Period:</strong>{" "}
            {ANALYSIS_PERIODS[selectedPeriod]}
          </p>

          <p>
            <strong>Analysis Time:</strong>
            {" "}00:00–24:00
          </p>

          <p>
            <strong>Walk Speed:</strong>
            {" "}5 km/h
          </p>

          <p>
            <strong>Bus Walk Threshold:</strong>
            {" "}960 m
          </p>

          <p>
            <strong>Rail Access:</strong>
            {" "}Not Included
          </p>

          <p>
            <strong>GTFS:</strong>
            {" "}Community Bus Only
          </p>
        </div>
      </section>

      <section className="panel-section">
        <h3>Transport Information</h3>

        <div className="info-card left-text">
          <p>
            Displays full-day PTAL accessibility
            by day of week.
          </p>

          <p>
            Population is displayed using the
            official 500 m census mesh.
          </p>
        </div>
      </section>
      {showPTALInfo && (
        <AboutPTALModal onClose={() => setShowPTALInfo(false)} />
      )}  
    </aside>
  );
}

export default Sidebar;