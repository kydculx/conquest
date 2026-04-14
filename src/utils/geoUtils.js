/**
 * Haversine 공식을 사용하여 두 좌표 사이의 거리를 계산 (미터 단위)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위 거리
};

export const TILE_SIZE = 0.001; // 약 100m (위도 0.001도 기준)

/**
 * 좌표를 입력받아 타일 정보(ID, 경계 좌표)를 반환
 */
export const getTileInfo = (lat, lng) => {
  const latIndex = Math.floor(lat / TILE_SIZE);
  const lngIndex = Math.floor(lng / TILE_SIZE);
  
  const id = `${latIndex}:${lngIndex}`;
  
  const southWest = [latIndex * TILE_SIZE, lngIndex * TILE_SIZE];
  const northEast = [(latIndex + 1) * TILE_SIZE, (lngIndex + 1) * TILE_SIZE];
  
  return {
    id,
    latIndex,
    lngIndex,
    bounds: [southWest, northEast]
  };
};

export const CAPTURE_RANGE = 150; // 점령 가능 거리 (미터) - 타일 시스템에서는 해당 타일 내부에만 있으면 됨
