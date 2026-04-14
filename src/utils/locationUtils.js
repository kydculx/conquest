/**
 * GPS 및 좌표 관련 유틸리티 함수
 */

/**
 * 지수 이동 평균 (Exponential Moving Average) 필터
 * 이전 값과 현재 값 사이의 가중치를 두어 급격한 변화(지터)를 억제합니다.
 * @param {number} prevSmotthValue 이전 보정된 값
 * @param {number} newValue 현재 수집된 원본 값
 * @param {number} alpha 가중치 (0~1, 작을수록 더 부드럽고 반응이 늦음)
 */
export const smoothValue = (prevSmoothValue, newValue, alpha = 0.2) => {
  if (prevSmoothValue === null || prevSmoothValue === undefined) return newValue;
  return (newValue * alpha) + (prevSmoothValue * (1 - alpha));
};

/**
 * 두 좌표 사이의 거리 계산 (Haversine formula)
 * @returns {number} 거리 (미터 단위)
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (m)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 정확도에 따른 신호 상태 반환
 */
export const getSignalStatus = (accuracy) => {
  if (accuracy === null) return { label: 'SEARCHING', class: 'searching' };
  if (accuracy < 15) return { label: 'LINK_STABLE', class: 'stable' };
  if (accuracy < 40) return { label: 'LINK_GOOD', class: 'good' };
  return { label: 'LINK_WEAK', class: 'weak' };
};
