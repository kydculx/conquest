import { MAP_CONFIG } from '../constants';

const { TILE_SIZE: HEX_SIZE } = MAP_CONFIG;

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
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

const ORIGIN_LAT = 37.5665;
const ORIGIN_LNG = 126.9780;

const latToY = (lat) => {
  return (lat - ORIGIN_LAT) * (111320 / HEX_SIZE);
};

const lngToX = (lng) => {
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  return (lng - ORIGIN_LNG) * (111320 * Math.cos(latRad) / HEX_SIZE);
};

const yToLat = (y) => {
  return (y * HEX_SIZE / 111320) + ORIGIN_LAT;
};

const xToLng = (x) => {
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  return (x * HEX_SIZE / (111320 * Math.cos(latRad))) + ORIGIN_LNG;
};

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

const axialToCube = (q, r) => {
  return { x: q, y: -q - r, z: r };
};

const cubeToAxial = (x, y, z) => {
  return { q: x, r: z };
};

export const latLngToHex = (lat, lng) => {
  const x = lngToX(lng);
  const y = latToY(lat);
  
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  
  const cube = cubeRound(q, -q - r, r);
  return cubeToAxial(cube.x, cube.y, cube.z);
};

export const hexToLatLng = (q, r) => {
  const cube = axialToCube(q, r);
  const x = Math.sqrt(3) * cube.x + (Math.sqrt(3) / 2) * cube.z;
  const y = (3 / 2) * cube.z;
  
  return {
    lat: yToLat(y),
    lng: xToLng(x)
  };
};

export const getHexCorners = (q, r) => {
  const center = hexToLatLng(q, r);
  const latRad = (ORIGIN_LAT * Math.PI) / 180;
  const latScale = HEX_SIZE / 111320;
  const lngScale = HEX_SIZE / (111320 * Math.cos(latRad));
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

export const getTileInfo = (lat, lng) => {
  const { q, r } = latLngToHex(lat, lng);
  const center = hexToLatLng(q, r);
  const distance = calculateDistance(lat, lng, center.lat, center.lng);
  const corners = getHexCorners(q, r);
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

export const CAPTURE_RANGE = 150;
