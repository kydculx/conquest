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
 * 위도를 평면 Y 좌표로 변환
 */
const latToY = (lat) => {
  return (lat - ORIGIN_LAT) * (111320 / HEX_SIZE);
};

/**
 * 경도를 평면 X 좌표로 변환
 */
const lngToX = (lng) => {
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  return (lng - ORIGIN_LNG) * (111320 * Math.cos(latRad) / HEX_SIZE);
};

/**
 * 평면 Y를 위도로 역변환
 */
const yToLat = (y) => {
  return (y * HEX_SIZE / 111320) + ORIGIN_LAT;
};

/**
 * 평면 X를 경도로 역변환
 */
const xToLng = (x) => {
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  return (x * HEX_SIZE / (111320 * Math.cos(latRad))) + ORIGIN_LNG;
};

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
export const latLngToHex = (lat, lng) => {
  const x = lngToX(lng);
  const y = latToY(lat);
  
  // Flat-top 헥사곤 수학 공식 적용
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  
  const cube = cubeRound(q, -q - r, r);
  return cubeToAxial(cube.x, cube.y, cube.z);
};

/**
 * 헥사곤 좌표(q, r)를 위도/경도 중심점으로 변환
 */
export const hexToLatLng = (q, r) => {
  const cube = axialToCube(q, r);
  const x = Math.sqrt(3) * cube.x + (Math.sqrt(3) / 2) * cube.z;
  const y = (3 / 2) * cube.z;
  
  return {
    lat: yToLat(y),
    lng: xToLng(x)
  };
};

/**
 * 특정 타일(q, r)의 6개 꼭짓점 위도/경도 좌표를 계산
 */
export const getHexCorners = (q, r) => {
  const center = hexToLatLng(q, r);
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  const latScale = HEX_SIZE / 111320;
  const lngScale = HEX_SIZE / (111320 * Math.cos(latRad));
  const corners = [];
  
  // 60도 간격으로 6개의 꼭짓점 생성
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
 * @returns {Object} 타일 메타데이터 (ID, 좌표, 경계면 등)
 */
export const getTileInfo = (lat, lng) => {
  const { q, r } = latLngToHex(lat, lng);
  const center = hexToLatLng(q, r);
  const distance = calculateDistance(lat, lng, center.lat, center.lng);
  const corners = getHexCorners(q, r);
  // 경계면 폐쇄를 위해 첫 좌표를 마지막에 추가
  corners.push(corners[0]);
  
  const id = `hex_${q}_${r}`;
  
  return {
    id,
    q,
    r,
    bounds: corners,
    centerLat: center.lat,
    centerLng: center.lng,
    distanceFromCenter: distance
  };
};

// 점령 허용 범위 (전역 설정에서 가져옴)
export const CAPTURE_RANGE = GAME_CONFIG.CAPTURE.RANGE;

/**
 * 특정 좌표가 대한민국 영토 경계(Bounding Box) 내에 있는지 확인
 */
export const isPointInKorea = (lat, lng) => {
  const { NORTH, SOUTH, WEST, EAST } = KOREA_BOUNDS;
  return lat >= SOUTH && lat <= NORTH && lng >= WEST && lng <= EAST;
};

/**
 * 지도의 LatLngBounds 영역에 포함되는 모든 헥사곤 좌표(q, r) 리스트를 반환
 */
export const getHexesInBounds = (bounds) => {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // 영역 내의 대략적인 q, r 범위를 계산하기 위해 네 모서리 변환
  const corners = [
    latLngToHex(sw.lat, sw.lng),
    latLngToHex(ne.lat, ne.lng),
    latLngToHex(sw.lat, ne.lng),
    latLngToHex(ne.lat, sw.lng)
  ];

  const minQ = Math.min(...corners.map(c => c.q)) - 1;
  const maxQ = Math.max(...corners.map(c => c.q)) + 1;
  const minR = Math.min(...corners.map(c => c.r)) - 1;
  const maxR = Math.max(...corners.map(c => c.r)) + 1;

  const hexes = [];
  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      const center = hexToLatLng(q, r);
      // 타일의 중심점이 현재 지도의 바운즈 안에 있는지 확인
      if (center.lat >= sw.lat && center.lat <= ne.lat && center.lng >= sw.lng && center.lng <= ne.lng) {
        hexes.push({ q, r });
      }
    }
  }
  return hexes;
};
