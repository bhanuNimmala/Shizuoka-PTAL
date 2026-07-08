function AboutModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="info-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>About This Dashboard</h2>

        <section className="modal-section">
          <h3>Project Goal</h3>
          <p>
            This dashboard is an interactive prototype for visualizing public
            transport accessibility across Shizuoka City. It helps explore where
            public transport access is stronger or weaker across the study area.
          </p>
        </section>

        <section className="modal-section">
          <h3>Main Features</h3>
          <ul>
            <li>Interactive PTAL accessibility map</li>
            <li>Day-wise accessibility analysis</li>
            <li>Bus stops and bus route visualization</li>
            <li>Population overlay using 500 m census mesh data</li>
            <li>Feature inspection panel for selected map elements</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Data Used</h3>
          <ul>
            <li>Shizuoka City Community Bus GTFS</li>
            <li>OpenStreetMap Walking Network (OSMnx)</li>
            <li>Shizuoka City  Administrative Boundary data</li>
            <li>e-Stat 2020 Census 500 m Population Mesh</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Technology Stack</h3>
            <ul>
              <li>Backend: Django</li>
              <li>Frontend: React</li>
              <li>Mapping: Leaflet</li>
              <li>Data Processing: Pandas, GeoPandas, Shapely, OSMnx</li>
              <li>Data Exchange: GeoJSON</li>
            </ul>
        </section>

        <section className="modal-section">
          <h3>Current Scope</h3>
          <p>
            The current version focuses on full-day PTAL results by day of week.
            Time-window analysis and multi-modal public transport integration can
            be added in future development.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutModal;