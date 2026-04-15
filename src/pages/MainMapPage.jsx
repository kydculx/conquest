import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCaptureLogic } from '../hooks/useCaptureLogic';
import { TEAM_BLUE, UI_TEXT, MAP_CONFIG } from '../constants';
import { getTileInfo, hexToLatLng } from '../utils/geoUtils';
import { getSignalStatus } from '../utils/locationUtils';
import { MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import MapUpdater from '../components/map/MapUpdater';
import MapCenterTracker from '../components/map/MapCenterTracker';
import { bluePlayerIcon, redPlayerIcon } from '../components/map/MapIcons';
import TileScanOverlay from '../components/map/TileScanOverlay';
import ScoreHUD from '../components/map/ScoreHUD';
import CaptureButton from '../components/map/CaptureButton';
import RecentButton from '../components/map/RecentButton';
import PermissionDenied from '../components/map/PermissionDenied';
import './MainMapPage.css';

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

  const handleCapture = useCallback(() => {
    if (currentTile) {
      startCapture(currentTile);
      if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
    }
  }, [currentTile, startCapture]);

  const handleRecentClick = useCallback(() => {
    if (!isTrackingStarted) startTracking();
    setRecenterTrigger(prev => prev + 1);
  }, [isTrackingStarted, startTracking]);

  const playerIcon = selectedTeam === TEAM_BLUE.id ? bluePlayerIcon : redPlayerIcon;
  const defaultPosition = [37.5665, 126.9780];
  const effectivePosition = location || defaultPosition;
  const signal = getSignalStatus(accuracy);

  const getCaptureStatusText = () => {
    if (isCapturing) {
      return `점령 중... ${Math.round(captureProgress)}%`;
    }
    if (captureCheck.reason === 'signal') return UI_TEXT.statusSignalWeak;
    if (captureCheck.reason === 'owned' || isCapturedByMe) return UI_TEXT.statusReclaimed;
    if (captureCheck.reason === 'busy') return '진행 중...';
    if (isEnemyTile) return '점령하기';
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
    return !captureCheck.canCapture && !isCapturing;
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
            center={defaultPosition}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            minZoom={MAP_CONFIG.MIN_ZOOM}
            maxZoom={MAP_CONFIG.MAX_ZOOM}
            zoomControl={false}
            className="real-map-container"
          >
            <TileLayer
              attribution='&copy; CartoDB'
              url="https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
            />

            <MapCenterTracker onCenterTileChange={setCenterTile} />

            <MapUpdater center={location} recenterTrigger={recenterTrigger} />

            {location && accuracy && (
              <Circle
                center={location}
                radius={accuracy}
                pathOptions={{
                  color: 'transparent',
                  fillColor: signal.class === 'stable' ? '#00ff88' : '#ffd600',
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
                  color: selectedTeam === 'blue' ? '#00f0ff' : '#ff1744',
                  fillColor: 'transparent',
                  fillOpacity: 0,
                  weight: 1,
                  dashArray: '5, 5'
                }}
              />
            )}

            {Object.values(capturedTiles).map(tile => (
              <Polygon
                key={tile.id}
                positions={tile.bounds || tile.coords}
                pathOptions={{
                  color: 'transparent',
                  fillColor: tile.owner === TEAM_BLUE.id ? '#00f0ff' : '#ff1744',
                  fillOpacity: 0.35,
                  weight: 0
                }}
              />
            ))}

            {/* 현재 지도의 중앙(커서) 타일 테두리 */}
            {centerTile && (
              <Polygon
                key={`center-${centerTile.id}`}
                positions={centerTile.bounds}
                pathOptions={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fillColor: 'transparent',
                  weight: 2,
                  dashArray: null
                }}
              />
            )}

            <TileScanOverlay tile={currentTile} isCapturing={isCapturing} teamColor={selectedTeam} />

            <Marker position={effectivePosition} icon={playerIcon} />
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
