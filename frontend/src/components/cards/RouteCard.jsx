import { cleanRouteName } from "../utils/mapUtils";

function RouteCard({ feature }) {
  const p = feature.properties || {};

  return (
    <div className="result-card">
      <h2>Bus Route</h2>

      <div className="card-details">
        <p><strong>Route Name:</strong> {cleanRouteName(p)}</p>
        {p.agency_name && <p><strong>Agency:</strong> {p.agency_name}</p>}
      </div>
    </div>
  );
}

export default RouteCard;