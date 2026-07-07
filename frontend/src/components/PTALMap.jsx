import { MapContainer, TileLayer, GeoJSON, Pane, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

import {
  API_BASE,
  getProp,
  getPTALColor,
  getPopulationColor,
} from "./utils/mapUtils";

import Sidebar from "./Sidebar";


function MapLegend({ showPopulation }) {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");

      const ptalGrades = [
        ["0", "#d3cdcd"],
        ["1a", "#d9f0a3"],
        ["1b", "#addd8e"],
        ["2", "#78c679"],
        ["3", "#41ab5d"],
        ["4", "#238443"],
        ["5", "#006837"],
        ["6a", "#fdae61"],
        ["6b", "#d7191c"],
      ];

      const populationGrades = [
        ["0–10", "#FFEDA0"],
        ["11–50", "#FEB24C"],
        ["51–100", "#FD8D3C"],
        ["101–250", "#FC4E2A"],
        ["251–500", "#E31A1C"],
        ["501–1000", "#BD0026"],
        [">1000", "#800026"],
      ];

      div.innerHTML = `
        <div class="legend-title">Legend</div>

        <div class="legend-subtitle">PTAL Band</div>
        ${ptalGrades
          .map(
            ([label, color]) => `
              <div class="legend-item">
                <span class="legend-color" style="background:${color}"></span>
                <span>${label}</span>
              </div>
            `
          )
          .join("")}

        ${
          showPopulation
            ? `
              <hr />
              <div class="legend-subtitle">Population</div>
              ${populationGrades
                .map(
                  ([label, color]) => `
                    <div class="legend-item">
                      <span class="legend-color" style="background:${color}"></span>
                      <span>${label}</span>
                    </div>
                  `
                )
                .join("")}
            `
            : ""
        }

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
  }, [map, showPopulation]);

  return null;
}

function PTALMap() {
  const [ptalData, setPtalData] = useState(null);
  const [routesData, setRoutesData] = useState(null);
  const [stopsData, setStopsData] = useState(null);
  const [population, setPopulation] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState("monday_full_day");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [showPTAL, setShowPTAL] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showPopulation, setShowPopulation] = useState(false);

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

    fetch(`${API_BASE}/population/`)
      .then((res) => res.json())
      .then(setPopulation)
      .catch((err) => console.error("Population API error:", err));
  }, []);

  const ptalStyle = (feature) => {
  const p = feature.properties || {};
  const band = getProp(p, ["ptal_band", "ptal", "band"], "0");

  // Special styling for PTAL Band 0
  if (String(band).toLowerCase() === "0") {
    return {
      fillColor: "#d3cdcd",      // Your chosen grey
      color: "#b8b8b8",          // Slightly lighter border
      weight: 0.2,
      opacity: 0.5,
      fillOpacity: showPopulation ? 0.15 : 0.30,
    };
  }

  // All other PTAL bands
  return {
    fillColor: getPTALColor(band),
    color: "#666666",
    weight: 0.2,
    opacity: 0.6,
    fillOpacity: showPopulation ? 0.28 : 0.42,
  };
};

  const populationStyle = (feature) => {
    const pop = Number(feature.properties.population || 0);

    return {
      fillColor: getPopulationColor(pop),
      color: "#777",
      weight: 0.25,
      opacity: 0.35,
      fillOpacity: 0.38,
    };
  };

  const routeStyle = () => ({
    color: "#2563eb",
    weight: 3,
    opacity: 0.95,
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

  const onEachPopulation = (feature, layer) => {
    layer.on({
      click: () => selectFeature("population", feature, layer),
      mouseover: () => layer.setStyle({ weight: 1.1, opacity: 0.8 }),
      mouseout: () => layer.setStyle(populationStyle(feature)),
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
      <Sidebar
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}

          selectedType={selectedType}
          selectedFeature={selectedFeature}

          showPTAL={showPTAL}
          setShowPTAL={setShowPTAL}

          showPopulation={showPopulation}
          setShowPopulation={setShowPopulation}

          showRoutes={showRoutes}
          setShowRoutes={setShowRoutes}

          showStops={showStops}
          setShowStops={setShowStops}

          clearSelection={() => {
              setSelectedType(null);
              setSelectedFeature(null);
          }}
      />

      <main className="map-area">
        <MapContainer
          center={[34.9756, 138.3828]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <Pane name="populationPane" style={{ zIndex: 250 }} />
          <Pane name="ptalPane" style={{ zIndex: 300 }} />
          <Pane name="routePane" style={{ zIndex: 400 }} />
          <Pane name="stopPane" style={{ zIndex: 500 }} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <MapLegend showPopulation={showPopulation} />

          {showPopulation && population && (
            <GeoJSON
              key="population-layer"
              data={population}
              pane="populationPane"
              style={populationStyle}
              onEachFeature={onEachPopulation}
            />
          )}

          {showPTAL && ptalData && (
            <GeoJSON
              key={`ptal-layer-${selectedPeriod}-${showPopulation}`}
              data={ptalData}
              pane="ptalPane"
              style={ptalStyle}
              onEachFeature={onEachPTALFeature}
            />
          )}

          {showRoutes && routesData && (
            <GeoJSON
              key="routes-layer"
              data={routesData}
              pane="routePane"
              style={routeStyle}
              onEachFeature={onEachRouteFeature}
            />
          )}

          {showStops && stopsData && (
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

export default PTALMap;