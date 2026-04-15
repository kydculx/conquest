/**
 * 점령 진행 중 해당 타일 구역에 표시되는 전술 스캔 시각 효과
 * - Leaflet Polygon을 생성하여 캔버스 애니메이션 기반의 점멸(Pulse) 효과를 구현합니다.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * 타일 스캔 오버레이 컴포넌트
 * @param {Object} props
 * @param {Object} props.tile - 대상 타일 정보
 * @param {boolean} props.isCapturing - 점령 중 여부
 * @param {string} props.teamColor - 현재 플레이어의 팀 컬러
 */
const TileScanOverlay = ({ tile, isCapturing, teamColor }) => {
  const map = useMap();
  const layerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!tile || !map) return;

    const removeLayer = () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    removeLayer();

    if (!isCapturing) return;

    const coords = tile.bounds || tile.coords;
    const teamColorValue = teamColor === 'blue' ? '#00f0ff' : '#ff1744';
    const enemyColor = teamColor === 'blue' ? '#ff1744' : '#00f0ff';
    
    layerRef.current = L.polygon(coords, {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0.3,
      fillColor: teamColorValue
    }).addTo(map);

    let frame = 0;
    const animate = () => {
      frame += 1;
      
      const step = Math.floor(frame / 15) % 2;
      const currentColor = step === 0 ? teamColorValue : enemyColor;
      const opacity = step === 0 ? 0.35 : 0.15;
      
      layerRef.current.setStyle({
        fillColor: currentColor,
        fillOpacity: opacity
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return removeLayer;
  }, [tile, isCapturing, map, teamColor]);

  return null;
};

export default TileScanOverlay;
