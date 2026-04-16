import { useRef, useCallback, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { getTileInfo } from '../../utils/geoUtils';

/**
 * 지도의 중앙(Crosshair 위치) 타일 정보를 실시간으로 추적하는 컴포넌트
 * @param {Object} props
 * @param {Function} props.onCenterTileChange - 중앙 타일 정보가 변경될 때 호출되는 콜백 함수
 */
const MapCenterTracker = ({ onCenterTileChange }) => {
  const lastUpdateRef = useRef(0);
  const throttleMs = 100;

  const updateCenterTile = useCallback((map) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;

    const center = map.getCenter();
    onCenterTileChange(getTileInfo(center.lat, center.lng));
    lastUpdateRef.current = now;
  }, [onCenterTileChange]);

  const map = useMapEvents({
    move: () => updateCenterTile(map),
    zoom: () => updateCenterTile(map),
    load: () => {
      const center = map.getCenter();
      onCenterTileChange(getTileInfo(center.lat, center.lng));
    }
  });

  return null;
};

export default MapCenterTracker;
