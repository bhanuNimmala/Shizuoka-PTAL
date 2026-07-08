import L from "leaflet";
import { getProp, getPTALColor, getPopulationColor } from "../utils/mapUtils";

function useMapLayers({
  showPopulation,
  selectFeature,
  selectedType,
  selectedFeature,
}) {
  const isSelectedFeature = (type, feature) => {
    if (!selectedFeature || selectedType !== type) return false;

    const currentProps = feature.properties || {};
    const selectedProps = selectedFeature.properties || {};

    if (type === "ptal") {
      return String(currentProps.grid_id) === String(selectedProps.grid_id);
    }

    if (type === "population") {
      return String(currentProps.KEY_CODE) === String(selectedProps.KEY_CODE);
    }

    if (type === "route") {
      return String(currentProps.route_id) === String(selectedProps.route_id);
    }

    if (type === "stop") {
      return String(currentProps.stop_id) === String(selectedProps.stop_id);
    }

    return false;
  };

  const ptalStyle = (feature) => {
    const p = feature.properties || {};
    const band = getProp(p, ["ptal_band", "ptal", "band"], "0");
    const selected = isSelectedFeature("ptal", feature);

    if (String(band).toLowerCase() === "0") {
      return {
        fillColor: getPTALColor(band),
        color: selected ? "#111827" : "#b8b8b8",
        weight: selected ? 2.5 : 0.2,
        opacity: selected ? 1 : 0.5,
        fillOpacity: selected ? 0.7 : showPopulation ? 0.15 : 0.3,
      };
    }

    return {
      fillColor: getPTALColor(band),
      color: selected ? "#111827" : "#666666",
      weight: selected ? 2.5 : 0.2,
      opacity: selected ? 1 : 0.6,
      fillOpacity: selected ? 0.75 : showPopulation ? 0.28 : 0.42,
    };
  };

  const populationStyle = (feature) => {
    const pop = Number(feature.properties.population || 0);
    const selected = isSelectedFeature("population", feature);

    return {
      fillColor: getPopulationColor(pop),
      fillOpacity: selected ? 0.65 : 0.38,

      stroke: selected,
      color: selected ? "#111827" : "transparent",
      weight: selected ? 2.5 : 0,
      opacity: selected ? 1 : 0,
    };
  };

  const routeStyle = (feature) => {
    const selected = isSelectedFeature("route", feature);

    return {
      color: selected ? "#111827" : "#2F6B4F",
      weight: selected ? 5 : 3,
      opacity: selected ? 1 : 0.85,
    };
  };

  const stopPointToLayer = (feature, latlng) => {
    const selected = isSelectedFeature("stop", feature);

    return L.circleMarker(latlng, {
      radius: selected ? 8 : 5,
      color: selected ? "#111827" : "#ffffff",
      weight: selected ? 2.5 : 1.5,
      fillColor: "#00bea5",
      fillOpacity: selected ? 1 : 0.9,
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