export const API_BASE = "http://localhost:8000/api";

export const ANALYSIS_PERIODS = {
  monday_full_day: "Monday Full Day",
  tuesday_full_day: "Tuesday Full Day",
  wednesday_full_day: "Wednesday Full Day",
  thursday_full_day: "Thursday Full Day",
  friday_full_day: "Friday Full Day",
  saturday_full_day: "Saturday Full Day",
  sunday_full_day: "Sunday Full Day",
};

export function getProp(properties, keys, fallback = "N/A") {
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

export function getPopulationColor(population) {
  if (population > 1000) return "#800026";
  if (population > 500) return "#BD0026";
  if (population > 250) return "#E31A1C";
  if (population > 100) return "#FC4E2A";
  if (population > 50) return "#FD8D3C";
  if (population > 10) return "#FEB24C";
  return "#FFEDA0";
}

export function cleanRouteName(p) {
  return (
    p.route_long_name ||
    p.route_short_name ||
    p.route_name ||
    p.name ||
    p.route_id ||
    "Bus Route"
  );
}

export function cleanStopName(p) {
  return p.stop_name || p.name || "Bus Stop";
}

export function formatNumber(value) {
  if (value === undefined || value === null || value === "" || value === "N/A") {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num.toFixed(6);
}

export const PTAL_STYLES = {
  "0":  { bg: "#e2e0e0", text: "#1F2937" },
  "1a": { bg: "#31367F", text: "#FFFFFF" },
  "1b": { bg: "#7678BE", text: "#FFFFFF" },
  "2":  { bg: "#B8DCEB", text: "#1F2937" },
  "3":  { bg: "#7CC35B", text: "#1F2937" },
  "4":  { bg: "#F5F3B2", text: "#1F2937" },
  "5":  { bg: "#EEA84D", text: "#FFFFFF" },
  "6a": { bg: "#E24A44", text: "#FFFFFF" },
  "6b": { bg: "#B5302C", text: "#FFFFFF" },
};

export function getPTALColor(band) {
  return PTAL_STYLES[band]?.bg || "#9ca3af";
}

export function getPTALTextColor(band) {
  return PTAL_STYLES[band]?.text || "#1F2937";
}