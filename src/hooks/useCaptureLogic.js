import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { CAPTURE_CONFIG, GPS_CONFIG, GAME_CONFIG } from '../constants';

/**
 * 점령 시스템의 핵심 비즈니스 로직을 관리하는 커스텀 훅
 * - 타일 점령 시작, 진행률 계산, 점령 가능 여부 판단 등을 수행합니다.
 * @returns {Object} 점령 관련 상태 및 제어 함수들
 */
export const useCaptureLogic = () => {
  const { selectedTeam, capturedTiles, captureTile } = useGame();
  
  // 현재 점령 중인 타일 정보 및 진행 상태
  const [capturingTileId, setCapturingTileId] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureStartTime, setCaptureStartTime] = useState(null);
  
  // 리렌더링과 독립적으로 타이머와 데이터를 관리하기 위한 Ref
  const intervalRef = useRef(null);
  const targetDurationRef = useRef(null);
  const capturingDataRef = useRef(null);

  /**
   * 점령 상태를 완전히 초기화하는 함수 (성공, 실패, 혹은 중단 시 호출)
   */
  const clearCaptureState = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCapturingTileId(null);
    setCaptureProgress(0);
    setCaptureStartTime(null);
    capturingDataRef.current = null;
  }, []);

  /**
   * 새로운 구역 점령을 시작하는 함수
   * @param {Object} tileInfo - 점령할 타일의 메타데이터 (ID, 좌표 등)
   * @returns {Promise<boolean>} 시작 성공 여부
   */
  const startCapture = useCallback(async (tileInfo) => {
    if (!selectedTeam || !tileInfo) return false;
    
    const { id, q, r, bounds } = tileInfo;
    const existingTile = capturedTiles[id];
    
    // 타일의 기존 주인이 있는지에 따라 점령 소요 시간 결정
    const isEmptyTile = !existingTile;
    const duration = isEmptyTile 
      ? CAPTURE_CONFIG.EMPTY_TILE_DURATION 
      : CAPTURE_CONFIG.ENEMY_TILE_DURATION;
    
    // 이전 진행 상태 청소
    clearCaptureState();
    
    // 점령 시도 데이터 구성
    const data = {
      id,
      q,
      r,
      bounds,
      owner: selectedTeam,
      capture_started_at: new Date().toISOString(),
    };

    capturingDataRef.current = data;
    setCapturingTileId(id);
    setCaptureStartTime(Date.now());
    targetDurationRef.current = duration;

    // 100ms 단위로 진행률을 업데이트하는 타이머 시작
    let elapsed = 0;
    intervalRef.current = setInterval(async () => {
      elapsed += GAME_CONFIG.CAPTURE.UPDATE_INTERVAL;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setCaptureProgress(progress);

      // 점령 완료 시점 체크
      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCapturingTileId(null);
        setCaptureProgress(0);
        
        // 최종 데이터를 Supabase(DB)에 전달하여 영구 저장
        const finalData = capturingDataRef.current;
        if (finalData) {
          try {
            const completeData = {
              ...finalData,
              captured_at: new Date().toISOString(),
              capture_status: 'captured'
            };
            await captureTile(completeData);
          } catch (error) {
            console.error('점령 완료 실패:', error);
          }
        }
        capturingDataRef.current = null;
      }
    }, GAME_CONFIG.CAPTURE.UPDATE_INTERVAL);

    return true;
  }, [selectedTeam, capturedTiles, clearCaptureState, captureTile]);

  /**
   * 컴포넌트 언마운트 시 진행 중인 타이머가 있다면 확실히 제거하여 메모리 누수 방지
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * 특정 타일을 현재 조건(위치, 팀, 진행상태)에서 점령할 수 있는지 판단
   * @param {Object} tileInfo - 검사할 타일 정보
   * @param {number} accuracy - 현재 GPS 정확도
   * @returns {Object} { canCapture: boolean, reason: string | null }
   */
  const canCapture = useCallback((tileInfo, accuracy) => {
    if (!selectedTeam || !tileInfo) return { canCapture: false, reason: null };
    
    // 1. GPS 정확도가 일정 수준(Threshold) 이하로 떨어지면 점령 금지
    if (accuracy && accuracy > GPS_CONFIG.CAPTURE_ACCURACY_THRESHOLD) {
      return { canCapture: false, reason: 'signal' };
    }
    
    // 2. 이미 다른 타일을 점령 중인 경우 중복 금지
    if (capturingTileId) {
      return { canCapture: false, reason: 'busy' };
    }
    
    // 3. 이미 우리 팀이 소유한 타일인 경우
    const existingTile = capturedTiles[tileInfo.id];
    if (existingTile?.owner === selectedTeam) {
      return { canCapture: false, reason: 'owned' };
    }
    
    return { canCapture: true, reason: null };
  }, [selectedTeam, capturingTileId, capturedTiles]);

  /**
   * 현재 점령 진행 중인 타일의 남은 시간을 밀리초 단위로 계산
   */
  const getRemainingTime = useCallback(() => {
    if (!captureStartTime || !targetDurationRef.current) return 0;
    const elapsed = Date.now() - captureStartTime;
    const remaining = targetDurationRef.current - elapsed;
    return Math.max(0, remaining);
  }, [captureStartTime]);

  return {
    isCapturing: !!capturingTileId,
    capturingTileId,
    capturingTile: capturingDataRef.current,
    captureProgress,
    startCapture,
    clearCaptureState,
    canCapture,
    getRemainingTime
  };
};
