import { MapContainer, TileLayer, GeoJSON, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

import { useState } from "react";
import useDashboardData from "./hooks/useDashboardData";
import Sidebar from "./Sidebar";
import MapLegend from "./MapLegend";
import useMapLayers from "./hooks/useMapLayers";

function PTALMap() {

  const [selectedPeriod, setSelectedPeriod] = useState("monday_full_day");
  const { ptalData, routesData, stopsData, population } = useDashboardData(selectedPeriod);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [showPTAL, setShowPTAL] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showPopulation, setShowPopulation] = useState(false);

  const selectFeature = (type, feature, layer) => {
    setSelectedType(type);
    setSelectedFeature(feature);

    if (layer && layer.bringToFront) {
      layer.bringToFront();
    }
  };

  const {
    ptalStyle,
    populationStyle,
    routeStyle,
    stopPointToLayer,
    onEachPTALFeature,
    onEachPopulation,
    onEachRouteFeature,
    onEachStopFeature,
  } = useMapLayers({
    showPopulation,
    selectFeature,
  });

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