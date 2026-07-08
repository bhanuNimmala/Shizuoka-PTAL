function PTALInfoModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
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
          <h3>Accessibility Index (AI)</h3>
          <p>
            The Accessibility Index is the calculated accessibility value for
            each analysis grid cell. A higher AI value indicates better public
            transport accessibility.
          </p>
        </section>

        <section className="modal-section">
          <h3>Total Access Time (TAT)</h3>
          <p>
            Total Access Time combines the walking time to a reachable stop and
            the average waiting time for the service. Shorter walking time and
            shorter waiting time produce a lower TAT.
          </p>
        </section>

        <section className="modal-section">
          <h3>Equivalent Doorstep Frequency (EDF)</h3>
          <p>
            EDF converts Total Access Time into an accessibility contribution.
            Lower TAT produces a higher EDF, meaning that nearby and frequent
            services contribute more strongly to accessibility.
          </p>
        </section>

        <section className="modal-section">
          <h3>Relation between EDF and AI</h3>
          <p>
            For each grid cell, EDF values from all reachable stops are summed
            to produce the Accessibility Index. Therefore, places with more
            reachable stops, shorter walking times, and more frequent services
            receive higher AI values.
          </p>
        </section>

        <section className="modal-section">
          <h3>PTAL Bands</h3>
          <p>
            PTAL bands range from 0 to 6b. Band 0 indicates no reachable public
            transport access in the analysis, while 6b represents the strongest
            accessibility level.
          </p>

          <div className="ptal-band-list">
            <span>0 — No Access / Worst</span>
            <span>1a / 1b — Lower Accessibility</span>
            <span>2 / 3 — Moderate Accessibility</span>
            <span>4 / 5 — Higher Accessibility</span>
            <span>6a / 6b — Highest Accessibility / Best</span>
          </div>
        </section>

        <section className="modal-section">
          <h3>How PTAL is used here</h3>
          <p>
            This dashboard applies PTAL-style accessibility analysis to Shizuoka
            City using GTFS schedule data, OpenStreetMap walking access, and a
            500 m grid-based spatial analysis. Results are shown by day of week.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PTALInfoModal;