import { Flag, Loader2 } from 'lucide-react';

const CaptureButton = ({ team, isCapturing, onClick, statusText, disabled }) => {
  return (
    <div
      className={`capture-overlay-btn team-${team} ${isCapturing ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="btn-scan-container">
        {isCapturing && <div className="btn-scan-line"></div>}
      </div>
      <div className="btn-glow"></div>
      <div className="btn-content">
        {isCapturing ? (
          <Loader2 size={22} className="spin-icon" />
        ) : (
          <Flag size={22} fill="currentColor" />
        )}
        <span className={isCapturing ? 'capturing-text' : ''}>{statusText}</span>
      </div>
    </div>
  );
};

export default CaptureButton;
