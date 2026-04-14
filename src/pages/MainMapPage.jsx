/**
 * Nexus Conquest 메인 전술 지도 페이지
 * - Leaflet 지도를 기반으로 실시간 점유 상태를 렌더링합니다.
 * - 사용자의 현재 위치를 타일 시스템(Grid)과 연동하여 점령 기능을 제공합니다.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Navigation, Flag, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { TEAM_BLUE, TEAM_RED, UI_TEXT, MAP_CONFIG } from '../constants';
import { getTileInfo } from '../utils/geoUtils';
import { getSignalStatus } from '../utils/locationUtils';
import { MapContainer, TileLayer, Marker, useMap, Rectangle, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MainMapPage.css';

/**
 * 플레이어용 전술 조준경 아이콘 설정 (Leaflet DivIcon)
 * @param {string} colorClass - 진영별 색상 클래스 (blue-marker / red-marker)
 */
const playerIconBase = (colorClass) => L.divIcon({
  className: `custom-leaflet-icon player-marker-transition`,
  html: `
    <div class="marker-wrapper ${colorClass}">
      <div class="marker-reticle"></div>
      <div class="marker-pulse"></div>
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const bluePlayerIcon = playerIconBase('blue-marker');
const redPlayerIcon = playerIconBase('red-marker');

/**
 * 지도 시점 및 이동을 전담하는 내부 컴포넌트
 * - 최초 로드 시 사용자 위치로 즉시 이동합니다.
 * - '내 위치' 버튼 클릭 시 flyTo 애니메이션을 실행합니다.
 */
const MapUpdater = ({ center, recenterTrigger }) => {
  const map = useMap();
  const isFirstLoad = React.useRef(true);

  // 최초 위치 획득 시 1회 빠른 이동
  useEffect(() => {
    if (center && isFirstLoad.current) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
      isFirstLoad.current = false;
    }
  }, [center, map]);

  // '내 위치' 버튼 클릭(trigger 변경) 시 부드럽게 이동
  useEffect(() => {
    if (center && recenterTrigger > 0) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
    }
  }, [recenterTrigger, map]);

  return null;
};

const MainMapPage = () => {
  const navigate = useNavigate();
  // 게임 전역 상태 및 GPS 추적 훅 사용
  const { selectedTeam, score, capturedTiles, captureTile } = useGame();
  const { location, accuracy, error, loading, permissionStatus } = useGeolocation();
  
  // 현재 위치한 타일 및 점령 중 여부 상태
  const [currentTile, setCurrentTile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  /**
   * 햅틱 피드백(진동) 실행 함수
   */
  const triggerHaptic = (pattern = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // 팀 선택이 안 된 경우 초기 화면으로 리다이렉트
  useEffect(() => {
    if (!selectedTeam) {
      navigate('/');
    }
  }, [selectedTeam, navigate]);

  /**
   * 실시간 현재 위치 타일 인덱싱
   * 위도/경도가 바뀔 때마다 사용자가 딛고 있는 100m 그리드 타일을 계산합니다.
   */
  useEffect(() => {
    if (location) {
      const tile = getTileInfo(location[0], location[1]);
      setCurrentTile(tile);
    }
  }, [location]);

  // 현재 타일의 점령 소유주 확인
  const tileStatus = useMemo(() => {
    if (!currentTile) return null;
    return capturedTiles[currentTile.id] || null;
  }, [currentTile, capturedTiles]);

  const isCapturedByMe = tileStatus?.owner === selectedTeam;

  /**
   * 점령 버튼 클릭 시 실행되는 핵심 로직
   * 1. 점령 가능 조건 확인 (정확도 50m 이내, 중복 점령 방지 등)
   * 2. 가짜 로딩(스캐닝 연출) 후 DB 업데이트
   */
  const handleCapture = () => {
    if (!currentTile || isCapturing || isCapturedByMe || (accuracy && accuracy > 50)) {
      if (accuracy > 50) triggerHaptic(100); // 신호 불량 시 짧은 경고 진동
      return;
    }

    triggerHaptic([30, 50, 30]); // 점령 시작 시퀀스 진동
    setIsCapturing(true);

    // 전술적 긴장감을 위한 1.5초 스캐닝 지연 효과
    setTimeout(() => {
      captureTile(currentTile);
      setIsCapturing(false);
    }, 1500);
  };

  // 렌더링용 변수 설정
  const playerIcon = selectedTeam === TEAM_BLUE.id ? bluePlayerIcon : redPlayerIcon;
  const defaultPosition = [37.5665, 126.9780]; // 기본 서울시청 위치 (GPS 미작동 시)
  const effectivePosition = location || defaultPosition;
  const signal = getSignalStatus(accuracy);

  /**
   * [권한 거부 대응]
   * 위치 권한이 없는 경우 안내 메시지와 시스템 재시도 버튼만 표시합니다.
   */
  if (permissionStatus === 'denied') {
    return (
      <div className="status-overlay">
        <div className="warning-card hud-panel">
          <ShieldAlert size={64} color="#ff003c" className="animate-pulse" />
          <h2 className="glitch-text">{UI_TEXT.permissionDenied}</h2>
          <div className="permission-guide">
            <p>1. 주소창의 <b>자물쇠 아이콘</b>을 클릭하세요.</p>
            <p>2. 위치 권한을 <b>'허용'</b>으로 변경해 주세요.</p>
            <p>3. 인앱 브라우저라면 <b>'다른 브라우저로 열기'</b>를 권장합니다.</p>
          </div>
          <button className="tactical-btn active" onClick={() => window.location.reload()}>
            시스템 재동기화
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-page team-${selectedTeam}`}>
      {/* 1. 좌표 정보 HUD (상단 왼쪽) */}
      <div className="coord-floating-ui hud-panel">
        <div className="coord-item">
          <span className="coord-label">{UI_TEXT.latLabel}:</span>
          <span className="coord-value">{location ? location[0].toFixed(3) : '---'}</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">{UI_TEXT.lngLabel}:</span>
          <span className="coord-value">{location ? location[1].toFixed(3) : '---'}</span>
        </div>
      </div>

      {/* 2. 전역 팀 스코어 HUD (상단 중앙) */}
      <div className="score-floating-ui hud-panel">
        <div className="score-section">
          <span className="blue-score">{score.blue}</span>
          <span className="divider">:</span>
          <span className="red-score">{score.red}</span>
        </div>
      </div>

      {/* 3. 메인 전술 지도 (Leaflet) */}
      <div className="map-view">
        <div className="tactical-overlay-container">
          <div className="tactical-overlay"></div> {/* 스캔 라인 오버레이 */}
          
          <MapContainer
            center={defaultPosition}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            minZoom={MAP_CONFIG.MIN_ZOOM}
            maxZoom={MAP_CONFIG.MAX_ZOOM}
            zoomControl={false}
            className="real-map-container"
          >
            {/* 기본 위성/지도 타일 및 다크 필터링 적용 */}
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark-map-tiles"
            />

            {/* 지도 이동 및 시점 업데이트 컨디셔널 렌더링 */}
            {location && <MapUpdater center={location} recenterTrigger={recenterTrigger} />}

            {/* GPS 오차 범위(정확도) 가시화 Circle */}
            {location && accuracy && (
              <Circle
                center={location}
                radius={accuracy}
                pathOptions={{
                  color: signal.class === 'stable' ? '#00d2ff' : '#ffea00',
                  fillColor: signal.class === 'stable' ? '#00d2ff' : '#ffea00',
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: '3, 6'
                }}
              />
            )}

            {/* 점령된 모든 타일을 사각형(Rectangle)으로 지도에 렌더링 */}
            {Object.values(capturedTiles).map(tile => (
              <Rectangle
                key={tile.id}
                bounds={tile.bounds}
                pathOptions={{
                  color: tile.owner === TEAM_BLUE.id ? '#00d2ff' : '#ff003c',
                  fillColor: tile.owner === TEAM_BLUE.id ? '#00d2ff' : '#ff003c',
                  fillOpacity: 0.4,
                  weight: 1
                }}
              />
            ))}

            {/* 플레이어가 현재 위치한 1 타일을 흰색 점선으로 강조 */}
            {currentTile && (
              <Rectangle
                bounds={currentTile.bounds}
                pathOptions={{
                  color: '#fff',
                  fillColor: 'transparent',
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* 플레이어 실시간 위치 마커 */}
            <Marker position={effectivePosition} icon={playerIcon} />
          </MapContainer>
        </div>

        {/* 지도 정가운데 전술 조준경(고정UI) */}
        <div className="crosshair-center">
          <Crosshair size={40} className={`active-target ${isCapturing ? 'capturing' : 'animate-pulse'}`} />
        </div>
      </div>

      {/* 4. 내 위치 보기 플로팅 버튼 */}
      <button
        className="recenter-btn"
        onClick={() => setRecenterTrigger(prev => prev + 1)}
        title={UI_TEXT.recenterBtn}
      >
        <Navigation size={24} />
      </button>

      {/* 5. 점령/스캐닝 실행 캡슐 버튼 (중앙 하단) */}
      <div
        className={`capture-overlay-btn team-${selectedTeam} ${isCapturing ? 'loading' : ''} ${!currentTile || isCapturedByMe || (accuracy > 50) ? 'disabled' : ''}`}
        onClick={handleCapture}
      >
        <div className="btn-glow"></div>
        <div className="btn-content">
          <Flag size={24} fill="currentColor" />
          <span>
            {isCapturing ? UI_TEXT.statusSyncing :
              accuracy > 50 ? UI_TEXT.statusSignalWeak :
                isCapturedByMe ? UI_TEXT.statusReclaimed : UI_TEXT.statusCapture}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainMapPage;
