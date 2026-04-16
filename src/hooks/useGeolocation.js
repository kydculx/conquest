import { useState, useEffect, useRef } from 'react';
import { smoothValue } from '../utils/locationUtils';
import { GPS_CONFIG, GAME_CONFIG, UI_TEXT } from '../constants';

/**
 * 실시간 GPS 위치 정보를 추적하고 관리하는 커스텀 훅
 * @returns {Object} {
 *   location: [number, number] | null, // [위도, 경도]
 *   accuracy: number | null,            // 오차 범위(m)
 *   error: string | null,               // 에러 메시지
 *   loading: boolean,                   // 초기 로딩 상태
 *   permissionStatus: string,           // 권한 상태 ('granted', 'denied', 'prompt')
 *   isTrackingStarted: boolean,         // 추적 시작 여부
 *   startTracking: Function             // 추적 시작 트리거 함수
 * }
 */
export const useGeolocation = () => {
  // 1. 상태 관리
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('last_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isTrackingStarted, setIsTrackingStarted] = useState(false);

  // EMA 필터링 및 리소스 정리를 위한 Ref
  const smoothedRef = useRef(null);
  const wakeLockRef = useRef(null);

  /**
   * GPS 추적 수동 시작 (iOS 등 사용자 액션 기반 권한 요청 대응)
   */
  const startTracking = () => {
    if (!isTrackingStarted) setIsTrackingStarted(true);
  };

  /**
   * Wake Lock 요청 (화면 꺼짐 방지)
   */
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  };

  useEffect(() => {
    if (!isTrackingStarted) return;

    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보 서비스를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    // 2. 권한 상태 실시간 감시 (Permissions API)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state);
          result.onchange = () => setPermissionStatus(result.state);
        });
    }

    // 화면 꺼짐 방지 시작
    requestWakeLock();

    /**
     * 위치 정보 수신 성공 핸들러
     * - EMA(Exponential Moving Average) 필터를 사용하여 위치 튐 현상을 방지합니다.
     */
    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      
      // 신호가 너무 불안정하면 무시 (단, UI 표시를 위해 정확도는 갱신)
      if (acc > GPS_CONFIG.UNSTABLE_ACCURACY_THRESHOLD) {
        setAccuracy(acc);
        return;
      }

      // 보정 계수 (낮을수록 부드럽지만 반응은 느려짐)
      const alpha = GAME_CONFIG.EMA_ALPHA;
      const smoothLat = smoothValue(smoothedRef.current?.[0], latitude, alpha);
      const smoothLng = smoothValue(smoothedRef.current?.[1], longitude, alpha);
      
      const newLocation = [smoothLat, smoothLng];
      smoothedRef.current = newLocation;
      
      setLocation(newLocation);
      setAccuracy(acc);
      setError(null);
      setLoading(false);
      
      localStorage.setItem('last_location', JSON.stringify(newLocation));
    };

    /**
     * 위치 정보 수신 실패 핸들러
     * - 권한 거부와 일시적 신호 장애를 구분하여 처리합니다.
     */
    const handleError = (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        // 실제 권한 상태를 재확인하여 오보를 방지
        if (navigator.permissions) {
          navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'denied') {
              setPermissionStatus('denied');
              setError(UI_TEXT.statusSignalWeak);
            }
          });
        }
        setLoading(false);
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError("위치 신호를 일시적으로 수신할 수 없거나 기기 위치 서비스가 꺼져 있습니다.");
        setLoading(false);
      } else if (err.code === err.TIMEOUT) {
        setError(UI_TEXT.gpsSearching);
      } else {
        setError(err.message || UI_TEXT.statusSignalWeak);
        setLoading(false);
      }
    };

    // 3. 위치 추적 시작
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: GAME_CONFIG.SYSTEM.GPS_TIMEOUT,
      maximumAge: 0
    });

    // 4. 리소스 정리
    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => { wakeLockRef.current = null; });
      }
    };
  }, [isTrackingStarted]);

  return { 
    location, accuracy, error, loading, 
    permissionStatus, isTrackingStarted, startTracking 
  };
};
