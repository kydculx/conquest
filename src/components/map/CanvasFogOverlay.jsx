import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';

/**
 * Canvas 기반 전술 안개(Fog of War) 레이어 v3
 *
 * 핵심 원리:
 * - Canvas를 Leaflet의 overlayPane 안에 배치합니다.
 * - overlayPane은 Leaflet이 직접 CSS transform으로 이동/확대시키므로
 *   패닝 중에는 Canvas가 지도와 함께 자동으로 움직입니다.
 * - 좌표는 layerPoint 기준(pane 내부 좌표계)를 사용합니다.
 * - 줌 완료(viewreset) 시에만 pane 기준점을 리셋하고 Canvas를 재배치합니다.
 */
const CanvasFogOverlay = ({ location }) => {
  const map = useMap();
  const { capturedTiles } = useGame();
  const canvasRef = useRef(null);
  const capturedTilesRef = useRef(capturedTiles);
  const locationRef = useRef(location);

  // 항상 최신 데이터를 ref로 유지
  capturedTilesRef.current = capturedTiles;
  locationRef.current = location;

  /**
   * Canvas를 overlayPane 기준에 맞게 재배치하고 그림을 다시 그립니다.
   * viewreset 이후 또는 데이터 변경 시 호출됩니다.
   */
  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    // 현재 지도 전체 bounds를 덮는 크기로 Canvas 설정
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    // Canvas 크기 = 지도 뷰포트 크기
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    // Canvas를 현재 뷰포트 topLeft 위치에 배치 (layerPoint 기준)
    canvas.style.left = topLeft.x + 'px';
    canvas.style.top = topLeft.y + 'px';

    const ctx = canvas.getContext('2d');

    // 1단계: 전체를 완전한 어둠으로 채움
    ctx.clearRect(0, 0, size.x, size.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.fillRect(0, 0, size.x, size.y);

    // 2단계: destination-out으로 밝은 구역만 구멍 뚫기
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';

    // 점령된 타일에 구멍 뚫기
    Object.values(capturedTilesRef.current).forEach(tile => {
      const coords = tile.bounds || tile.coords;
      if (!coords || coords.length === 0) return;

      ctx.beginPath();
      coords.forEach((latLng, i) => {
        // layerPoint: overlayPane 내 좌표 → topLeft 기준의 Canvas 오프셋으로 변환
        const pt = map.latLngToLayerPoint(latLng);
        const x = pt.x - topLeft.x;
        const y = pt.y - topLeft.y;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    });

    // 플레이어 주변 가시권 구멍 뚫기
    const loc = locationRef.current;
    if (loc) {
      const playerPt = map.latLngToLayerPoint(loc);
      const x = playerPt.x - topLeft.x;
      const y = playerPt.y - topLeft.y;

      const metersPerPixel =
        (156543.03392 * Math.cos((loc[0] * Math.PI) / 180)) /
        Math.pow(2, map.getZoom());
      const r = Math.max(40, Math.min(250, 150 / metersPerPixel));

      // 가장자리가 부드럽게 사라지는 그라데이션
      const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 합성 모드 복원
    ctx.globalCompositeOperation = 'source-over';
  }, [map]);

  // Canvas 마운트 및 이벤트 바인딩
  useEffect(() => {
    if (!map) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position: absolute; pointer-events: none;';
    canvasRef.current = canvas;

    // overlayPane에 삽입 → 패닝 시 Leaflet이 pane을 transform으로 이동
    const overlayPane = map.getPanes().overlayPane;
    overlayPane.appendChild(canvas);

    // 줌 완료 후 + 뷰 리셋 후 Canvas 재배치 및 재드로잉
    map.on('viewreset', reset);
    map.on('zoomend', reset);

    reset();

    return () => {
      map.off('viewreset', reset);
      map.off('zoomend', reset);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, reset]);

  // capturedTiles 또는 location 변경 시 재드로잉
  useEffect(() => {
    reset();
  }, [capturedTiles, location, reset]);

  return null;
};

export default CanvasFogOverlay;
