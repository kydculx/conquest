import React from 'react';
import { Target } from 'lucide-react';
import './CaptureButton.css';

/**
 * 모험 점령 버튼 컴포넌트
 * - V3.4: 입체적인 카툰 스타일의 원형 버튼
 */
const CaptureButton = ({ 
  team, 
  isCapturing, 
  statusType, 
  onClick, 
  statusText, 
  disabled 
}) => {
  return (
    <div className="capture-btn-wrapper">
      <button
        className={`pop-adventure-btn ${team} ${isCapturing ? 'active' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <div className="btn-inner-container">
          <span className="btn-label">{statusText}</span>
        </div>
        
        {/* 그림자 및 입체감 레이어 */}
        <div className="btn-depth-layer"></div>
      </button>
      
      {/* 캡처 진행 시 외곽 광채 */}
      {isCapturing && <div className="btn-capture-glow"></div>}
    </div>
  );
};

export default CaptureButton;
