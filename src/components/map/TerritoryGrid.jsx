import { useState, useEffect, useCallback } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { getHexesInBounds, isPointInKorea, getHexCorners, hexToLatLng } from '../../utils/geoUtils';
import { GAME_CONFIG } from '../../constants';
import { GRID_RENDER_CONFIG } from '../../constants/territoryConfig';

/**
 * 대한민국 영토 내의 가용 구역을 옅은 격자로 표시하는 레이어
 * - 성능 최적화를 위해 현재 화면(Viewport) 내의 타일만 렌더링합니다.
 * - 특정 줌 레벨 이상에서만 활성화됩니다.
 */
const TerritoryGrid = () => {
  const [visibleHexes, setVisibleHexes] = useState([]);
  const [zoom, setZoom] = useState(0);

  const updateGrid = useCallback((map) => {
    const currentZoom = map.getZoom();
    setZoom(currentZoom);

    // 줌 레벨이 너무 낮으면(멀리서 보면) 렌더링하지 않음
    if (currentZoom < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) {
      if (visibleHexes.length > 0) setVisibleHexes([]);
      return;
    }

    const bounds = map.getBounds();
    const hexes = getHexesInBounds(bounds);
    
    // 대한민국 영토 경계 내에 포함된 타일만 선별
    const koreaHexes = hexes.filter(h => {
      const center = hexToLatLng(h.q, h.r);
      return isPointInKorea(center.lat, center.lng);
    });

    setVisibleHexes(koreaHexes);
  }, [visibleHexes.length]);

  const map = useMapEvents({
    moveend: () => updateGrid(map),
    zoomend: () => updateGrid(map),
  });

  // 컴포넌트 마운트 시 초기 그리드 계산
  useEffect(() => {
    updateGrid(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (zoom < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) return null;

  return (
    <>
      {visibleHexes.map(hex => (
        <Polygon
          key={`ghost-${hex.q}-${hex.r}`}
          positions={getHexCorners(hex.q, hex.r)}
          pathOptions={{
            color: GAME_CONFIG.COLORS.TERRITORY_GRID,
            fillColor: GAME_CONFIG.COLORS.TRANSPARENT,
            weight: 1,
            fillOpacity: 0,
            dashArray: '3, 7',
            interactive: false // 배경 격자는 마우스 이벤트를 가로채지 않도록 설정
          }}
        />
      ))}
    </>
  );
};

export default TerritoryGrid;
