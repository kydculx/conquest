import React, { useMemo } from 'react';
import { Polygon } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';
import { TEAM_BLUE, GAME_CONFIG } from '../../constants';

const CapturedTilesLayer = React.memo(() => {
  const { capturedTiles } = useGame();

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

  return (
    <>
      {/* 블루팀 점령 영역 (일괄 렌더링) */}
      {blueCoords.length > 0 && (
        <Polygon
          positions={blueCoords}
          pathOptions={{
            color: '#000000',      // 강렬한 블랙 테두리
            fillColor: GAME_CONFIG.COLORS.TEAM_BLUE,
            fillOpacity: 0.8,
            weight: 3,             // 굵은 선 (Cartoon Style)
            lineJoin: 'round',
            smoothFactor: 1,
            className: 'captured-hex team-blue-hex'
          }}
          interactive={false}
        />
      )}

      {/* 레드팀 점령 영역 (일괄 렌더링) */}
      {redCoords.length > 0 && (
        <Polygon
          positions={redCoords}
          pathOptions={{
            color: '#000000',      // 강렬한 블랙 테두리
            fillColor: GAME_CONFIG.COLORS.TEAM_RED,
            fillOpacity: 0.8,
            weight: 3,             // 굵은 선 (Cartoon Style)
            lineJoin: 'round',
            smoothFactor: 1,
            className: 'captured-hex team-red-hex'
          }}
          interactive={false}
        />
      )}
    </>
  );
});

export default CapturedTilesLayer;
