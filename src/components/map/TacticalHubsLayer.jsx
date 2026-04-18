import { Marker, Popup } from 'react-leaflet';
import { TACTICAL_HUBS } from '../../constants/tacticalHubs';
import { 
  specialHubIcon, 
  metropolitanHubIcon, 
  provincialHubIcon, 
  cityHubIcon, 
  countyHubIcon, 
  districtHubIcon 
} from './MapIcons';

/**
 * 전술 거점 등급별 아이콘 매퍼
 */
const getHubIcon = (type) => {
  switch (type) {
    case 'special': return specialHubIcon;
    case 'metropolitan': return metropolitanHubIcon;
    case 'provincial': return provincialHubIcon;
    case 'city': return cityHubIcon;
    case 'county': return countyHubIcon;
    case 'district': return districtHubIcon;
    default: return cityHubIcon;
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
  return (
    <>
      {TACTICAL_HUBS.map((hub) => (
        <Marker 
          key={hub.id} 
          position={[hub.lat, hub.lng]} 
          icon={getHubIcon(hub.type)}
        >
          <Popup className="tactical-popup">
            <div className="hub-popup-content">
              <span className={`hub-tag ${hub.type}`}>
                {getHubTag(hub.type)}
              </span>
              <h3 className="hub-name">{hub.name}</h3>
              <p className="hub-status">작전 구역 내 주요 거점</p>
              <div className="hub-footer">
                <span className="region-label">{hub.region} 섹터</span>
                <span className="coords-label">{hub.lat.toFixed(3)}, {hub.lng.toFixed(3)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default TacticalHubsLayer;
