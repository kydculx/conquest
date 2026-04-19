/**
 * 어플리케이션 전역에서 사용되는 텍스트 정의
 * - 'Advanced Tactical HUD V4.0' 컨셉에 맞춰 전문적이고 격식 있는 용어로 개편
 */
export const UI_TEXT = {
  // 공통
  appTitle: "NEXUS CONQUEST",
  loading: "시스템 초기화 중...",

  // 팀 선택
  selectTeam: "투입 진영을 선택하십시오.",
  selectTeamTitle: "작전 진영 선택",
  teamBlueTitle: "블루 센티널",
  teamRedTitle: "레드 팬텀",
  teamBlueDesc: "방어 및 보안 프로토콜 최적화 진영",
  teamRedDesc: "공격 및 시스템 탈취 프로토콜 특화 진영",

  // 지도 액션
  btnStartCapture: "구역 점령 개시",
  btnCapturing: "업링크 동기화 중...",
  btnCaptureDone: "구역 확보 완료",

  // 상태 메시지
  statusCapture: "미확보 구역 탐지",
  statusCaptureReady: "점령 프로토콜 가동 가능",
  statusCapturingBase: "데이터 전송 및 동기화 중...",
  statusReclaimed: "아군 점령 구역 (SECURED)",
  statusSignalWeak: "GPS 신호 감쇠 - 개활지로 이동하십시오.",
  statusTargetMismatch: "좌표 보정 필요: 위치를 중앙에 맞추십시오.",
  statusProcessing: "데이터 패킷 처리 중...",

  // 레이어 및 목록
  territoryListTitle: "점령 구역 데이터베이스",
  territoryListEmpty: "확보된 데이터가 없습니다. 구역 점령을 시작하십시오.",
  hubsListTitle: "주요 전술 거점 (TACTICAL_HUBS)",

  // 에러
  locationDenied: "위치 권한 거부 - 작전 수행 불가",
  locationError: "GPS 하드웨어 응답 없음",
  locationUnavailable: "위치 서비스 이용 불가. 시스템 설정에서 GPS 권한을 확인한 후 'RECENTER' 버튼을 눌러 재시도하십시오.",
  mockLocationNotice: "가상 위치 시뮬레이션 가동 중 (DEV_MODE)",
};
