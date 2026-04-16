/**
 * 지도 제어 플로팅 버튼 (내 위치로)
 */
import { Radar } from 'lucide-react';
import { UI_TEXT } from '../../constants';

/**
 * 지도를 플레이어 위치로 즉시 이동시키기 위한 버튼 컴포넌트
 * - 레이더 스캔 애니메이션과 전술적 프레임이 포함된 고도화된 디자인
 */
const RecentButton = ({ onClick }) => {
  return (
    <div className="recenter-container">
      <button 
        className="recenter-btn" 
        onClick={onClick} 
        title={UI_TEXT.recenterBtn}
      >
        {/* 회전하는 스캔 링 효과 */}
        <div className="radar-scanner"></div>
        <div className="radar-pulse"></div>
        
        {/* 전술적 브래킷 (작은 사이즈) */}
        <div className="tiny-bracket tl"></div>
        <div className="tiny-bracket tr"></div>
        <div className="tiny-bracket bl"></div>
        <div className="tiny-bracket br"></div>

        <Radar size={20} className="radar-icon" />
      </button>
    </div>
  );
};

export default RecentButton;
