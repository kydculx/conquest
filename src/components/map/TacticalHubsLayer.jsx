import React, { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { TACTICAL_HUBS } from '../../constants/tacticalHubs';
import { useGame } from '../../hooks/useGame';
import { getTileInfo } from '../../utils/geoUtils';
import { GAME_CONFIG } from '../../constants';

/**
 * 전술 거점 등급별 스타일 매퍼
 */
const getHubStyle = (type, ownerTeam) => {
  // 기본 기본색 설정
  let color = '#94A3B8'; // District (Slate)
  let radius = 6;

  switch (type) {
    case 'special':
      color = '#FFD700'; // Gold
      radius = 14;
      break;
    case 'metropolitan':
      color = '#A855F7'; // Purple
      radius = 11;
      break;
    case 'provincial':
      color = '#F59E0B'; // Amber
      radius = 10;
      break;
    case 'city':
      color = '#06B6D4'; // Cyan
      radius = 8;
      break;
    case 'county':
      color = '#10B981'; // Emerald
      radius = 7;
      break;
    default:
      radius = 6;
  }

  // 점령 상태에 따른 색상 오버라이드
  if (ownerTeam === 'blue') color = '#00A2FF';
  if (ownerTeam === 'red') color = '#FF3B30';

  return { color, radius };
};

/**
 * 개별 거점 아이템 컴포넌트 (메모이제이션 적용)
 */
const TacticalHubItem = React.memo(({ hub, owner }) => {
  const { color, radius } = useMemo(() => getHubStyle(hub.type, owner), [hub.type, owner]);
  
  // 고정된 섹터 번호
  const sectorNum = useMemo(() => (hub.id % 9) + 1, [hub.id]);

  return (
    <>
      {/* 1. 외곽 광채 레이어 (Glow Effect) */}
      <CircleMarker
        center={[hub.lat, hub.lng]}
        radius={radius * 1.8}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.15,
          color: 'transparent',
          interactive: false
        }}
      />
      
      {/* 2. 중심 코어 레이어 (Core Node) */}
      <CircleMarker
        center={[hub.lat, hub.lng]}
        radius={radius}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.9,
          color: '#ffffff',
          weight: 1.5,
          className: `tactical-hub-core hub-${hub.type}`
        }}
      >
        <Popup className="tactical-popup">
          <div className="hub-popup-content">
            <h3 className="hub-name">{hub.name}</h3>
            <div className="hub-footer">
              <span className="region-label">{hub.region} SECTOR_0{sectorNum}</span>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
});

/**
 * 전술 거점(시청, 군청, 구청)을 지도에 표시하는 레이어
 * - 캔버스 기반 CircleMarker를 사용하여 수백 개의 거점도 랙 없이 렌더링합니다.
 */
const TacticalHubsLayer = () => {
  const { capturedTiles } = useGame();

  return (
    <>
      {TACTICAL_HUBS.map((hub) => {
        const tileInfo = getTileInfo(hub.lat, hub.lng);
        const owner = capturedTiles[tileInfo.id]?.owner;

        return (
          <TacticalHubItem 
            key={hub.id} 
            hub={hub} 
            owner={owner} 
          />
        );
      })}
    </>
  );
};

export default TacticalHubsLayer;
