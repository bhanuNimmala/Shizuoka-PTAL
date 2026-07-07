import PTALCard from "./cards/PTALCard";
import PopulationCard from "./cards/PopulationCard";
import StopCard from "./cards/StopCard";
import RouteCard from "./cards/RouteCard";

function Sidebar({ selectedType, selectedFeature, clearSelection }) {
  return (
    <aside className="sidebar">
      <section className="selected-feature-panel">
        <div className="selected-feature-header">
          <div>
            <h2>Selected Feature</h2>
            <p>Inspect map features</p>
          </div>

          {selectedFeature && (
            <button
              className="clear-selection-button"
              onClick={clearSelection}
            >
              Clear
            </button>
          )}
        </div>

        {!selectedFeature && (
          <div className="empty-card">
            Select a feature on the map to view its details.
          </div>
        )}

        {selectedType === "ptal" && selectedFeature && (
          <PTALCard feature={selectedFeature} />
        )}

        {selectedType === "population" && selectedFeature && (
          <PopulationCard feature={selectedFeature} />
        )}

        {selectedType === "stop" && selectedFeature && (
          <StopCard feature={selectedFeature} />
        )}

        {selectedType === "route" && selectedFeature && (
          <RouteCard feature={selectedFeature} />
        )}
      </section>
    </aside>
  );
}

export default Sidebar;