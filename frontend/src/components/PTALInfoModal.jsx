function PTALInfoModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="info-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Public Transport Accessibility Level (PTAL)</h2>

        <section className="modal-section">
          <h3>What is PTAL?</h3>
          <p>
            PTAL measures how easily public transport can be accessed from a
            location. It considers both walking access to nearby stops and the
            frequency of available services.
          </p>
        </section>

        <section className="modal-section">
          <h3>Accessibility Index</h3>
          <p>
            The Accessibility Index is the calculated value used to classify
            each location into a PTAL band. A higher value generally means
            better access to public transport.
          </p>
        </section>

        <section className="modal-section">
          <h3>PTAL Bands</h3>
          <p>
            PTAL bands range from 0 to 6b. Lower values indicate limited access,
            while higher values indicate stronger public transport accessibility.
          </p>

          <div className="ptal-band-list">
            <span>0 — No Access</span>
            <span>1a / 1b — Very Poor</span>
            <span>2 — Poor</span>
            <span>3 — Moderate</span>
            <span>4 — Good</span>
            <span>5 — Very Good</span>
            <span>6a / 6b — Excellent</span>
          </div>
        </section>

        <section className="modal-section">
          <h3>How PTAL is used here</h3>
          <p>
            This dashboard applies PTAL analysis to Shizuoka City using GTFS
            schedule data, OpenStreetMap walking access, and a grid-based spatial
            analysis. Results are shown by day of week.
          </p>
        </section>

        <section className="modal-section">
          <h3>Prototype Scope</h3>
          <p>
            This prototype uses available community bus GTFS data. Railway and
            Shinkansen services are not included in the current PTAL calculation.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PTALInfoModal;