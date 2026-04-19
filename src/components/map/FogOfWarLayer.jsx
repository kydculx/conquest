import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGame } from '../../hooks/useGame';

/**
 * 전술 안개(Fog of War) 레이어 v5 — 직접 Leaflet API 방식
 *
 * React setState → 재렌더 → Leaflet 업데이트 사이클에서 발생하는
 * 1~2 프레임 지연을 완전히 제거합니다.
 *
 * 방식: L.polygon을 직접 생성하고, map.on('move') 콜백에서
 * polygon.setLatLngs()를 동기적으로 즉시 호출합니다.
 * → 지도 이동과 동일한 프레임에 안개가 갱신됩니다.
 */
const FogOfWarLayer = ({ location, capturedTiles: _ignored }) => {
  const map = useMap();
  const { capturedTiles } = useGame();
  const fogRef = useRef(null);
  // 항상 최신 상태를 동기적으로 읽기 위해 ref 사용
  const capturedTilesRef = useRef(capturedTiles);
  const locationRef = useRef(location);
  capturedTilesRef.current = capturedTiles;
  locationRef.current = location;

  useEffect(() => {
    if (!map) return;

    /**
     * 현재 뷰포트 기준으로 외곽 링 + 구멍들을 계산하여
     * Leaflet polygon에 즉시 적용합니다.
     * React 렌더링을 거치지 않아 지연이 없습니다.
     */
    const rebuild = () => {
      if (!fogRef.current) return;

      // 외곽 링: 현재 화면보다 60% 더 크게 — viewreset 중에도 화면 보장
      const b = map.getBounds().pad(0.6);
      const outerRing = [
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getWest()],
        [b.getNorth(), b.getEast()],
        [b.getSouth(), b.getEast()],
      ];

      // 점령 타일 구멍
      const holes = Object.values(capturedTilesRef.current)
        .map(tile => tile.bounds || tile.coords)
        .filter(coords => coords && coords.length > 0);

      // 플레이어 주변 가시권 (약 200m 반경 12각형)
      const loc = locationRef.current;
      if (loc) {
        const [lat, lng] = loc;
        const latR = 0.0018;
        const lngR = latR / Math.cos((lat * Math.PI) / 180);
        holes.push(
          Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return [lat + latR * Math.cos(a), lng + lngR * Math.sin(a)];
          })
        );
      }

      // React 재렌더 없이 직접 SVG 경로 갱신 (동기, 프레임 안에서 완료)
      fogRef.current.setLatLngs([outerRing, ...holes]);
    };

    // 초기 플레이스홀더로 생성
    const fog = L.polygon([[0, 0]], {
      fillColor: '#000000',
      fillOpacity: 1.0,
      color: 'transparent',
      weight: 0,
      interactive: false,
      smoothFactor: 1,
      pane: 'overlayPane',
    }).addTo(map);

    fogRef.current = fog;
    rebuild(); // 최초 배치

    // 모든 지도 이동/줌 이벤트에 동기 갱신 연결
    map.on('move', rebuild);
    map.on('zoom', rebuild);
    map.on('viewreset', rebuild);

    return () => {
      map.off('move', rebuild);
      map.off('zoom', rebuild);
      map.off('viewreset', rebuild);
      fog.remove();
      fogRef.current = null;
    };
  }, [map]); // map 인스턴스가 교체될 때만 재실행

  // 점령 타일 또는 위치가 바뀌면 안개 즉시 재배치
  useEffect(() => {
    if (!fogRef.current || !map) return;

    const b = map.getBounds().pad(0.6);
    const outerRing = [
      [b.getSouth(), b.getWest()],
      [b.getNorth(), b.getWest()],
      [b.getNorth(), b.getEast()],
      [b.getSouth(), b.getEast()],
    ];

    const holes = Object.values(capturedTiles)
      .map(tile => tile.bounds || tile.coords)
      .filter(coords => coords && coords.length > 0);

    if (location) {
      const [lat, lng] = location;
      const latR = 0.0018;
      const lngR = latR / Math.cos((lat * Math.PI) / 180);
      holes.push(
        Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return [lat + latR * Math.cos(a), lng + lngR * Math.sin(a)];
        })
      );
    }

    fogRef.current.setLatLngs([outerRing, ...holes]);
  }, [capturedTiles, location, map]);

  return null;
};

export default FogOfWarLayer;
