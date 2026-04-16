/**
 * 작전 구역(대한민국 영토) 지리적 경계 설정
 */
export const KOREA_BOUNDS = {
  // 실제 대한민국 위경도 극점 기준 (대략적 바운딩 박스)
  NORTH: 38.6, // DMZ 인근
  SOUTH: 33.0, // 제주도 남단
  WEST: 124.0, // 백령도 서단
  EAST: 132.0, // 독도 동단
};

/**
 * 격자 렌더링 최적화 설정
 */
export const GRID_RENDER_CONFIG = {
  MIN_ZOOM_LEVEL: 13, // 이 레벨보다 멀어지면 격자를 숨김 (성능 보호)
  MAX_TILES_PER_VIEW: 200, // 화면 내 최대 렌더링 타일 수 (이상 감지용)
};
