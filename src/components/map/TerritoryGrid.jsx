import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { getHexesInBounds, getHexCorners } from '../../utils/geoUtils';
import { GAME_CONFIG, MAP_CONFIG } from '../../constants';
import { GRID_RENDER_CONFIG } from '../../constants/territoryConfig';

/**
 * 개별 헥사곤 타일 컴포넌트 (상위 리렌더링 시에도 q, r, size가 같으면 생략)
 */
const HexagonTile = React.memo(({ q, r, size }) => {
  const corners = useMemo(() => getHexCorners(q, r, size), [q, r, size]);
  
  return (
    <Polygon
      positions={corners}
      pathOptions={{
        color: GAME_CONFIG.COLORS.TERRITORY_GRID,
        fillColor: 'transparent',
        weight: 1,
        fillOpacity: 0,
        dashArray: '3, 7',
        interactive: false,
        smoothFactor: 0 // 선 단순화 방지로 정확도 유지
      }}
    />
  );
});

/**
 * 대한민국 영토 내의 격자를 렌더링하는 컴포넌트 (최적화 버전)
 */
const TerritoryGrid = () => {
  const [visibleHexes, setVisibleHexes] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const lastUpdateRef = useRef(0);
  const throttleMs = 100; // 업데이트 주기 (ms)

  // 격자 업데이트 로직 (버퍼링 적용)
  const updateGrid = useCallback((map) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;
    
    const z = map.getZoom();
    setCurrentZoom(z);

    if (z < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) {
      if (visibleHexes.length > 0) setVisibleHexes([]);
      return;
    }

    const bounds = map.getBounds();
    // 패딩(0.08)을 넉넉히 두어 flyTo 시 타일 끊김 방지
    const hexes = getHexesInBounds(bounds, MAP_CONFIG.TILE_SIZE, 0.08);
    
    setVisibleHexes(hexes);
    lastUpdateRef.current = now;
  }, [visibleHexes.length]);

  const map = useMapEvents({
    move: () => updateGrid(map),
    zoom: () => updateGrid(map),
    moveend: () => updateGrid(map),
    zoomend: () => updateGrid(map)
  });

  // 초기 렌더링 시 실행
  useEffect(() => {
    if (map) {
      updateGrid(map);
    }
  }, [map]);

  if (currentZoom < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL) return null;

  return (
    <>
      {visibleHexes.map(hex => (
        <HexagonTile 
          key={`ghost-${hex.q}-${hex.r}`} 
          q={hex.q} 
          r={hex.r} 
          size={MAP_CONFIG.TILE_SIZE} 
        />
      ))}
    </>
  );
};

export default TerritoryGrid;
