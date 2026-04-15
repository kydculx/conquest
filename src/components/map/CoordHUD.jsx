const CoordHUD = ({ location }) => {
  if (!location) return null;

  return (
    <div className="coord-floating-ui hud-panel">
      <div className="coord-item">
        <span className="coord-label">위도:</span>
        <span className="coord-value">{location[0].toFixed(5)}</span>
      </div>
      <div className="coord-item">
        <span className="coord-label">경도:</span>
        <span className="coord-value">{location[1].toFixed(5)}</span>
      </div>
    </div>
  );
};

export default CoordHUD;
