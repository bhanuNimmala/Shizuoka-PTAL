import { cleanStopName, formatNumber, getProp } from "../utils/mapUtils";

function StopCard({ feature }) {
  const p = feature.properties || {};
  const coords = feature.geometry?.coordinates || [];

  const lon = getProp(p, ["stop_lon", "lon", "longitude"], coords[0]);
  const lat = getProp(p, ["stop_lat", "lat", "latitude"], coords[1]);

  const formattedLat = formatNumber(lat);
  const formattedLon = formatNumber(lon);

  return (
    <div className="result-card">
      <h2>Bus Stop</h2>

      <div className="card-details">
        <p><strong>Stop Name:</strong> {cleanStopName(p)}</p>
        {formattedLat && <p><strong>Latitude:</strong> {formattedLat}</p>}
        {formattedLon && <p><strong>Longitude:</strong> {formattedLon}</p>}
      </div>
    </div>
  );
}

export default StopCard;