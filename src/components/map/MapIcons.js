/**
 * 지도에 표시될 전술 아이콘(Marker Icon) 정의
 * - Leaflet의 L.divIcon을 사용하여 CSS 기반의 커스텀 애니메이션 아이콘을 생성합니다.
 */
import L from 'leaflet';

/**
 * 전술 맵에 사용되는 커스텀 플레이어 마커 아이콘 생성기
 * - 중심 코어(Core)와 주변 파동(Pulse) 효과를 포함하는 HTML 구조를 생성합니다.
 * @param {string} colorClass - 마커에 적용할 팀 컬러 클래스 (blue-marker: 블루팀, red-marker: 레드팀)
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

// [팀별 아이콘 인스턴스] - 컴포넌트 리렌더링 시 재생성을 방지하기 위해 상수로 유지
export const bluePlayerIcon = createPlayerIcon('blue-marker');
export const redPlayerIcon = createPlayerIcon('red-marker');

/**
 * 전술 거점(Hub) 등급별 아이콘 정의
 */

// 1. 특별시청 (Special - Seoul)
export const specialHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper special-marker">
      <div class="marker-core"></div>
      <div class="major-ring double"></div>
    </div>
  `,
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});

// 2. 광역시청 (Metropolitan)
export const metropolitanHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper metropolitan-marker">
      <div class="marker-core"></div>
      <div class="major-ring"></div>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

// 3. 도청/특별자치 (Provincial)
export const provincialHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper provincial-marker">
      <div class="marker-core"></div>
      <div class="major-ring flat"></div>
    </div>
  `,
  iconSize: [52, 52],
  iconAnchor: [26, 26],
});

// 4. 일반 시청 (City)
export const cityHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper city-marker">
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// 5. 일반 군청 (County)
export const countyHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper county-marker">
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// 6. 구청 (District)
export const districtHubIcon = L.divIcon({
  className: 'custom-leaflet-icon hub-marker-transition',
  html: `
    <div class="marker-wrapper district-marker">
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// 하위 호환성을 위한 기본 허브 아이콘 (City와 동일)
export const hubIcon = cityHubIcon;
