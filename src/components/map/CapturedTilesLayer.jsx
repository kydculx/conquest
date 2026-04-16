import React, { useState, useMemo } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';
import { TEAM_BLUE, GAME_CONFIG } from '../../constants';

/**
 * 전역 점령지 데이터를 팀별 멀티-폴리곤으로 렌더링하는 최적화 레이어
 */
const CapturedTilesLayer = React.memo(() => {
  const { capturedTiles, selectedTeam } = useGame();
  const [isMoving, setIsMoving] = useState(false);

  useMapEvents({
    movestart: () => setIsMoving(true),
    zoomstart: () => setIsMoving(true),
    moveend: () => setIsMoving(false),
    zoomend: () => setIsMoving(false),
  });

  const { blue: blueCoords, red: redCoords } = useMemo(() => {
    const coords = { blue: [], red: [] };
    
    Object.values(capturedTiles).forEach(tile => {
      const tileCoords = tile.bounds || tile.coords;
      if (tile.owner === TEAM_BLUE.id) {
        coords.blue.push(tileCoords);
      } else {
        coords.red.push(tileCoords);
      }
    });
    
    return coords;
  }, [capturedTiles]);

  if (isMoving) return null;

  return (
    <>
      {/* 블루팀 점령 영역 (일괄 렌더링) */}
      {blueCoords.length > 0 && (
        <Polygon
          positions={blueCoords}
          pathOptions={{
            color: 'transparent',
            fillColor: GAME_CONFIG.COLORS.TEAM_BLUE,
            fillOpacity: 0.35,
            weight: 0,
            smoothFactor: 0.5
          }}
          interactive={false}
        />
      )}

      {/* 레드팀 점령 영역 (일괄 렌더링) */}
      {redCoords.length > 0 && (
        <Polygon
          positions={redCoords}
          pathOptions={{
            color: 'transparent',
            fillColor: GAME_CONFIG.COLORS.TEAM_RED,
            fillOpacity: 0.35,
            weight: 0,
            smoothFactor: 0.5
          }}
          interactive={false}
        />
      )}
    </>
  );
});

export default CapturedTilesLayer;
