/**
 * 위치 권한 거부 시 표시되는 안내 오버레이
 */
import { ShieldAlert } from 'lucide-react';
import { UI_TEXT } from '../../constants';

const PermissionDenied = () => {
  return (
    <div className="status-overlay">
      <div className="hud-panel warning-card">
        <div className="panel-scan-line"></div>
        <div className="corner-bracket tl"></div>
        <div className="corner-bracket tr"></div>
        <div className="corner-bracket bl"></div>
        <div className="corner-bracket br"></div>
        <ShieldAlert size={64} color="#ff003c" className="animate-pulse" />
        <h2 className="glitch-text">{UI_TEXT.permissionDenied}</h2>
        <div className="permission-guide">
          <p>1. 주소창의 <b>자물쇠 아이콘</b>을 클릭하세요.</p>
          <p>2. 위치 권한을 <b>'허용'</b>으로 변경해 주세요.</p>
          <p>3. 인앱 브라우저라면 <b>'다른 브라우저로 열기'</b>를 권장합니다.</p>
        </div>
        <button className="tactical-btn active" onClick={() => window.location.reload()}>
          시스템 재동기화
        </button>
      </div>
    </div>
  );
};

export default PermissionDenied;
