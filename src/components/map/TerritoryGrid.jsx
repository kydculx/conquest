import { useState, useEffect, useCallback } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { getHexesInBounds, isPointInKorea, getHexCorners, hexToLatLng } from '../../utils/geoUtils';
import { GAME_CONFIG, MAP_CONFIG } from '../../constants';
import { GRID_RENDER_CONFIG } from '../../constants/territoryConfig';

/**
 * 대한민국 영토 내의 가용 구역을 옅은 격자로 표시하는 레이어
 * - 성능 최적화를 위해 현재 화면(Viewport) 내의 타일만 렌더링합니다.
 * - 특정 줌 레벨 이상에서만 활성화됩니다.
 */
const TerritoryGrid = () => {
  const [visibleHexes, setVisibleHexes] = useState([]);
  const [zoom, setZoom] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const [isReady, setIsReady] = useState(false);

  const updateGrid = useCallback((m) => {
    const z = m.getZoom();
    setZoom(z);

    // 성능 보호: 특정 줌 레벨 미만에서는 격자를 렌더링하지 않음
    if (z < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) {
      setVisibleHexes([]);
      return;
    }

    const bounds = m.getBounds();
    
    // 고정된 타일 크기(MAP_CONFIG.TILE_SIZE)로 격자 계산
    const hexes = getHexesInBounds(bounds, MAP_CONFIG.TILE_SIZE);
    setVisibleHexes(hexes);
  }, []);

  const map = useMapEvents({
    moveend: () => updateGrid(map),
    zoomend: () => updateGrid(map),
  });

  useEffect(() => {
    if (map) {
      updateGrid(map);
      setIsReady(true);
    }
  }, [map, updateGrid]);

  if (!isReady || zoom < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) return null;

  return (
    <>
      {visibleHexes.map(hex => (
        <Polygon
          key={`ghost-${hex.q}-${hex.r}`}
          positions={getHexCorners(hex.q, hex.r, MAP_CONFIG.TILE_SIZE)}
          pathOptions={{
            color: GAME_CONFIG.COLORS.TERRITORY_GRID,
            fillColor: GAME_CONFIG.COLORS.TRANSPARENT,
            weight: 1,
            fillOpacity: 0,
            dashArray: '3, 7',
            interactive: false
          }}
        />
      ))}
    </>
  );
};

export default TerritoryGrid;
