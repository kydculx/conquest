const CaptureButton = ({ team, isCapturing, statusType, onClick, statusText, disabled }) => {
  return (
    <div
      className={`capture-overlay-btn team-${team} state-${statusType} ${isCapturing ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {/* 전술적 코너 브래킷 */}
      <div className="btn-bracket-tl"></div>
      <div className="btn-bracket-tr"></div>
      <div className="btn-bracket-bl"></div>
      <div className="btn-bracket-br"></div>
      
      {/* 빗금 패턴 배경 */}
      <div className="btn-scanline-pattern"></div>

      <div className="btn-content">
        <div className="text-info-area">
          <span className="main-status">
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaptureButton;
