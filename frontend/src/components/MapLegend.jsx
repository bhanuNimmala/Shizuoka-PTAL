import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

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

export default MapLegend;