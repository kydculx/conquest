/**
 * GPS 수신 데이터 및 좌표 보정을 위한 공통 유틸리티
 */
export { calculateDistance as getDistance } from './geoUtils';
import { GPS_CONFIG } from '../constants';

/**
 * 전술적 위치 데이터 보정 (지수 이동 평균 - EMA 필터)
 * GPS 데이터의 급격한 튀어오름(지터링)을 억제하여 맵 마커가 부드럽게 흐르듯 이동하도록 만듭니다.
 * @param {number} prevSmoothValue - 이전에 보정된 좌표값
 * @param {number} newValue - 현재 GPS 센서로부터 입력된 원본 좌표값
 * @param {number} alpha - 보정 강도 가중치 (0.0~1.0)
 * @returns {number} 최종 보정된 세로/가로 좌표값
 */
export const smoothValue = (prevSmoothValue, newValue, alpha = 0.2) => {
  if (prevSmoothValue === null || prevSmoothValue === undefined) return newValue;
  return (newValue * alpha) + (prevSmoothValue * (1 - alpha));
};

/**
 * 현재 GPS 정확도(Accuracy)를 기반으로 전술 신호 상태 정보 반환
 * @param {number|null} accuracy - 오차 범위(m)
 * @returns {Object} { label: string, class: string }
 */
export const getSignalStatus = (accuracy) => {
  if (accuracy === null) return { label: '신호 검색 중', class: 'searching' };
  
  // 1. 불안정 임계치 초과
  if (accuracy > GPS_CONFIG.UNSTABLE_ACCURACY_THRESHOLD) {
    return { label: '신호 매우 불안정', class: 'unstable' };
  }
  
  // 2. 고정밀 임계치 미만 (최상)
  if (accuracy < GPS_CONFIG.HIGH_ACCURACY_THRESHOLD) {
    return { label: '연결 안정 (최상)', class: 'stable' };
  }
  
  // 3. 양호 임계치 미만
  if (accuracy < GPS_CONFIG.GOOD_ACCURACY_THRESHOLD) {
    return { label: '연결 양호', class: 'good' };
  }
  
  return { label: '신호 약함', class: 'weak' };
};
