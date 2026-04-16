/**
 * 게임의 전반적인 비즈니스 로직 및 시스템 설정값
 */
export const GAME_CONFIG = {
  // 위치 보정용 EMA 필터 계수 (낮을수록 부드럽지만 반응은 느려짐)
  EMA_ALPHA: 0.3,

  // 점령 관련 설정
  CAPTURE: {
    UPDATE_INTERVAL: 100,      // 점령 진행률 갱신 주기 (ms)
    RANGE: 150,                // 점령 가능 범위 (m)
    VIBRATION_PATTERN: [30, 50, 30], // 점령 시작 시 진동 패턴
  },

  // 전술 테마 색상 (Leaflet 컴포넌트용)
  COLORS: {
    TEAM_BLUE: '#0066ff',
    TEAM_RED: '#ff1744',
    SIGNAL_STABLE: '#00ff88',
    SIGNAL_UNSTABLE: '#ffd600',
    TILE_HIGHLIGHT: 'rgba(0, 255, 200, 0.5)',
    TERRITORY_GRID: 'rgba(0, 255, 200, 0.2)',
    TRANSPARENT: 'transparent'
  },

  // 시스템 기본값
  SYSTEM: {
    GPS_TIMEOUT: 10000,        // GPS 신호 대기 타임아웃 (ms)
  }
};
