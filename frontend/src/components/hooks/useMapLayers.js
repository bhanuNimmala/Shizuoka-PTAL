import L from "leaflet";
import { getProp, getPTALColor, getPopulationColor } from "../utils/mapUtils";

function useMapLayers({ showPopulation, selectFeature }) {
  const ptalStyle = (feature) => {
    const p = feature.properties || {};
    const band = getProp(p, ["ptal_band", "ptal", "band"], "0");

    if (String(band).toLowerCase() === "0") {
      return {
        fillColor: "#d3cdcd",
        color: "#b8b8b8",
        weight: 0.2,
        opacity: 0.5,
        fillOpacity: showPopulation ? 0.15 : 0.3,
      };
    }

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
    color: "#2F6B4F",
    weight: 3,
    opacity: 0.85,
  });

  const stopPointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 5,
      color: "#000000",
      weight: 1.5,
      fillColor: "#e9ec0d",
      fillOpacity: 0.9,
      opacity: 1,
    });
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

  return {
    ptalStyle,
    populationStyle,
    routeStyle,
    stopPointToLayer,
    onEachPTALFeature,
    onEachPopulation,
    onEachRouteFeature,
    onEachStopFeature,
  };
}

export default useMapLayers;