import { useEffect, useState } from "react";
import { API_BASE } from "../utils/mapUtils";

function useDashboardData(selectedPeriod) {
  const [ptalData, setPtalData] = useState(null);
  const [ptalDataPeriod, setPtalDataPeriod] = useState(null);

  const [routesData, setRoutesData] = useState(null);
  const [stopsData, setStopsData] = useState(null);
  const [population, setPopulation] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/ptal/?period=${selectedPeriod}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`PTAL request failed: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setPtalData(data);
        setPtalDataPeriod(selectedPeriod);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("PTAL API error:", err);
        }
      });

    return () => {
      controller.abort();
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
    ptalDataPeriod,
    routesData,
    stopsData,
    population,
  };
}

export default useDashboardData;