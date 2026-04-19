import React from 'react';
import { useGame } from '../../hooks/useGame';
import './AutoCaptureToggle.css';

/**
 * 자동 점령(Auto-Capture) 토글 버튼 - 텍스트 전용 버전
 * - 사용자의 요청에 따라 복잡한 토글 스위치 대신 '자동/수동' 텍스트 버튼으로 변경
 */
const AutoCaptureToggle = () => {
  const { autoCaptureEnabled, saveAutoCapture } = useGame();

  const handleToggle = (e) => {
    // 이벤트 전파 차단 (지도로 전달되지 않도록)
    e.stopPropagation();
    saveAutoCapture(!autoCaptureEnabled);
  };

  return (
    <div className="adventure-auto-toggle">
      <button 
        className={`pop-text-btn ${autoCaptureEnabled ? 'auto' : 'manual'}`}
        onClick={handleToggle}
        title={autoCaptureEnabled ? '현재 자동 모드' : '현재 수동 모드'}
      >
        <span className="btn-text">
          {autoCaptureEnabled ? '자동' : '수동'}
        </span>
      </button>
    </div>
  );
};

export default AutoCaptureToggle;
