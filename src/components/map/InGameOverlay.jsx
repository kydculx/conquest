import React, { useState } from 'react';
import { LogOut, User, Zap, Shield, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import './InGameOverlay.css';

const InGameOverlay = ({ user, onLogout, location, team, score }) => {
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);

  const formatCoord = (val) => val ? val.toFixed(6) : '---.------';

  const triggerHaptic = (pattern = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const toggleLeft = () => {
    triggerHaptic(5);
    setIsLeftExpanded(!isLeftExpanded);
  };

  const toggleRight = () => {
    triggerHaptic(5);
    setIsRightExpanded(!isRightExpanded);
  };

  return (
    <div className="ingame-hud-container">
      {/* 화면 전체 아날로그 효과 (스캔라인, 노이즈) */}
      <div className="crt-overlay"></div>
      <div className="scanline-effect"></div>

      {/* 실시간 좌표 오버레이는 헤더로 통합됨 (여기서는 삭제) */}

      {/* 좌측 요원 상태 패널 - 인라인 스타일 강제 및 방어적 렌더링 */}
      <div 
        className={`hud-panel side-panel left-panel glass-panel ${isLeftExpanded ? 'expanded' : ''}`}
        style={{ 
          display: 'block', 
          opacity: 1, 
          visibility: 'visible', 
          background: 'rgba(13, 15, 26, 0.95)', 
          border: '4px solid #00f2ff',
          zIndex: 999999 
        }}
      >
        <div className="panel-header" onClick={toggleLeft}>
          <div className="panel-toggle mobile-only">
            <ChevronLeft size={16} className={isLeftExpanded ? 'rotated' : ''} />
          </div>
          <span>AGENT STATUS</span>
          <Shield size={16} />
        </div>
        <div className="agent-info">
          <div className="agent-details text-right">
            <p className="agent-email">{(user?.email || 'GUEST').split('@')[0]}</p>
            <p className="agent-rank">RANK: SENIOR AGENT</p>
          </div>
          <div className="agent-avatar">
            <User size={24} />
          </div>
        </div>
        <div className="stat-bars">
          <div className="stat-item text-right">
            <span className="stat-label">UPLINK</span>
            <div className="stat-bar-bg">
              <div className="stat-bar-fill pulse ml-auto" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="stat-item text-right">
            <span className="stat-label">POWER</span>
            <div className="stat-bar-bg">
              <div className="stat-bar-fill ml-auto" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 전술 데이터 패널 */}
      <div className={`hud-panel side-panel right-panel glass-panel ${isRightExpanded ? 'expanded' : ''}`}>
        <div className="panel-header" onClick={toggleRight}>
          <Activity size={16} />
          <span>TACTICAL FEED</span>
          <div className="panel-toggle mobile-only">
            <ChevronRight size={16} className={isRightExpanded ? 'rotated' : ''} />
          </div>
        </div>
        <div className="tactical-log">
          <div className="log-entry">
            <span className="log-time">13:42:01</span>
            <span className="log-msg">SECTOR SCAN COMPLETE</span>
          </div>
          <div className="log-entry highlight">
            <span className="log-time">13:41:45</span>
            <span className="log-msg">HOSTILE DETECTED IN SECTOR-04</span>
          </div>
          <div className="log-entry">
            <span className="log-time">13:41:20</span>
            <span className="log-msg">ENCRYPTION PROTOCOL ACTIVE</span>
          </div>
        </div>
        <div className="team-score-mini">
          <div className={`score-box ${team === 'blue' ? 'active' : ''}`}>
            <span className="score-label">BLUE</span>
            <span className="score-num">{score?.blue || 0}</span>
          </div>
          <div className={`score-box ${team === 'red' ? 'active' : ''}`}>
            <span className="score-label">RED</span>
            <span className="score-num">{score?.red || 0}</span>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 (좌측 하단) */}
      <button className="hud-logout-btn" onClick={onLogout} title="TERMINATE LINK">
        <LogOut size={20} />
      </button>

      {/* 전술 프레임 제거 (사용자 요청) */}
    </div>
  );
};

export default InGameOverlay;
