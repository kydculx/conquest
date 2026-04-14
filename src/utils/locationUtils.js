/**
 * GPS 수신 데이터 및 좌표 보정을 위한 공통 유틸리티
 */

/**
 * 전술적 위치 데이터 보정 (지수 이동 평균 - EMA 필터)
 * GPS 데이터의 급격한 튀어오름(지터링)을 억제하여 맵 마커가 부드럽게 흐르듯 이동하도록 만듭니다.
 * @param {number} prevSmoothValue - 이전에 보정된 좌표값
 * @param {number} newValue - 현재 GPS 센서로부터 입력된 원본 좌표값
 * @param {number} alpha - 보정 강도 가중치 (0.0~1.0, 숫자가 낮을수록 더 부드럽지만 반응 속도가 약간 느려짐)
 * @returns {number} 최종 보정된 세로/가로 좌표값
 */
export const smoothValue = (prevSmoothValue, newValue, alpha = 0.2) => {
  // 이전 데이터가 없으면 현재 값을 그대로 사용하여 즉시 초기화
  if (prevSmoothValue === null || prevSmoothValue === undefined) return newValue;
  // (현재값 * 가중치) + (지난 보정값 * 남은 비중)
  return (newValue * alpha) + (prevSmoothValue * (1 - alpha));
};

/**
 * 하버사인(Haversine) 공식을 이용한 두 지점 간의 실제 거리 계산
 * 구(Globe) 형태인 지구 상에서 두 좌표 사이의 곡선 거리를 미터 단위로 반환합니다.
 * @returns {number} 거리 (미터 단위)
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구의 반지름 (단위: m)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 최종 계산 거리 (m)
};

/**
 * GPS 정확도(Accuracy) 수치에 따른 통신 신호 상태 판별
 * 미터(m) 단위의 오차 범위를 바탕으로 사용자에게 직관적인 상태 텍스트와 스타일 클래스를 제공합니다.
 * @param {number|null} accuracy - GPS 오차 범위 (m)
 * @returns {object} 상태 텍스트(label)와 스타일용 클래스명(class)
 */
export const getSignalStatus = (accuracy) => {
  if (accuracy === null) return { label: '수신 중', class: 'searching' };
  if (accuracy < 15) return { label: '연결 안정', class: 'stable' }; // 15m 미만: 무선 전술망 활성화
  if (accuracy < 40) return { label: '연결 좋음', class: 'good' };   // 40m 미만: 일반 위성 데이터 수신
  return { label: '신호 약함', class: 'weak' };                      // 40m 이상: 수신 감도 저하
};
