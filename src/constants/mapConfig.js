/**
 * 지도의 핵심 설정 변수
 */
export const MAP_CONFIG = {
  // 기본 중심 좌표 (서울 시청 권역)
  DEFAULT_POSITION: [37.5665, 126.9780],

  // 타일 레이어 및 출처 설정
  TILE_URL: "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
  ATTRIBUTION: '&copy; CartoDB',

  // 줌 임계치 및 애니메이션 파라미터
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 12,
  MAX_ZOOM: 15,
  FLY_DURATION: 1.5,
  TILE_SIZE: 400, // 헥사곤 타일 한 변의 길이 (평면 미터)
};

/**
 * GPS 수신 정확도 임계치 설정 (단위: 미터)
 */
export const GPS_CONFIG = {
  CAPTURE_ACCURACY_THRESHOLD: 50,  // 점령 가능 최대 허용 오차
  HIGH_ACCURACY_THRESHOLD: 15,     // 고정밀 신호 기준
  GOOD_ACCURACY_THRESHOLD: 40,     // 양호 신호 기준
  UNSTABLE_ACCURACY_THRESHOLD: 100, // 통신 불안정 기준
};

export const CAPTURE_CONFIG = {
  EMPTY_TILE_DURATION: 10000,
  ENEMY_TILE_DURATION: 60000,
};
