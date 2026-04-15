export const APP_TITLE = "NEXUS CONQUEST // 사이버 워페어";

export const TEAM_RED = {
  id: "red",
  name: "사이버 코어",
  description: "공격형 해킹 특화. 적 네트워크를 마비시키고 시스템을 장악합니다.",
  color: "var(--color-neon-red)",
  callsign: "레드 팬텀",
};

export const TEAM_BLUE = {
  id: "blue",
  name: "실드 셀",
  description: "방어형 보안 특화. 아군 네트워크를 보호하고 역공을 전개합니다.",
  color: "var(--color-neon-blue)",
  callsign: "블루 센티널",
};

export const UI_TEXT = {
  selectTeamTitle: "프로토콜 초기화",
  selectTeamSubtitle: "사이버 전쟁 커맨드에 접속할 진영을 선택하십시오.",
  readyBtn: "작전 개시",
  captureBtn: "구역 점령",
  scanningBtn: "구역 스캔 중...",
  loginTitle: "보안 시스템 접속",
  loginSubtitle: "넥서스 커맨드 센터에 접속하기 위해 권한을 증명하십시오.",
  emailLabel: "통신 ID (이메일)",
  passwordLabel: "액세스 키 (비밀번호)",
  loginBtn: "인증 및 접속",
  signUpBtn: "신규 요원 등록",
  noAccount: "아직 등록되지 않은 요원이십니까?",
  hasAccount: "이미 등록된 요원이십니까?",
  authLoading: "보안 데이터 확인 중...",
  authError: "인증에 실패했습니다. 액세스 권한을 확인하십시오.",
  logoutBtn: "통신 종료",
  googleLoginBtn: "Google 계정으로 접속",

  // 추가된 맵 관련 텍스트
  latLabel: "위도",
  lngLabel: "경도",
  accLabel: "정밀도",
  calibrating: "보정 중",
  recenterBtn: "내 위치로",

  // 시그널 및 점령 상태
  signalSearching: "신호 탐색 중",
  signalStable: "연결 안정",
  signalGood: "연결 좋음",
  signalWeak: "신호 약함",

  statusSyncing: "점령 진행 중...",
  statusSignalWeak: "신호 약함",
  statusReclaimed: "점령 완료",
  statusCapture: "구역 점령",

  // 권한 관련
  permissionDenied: "위치 권한 거부됨",
  permissionHint: "점령을 계속하려면 브라우저 설정에서 위치 권한을 허용해 주십시오.",
  retrySync: "센서 동기화 재시도",

  // 알림 메시지 템플릿
  alertNeutralCapture: "영토 확보: 새로운 구역을 점령했습니다.",
  alertEnemyInvasion: "침공 발생! 적군이 우리 영토를 탈취했습니다.",
  alertCounterCapture: "반격 성공! 적의 구역을 탈취했습니다.",
  alertOtherTeamCapture: "전선 변화: 타 진영 간의 교전이 감지되었습니다.",
  alertSensorWarning: "수신 저하: GPS 신호가 불안정합니다."
};

export const MAP_CONFIG = {
  DEFAULT_ZOOM: 16,
  MIN_ZOOM: 13,
  MAX_ZOOM: 17,
  FLY_DURATION: 1.5,
  TILE_SIZE: 500, // 100m grid
};
