/**
 * "CONQUEST" 어플리케이션의 핵심 페이지: 메인 전술 지도 화면
 * - 실시간 GPS 추적, 헥사곤 그리드 기반 영토 렌더링, 점령 인터페이스를 총괄합니다.
 */
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCaptureLogic } from '../hooks/useCaptureLogic';
import { TEAM_BLUE, TEAM_RED, UI_TEXT, MAP_CONFIG, MAP_THEMES, GAME_CONFIG } from '../constants';
import { getTileInfo } from '../utils/geoUtils';
import { getSignalStatus } from '../utils/locationUtils';
import { MapContainer, TileLayer, Marker, Polygon, Circle } from 'react-leaflet';

import MapUpdater from '../components/map/MapUpdater';
import { bluePlayerIcon, redPlayerIcon } from '../components/map/MapIcons';
import TileScanOverlay from '../components/map/TileScanOverlay';
import ScoreHUD from '../components/map/ScoreHUD';
import CaptureButton from '../components/map/CaptureButton';
import RecentButton from '../components/map/RecentButton';
import TerritoryGrid from '../components/map/TerritoryGrid';
import MapThemeSwitcher from '../components/map/MapThemeSwitcher';
import TerritoryList from '../components/map/TerritoryList';
import CenterTileLayer from '../components/map/CenterTileLayer';
import CapturedTilesLayer from '../components/map/CapturedTilesLayer';
import PermissionDenied from '../components/map/PermissionDenied';
import './MainMapPage.css';
/**
 * 전술 지도 메인 컴포넌트
 */
const MainMapPage = () => {
  const navigate = useNavigate();
  
  // 1. 전역 게임 상태 및 위치 정보 훅 연결
  const { selectedTeam, score, capturedTiles, mapThemeId } = useGame();
  const { 
    location, accuracy, error, permissionStatus, 
    isTrackingStarted, startTracking 
  } = useGeolocation();
  
  // 2. 점령 비즈니스 로직 훅 연결
  const { 
    isCapturing, captureProgress, startCapture, canCapture 
  } = useCaptureLogic();

  // 3. 로컬 UI 상태 (지도 재중심화 트리거, 현재 지도 중앙 타일)
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [centerTile, setCenterTile] = useState(null);

  useEffect(() => {
    if (!selectedTeam) navigate('/', { replace: true });
  }, [selectedTeam, navigate]);

  if (!selectedTeam) return null;

  const currentTile = useMemo(() => {
    if (!location) return null;
    return getTileInfo(location[0], location[1]);
  }, [location]);

  const tileStatus = useMemo(() => {
    if (!currentTile) return null;
    return capturedTiles[currentTile.id] || null;
  }, [currentTile, capturedTiles]);

  const isCapturedByMe = tileStatus?.owner === selectedTeam;
  const captureCheck = canCapture(currentTile, accuracy);
  const isEnemyTile = currentTile && tileStatus && tileStatus.owner && tileStatus.owner !== selectedTeam;

  // 4. 전술적 타겟 정렬 확인 (GPS 위치와 지도 중앙 십자선 일치 여부)
  const isTargetAligned = currentTile && centerTile && currentTile.id === centerTile.id;

  const handleCapture = useCallback(() => {
    if (currentTile) {
      startCapture(currentTile);
      if ('vibrate' in navigator) navigator.vibrate(GAME_CONFIG.CAPTURE.VIBRATION_PATTERN);
    }
  }, [currentTile, startCapture]);

  const handleRecentClick = useCallback(() => {
    if (!isTrackingStarted) startTracking();
    setRecenterTrigger(prev => prev + 1);
  }, [isTrackingStarted, startTracking]);

  // 플레이어 아이콘 및 위치 설정
  const playerIcon = selectedTeam === TEAM_BLUE.id ? bluePlayerIcon : redPlayerIcon;
  const effectivePosition = location || MAP_CONFIG.DEFAULT_POSITION;
  const signal = getSignalStatus(accuracy);

  const getCaptureStatusText = () => {
    if (isCapturing) {
      return `${UI_TEXT.statusCapturingBase} ${Math.round(captureProgress)}%`;
    }
    // 조준 정렬이 되지 않은 경우를 우선적으로 안내
    if (currentTile && !isTargetAligned) return UI_TEXT.statusTargetMismatch;
    
    if (captureCheck.reason === 'signal') return UI_TEXT.statusSignalWeak;
    if (captureCheck.reason === 'owned' || isCapturedByMe) return UI_TEXT.statusReclaimed;
    if (captureCheck.reason === 'busy') return UI_TEXT.statusProcessing;
    if (isEnemyTile) return UI_TEXT.statusCaptureReady;
    return UI_TEXT.statusCapture;
  };

  const getCaptureStatusType = () => {
    if (isCapturing) return 'busy';
    if (captureCheck.reason === 'signal') return 'warning';
    if (isCapturedByMe) return 'secured';
    if (captureCheck.canCapture) return 'ready';
    return 'default';
  };

  const getCaptureDisabled = () => {
    // 1. 이미 점령 중이면 버튼을 누를 수 있음 (진행 상황 확인용) - 사실상 비활성화 대신 텍스트로 표현 가능
    if (isCapturing) return false;
    
    // 2. 점령 가능 상태가 아니거나, 타겟 조준이 정렬되지 않았으면 비활성화
    return !captureCheck.canCapture || !isTargetAligned;
  };

  // 실제 권한이 거부되었고, 캐시된 위치 정보조차 없는 경우에만 차단 화면 노출
  // 이미 위치 정보가 있다면 신호가 불안정하더라도 지도를 계속 보여줌
  if (permissionStatus === 'denied' && !location) {
    return <PermissionDenied />;
  }

  return (
    <div className={`map-page team-${selectedTeam} ${isCapturing ? 'is-capturing' : ''}`}>
      <div className="scanline-overlay"></div>
      
      <ScoreHUD score={score} />
      
      {/* GPS 상태 인디케이터 */}
      <div className={`gps-status-bar ${signal.class} ${error ? 'has-error' : ''}`}>
        <div className="status-dot"></div>
        <span className="status-label">{error || signal.label}</span>
        {accuracy && <span className="accuracy-value">±{Math.round(accuracy)}m</span>}
      </div>

      <div className="map-view">
        <div className="tactical-overlay-container">
          <MapContainer
            center={MAP_CONFIG.DEFAULT_POSITION}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            minZoom={MAP_CONFIG.MIN_ZOOM}
            maxZoom={MAP_CONFIG.MAX_ZOOM}
            zoomControl={false}
            preferCanvas={true}
            className="real-map-container"
          >
            <TileLayer
              attribution={MAP_THEMES[mapThemeId]?.attribution || MAP_THEMES.dark.attribution}
              url={MAP_THEMES[mapThemeId]?.url || MAP_THEMES.dark.url}
            />


            <MapUpdater center={location} recenterTrigger={recenterTrigger} />

            {/* 최적화 레이어: 이동 중 숨김 및 상태 격리 적용 */}
            <TerritoryGrid />
            <CapturedTilesLayer />
            <CenterTileLayer onTileChange={setCenterTile} />

            {location && accuracy && (
              <Circle
                center={location}
                radius={accuracy}
                pathOptions={{
                  color: GAME_CONFIG.COLORS.TRANSPARENT,
                  fillColor: signal.class === 'stable' ? GAME_CONFIG.COLORS.SIGNAL_STABLE : GAME_CONFIG.COLORS.SIGNAL_UNSTABLE,
                  fillOpacity: 0.08,
                  weight: 0
                }}
              />
            )}

            {currentTile && (
              <Polygon
                key={`current-${currentTile.id}`}
                positions={currentTile.bounds || currentTile.coords}
                pathOptions={{
                  color: selectedTeam === TEAM_BLUE.id ? GAME_CONFIG.COLORS.TEAM_BLUE : GAME_CONFIG.COLORS.TEAM_RED,
                  fillColor: GAME_CONFIG.COLORS.TRANSPARENT,
                  fillOpacity: 0,
                  weight: 1,
                  dashArray: '5, 5',
                  smoothFactor: 0
                }}
              />
            )}

            <TileScanOverlay tile={currentTile} isCapturing={isCapturing} teamColor={selectedTeam} />

            <Marker position={effectivePosition} icon={playerIcon} />
            <TerritoryList />
          </MapContainer>
        </div>

        {/* 정중앙 전술 십자선 */}
        <div className="crosshair-center">
          <div className="crosshair-outer"></div>
          <div className="crosshair-inner">
            <Crosshair size={32} className={`active-target ${isCapturing ? 'capturing' : ''}`} />
          </div>
        </div>
      </div>

      <RecentButton onClick={handleRecentClick} />

      <MapThemeSwitcher />

      <CaptureButton
        team={selectedTeam}
        isCapturing={isCapturing}
        statusType={getCaptureStatusType()}
        onClick={handleCapture}
        statusText={getCaptureStatusText()}
        disabled={getCaptureDisabled()}
      />
    </div>
  );
};

export default MainMapPage;
