import L from 'leaflet';

/**
 * 전술 맵에 사용되는 커스텀 마커 아이콘 생성 베이스
 * @param {string} colorClass - 마커에 적용할 팀 컬러 클래스 (blue-marker, red-marker)
 * @returns {L.DivIcon} Leaflet DivIcon 객체
 */
export const createPlayerIcon = (colorClass) => L.divIcon({
  className: `custom-leaflet-icon player-marker-transition`,
  html: `
    <div class="marker-wrapper ${colorClass}">
      <div class="marker-pulse"></div>
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// 팀별 사전 정의 아이콘
export const bluePlayerIcon = createPlayerIcon('blue-marker');
export const redPlayerIcon = createPlayerIcon('red-marker');
