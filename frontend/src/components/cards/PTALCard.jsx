import { getProp } from "../utils/mapUtils";

function PTALCard({ feature }) {
  const p = feature.properties || {};
  const band = getProp(p, ["ptal_band", "ptal", "band"], null);
  const ai = getProp(p, ["accessibility_index", "ai", "ptal_score"], null);
  const gridId = getProp(p, ["grid_id", "id"], null);
  const stopCount = getProp(p, ["reachable_stop_count"], null);
  const maxTrips = getProp(p, ["max_trips_per_hour"], null);

  return (
    <div className="result-card">
      <h2>PTAL Grid</h2>
      {band && <div className="score-circle">{band}</div>}

      <div className="card-details">
        {gridId && <p><strong>Grid ID:</strong> {gridId}</p>}
        {ai && <p><strong>Accessibility Index:</strong> {ai}</p>}
        {band && <p><strong>PTAL Band:</strong> {band}</p>}
        {stopCount !== null && <p><strong>Reachable Stops:</strong> {stopCount}</p>}
        {maxTrips !== null && <p><strong>Max Trips/Hour:</strong> {maxTrips}</p>}
      </div>
    </div>
  );
}

export default PTALCard;