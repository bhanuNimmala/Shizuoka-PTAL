import { useEffect, useState } from "react";
import { API_BASE } from "../utils/mapUtils";

function useDashboardData(selectedPeriod) {
  const [ptalData, setPtalData] = useState(null);
  const [routesData, setRoutesData] = useState(null);
  const [stopsData, setStopsData] = useState(null);
  const [population, setPopulation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/ptal/?period=${selectedPeriod}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPtalData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("PTAL API error:", err);
        }
      });

    return () => {
      cancelled = true;
    };
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

  return {
    ptalData,
    routesData,
    stopsData,
    population,
  };
}

export default useDashboardData;