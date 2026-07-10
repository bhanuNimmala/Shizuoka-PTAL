import { MapContainer, TileLayer, GeoJSON, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

import { useState } from "react";
import useDashboardData from "./hooks/useDashboardData";
import Sidebar from "./Sidebar";
import MapLegend from "./MapLegend";
import useMapLayers from "./hooks/useMapLayers";
import AppHeader from "./AppHeader";
import DashboardToolbar from "./DashboardToolbar";
import PTALInfoModal from "./PTALInfoModal";
import AboutModal from "./AboutModal";

function PTALMap() {
  const [selectedPeriod, setSelectedPeriod] = useState("monday_full_day");
  const { ptalData, routesData, stopsData, population } =
    useDashboardData(selectedPeriod);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [showPTAL, setShowPTAL] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showStops, setShowStops] = useState(false);
  const [showPopulation, setShowPopulation] = useState(false);

  const [showPTALModal, setShowPTALModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const selectFeature = (type, feature, layer) => {
    setSelectedType(type);
    setSelectedFeature(feature);

    if (layer && layer.bringToFront) {
      layer.bringToFront();
    }
  };


  const handlePeriodChange = (period) => {
  // Only clear PTAL selection because PTAL changes with the day
    if (selectedType === "ptal") {
      setSelectedType(null);
      setSelectedFeature(null);
    }

    setSelectedPeriod(period);
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
    selectedType,
    selectedFeature,
  });

  return (
    <div className="dashboard-page">
      <AppHeader
        onOpenPTAL={() => setShowPTALModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      <DashboardToolbar
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={handlePeriodChange}
        showPTAL={showPTAL}
        setShowPTAL={setShowPTAL}
        showPopulation={showPopulation}
        setShowPopulation={setShowPopulation}
        showStops={showStops}
        setShowStops={setShowStops}
        showRoutes={showRoutes}
        setShowRoutes={setShowRoutes}
      />

      <div className="dashboard">
        <Sidebar
          selectedType={selectedType}
          selectedFeature={selectedFeature}
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

            <MapLegend
              showPTAL={showPTAL}
              showPopulation={showPopulation}
            />

            {showPopulation && population && (
              <GeoJSON
                key={`population-layer-${selectedType}-${selectedFeature?.properties?.KEY_CODE || ""}`}
                data={population}
                pane="populationPane"
                style={populationStyle}
                onEachFeature={onEachPopulation}
              />
            )}

            {showPTAL && ptalData && (
              <GeoJSON
                key={`ptal-layer-${selectedType}-${selectedPeriod}-${showPopulation}-${selectedFeature?.properties?.grid_id || ""}`}
                data={ptalData}
                pane="ptalPane"
                style={ptalStyle}
                onEachFeature={onEachPTALFeature}
              />
            )}

            {showRoutes && routesData && (
              <GeoJSON
                key={`routes-layer-${selectedType}-${selectedFeature?.properties?.route_id || ""}`}
                data={routesData}
                pane="routePane"
                style={routeStyle}
                onEachFeature={onEachRouteFeature}
              />
            )}

            {showStops && stopsData && (
              <GeoJSON
                key={`stops-layer-${selectedType}-${selectedFeature?.properties?.stop_id || ""}`}
                data={stopsData}
                pane="stopPane"
                pointToLayer={stopPointToLayer}
                onEachFeature={onEachStopFeature}
              />
            )}
          </MapContainer>
        </main>
      </div>

      {showPTALModal && (
        <PTALInfoModal onClose={() => setShowPTALModal(false)} />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
    </div>
  );
}

export default PTALMap;