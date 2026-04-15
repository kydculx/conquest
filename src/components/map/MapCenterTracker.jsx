import { useMapEvents } from 'react-leaflet';
import { getTileInfo } from '../../utils/geoUtils';

/**
 * 지도의 중앙(Crosshair 위치) 타일 정보를 실시간으로 추적하는 컴포넌트
 * @param {Object} props
 * @param {Function} props.onCenterTileChange - 중앙 타일 정보가 변경될 때 호출되는 콜백 함수
 */
const MapCenterTracker = ({ onCenterTileChange }) => {
  const map = useMapEvents({
    // 지도가 움직일 때
    move: () => {
      const center = map.getCenter();
      onCenterTileChange(getTileInfo(center.lat, center.lng));
    },
    // 확대/축소가 끝났을 때
    zoomend: () => {
      const center = map.getCenter();
      onCenterTileChange(getTileInfo(center.lat, center.lng));
    },
    // 초기 로딩 시
    load: () => {
      const center = map.getCenter();
      onCenterTileChange(getTileInfo(center.lat, center.lng));
    }
  });

  return null;
};

export default MapCenterTracker;
