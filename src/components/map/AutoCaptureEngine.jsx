import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';
import { MAP_CONFIG } from '../../constants';

/**
 * 자동 조준 및 자동 점령 엔진 컴포넌트
 * - MapContainer 내부에 위치하여 MapContext에 접근합니다.
 * - 지시된 조건에 따라 자동 조준(panTo) 및 자동 점령(onCapture)을 수행합니다.
 */
const AutoCaptureEngine = ({ 
  location, 
  tileId,
  canCapture, 
  isTargetAligned, 
  isCapturing, 
  onCapture 
}) => {
  const map = useMap();
  const { autoCaptureEnabled } = useGame();
  
  // 무한 루프 및 중복 점령 방지를 위한 상태 기록
  const lastAutoActionRef = useRef(0);
  const lastProcessedTileIdRef = useRef(null);

  useEffect(() => {
    if (!autoCaptureEnabled || !location || !tileId || isCapturing) return;

    // 다른 타일로 이동했다면 처리 완료 기록 초기화
    if (lastProcessedTileIdRef.current && lastProcessedTileIdRef.current !== tileId) {
      lastProcessedTileIdRef.current = null;
    }

    // 1. 점령 가능 여부 확인
    const { canCapture: possible } = canCapture;
    if (!possible) return;

    const now = Date.now();
    
    // 2. [자동 조준 단계] 조준이 정렬되지 않았다면 플레이어 위치로 지도 이동
    if (!isTargetAligned) {
      if (now - lastAutoActionRef.current < 2000) return;
      
      lastAutoActionRef.current = now;
      map.panTo(location, {
        animate: true,
        duration: MAP_CONFIG.FLY_DURATION
      });
      return;
    }

    // 3. [자동 점령 단계] 조준이 완료되었고 점령 가용한 상태면 실행
    if (isTargetAligned && !isCapturing) {
      // ⚠️ 중요: 점령 완료 직후 동일 타일 중복 실행 방지
      if (lastProcessedTileIdRef.current === tileId) return;

      lastProcessedTileIdRef.current = tileId;
      onCapture(); 
    }

  }, [
    autoCaptureEnabled, 
    location, 
    tileId,
    canCapture, 
    isTargetAligned, 
    isCapturing, 
    onCapture, 
    map
  ]);

  return null; // 렌더링 요소 없음 (로직 전용)
};

export default AutoCaptureEngine;
