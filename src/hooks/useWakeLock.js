import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Screen Wake Lock API를 사용하여 화면 꺼짐을 방지하는 커스텀 훅
 * - 모바일 환경에서 백그라운드 GPS 추적(화면 유지형)을 가능하게 합니다.
 */
export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState('wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef(null);

  // 1. Wake Lock 요청 함수
  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    try {
      if (wakeLockRef.current !== null) return; // 이미 활성화됨

      const lock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = lock;
      setIsActive(true);

      // 브라우저에 의해 락이 해제되었을 때 이벤트 리스너
      lock.addEventListener('release', () => {
        console.log('[Wake Lock] Screen Wake Lock was released');
        wakeLockRef.current = null;
        setIsActive(false);
      });

      console.log('[Wake Lock] Screen Wake Lock is active');
    } catch (err) {
      console.error(`[Wake Lock] Failed to request: ${err.name}, ${err.message}`);
      setIsActive(false);
    }
  }, [isSupported]);

  // 2. Wake Lock 해제 함수
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // 3. 브라우저 탭 포커스 변경 시 처리 (탭 재진입 시 다시 요청)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [requestWakeLock]);

  // 4. 컴포넌트 언마운트 시 자동 해제
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock
  };
};
