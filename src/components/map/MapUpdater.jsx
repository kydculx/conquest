/**
 * 지도의 시각적 위치 업데이트를 제어하는 컴포넌트
 * - 초기 로딩 시 플레이어 위치로 지도를 이동시키고, '내 위치로' 버튼 클릭 시 재중심화를 담당합니다.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_CONFIG } from '../../constants';

/**
 * 지도 업데이트 관리 컴포넌트
 * @param {Array|null} center - 지도 중심에 위치할 [위도, 경도] 좌표
 * @param {number} recenterTrigger - 재중심화를 강제 실행하기 위한 카운터 트리거
 */
const MapUpdater = ({ center, recenterTrigger }) => {
  const map = useMap();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (center && isFirstLoad.current) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
      isFirstLoad.current = false;
    }
  }, [center, map]);

  useEffect(() => {
    if (center && recenterTrigger > 0) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
    }
  }, [recenterTrigger, center, map]);

  return null;
};

export default MapUpdater;
