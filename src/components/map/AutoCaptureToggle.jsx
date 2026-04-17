import React from 'react';
import { Target } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import './AutoCaptureToggle.css';

/**
 * 자동 점령(Auto-Capture) 토글 스위치 컴포넌트 - 간소화 버전
 */
const AutoCaptureToggle = () => {
  const { autoCaptureEnabled, saveAutoCapture } = useGame();

  const handleToggle = (e) => {
    // 이벤트 전파 차단 (지도로 전달되지 않도록)
    e.stopPropagation();
    saveAutoCapture(!autoCaptureEnabled);
  };

  return (
    <div 
      className={`auto-capture-toggle-container ${autoCaptureEnabled ? 'is-active' : ''}`}
      onClick={handleToggle}
      title={autoCaptureEnabled ? '전술 모드: 자동' : '전술 모드: 수동'}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <Target size={14} className="thumb-icon" />
        </div>
      </div>
      <div className="toggle-label">
        <span className="status-text">{autoCaptureEnabled ? '자동' : '수동'}</span>
      </div>
    </div>
  );
};

export default AutoCaptureToggle;
