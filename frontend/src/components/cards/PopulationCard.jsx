function PopulationCard({ feature }) {
  const p = feature.properties || {};
  const density = Number(p.population_density || 0);

  return (
    <div className="result-card">
      <h2>Population Details</h2>

      <div className="card-details">
        {/* <p><strong>Mesh Code:</strong> {p.KEY_CODE}</p> */}
        <p><strong>Population:</strong> {Number(p.population || 0).toLocaleString()}</p>
        <p><strong>Density:</strong> {density.toFixed(2)} persons/km²</p>
      </div>
    </div>
  );
}

export default PopulationCard;