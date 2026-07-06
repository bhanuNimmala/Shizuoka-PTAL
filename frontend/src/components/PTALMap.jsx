import { MapContainer, TileLayer, GeoJSON, Pane, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

const API_BASE = "http://localhost:8000/api";

const ANALYSIS_PERIODS = {
  monday_full_day: "Monday Full Day",
  tuesday_full_day: "Tuesday Full Day",
  wednesday_full_day: "Wednesday Full Day",
  thursday_full_day: "Thursday Full Day",
  friday_full_day: "Friday Full Day",
  saturday_full_day: "Saturday Full Day",
  sunday_full_day: "Sunday Full Day",
};

function getProp(properties, keys, fallback = "N/A") {
  for (const key of keys) {
    if (
      properties &&
      properties[key] !== undefined &&
      properties[key] !== null &&
      properties[key] !== ""
    ) {
      return properties[key];
    }
  }
  return fallback;
}

function getPTALColor(band) {
  switch (String(band).toLowerCase()) {
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
      `;

      return div;
    };

    legend.addTo(map);

    return () => legend.remove();
  }, [map]);

  return null;
}

function PTALMap() {
  const [ptalData, setPtalData] = useState(null);
  const [routesData, setRoutesData] = useState(null);
  const [stopsData, setStopsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monday_full_day");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/ptal/?period=${selectedPeriod}`)
      .then((res) => res.json())
      .then(setPtalData)
      .catch((err) => console.error("PTAL API error:", err));
  }, [selectedPeriod]);

  useEffect(() => {
    fetch(`${API_BASE}/routes/`)
      .then((res) => res.json())
      .then(setRoutesData)
      .catch((err) => console.error("Routes API error:", err));

    fetch(`${API_BASE}/stops/`)
      .then((res) => res.json())
      .then(setStopsData)
      .catch((err) => console.error("Stops API error:", err));
  }, []);

  const ptalStyle = (feature) => {
    const p = feature.properties || {};
    const band = getProp(p, ["ptal_band", "ptal", "band"], "0");

    return {
      fillColor: getPTALColor(band),
      color: "#555",
      weight: 0.25,
      opacity: 0.45,
      fillOpacity: 0.42,
    };
  };

  const routeStyle = () => ({
    color: "#2563eb",
    weight: 3,
    opacity: 0.9,
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
      mouseover: () => layer.setStyle({ weight: 1.1, opacity: 0.8 }),
      mouseout: () => layer.setStyle(ptalStyle(feature)),
    });
  };

  const onEachRouteFeature = (feature, layer) => {
    layer.on({
      click: () => selectFeature("route", feature, layer),
      mouseover: () => layer.setStyle({ weight: 5, opacity: 1 }),
      mouseout: () => layer.setStyle(routeStyle(feature)),
    });
  };

  const onEachStopFeature = (feature, layer) => {
    const p = feature.properties || {};
    const stopName = getProp(p, ["stop_name", "name"], "Bus Stop");

    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        selectFeature("stop", feature, layer);
      },
    });

    layer.bindTooltip(stopName, {
      direction: "top",
      offset: [0, -8],
    });
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h1 className="dashboard-title">Shizuoka PTAL Dashboard</h1>

        <div className="period-selector">
          <label>Analysis Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setSelectedType(null);
              setSelectedFeature(null);
            }}
          >
            {Object.entries(ANALYSIS_PERIODS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <section className="panel-section">
          <h3>Selected Feature</h3>

          {!selectedFeature && (
            <div className="empty-card">
              Click a PTAL grid, bus stop, or bus route on the map.
            </div>
          )}

          {selectedType === "ptal" && <PTALCard feature={selectedFeature} />}
          {selectedType === "stop" && <StopCard feature={selectedFeature} />}
          {selectedType === "route" && <RouteCard feature={selectedFeature} />}
        </section>

        <section className="panel-section">
          <h3>Calculation Parameters</h3>
          <div className="info-card left-text">
            <p>
              <strong>Analysis Period:</strong>{" "}
              {ANALYSIS_PERIODS[selectedPeriod]}
            </p>
            <p>
              <strong>Analysis Time:</strong> 00:00–24:00
            </p>
            <p>
              <strong>Walk Speed:</strong> 5.0 km/h
            </p>
            <p>
              <strong>Bus Walk Access Threshold:</strong> 960 m
            </p>
            <p>
              <strong>Rail Access:</strong> Not included in prototype
            </p>
            <p>
              <strong>GTFS Scope:</strong> Shizuoka City community bus only
            </p>
          </div>
        </section>

        <section className="panel-section">
          <h3>Transport Information</h3>
          <div className="info-card left-text">
            <p>
              This dashboard displays full-day PTAL accessibility by day of
              week.
            </p>
            <p>
              Select a day above to view the pre-calculated PTAL result for
              that day.
            </p>
          </div>
        </section>
      </aside>

      <main className="map-area">
        <MapContainer
          center={[34.9756, 138.3828]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <Pane name="ptalPane" style={{ zIndex: 300 }} />
          <Pane name="routePane" style={{ zIndex: 400 }} />
          <Pane name="stopPane" style={{ zIndex: 500 }} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <PTALLegend />

          {ptalData && (
            <GeoJSON
              key={`ptal-layer-${selectedPeriod}`}
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
        {gridId && (
          <p>
            <strong>Grid ID:</strong> {gridId}
          </p>
        )}

        {ai && (
          <p>
            <strong>Accessibility Index:</strong> {ai}
          </p>
        )}

        {band && (
          <p>
            <strong>PTAL Band:</strong> {band}
          </p>
        )}

        {stopCount !== null && (
          <p>
            <strong>Reachable Stops:</strong> {stopCount}
          </p>
        )}

        {maxTrips !== null && (
          <p>
            <strong>Max Trips/Hour:</strong> {maxTrips}
          </p>
        )}
      </div>
    </div>
  );
}

function cleanRouteName(p) {
  return (
    p.route_long_name ||
    p.route_short_name ||
    p.route_name ||
    p.name ||
    p.route_id ||
    "Bus Route"
  );
}

function cleanStopName(p) {
  return p.stop_name || p.name || "Bus Stop";
}

function formatNumber(value) {
  if (value === undefined || value === null || value === "" || value === "N/A") {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num.toFixed(6);
}

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
        <p>
          <strong>Stop Name:</strong> {cleanStopName(p)}
        </p>

        {formattedLat && (
          <p>
            <strong>Latitude:</strong> {formattedLat}
          </p>
        )}

        {formattedLon && (
          <p>
            <strong>Longitude:</strong> {formattedLon}
          </p>
        )}
      </div>
    </div>
  );
}

function RouteCard({ feature }) {
  const p = feature.properties || {};

  return (
    <div className="result-card">
      <h2>Bus Route</h2>

      <div className="card-details">
        <p>
          <strong>Route:</strong> {cleanRouteName(p)}
        </p>

        {p.agency_name && (
          <p>
            <strong>Agency:</strong> {p.agency_name}
          </p>
        )}
      </div>
    </div>
  );
}

export default PTALMap;