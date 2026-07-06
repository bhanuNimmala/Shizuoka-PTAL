import { MapContainer, TileLayer, GeoJSON, Pane, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

const API_BASE = "http://localhost:8000/api";

function getPTALColor(band) {
  switch (String(band)) {
    case "0":
      return "#f5f5f5";
    case "1a":
      return "#d9f0a3";
    case "1b":
      return "#addd8e";
    case "2":
      return "#78c679";
    case "3":
      return "#41ab5d";
    case "4":
      return "#238443";
    case "5":
      return "#006837";
    case "6a":
      return "#fdae61";
    case "6b":
      return "#d7191c";
    default:
      return "#cccccc";
  }
}

function App() {
  const [ptalData, setPtalData] = useState(null);
  const [routesData, setRoutesData] = useState(null);
  const [stopsData, setStopsData] = useState(null);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/ptal/`)
      .then((res) => res.json())
      .then(setPtalData)
      .catch((err) => console.error("PTAL API error:", err));

    fetch(`${API_BASE}/routes/`)
      .then((res) => res.json())
      .then(setRoutesData)
      .catch((err) => console.error("Routes API error:", err));

    fetch(`${API_BASE}/stops/`)
      .then((res) => res.json())
      .then(setStopsData)
      .catch((err) => console.error("Stops API error:", err));
  }, []);

  const ptalStyle = (feature) => ({
    fillColor: getPTALColor(
      feature.properties.ptal_band ||
        feature.properties.ptal ||
        feature.properties.band
    ),
    color: "#555",
    weight: 0.4,
    opacity: 0.4,
    fillOpacity: 0.45,
  });

  const routeStyle = () => ({
    color: "#2563eb",
    weight: 3,
    opacity: 0.8,
  });

  const stopPointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 6,
      color: "#ffffff",
      weight: 1.5,
      fillColor: "#dc2626",
      fillOpacity: 1,
      opacity: 1,
    });
  };

  const selectFeature = (type, feature, layer) => {
    setSelectedType(type);
    setSelectedFeature(feature);

    if (layer && layer.bringToFront) {
      layer.bringToFront();
    }
  };

  const onEachPTALFeature = (feature, layer) => {
    layer.on({
      click: () => selectFeature("ptal", feature, layer),
      mouseover: () => {
        layer.setStyle({
          weight: 1.2,
          opacity: 0.8,
        });
      },
      mouseout: () => {
        layer.setStyle(ptalStyle(feature));
      },
    });
  };

  const onEachRouteFeature = (feature, layer) => {
    layer.on({
      click: () => selectFeature("route", feature, layer),
      mouseover: () => {
        layer.setStyle({
          weight: 5,
          opacity: 1,
        });
      },
      mouseout: () => {
        layer.setStyle(routeStyle(feature));
      },
    });
  };

  const onEachStopFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        selectFeature("stop", feature, layer);
      },
    });
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search stop, route, or area"
            disabled
          />
        </div>

        <div className="panel-section">
          <h3>Selected Result</h3>

          {!selectedFeature && (
            <div className="empty-card">
              Click a PTAL grid, bus stop, or route on the map.
            </div>
          )}

          {selectedType === "ptal" && (
            <PTALCard feature={selectedFeature} />
          )}

          {selectedType === "stop" && (
            <StopCard feature={selectedFeature} />
          )}

          {selectedType === "route" && (
            <RouteCard feature={selectedFeature} />
          )}
        </div>

        <div className="panel-section">
          <h3>Transport Services For This Area</h3>
          <div className="info-card">
            Click a PTAL grid to inspect accessibility, or click a stop to view
            stop information.
          </div>
        </div>
      </aside>

      <main className="map-area">
        <MapContainer
           center={[34.9756, 138.3828]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            >
            <PTALLegend />

            <Pane name="ptalPane" style={{ zIndex: 300 }} />
            <Pane name="routePane" style={{ zIndex: 400 }} />
            <Pane name="stopPane" style={{ zIndex: 500 }} />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {ptalData && (
            <GeoJSON
              key="ptal-layer"
              data={ptalData}
              pane="ptalPane"
              style={ptalStyle}
              onEachFeature={onEachPTALFeature}
            />
          )}

          {routesData && (
            <GeoJSON
              key="routes-layer"
              data={routesData}
              pane="routePane"
              style={routeStyle}
              onEachFeature={onEachRouteFeature}
            />
          )}

          {stopsData && (
            <GeoJSON
              key="stops-layer"
              data={stopsData}
              pane="stopPane"
              pointToLayer={stopPointToLayer}
              onEachFeature={onEachStopFeature}
            />
          )}
        </MapContainer>
      </main>
    </div>
  );
}

function PTALCard({ feature }) {
  const p = feature.properties || {};

  return (
    <div className="result-card">
      <h2>PTAL Score</h2>

      <div className="score-circle">
        {p.ptal_band || p.ptal || p.band || "N/A"}
      </div>

      <div className="card-details">
        <p>
          <strong>Grid ID:</strong> {p.grid_id || p.id || "N/A"}
        </p>
        <p>
          <strong>Accessibility Index:</strong>{" "}
          {p.accessibility_index || p.ai || p.ptal_score || "N/A"}
        </p>
        <p>
          <strong>PTAL Band:</strong>{" "}
          {p.ptal_band || p.ptal || p.band || "N/A"}
        </p>
      </div>

      <div className="card-details">
        <h4>Calculation Parameters</h4>
        <p>
          <strong>Analysis Window:</strong>{" "}
          {p.analysis_window || "Configurable"}
        </p>
        <p>
          <strong>Walk Speed:</strong> {p.walk_speed || "Default"}
        </p>
      </div>
    </div>
  );
}

function StopCard({ feature }) {
  const p = feature.properties || {};
  const coords = feature.geometry?.coordinates || [];

  const lon = p.stop_lon || p.lon || coords[0];
  const lat = p.stop_lat || p.lat || coords[1];

  const cleanStopId = p.stop_id
    ? String(p.stop_id).split("_").slice(-1)[0]
    : p.id || "N/A";

  return (
    <div className="result-card">
      <h2>Bus Stop</h2>

      <div className="card-details">
        <p><strong>Stop Name:</strong> {p.stop_name || p.name || "N/A"}</p>
        <p><strong>Stop ID:</strong> {cleanStopId}</p>
        <p><strong>Full Stop ID:</strong> {p.stop_id || p.id || "N/A"}</p>
        <p><strong>Latitude:</strong> {lat ? Number(lat).toFixed(6) : "N/A"}</p>
        <p><strong>Longitude:</strong> {lon ? Number(lon).toFixed(6) : "N/A"}</p>
        <p><strong>Agency:</strong> {p.agency_name || p.agency || "N/A"}</p>
      </div>
    </div>
  );
}

function PTALLegend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");

      const grades = [
        ["0", "#f5f5f5"],
        ["1a", "#d9f0a3"],
        ["1b", "#addd8e"],
        ["2", "#78c679"],
        ["3", "#41ab5d"],
        ["4", "#238443"],
        ["5", "#006837"],
        ["6a", "#fdae61"],
        ["6b", "#d7191c"],
      ];

      div.innerHTML = `
        <div class="legend-title">Legend</div>

        <div class="legend-subtitle">PTAL Band</div>
        ${grades
          .map(
            ([label, color]) => `
              <div class="legend-item">
                <span class="legend-color" style="background:${color}"></span>
                <span>${label}</span>
              </div>
            `
          )
          .join("")}

        <hr />

        <div class="legend-subtitle">Map Layers</div>

        <div class="legend-item">
          <span class="legend-stop"></span>
          <span>Bus Stops</span>
        </div>

        <div class="legend-item">
          <span class="legend-route"></span>
          <span>Bus Routes</span>
        </div>

        <div class="legend-item">
          <span class="legend-grid"></span>
          <span>PTAL Grid</span>
        </div>

        <hr />

        <div class="legend-subtitle">Base Map</div>
        <div class="legend-text">OpenStreetMap</div>
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

function RouteCard({ feature }) {
  const p = feature.properties || {};

  return (
    <div className="result-card">
      <h2>Route</h2>

      <div className="card-details">
        <p>
          <strong>Route Name:</strong>{" "}
          {p.route_long_name || p.route_short_name || p.name || "N/A"}
        </p>
        <p>
          <strong>Route ID:</strong> {p.route_id || p.id || "N/A"}
        </p>
        <p>
          <strong>Agency:</strong> {p.agency_name || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default App;