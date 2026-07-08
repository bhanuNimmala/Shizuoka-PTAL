function FeatureInfoCard({ selectedType }) {
  let title = "";
  let source = "";
  let layer = "";
  let description = "";

  switch (selectedType) {
    case "ptal":
      title = "PTAL Information";
      source = "GTFS, OpenStreetMap";
      layer = "Custom 500 m analysis grid";
      description =
        "Shows the level of public transport accessibility for this area.";
      break;

    case "population":
      title = "Population Information";
      source = "e-Stat 2020 Census";
      layer = "Official 500 m census mesh";
      description =
        "Represents total population within the selected official census mesh.";
      break;

    case "stop":
      title = "Bus Stop Information";
      source = "GTFS";
      layer = "Point feature";
      description =
        "Represents a public transport boarding location from the GTFS dataset.";
      break;

    case "route":
      title = "Bus Route Information";
      source = "GTFS";
      layer = "Line feature";
      description =
        "Represents a community bus route available within the study area.";
      break;

    default:
      return null;
  }

  return (
    <div className="feature-card">
      <h3>{title}</h3>

      <div className="feature-card-body">
        <div className="feature-info-row">
          <span className="feature-info-label">Source</span>
          <p className="feature-info-text">{source}</p>
        </div>

        <div className="feature-info-row">
          <span className="feature-info-label">Layer Type</span>
          <p className="feature-info-text">{layer}</p>
        </div>

        <div className="feature-info-row">
          <span className="feature-info-label">Description</span>
          <p className="feature-info-text">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default FeatureInfoCard;