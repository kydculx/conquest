import React, { useMemo } from 'react';
import { Polygon } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';
import { TEAM_BLUE, GAME_CONFIG } from '../../constants';
import { TACTICAL_HUBS } from '../../constants/tacticalHubs';
import { getTileInfo } from '../../utils/geoUtils';

const CapturedTilesLayer = React.memo(({ zoom }) => {
  const { capturedTiles } = useGame();

  // 줌 레벨에 따른 렌더링 품질 최적화 (LoD)
  const renderConfig = useMemo(() => {
    if (zoom < 9) return { weight: 1, smoothFactor: 6 };
    if (zoom < 12) return { weight: 2, smoothFactor: 3 };
    return { weight: 3, smoothFactor: 1 };
  }, [zoom]);

  const { blue: blueCoords, red: redCoords, neutral: neutralHubCoords } = useMemo(() => {
    const coords = { blue: [], red: [], neutral: [] };

    // 1. 점령된 타일 분류
    Object.values(capturedTiles).forEach(tile => {
      const tileCoords = tile.bounds || tile.coords;
      if (tile.owner === TEAM_BLUE.id) {
        coords.blue.push(tileCoords);
      } else {
        coords.red.push(tileCoords);
      }
    });

    // 2. 미점령 거점 타일 추출 (목표 지점 표시)
    TACTICAL_HUBS.forEach(hub => {
      const tile = getTileInfo(hub.lat, hub.lng);
      if (!capturedTiles[tile.id]) {
        coords.neutral.push(tile.bounds);
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
            weight: renderConfig.weight,
            lineJoin: 'round',
            smoothFactor: renderConfig.smoothFactor,
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
            weight: renderConfig.weight,
            lineJoin: 'round',
            smoothFactor: renderConfig.smoothFactor,
            className: 'captured-hex team-red-hex'
          }}
          interactive={false}
        />
      )}

      {/* 중립 거점 영역 (목표 구역 표시) - 가장 위에 렌더링하여 고립 방지 */}
      {neutralHubCoords.length > 0 && (
        <Polygon
          positions={neutralHubCoords}
          pathOptions={{
            color: '#000000',      // 명확한 블랙 테두리
            fillColor: '#888888',  // 선명한 중립 회색
            fillOpacity: 0.6,
            weight: renderConfig.weight * 0.8,
            lineJoin: 'round',
            smoothFactor: renderConfig.smoothFactor,
            className: 'neutral-hub-hex'
          }}
          interactive={false}
        />
      )}
    </>
  );
});

export default CapturedTilesLayer;
