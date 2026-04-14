import { MAP_CONFIG } from '../constants';

/**
 * Haversine 공식을 사용하여 지구 표면 위의 두 좌표 사이의 최단 거리(대권 거리)를 계산합니다.
 * @param {number} lat1 - 첫 번째 지점 위도
 * @param {number} lon1 - 첫 번째 지점 경도
 * @param {number} lat2 - 두 번째 지점 위도
 * @param {number} lon2 - 두 번째 지점 경도
 * @returns {number} 미터(m) 단위의 직선 거리
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구의 평균 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 계산된 최종 거리 (m)
};

/** 
 * 타일 한 칸의 크기 정의 (도 단위)
 * MAP_CONFIG.TILE_SIZE (미터)를 기반으로 위도상의 도(degree) 단위로 변환합니다.
 * 기준: 0.001도 ≒ 약 111m (계산 편의상 0.001도당 100m로 비례 계산)
 */
export const TILE_SIZE = (MAP_CONFIG.TILE_SIZE / 100) * 0.001; 

/**
 * 현재 GPS 좌표를 기반으로 무한 그리드(Infinite Grid) 상의 타일 정보를 계산합니다.
 * @param {number} lat - 사용자의 현재 위도
 * @param {number} lng - 사용자의 현재 경도
 * @returns {object} 타일 ID, 인덱스, 지도의 사각형 영역(bounds) 정보
 */
export const getTileInfo = (lat, lng) => {
  // 현재 좌표를 TILE_SIZE로 나누어 해당 좌표가 속한 인덱스를 찾습니다.
  const latIndex = Math.floor(lat / TILE_SIZE);
  const lngIndex = Math.floor(lng / TILE_SIZE);
  
  // 고유 타일 ID 생성 (예: "37566:126978")
  const id = `${latIndex}:${lngIndex}`;
  
  // 지도의 Rectangle 컴포넌트에서 사용할 사각형의 남서쪽(SW)과 북동쪽(NE) 좌표 계산
  const southWest = [latIndex * TILE_SIZE, lngIndex * TILE_SIZE];
  const northEast = [(latIndex + 1) * TILE_SIZE, (lngIndex + 1) * TILE_SIZE];
  
  return {
    id,
    latIndex,
    lngIndex,
    bounds: [southWest, northEast]
  };
};

/**
 * 점령 가능한 최대 오차 범위 (미터)
 * GPS 정확도가 이 수치보다 나쁘면(숫자가 크면) 점령이 불가능하도록 제한합니다.
 */
export const CAPTURE_RANGE = 150; 
