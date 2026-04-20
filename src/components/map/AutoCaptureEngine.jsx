import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useGame } from '../../hooks/useGame';
import { MAP_CONFIG, GAME_CONFIG } from '../../constants';

/**
 * 자동 조준 및 자동 점령 엔진 컴포넌트
 * - 지시된 조건에 따라 자동 조준(panTo) 및 지연 자동 점령(onCapture)을 수행합니다.
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
  
  // 상태 관리 Ref (리렌더링 방지 및 정밀 제어)
  const lastAutoActionRef = useRef(0);
  const lastProcessedTileIdRef = useRef(null);
  const pendingTimerRef = useRef(null);
  const pendingTileIdRef = useRef(null);

  /**
   * 타이머 및 대기 상태 초기화
   */
  const clearAutoTimer = () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    pendingTileIdRef.current = null;
  };

  useEffect(() => {
    // 자동 점령 비활성 또는 렌더링 초기 단계 예외 처리
    if (!autoCaptureEnabled || !location || !tileId || isCapturing) {
      clearAutoTimer();
      return;
    }

    const { canCapture: possible } = canCapture;
    
    // 점령 불가한 타일이면 타이머 및 기록 초기화
    if (!possible) {
      clearAutoTimer();
      lastProcessedTileIdRef.current = null;
      return;
    }

    const now = Date.now();
    
    // 1. [자동 조준 단계] 플레이어 위치로 지도 이동
    if (!isTargetAligned) {
      if (now - lastAutoActionRef.current > 2000) {
        lastAutoActionRef.current = now;
        map.panTo(location, {
          animate: true,
          duration: MAP_CONFIG.FLY_DURATION
        });
      }
    }

    // 2. [지연 자동 점령 단계]
    // ⚠️ 이미 처리 중이거나, 이미 완료된 타일이면 바로 종료
    if (lastProcessedTileIdRef.current === tileId) return;

    // 새로운 타일에 진입했거나, 대기 타이머가 동작 중이지 않은 경우
    if (pendingTileIdRef.current !== tileId) {
      clearAutoTimer(); // 이전 타일 타이머 제거
      
      pendingTileIdRef.current = tileId;
      pendingTimerRef.current = setTimeout(() => {
        // [최종 재검증] 10초 대기 후에도 여전히 같은 타일에 있고, 
        // 최신 GPS 신호 기준으로도 점령 가능한 상태(possible)인지 다시 확인합니다.
        if (pendingTileIdRef.current === tileId && canCapture.possible) {
          lastProcessedTileIdRef.current = tileId;
          onCapture();
          clearAutoTimer();
        } else {
          // 조건 미달 시 조용히 타이머 초기화
          clearAutoTimer();
        }
      }, GAME_CONFIG.CAPTURE.AUTO_CAPTURE_DELAY);
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

  // 언마운트 시 클린업
  useEffect(() => () => clearAutoTimer(), []);

  return null;
};

export default AutoCaptureEngine;
