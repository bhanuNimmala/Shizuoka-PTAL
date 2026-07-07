function AboutPTALModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>About PTAL</h2>

        <p>
          PTAL stands for <strong>Public Transport Accessibility Level</strong>.
          It estimates how accessible an area is by public transport.
        </p>

        <h3>How this prototype calculates PTAL</h3>

        <ol>
          <li>Generate a 500 m analysis grid for Shizuoka City.</li>
          <li>Calculate which bus stops are reachable by walking.</li>
          <li>Calculate service frequency from GTFS timetable data.</li>
          <li>Estimate average waiting time from service frequency.</li>
          <li>
            Calculate Total Access Time:
            <br />
            <strong>Walking Time + Average Waiting Time</strong>
          </li>
          <li>
            Convert access time into Equivalent Doorstep Frequency:
            <br />
            <strong>EDF = 30 / Total Access Time</strong>
          </li>
          <li>Sum EDF values to calculate the Accessibility Index.</li>
          <li>Classify the Accessibility Index into PTAL bands.</li>
        </ol>

        <h3>Prototype Scope</h3>

        <p>
          This prototype uses Shizuoka City community bus GTFS data only.
          Railway and Shinkansen services are not included.
        </p>
      </div>
    </div>
  );
}

export default AboutPTALModal;