import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { PTAL_STYLES } from "./utils/mapUtils";

function MapLegend({ showPTAL, showPopulation }) {
  const map = useMap();

  useEffect(() => {
    if (!showPTAL && !showPopulation) {
      return;
    }

    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");

      const ptalOrder = ["0", "1a", "1b", "2", "3", "4", "5", "6a", "6b"];
      const ptalGrades = ptalOrder.map((band) => [
        band,
        PTAL_STYLES[band].bg,
      ]);

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

        ${
          showPTAL
            ? `
              <div class="legend-subtitle">PTAL</div>
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
            `
            : ""
        }

        ${
          showPopulation
            ? `
              ${showPTAL ? "<hr />" : ""}
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
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, showPTAL, showPopulation]);

  return null;
}

export default MapLegend;