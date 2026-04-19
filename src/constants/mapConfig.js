/**
 * 지도의 핵심 설정 변수
 */
export const MAP_CONFIG = {
  DEFAULT_POSITION: [37.5665, 126.9780],
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 7,
  MAX_ZOOM: 14,
  FLY_DURATION: 1.5,
  TILE_SIZE: 400,
  MOCK_POSITION: [37.4979, 127.0276], // 개발용 가상 위치 (강남역)
};

/**
 * 실시간 변경 가능한 지도 테마 리스트
 * - 카툰 컨셉에 최적화된 테마들로 구성
 */
export const MAP_THEMES = {
  voyager: {
    id: 'voyager',
    name: '기본 카툰',
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; CARTO',
    preview: '#87CEEB'
  },
  colorpop: {
    id: 'colorpop',
    name: '컬러팝!',
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors',
    preview: '#FFD700'
  },
  sketch: {
    id: 'sketch',
    name: '스케치북',
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; CARTO',
    preview: '#E2E8F0'
  },
  satellite: {
    id: 'satellite',
    name: '위성 지도',
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
    preview: '#14251a'
  }
};

/**
 * GPS 수신 정확도 임계치 설정
 */
export const GPS_CONFIG = {
  CAPTURE_ACCURACY_THRESHOLD: 50,
  HIGH_ACCURACY_THRESHOLD: 15,
  GOOD_ACCURACY_THRESHOLD: 40,
  UNSTABLE_ACCURACY_THRESHOLD: 100,
};

export const CAPTURE_CONFIG = {
  EMPTY_TILE_DURATION: 10000,
  ENEMY_TILE_DURATION: 60000,
};
