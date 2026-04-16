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
  const [currentHexSize, setCurrentHexSize] = useState(MAP_CONFIG.TILE_SIZE);
  const [zoom, setZoom] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const [isReady, setIsReady] = useState(false);

  // 줌 레벨에 따른 적절한 격자 크기(LOD) 결정
  const getHexSizeForZoom = (z) => {
    if (z >= 14) return 400;   // 최신 400m
    if (z >= 12) return 1500;  // 1.5km
    if (z >= 10) return 4000;  // 4km
    if (z >= 8)  return 10000; // 10km
    return 30000;              // 30km (전국 단위)
  };

  const updateGrid = useCallback((m) => {
    const z = m.getZoom();
    const hexSize = getHexSizeForZoom(z);
    const bounds = m.getBounds();
    
    // 이 함수는 이제 geoUtils에서 한국 영토와의 교집합만 계산함
    const hexes = getHexesInBounds(bounds, hexSize);
    
    setZoom(z);
    setCurrentHexSize(hexSize);
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

  if (!isReady) return null;

  return (
    <>
      {visibleHexes.map(hex => (
        <Polygon
          key={`ghost-${currentHexSize}-${hex.q}-${hex.r}`}
          positions={getHexCorners(hex.q, hex.r, currentHexSize)}
          pathOptions={{
            color: GAME_CONFIG.COLORS.TERRITORY_GRID,
            fillColor: GAME_CONFIG.COLORS.TRANSPARENT,
            weight: 1,
            fillOpacity: 0,
            dashArray: zoom < 10 ? 'none' : '3, 7',
            interactive: false
          }}
        />
      ))}
    </>
  );
};

export default TerritoryGrid;
