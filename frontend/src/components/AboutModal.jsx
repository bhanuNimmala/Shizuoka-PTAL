function AboutModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>About This Dashboard</h2>

        <section className="modal-section">
          <h3>Project Goal</h3>
          <p>
            This dashboard is an interactive prototype for visualizing public
            transport accessibility across Shizuoka City. It helps identify
            areas with stronger or weaker access to public transport.
          </p>
        </section>

        <section className="modal-section">
          <h3>Main Features</h3>
          <ul>
            <li>Interactive PTAL accessibility map</li>
            <li>Day-of-week accessibility analysis</li>
            <li>Bus stops and bus route visualization</li>
            <li>Population overlay using 500 m census mesh data</li>
            <li>Feature inspection panel for selected map elements</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Data Used</h3>
          <ul>
            <li>Shizuoka City community bus GTFS data</li>
            <li>OpenStreetMap walking network using OSMnx</li>
            <li>Shizuoka City administrative boundary data</li>
            <li>e-Stat 2020 Census 500 m population mesh data</li>
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
          <h3>Classification Method</h3>
          <p>
            The Accessibility Index (AI) is calculated using the PTAL
            methodology. However, this prototype classifies AI values using
            Jenks Natural Breaks instead of Transport for London's fixed PTAL
            thresholds.
          </p>
          <p>
            This approach was used because Shizuoka City's available community
            bus network is much less dense than London's public transport
            network. Using the original fixed thresholds would classify most
            accessible areas into the lowest PTAL band, making the map less
            informative.
          </p>
        </section>

        <section className="modal-section">
          <h3>Current Scope</h3>
          <p>
            The current version focuses on full-day PTAL results by day of week
            using available community bus data. Railway and Shinkansen services
            are not included in the current PTAL calculation.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutModal;