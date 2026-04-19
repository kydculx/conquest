import { Marker, Popup } from 'react-leaflet';
import { TACTICAL_HUBS } from '../../constants/tacticalHubs';
import { useGame } from '../../hooks/useGame';
import { getTileInfo } from '../../utils/geoUtils';
import { 
  getSpecialHubIcon, 
  getMetropolitanHubIcon, 
  getProvincialHubIcon, 
  getCityHubIcon, 
  getCountyHubIcon, 
  getDistrictHubIcon 
} from './MapIcons';
import { Activity } from 'lucide-react';

/**
 * 전술 거점 등급별 아이콘 매퍼 (동적)
 */
const getHubIcon = (type, captureClass) => {
  switch (type) {
    case 'special': return getSpecialHubIcon(captureClass);
    case 'metropolitan': return getMetropolitanHubIcon(captureClass);
    case 'provincial': return getProvincialHubIcon(captureClass);
    case 'city': return getCityHubIcon(captureClass);
    case 'county': return getCountyHubIcon(captureClass);
    case 'district': return getDistrictHubIcon(captureClass);
    default: return getCityHubIcon(captureClass);
  }
};

/**
 * 전술 거점 등급별 태그 텍스트 매퍼
 */
const getHubTag = (type) => {
  switch (type) {
    case 'special': return 'SUPREME COMMAND';
    case 'metropolitan': return 'METRO COMMAND';
    case 'provincial': return 'PROV COMMAND';
    case 'city': return 'CITY HUB';
    case 'county': return 'COUNTY BASE';
    case 'district': return 'DISTRICT UNIT';
    default: return 'TACTICAL HUB';
  }
};

/**
 * 전술 거점(시청, 군청, 구청)을 지도에 표시하는 레이어
 */
const TacticalHubsLayer = () => {
  const { capturedTiles } = useGame();

  return (
    <>
      {TACTICAL_HUBS.map((hub) => {
        // 거점 위치의 타일 점령 상태 파악
        const tileInfo = getTileInfo(hub.lat, hub.lng);
        const owner = capturedTiles[tileInfo.id]?.owner;
        const captureClass = owner ? `captured-${owner}` : '';

        return (
          <Marker 
            key={hub.id} 
            position={[hub.lat, hub.lng]} 
            icon={getHubIcon(hub.type, captureClass)}
          >
            <Popup className="tactical-popup">
              <div className="hub-popup-content">
                <h3 className="hub-name">{hub.name}</h3>
                <div className="hub-footer">
                  <span className="region-label">{hub.region} SECTOR_0{Math.floor(Math.random() * 9) + 1}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default TacticalHubsLayer;
