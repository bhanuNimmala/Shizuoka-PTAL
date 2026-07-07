import { ANALYSIS_PERIODS } from "../utils/mapUtils";

function AnalysisSelector({ selectedPeriod, setSelectedPeriod, clearSelection }) {
  return (
    <div className="period-selector">
      <label>Analysis Period</label>

      <select
        value={selectedPeriod}
        onChange={(e) => {
          setSelectedPeriod(e.target.value);
          clearSelection();
        }}
      >
        {Object.entries(ANALYSIS_PERIODS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AnalysisSelector;