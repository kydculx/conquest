import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Navigation, Target, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import { getTileInfo } from '../utils/geoUtils';
import { getSignalStatus } from '../utils/locationUtils';
import { MapContainer, TileLayer, Marker, useMap, Rectangle, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MainMapPage.css';

// Special icon for player with radar effect
const playerIconBase = (colorClass) => L.divIcon({
  className: `custom-leaflet-icon player-marker-transition`,
  html: `
    <div class="marker-wrapper ${colorClass}">
      <div class="player-radar"></div>
      <div class="ring ring-outer" style="animation-duration: 4s"></div>
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const bluePlayerIcon = playerIconBase('blue-marker');
const redPlayerIcon = playerIconBase('red-marker');

// Component to fly to the user's location when acquired
const MapUpdater = ({ center, recenterTrigger }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 18, { animate: true, duration: 1.5 });
    }
  }, [center, recenterTrigger, map]);
  return null;
};

const MainMapPage = () => {
  const navigate = useNavigate();
  const { selectedTeam, score, capturedTiles, captureTile } = useGame();
  const { location, accuracy, error, loading, permissionStatus } = useGeolocation();
  const [currentTile, setCurrentTile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const triggerHaptic = (pattern = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (!selectedTeam) {
      navigate('/');
    }
  }, [selectedTeam, navigate]);

  // 현재 있는 타일 계산
  useEffect(() => {
    if (location) {
      const tile = getTileInfo(location[0], location[1]);
      setCurrentTile(tile);
    }
  }, [location]);

  const tileStatus = useMemo(() => {
    if (!currentTile) return null;
    return capturedTiles[currentTile.id] || null;
  }, [currentTile, capturedTiles]);

  const isCapturedByMe = tileStatus?.owner === selectedTeam;

  const handleCapture = () => {
    if (!currentTile || isCapturing || isCapturedByMe || (accuracy && accuracy > 50)) {
      if (accuracy > 50) triggerHaptic(100);
      return;
    }

    triggerHaptic([30, 50, 30]);
    setIsCapturing(true);
    setTimeout(() => {
      captureTile(currentTile);
      setIsCapturing(false);
    }, 1500);
  };

  const playerIcon = selectedTeam === TEAM_BLUE.id ? bluePlayerIcon : redPlayerIcon;
  const defaultPosition = [37.5665, 126.9780];
  const effectivePosition = location || defaultPosition;
  const signal = getSignalStatus(accuracy);

  // Permission warning UI
  if (permissionStatus === 'denied') {
    return (
      <div className="status-overlay">
        <ShieldAlert size={64} color="#ff003c" />
        <h2>{UI_TEXT.permissionDenied}</h2>
        <p>{UI_TEXT.permissionHint}</p>
        <button className="auth-btn" onClick={() => window.location.reload()}>{UI_TEXT.retrySync}</button>
      </div>
    );
  }

  return (
    <div className={`map-page team-${selectedTeam}`}>
      {/* 좌표 정보 플로팅 UI - 왼쪽 상단 */}
      <div className="coord-floating-ui">
        <div className="coord-item">
          <span className="coord-label">{UI_TEXT.latLabel}:</span>
          <span className="coord-value">{location ? location[0].toFixed(6) : '---'}</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">{UI_TEXT.lngLabel}:</span>
          <span className="coord-value">{location ? location[1].toFixed(6) : '---'}</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">{UI_TEXT.accLabel}:</span>
          <span className={`coord-value ${signal.class}`}>
            {accuracy ? `±${accuracy.toFixed(1)}M` : UI_TEXT.calibrating}
          </span>
        </div>
      </div>

      {/* 점수 및 상태 UI - 상단 중앙 */}
      <div className="score-floating-ui">
        <div className="score-section">
          <span className="blue-score">{score.blue}</span>
          <span className="divider">:</span>
          <span className="red-score">{score.red}</span>
        </div>
        <div className={`sat-status status-${signal.class}`}>
          {accuracy ? <Wifi size={14} /> : <WifiOff size={14} className="animate-pulse" />}
          <span className="sat-value">{signal.label}</span>
        </div>
      </div>

      <div className="map-view">
        <MapContainer
          center={defaultPosition}
          zoom={16}
          zoomControl={false}
          className="real-map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-map-tiles"
          />

          {location && <MapUpdater center={location} recenterTrigger={recenterTrigger} />}

          {/* 오차 범위 Circle */}
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

          {/* 점령된 타일들 표시 */}
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

          {/* 현재 타일 하이라이트 */}
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

          {/* Player Marker */}
          <Marker position={effectivePosition} icon={playerIcon} />
        </MapContainer>

        <div className="crosshair-center">
          <Crosshair size={40} className={`active-target ${isCapturing ? 'capturing' : 'animate-pulse'}`} />
        </div>
      </div>

      {/* 내 위치 재설정 버튼 */}
      <button
        className="recenter-btn"
        onClick={() => setRecenterTrigger(prev => prev + 1)}
        title={UI_TEXT.recenterBtn}
      >
        <Navigation size={24} />
      </button>

      {/* 점령 액션 버튼 - 중앙 하단 */}
      <div
        className={`capture-overlay-btn team-${selectedTeam} ${isCapturing ? 'loading' : ''} ${!currentTile || isCapturedByMe || (accuracy > 50) ? 'disabled' : ''}`}
        onClick={handleCapture}
      >
        <div className="btn-glow"></div>
        <div className="btn-content">
          <Target size={24} />
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
