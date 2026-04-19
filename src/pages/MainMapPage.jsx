/**
 * "COLOR CONQUEST" 어플리케이션의 핵심 페이지: 메인 모험 지도 화면
 * - 실시간 GPS 추적, 헥사곤 그리드 기반 컬러링 인터페이스를 총괄합니다.
 */
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Target, Map as MapIcon } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCaptureLogic } from '../hooks/useCaptureLogic';
import { useWakeLock } from '../hooks/useWakeLock';
import { TEAM_BLUE, TEAM_RED, UI_TEXT, MAP_CONFIG, GAME_CONFIG } from '../constants';
import { getTileInfo } from '../utils/geoUtils';
import { MapContainer, Marker, Circle } from 'react-leaflet';

import MapUpdater from '../components/map/MapUpdater';
import { bluePlayerIcon, redPlayerIcon } from '../components/map/MapIcons';
import TileScanOverlay from '../components/map/TileScanOverlay';
import ScoreHUD from '../components/map/ScoreHUD';
import CaptureButton from '../components/map/CaptureButton';
import RecentButton from '../components/map/RecentButton';
import MapThemeSwitcher from '../components/map/MapThemeSwitcher';
import CenterTileLayer from '../components/map/CenterTileLayer';
import TacticalDataModal from '../components/map/TacticalDataModal';
import CapturedTilesLayer from '../components/map/CapturedTilesLayer';
import { useMap } from 'react-leaflet';
import PermissionDenied from '../components/map/PermissionDenied';
import TacticalHubsLayer from '../components/map/TacticalHubsLayer';
import AutoCaptureEngine from '../components/map/AutoCaptureEngine';
import AutoCaptureToggle from '../components/map/AutoCaptureToggle';
import './MainMapPage.css';

/**
 * 모험 지도 메인 컴포넌트
 */
const MainMapPage = () => {
  const navigate = useNavigate();

  // 1. 전역 게임 상태 및 위치 정보 훅 연결
  const { selectedTeam, score, capturedTiles, autoCaptureEnabled } = useGame();
  const {
    location, accuracy, error, permissionStatus,
    isTrackingStarted, startTracking, isMocking
  } = useGeolocation();

  // 2. 점령 비즈니스 로직 훅 연결
  const {
    isCapturing, captureProgress, startCapture, canCapture
  } = useCaptureLogic();

  // 3. 화면 유지(Wake Lock) 훅 연결
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // 4. 로컬 UI 상태
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [centerTile, setCenterTile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(MAP_CONFIG.DEFAULT_ZOOM);

  /**
   * 지도 객체를 상위 상태로 추출하기 위한 내부 헬퍼 컴포넌트
   */
  const MapInstanceGetter = () => {
    const map = useMap();
    useEffect(() => {
      if (map) {
        setMapInstance(map);

        // 줌 레벨 추적 이벤트 등록
        const onZoom = () => setCurrentZoom(map.getZoom());
        map.on('zoomend', onZoom);
        return () => map.off('zoomend', onZoom);
      }
    }, [map]);
    return null;
  };

  const currentTile = useMemo(() => {
    if (!location) return null;
    return getTileInfo(location[0], location[1]);
  }, [location]);

  const tileStatus = useMemo(() => {
    if (!currentTile) return null;
    return capturedTiles[currentTile.id] || null;
  }, [currentTile, capturedTiles]);

  const handleCapture = useCallback(() => {
    if (currentTile) {
      startCapture(currentTile);
      if ('vibrate' in navigator) navigator.vibrate(GAME_CONFIG.CAPTURE.VIBRATION_PATTERN);
    }
  }, [currentTile, startCapture]);

  const handleRecentClick = useCallback(() => {
    startTracking(); // 에러 초기화 및 재시도 포함
    setRecenterTrigger(prev => prev + 1);
  }, [startTracking]);

  useEffect(() => {
    if (!selectedTeam) navigate('/', { replace: true });
  }, [selectedTeam, navigate]);

  if (!selectedTeam) return null;

  const isCapturedByMe = tileStatus?.owner === selectedTeam;
  const captureCheck = canCapture(currentTile, accuracy);
  const isEnemyTile = currentTile && tileStatus && tileStatus.owner && tileStatus.owner !== selectedTeam;
  const isTargetAligned = currentTile && centerTile && currentTile.id === centerTile.id;

  // 플레이어 아이콘 및 위치 설정
  const playerIcon = selectedTeam === TEAM_BLUE.id ? bluePlayerIcon : redPlayerIcon;
  const effectivePosition = location || MAP_CONFIG.DEFAULT_POSITION;

  const getCaptureStatusText = () => {
    if (isCapturing) {
      return `${UI_TEXT.btnCapturing} ${Math.round(captureProgress)}%`;
    }

    if (captureCheck.reason === 'owned' || isCapturedByMe) {
      return UI_TEXT.statusReclaimed;
    }
    if (captureCheck.reason === 'busy') return UI_TEXT.statusProcessing;

    return UI_TEXT.btnStartCapture;
  };

  const getCaptureStatusType = () => {
    if (isCapturing) return 'busy';
    if (captureCheck.reason === 'signal') return 'warning';
    if (isCapturedByMe) return 'secured';
    if (captureCheck.canCapture) return 'ready';
    return 'default';
  };

  const getCaptureDisabled = () => {
    if (isCapturing) return false;
    return !captureCheck.canCapture;
  };

  // 자동 점령 활성화 시 화면 유지 강제
  useEffect(() => {
    if (autoCaptureEnabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [autoCaptureEnabled, requestWakeLock, releaseWakeLock]);

  if (permissionStatus === 'denied' && !location) {
    return <PermissionDenied />;
  }

  return (
    <div className={`map-page team-${selectedTeam} ${isCapturing ? 'is-capturing' : ''}`}>
      {/* 글로벌 전술 오버레이 (스캔라인/그리드) */}
      <div className="global-tactical-overlay"></div>

      {/* HUD 상단: 스코어 */}
      <ScoreHUD score={score} />

      <div className="adventure-map-view">
        <MapContainer
          center={MAP_CONFIG.DEFAULT_POSITION}
          zoom={MAP_CONFIG.DEFAULT_ZOOM}
          minZoom={MAP_CONFIG.MIN_ZOOM}
          maxZoom={MAP_CONFIG.MAX_ZOOM}
          zoomControl={false}
          tap={false}
          preferCanvas={true}
          className="cartoon-map-container"
        >

          <MapUpdater center={location} recenterTrigger={recenterTrigger} />
          <CapturedTilesLayer zoom={currentZoom} />
          <TacticalHubsLayer zoom={currentZoom} />
          <CenterTileLayer onTileChange={setCenterTile} zoom={currentZoom} />

          <AutoCaptureEngine
            location={location}
            tileId={currentTile?.id}
            canCapture={captureCheck}
            isTargetAligned={isTargetAligned}
            isCapturing={isCapturing}
            onCapture={handleCapture}
          />


          <Marker position={effectivePosition} icon={playerIcon} />
          <MapInstanceGetter />
        </MapContainer>
      </div>

      {/* 팝한 타켓 가이드 (Crosshair 적용) */}
      <div className="adventure-target-guide">
        <div className="target-ring"></div>
        <div className="target-center">
          <Crosshair size={36} className={`target-icon ${isCapturing ? 'spinning' : ''}`} />
        </div>
      </div>

      {/* 구역 목록 모달 */}
      <TacticalDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        map={mapInstance}
      />

      {/* 상태 안내 말풍선 영역 */}
      <div className="floating-status-balloon">
        <div className={`balloon-content ${getCaptureStatusType()}`}>
          {getCaptureStatusText()}
        </div>
      </div>

      {/* 하단 통합 컨트롤 바 (Pop Dock) */}
      <div className="pop-control-dock">
        <div className="dock-section side">
          <RecentButton onClick={handleRecentClick} />
          <button
            className="adventure-list-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <MapIcon size={24} />
          </button>
        </div>

        <div className="dock-section center">
          <CaptureButton
            team={selectedTeam}
            isCapturing={isCapturing}
            statusType={getCaptureStatusType()}
            onClick={handleCapture}
            statusText="점령하기"
            disabled={getCaptureDisabled()}
          />
        </div>

        <div className="dock-section side settings">
          <AutoCaptureToggle />
        </div>
      </div>
    </div>
  );
};

export default MainMapPage;
