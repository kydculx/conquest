import { useState, useEffect, useRef } from 'react';
import { smoothValue } from '../utils/locationUtils';

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

  // 부드러운 위치 이동을 위한 이전 값 보관용 Ref (리렌더링 방지)
  const smoothedRef = useRef(null);

  useEffect(() => {
    // 브라우저 지원 여부 확인
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보 서비스를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    // Permission API를 통한 권한 상태 실시간 감시
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        // 사용자 권한이 바뀌면 (예: 설정에서 차단 해제) 즉시 반영
        result.onchange = () => setPermissionStatus(result.state);
      });
    }

    // 위치 정보 획득 성공 시 실행될 핸들러
    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      
      /**
       * 지수가중이동평균(EMA) 필터링
       * 튀는 데이터(Noise)를 억제하고 마커 이동을 부드럽게 만들기 위해 이전 좌표와 현재 좌표를 섞습니다.
       * 0.4(가중치)는 반응성과 부드러움 사이의 밸런스 값입니다.
       */
      const smoothLat = smoothValue(smoothedRef.current?.[0], latitude, 0.4);
      const smoothLng = smoothValue(smoothedRef.current?.[1], longitude, 0.4);
      
      const newLocation = [smoothLat, smoothLng];
      smoothedRef.current = newLocation;
      
      setLocation(newLocation);
      setAccuracy(acc);
      setLoading(false);
      
      // 기기 재부팅이나 브라우저 재시작 시 빠른 초기화를 위해 마지막 위치 저장
      localStorage.setItem('last_location', JSON.stringify(newLocation));
    };

    // 위치 정보 획득 실패 시 실행될 핸들러
    const handleError = (err) => {
      // 1. 사용자가 명시적으로 권한을 거부한 경우 상태 업데이트
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionStatus('denied');
      }
      
      // 2. 에러 메시지 업데이트 (위치 확인 불가, 타임아웃 등)
      setError(err.message);
      setLoading(false);
    };

    // Geolocation 옵션 설정
    const options = {
      enableHighAccuracy: true, // 고정밀 모드 사용 (GPS 하드웨어 직접 사용)
      timeout: 15000,           // 15초 이내에 응답이 없으면 에러 처리
      maximumAge: 0             // 캐시된 데이터 대신 항상 최신 데이터 요청
    };

    // 실시간 위치 추적 시작
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // 컴포넌트 언마운트 시 추적 중단 (배터리 및 메모리 절약)
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, accuracy, error, loading, permissionStatus };
};
