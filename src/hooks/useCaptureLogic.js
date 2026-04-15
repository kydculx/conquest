import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { CAPTURE_CONFIG, GPS_CONFIG } from '../constants';

export const useCaptureLogic = () => {
  const { selectedTeam, capturedTiles, captureTile } = useGame();
  
  const [capturingTileId, setCapturingTileId] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureStartTime, setCaptureStartTime] = useState(null);
  
  const intervalRef = useRef(null);
  const targetDurationRef = useRef(null);
  const capturingDataRef = useRef(null);

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

  const startCapture = useCallback(async (tileInfo) => {
    if (!selectedTeam || !tileInfo) return false;
    
    const { id, bounds } = tileInfo;
    const existingTile = capturedTiles[id];
    
    const isEmptyTile = !existingTile;
    const duration = isEmptyTile 
      ? CAPTURE_CONFIG.EMPTY_TILE_DURATION 
      : CAPTURE_CONFIG.ENEMY_TILE_DURATION;
    
    clearCaptureState();
    
    const data = {
      id,
      bounds,
      owner: selectedTeam,
      capture_started_at: new Date().toISOString(),
    };

    capturingDataRef.current = data;
    setCapturingTileId(id);
    setCaptureStartTime(Date.now());
    targetDurationRef.current = duration;

    let elapsed = 0;
    intervalRef.current = setInterval(async () => {
      elapsed += 100;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setCaptureProgress(progress);

      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCapturingTileId(null);
        setCaptureProgress(0);
        
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
    }, 100);

    return true;
  }, [selectedTeam, capturedTiles, clearCaptureState, captureTile]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const canCapture = useCallback((tileInfo, accuracy) => {
    if (!selectedTeam || !tileInfo) return { canCapture: false, reason: null };
    if (accuracy && accuracy > GPS_CONFIG.CAPTURE_ACCURACY_THRESHOLD) {
      return { canCapture: false, reason: 'signal' };
    }
    if (capturingTileId) {
      return { canCapture: false, reason: 'busy' };
    }
    const existingTile = capturedTiles[tileInfo.id];
    if (existingTile?.owner === selectedTeam) {
      return { canCapture: false, reason: 'owned' };
    }
    return { canCapture: true, reason: null };
  }, [selectedTeam, capturingTileId, capturedTiles]);

  const getRemainingTime = useCallback(() => {
    if (!captureStartTime || !targetDurationRef.current) return 0;
    const elapsed = Date.now() - captureStartTime;
    const remaining = targetDurationRef.current - elapsed;
    return Math.max(0, remaining);
  }, [captureStartTime]);

  return {
    isCapturing: !!capturingTileId,
    capturingTileId,
    captureProgress,
    startCapture,
    clearCaptureState,
    canCapture,
    getRemainingTime
  };
};
