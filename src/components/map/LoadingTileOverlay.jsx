import { useEffect, useRef, useState } from 'react';
import { Rectangle, useMap } from 'react-leaflet';

/**
 * 현재 로딩 중인 타일 영역에 검은색 사각형을 덮어 지도가 보이지 않게 합니다.
 * tileloadstart 이벤트로 로딩 시작을, tileload 이벤트로 완료를 감지합니다.
 */

/**
 * 타일 좌표(z, x, y) → 위도/경도 경계(Leaflet bounds) 변환
 * Web Mercator 타일 표준 공식 사용
 */
function tileToBounds(x, y, z) {
  const n = Math.pow(2, z);
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  return [[south, west], [north, east]];
}

const LoadingTileOverlay = () => {
  const map = useMap();
  // Map<tileKey, bounds> 형태로 현재 로딩 중인 타일 관리
  const loadingRef = useRef(new Map());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const loading = loadingRef.current;

    const onTileStart = (e) => {
      const { x, y, z } = e.coords;
      const key = `${z}/${x}/${y}`;
      loading.set(key, tileToBounds(x, y, z));
      forceUpdate(n => n + 1);
    };

    const onTileDone = (e) => {
      const { x, y, z } = e.coords;
      const key = `${z}/${x}/${y}`;
      loading.delete(key);
      forceUpdate(n => n + 1);
    };

    map.on('tileloadstart', onTileStart);
    map.on('tileload', onTileDone);
    map.on('tileerror', onTileDone);

    return () => {
      map.off('tileloadstart', onTileStart);
      map.off('tileload', onTileDone);
      map.off('tileerror', onTileDone);
    };
  }, [map]);

  const bounds = [...loadingRef.current.values()];

  if (bounds.length === 0) return null;

  return (
    <>
      {bounds.map((b, i) => (
        <Rectangle
          key={i}
          bounds={b}
          pathOptions={{
            fillColor: '#000',
            fillOpacity: 1,
            color: 'transparent',
            weight: 0,
            interactive: false,
          }}
        />
      ))}
    </>
  );
};

export default LoadingTileOverlay;
