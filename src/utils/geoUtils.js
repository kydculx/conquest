/**
 * 지리 좌표(위도, 경도)와 전술 맵의 타일 시스템(Hex Grid) 간의 변환을 담당하는 유틸리티
 * - Flat-top 헥사곤 그리드 알고리즘을 사용합니다.
 */
import { MAP_CONFIG, GAME_CONFIG } from '../constants';
import { KOREA_BOUNDS } from '../constants/territoryConfig';

const { TILE_SIZE: HEX_SIZE } = MAP_CONFIG;

/**
 * 하버사인(Haversine) 공식을 사용하여 두 지점 사이의 거리를 계산 (미터 단위)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반경 (m)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 그리드 계산의 기준점 (서울 시청)
const ORIGIN_LAT = MAP_CONFIG.DEFAULT_POSITION[0];
const ORIGIN_LNG = MAP_CONFIG.DEFAULT_POSITION[1];

/**
 * 실수 부동소수점 큐브 좌표를 가장 가까운 정수 헥사곤 좌표로 반올림
 */
const cubeRound = (x, y, z) => {
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { x: rx, y: ry, z: rz };
};

/**
 * 축 좌표(q, r)를 큐브 좌표(x, y, z)로 변환
 */
const axialToCube = (q, r) => {
  return { x: q, y: -q - r, z: r };
};

/**
 * 큐브 좌표를 축 좌표로 변환
 */
const cubeToAxial = (x, y, z) => {
  return { q: x, r: z };
};

/**
 * 위도/경도를 전술 맵의 헥사곤 좌표(q, r)로 변환
 */
export const latLngToHex = (lat, lng, hexSize = HEX_SIZE) => {
  // 가변 hexSize를 고려한 좌표 변환
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  const x = (lng - ORIGIN_LNG) * (111320 * Math.cos(latRad) / hexSize);
  const y = (lat - ORIGIN_LAT) * (111320 / hexSize);
  
  // Flat-top 헥사곤 수학 공식 적용
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  
  const cube = cubeRound(q, -q - r, r);
  return cubeToAxial(cube.x, cube.y, cube.z);
};

/**
 * 헥사곤 좌표(q, r)를 위도/경도 중심점으로 변환
 */
export const hexToLatLng = (q, r, hexSize = HEX_SIZE) => {
  const cube = axialToCube(q, r);
  const x = Math.sqrt(3) * cube.x + (Math.sqrt(3) / 2) * cube.z;
  const y = (3 / 2) * cube.z;
  
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  const lat = (y * hexSize / 111320) + ORIGIN_LAT;
  const lng = (x * hexSize / (111320 * Math.cos(latRad))) + ORIGIN_LNG;
  
  return { lat, lng };
};

/**
 * 특정 타일(q, r)의 6개 꼭짓점 위도/경도 좌표를 계산
 */
export const getHexCorners = (q, r, hexSize = HEX_SIZE) => {
  const center = hexToLatLng(q, r, hexSize);
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  const latScale = hexSize / 111320;
  const lngScale = hexSize / (111320 * Math.cos(latRad));
  const corners = [];
  
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const lat = center.lat + latScale * Math.sin(angleRad);
    const lng = center.lng + lngScale * Math.cos(angleRad);
    corners.push([lat, lng]);
  }
  return corners;
};

/**
 * 특정 좌표(lat, lng)에 해당하는 타일의 전체 정보를 생성
 */
export const getTileInfo = (lat, lng) => {
  const { q, r } = latLngToHex(lat, lng);
  const center = hexToLatLng(q, r);
  const distance = calculateDistance(lat, lng, center.lat, center.lng);
  const corners = getHexCorners(q, r);
  corners.push(corners[0]);
  
  const id = `hex_${q}_${r}`;
  return { id, q, r, bounds: corners, centerLat: center.lat, centerLng: center.lng, distanceFromCenter: distance };
};

// 점령 허용 범위 (전역 설정에서 가져옴)
export const CAPTURE_RANGE = GAME_CONFIG.CAPTURE.RANGE;

/**
 * 특정 좌표가 대한민국 영토 경계(Bounding Box) 내에 있는지 확인
 */
export const isPointInKorea = (lat, lng) => {
  const { NORTH, SOUTH, WEST, EAST } = KOREA_BOUNDS;
  return lat >= SOUTH - 0.1 && lat <= NORTH + 0.1 && lng >= WEST - 0.1 && lng <= EAST + 0.1;
};

/**
 * 지도의 LatLngBounds 영역에 포함되는 헥사곤 좌표 리스트를 반환 (최적화 버전)
 * @param {object} viewportBounds - 현재 지도의 경계
 * @param {number} hexSize - 헥사곤 크기
 * @param {number} padding - 위경도 패딩 (화면 밖 타일 선행 계산용)
 */
export const getHexesInBounds = (viewportBounds, hexSize = HEX_SIZE, padding = 0.05) => {
  const { NORTH, SOUTH, WEST, EAST } = KOREA_BOUNDS;
  const sw = viewportBounds.getSouthWest();
  const ne = viewportBounds.getNorthEast();

  // 화면 바운즈에 패딩을 적용하여 교집합 계산
  const interSouth = Math.max(sw.lat - padding, SOUTH);
  const interNorth = Math.min(ne.lat + padding, NORTH);
  const interWest = Math.max(sw.lng - padding, WEST);
  const interEast = Math.min(ne.lng + padding, EAST);

  if (interSouth >= interNorth || interWest >= interEast) return [];

  // 교집합 구역의 q, r 범위를 산출
  const c1 = latLngToHex(interSouth, interWest, hexSize);
  const c2 = latLngToHex(interNorth, interEast, hexSize);
  const c3 = latLngToHex(interSouth, interEast, hexSize);
  const c4 = latLngToHex(interNorth, interWest, hexSize);

  const qs = [c1.q, c2.q, c3.q, c4.q];
  const rs = [c1.r, c2.r, c3.r, c4.r];
  
  const minQ = Math.min(...qs) - 1;
  const maxQ = Math.max(...qs) + 1;
  const minR = Math.min(...rs) - 1;
  const maxR = Math.max(...rs) + 1;

  const hexes = [];
  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      const center = hexToLatLng(q, r, hexSize);
      if (isPointInKorea(center.lat, center.lng)) {
        hexes.push({ q, r });
      }
    }
  }
  return hexes;
};
