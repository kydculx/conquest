import { useState, useRef, useCallback } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { getTileInfo } from '../../utils/geoUtils';
import { GAME_CONFIG } from '../../constants';

/**
 * 지도의 중앙(Crosshair) 타일 하이라이트를 개별적으로 관리하는 레이어 컴포넌트
 * - 메인 페이지의 리렌더링을 방지하기 위해 내부에서 상태를 관리합니다.
 * @param {Object} props
 * @param {Function} props.onTileChange - 타일이 바뀔 때 외부(부모)에 알리기 위한 콜백 (필요 시)
 */
const CenterTileLayer = ({ onTileChange, zoom }) => {
  const [centerTile, setCenterTile] = useState(null);
  const lastUpdateRef = useRef(0);
  const throttleMs = 100;

  const updateCenterTile = useCallback((map) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;

    const center = map.getCenter();
    const tile = getTileInfo(center.lat, center.lng);
    
    setCenterTile(tile);
    if (onTileChange) {
      onTileChange(tile);
    }
    lastUpdateRef.current = now;
  }, [onTileChange]);

  const map = useMapEvents({
    move: () => updateCenterTile(map),
    zoom: () => updateCenterTile(map),
    load: () => updateCenterTile(map)
  });

  if (!centerTile || (zoom && zoom < 12)) return null;

  return (
    <Polygon
      key={`center-${centerTile.id}`}
      positions={centerTile.bounds}
      pathOptions={{
        color: GAME_CONFIG.COLORS.TILE_HIGHLIGHT,
        fillColor: GAME_CONFIG.COLORS.TRANSPARENT,
        weight: 2,
        dashArray: null,
        smoothFactor: 0
      }}
      interactive={false}
    />
  );
};

export default CenterTileLayer;
