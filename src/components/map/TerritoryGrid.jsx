import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { getHexesInBounds, getHexCorners } from '../../utils/geoUtils';
import { GAME_CONFIG, MAP_CONFIG } from '../../constants';
import { GRID_RENDER_CONFIG } from '../../constants/territoryConfig';

/**
 * 전술 맵 격자 레이어 (멀티-폴리곤 가속 가동)
 */
const TerritoryGrid = () => {
  const [visibleHexes, setVisibleHexes] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const lastUpdateRef = useRef(0);
  const throttleMs = 150;

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
    const hexes = getHexesInBounds(bounds, MAP_CONFIG.TILE_SIZE, 0.08);

    setVisibleHexes(hexes);
    lastUpdateRef.current = now;
  }, [visibleHexes.length]);

  const map = useMapEvents({
    moveend: () => updateGrid(map),
    zoomend: () => updateGrid(map)
  });

  const multiPolygonCoords = useMemo(() => {
    if (visibleHexes.length === 0) return [];
    return visibleHexes.map(hex => getHexCorners(hex.q, hex.r, MAP_CONFIG.TILE_SIZE));
  }, [visibleHexes]);

  useEffect(() => {
    if (map) {
      updateGrid(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (currentZoom < GRID_RENDER_CONFIG.MIN_ZOOM_LEVEL || multiPolygonCoords.length === 0) {
    return null;
  }

  return (
    <Polygon
      positions={multiPolygonCoords}
      pathOptions={{
        color: GAME_CONFIG.COLORS.TERRITORY_GRID,
        fillColor: 'transparent',
        weight: 1.5,
        fillOpacity: 0,
        dashArray: '2, 5',
        interactive: false,
        smoothFactor: 1
      }}
    />
  );
};

export default TerritoryGrid;
