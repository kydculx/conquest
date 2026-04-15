import { useState, useEffect, useRef } from 'react';
import { smoothValue } from '../utils/locationUtils';
import { GPS_CONFIG } from '../constants';

/**
 * 실시간 GPS 위치 정보를 추적하고 관리하는 커스텀 훅
 * - 지수 이동 평균(EMA)을 사용하여 위치 변화를 부드럽게 보정합니다.
 * - 브라우저 권한 상태를 감시하고 마지막 위치를 로컬 스토리지에 유지합니다.
 */
export const useGeolocation = () => {
  // 위치 정보 상태 (위도, 경도) - 초기값은 로컬 스토리지에서 복구 시도
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('last_location');
    return saved ? JSON.parse(saved) : null;
  });

  // GPS 정확도 상태 (미터 단위)
  const [accuracy, setAccuracy] = useState(null);

  // 에러 발생 상태
  const [error, setError] = useState(null);

  // 데이터 로딩 중 상태
  const [loading, setLoading] = useState(true);

  // 브라우저 위치 권한 상태 ('granted', 'denied', 'prompt')
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // GPS 추적 활성화 여부 (사용자 제스처 연동용)
  const [isTrackingStarted, setIsTrackingStarted] = useState(false);

  // 부드러운 위치 이동을 위한 이전 값 보관용 Ref (리렌더링 방지)
  const smoothedRef = useRef(null);

  /**
   * GPS 추적을 수동으로 시작하는 함수
   * - 아이폰 등에서 사용자 클릭 이벤트와 연동하여 권한 팝업을 띄우기 위해 사용합니다.
   */
  const startTracking = () => {
    if (!isTrackingStarted) {
      setIsTrackingStarted(true);
    }
  };

  useEffect(() => {
    // 수동 시작 전이면 아무것도 하지 않음
    if (!isTrackingStarted) return;

    // 브라우저 지원 여부 확인
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보 서비스를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    // Permission API를 통한 권한 상태 실시간 감시
    if (navigator.permissions && navigator.permissions.query) {
      try {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setPermissionStatus(result.state);
          // 사용자 권한이 바뀌면 (예: 설정에서 차단 해제) 즉시 반영
          result.onchange = () => setPermissionStatus(result.state);
        }).catch(err => {
          console.warn('Permissions API query failed:', err);
        });
      } catch (err) {
        console.warn('Permissions API not fully supported:', err);
      }
    }

    // Wake Lock 관리 변수
    let wakeLock = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        } catch (err) {
          console.warn(`${err.name}, ${err.message}`);
        }
      }
    };

    if (isTrackingStarted) {
      requestWakeLock();
    }

    // 위치 정보 획득 성공 시 실행될 핸들러
    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      
      // 지나치게 낮은 정확도는 유효하지 않은 신호로 간주하여 무시
      if (acc > GPS_CONFIG.UNSTABLE_ACCURACY_THRESHOLD) {
        console.warn('Low accuracy detected. Skipping update:', acc);
        setAccuracy(acc); // UI에 신호 약함 노출을 위해 정확도는 업데이트
        return;
      }

      /**
       * 지수가중이동평균(EMA) 필터링
       * 가중치를 0.3으로 조정하여 모바일에서 더욱 부드러운 움직임을 구현 (기존 0.4)
       */
      const alpha = 0.3;
      const smoothLat = smoothValue(smoothedRef.current?.[0], latitude, alpha);
      const smoothLng = smoothValue(smoothedRef.current?.[1], longitude, alpha);
      
      const newLocation = [smoothLat, smoothLng];
      smoothedRef.current = newLocation;
      
      setLocation(newLocation);
      setAccuracy(acc);
      setError(null); // 성공 시 에러 초기화
      setLoading(false);
      
      localStorage.setItem('last_location', JSON.stringify(newLocation));
    };

    // 위치 정보 획득 실패 시 실행될 핸들러
    const handleError = (err) => {
      // 1. 사용자가 명시적으로 권한을 거부한 경우
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionStatus('denied');
        setError('위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.');
        setLoading(false);
      } else if (err.code === err.TIMEOUT) {
        // 타임아웃의 경우 loading을 끄지 않고 연결 시도 중임을 표시
        setError('위치 신호를 찾는 중입니다 (타임아웃)...');
      } else {
        setError(err.message);
        setLoading(false);
      }
    };

    // Geolocation 옵션 설정
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,           // 10초로 단축하여 더 빠른 상태 피드백 제공
      maximumAge: 0
    };

    // 실시간 위치 추적 시작
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // 컴포넌트 언마운트 또는 상태 변경 시 리소스 정리
    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
        });
      }
    };
  }, [isTrackingStarted]);

  return { 
    location, 
    accuracy, 
    error, 
    loading, 
    permissionStatus, 
    isTrackingStarted, 
    startTracking 
  };
};
