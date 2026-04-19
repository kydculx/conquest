/**
 * 지도 제어 플로팅 버튼 (내 위치로)
 */
import { LocateFixed } from 'lucide-react';

/**
 * 지도를 플레이어 위치로 즉시 이동시키기 위한 버튼 컴포넌트
 * - 카툰 테마에 맞춘 심플하고 팝한 디자인
 */
const RecentButton = ({ onClick }) => {
  return (
    <div className="recenter-container">
      <button 
        className="recenter-btn" 
        onClick={onClick} 
      >
        <LocateFixed size={24} className="location-icon" />
      </button>
    </div>
  );
};

export default RecentButton;
