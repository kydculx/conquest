/**
 * 지도 제어 플로팅 버튼 (내 위치로)
 */
import { Radar } from 'lucide-react';
import { UI_TEXT } from '../../constants';

/**
 * 지도를 플레이어 위치로 즉시 이동시키기 위한 버튼 컴포넌트
 */
const RecentButton = ({ onClick }) => {
  return (
    <button className="recenter-btn" onClick={onClick} title={UI_TEXT.recenterBtn}>
      <Radar size={22} />
    </button>
  );
};

export default RecentButton;
