import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Navigation, Target } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useGeolocation } from '../hooks/useGeolocation';
import { TEAM_BLUE, TEAM_RED } from '../constants';
import { getTileInfo } from '../utils/geoUtils';
import { MapContainer, TileLayer, Marker, useMap, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import './MainMapPage.css';

// Special icon for player with radar effect
const playerIconBase = (colorClass) => L.divIcon({
  className: 'custom-leaflet-icon',
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
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, recenterTrigger, map]);
  return null;
};

const MainMapPage = () => {
  const navigate = useNavigate();
  const { selectedTeam, score, capturedTiles, captureTile } = useGame();
  const { location } = useGeolocation();
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
    if (!currentTile || isCapturing || isCapturedByMe) return;

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

  return (
    <div className={`map-page team-${selectedTeam}`}>
      {/* 좌표 정보 플로팅 UI - 왼쪽 상단 */}
      <div className="coord-floating-ui">
        <div className="coord-item">
          <span className="coord-label">LAT:</span>
          <span className="coord-value">{location ? location[0].toFixed(6) : '---'}</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">LNG:</span>
          <span className="coord-value">{location ? location[1].toFixed(6) : '---'}</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">ALT:</span>
          <span className="coord-value">024.5M</span>
        </div>
      </div>

      {/* 점수 플로팅 UI - 상단 중앙 */}
      <div className="score-floating-ui">
        <div className="score-section">
          <span className="blue-score">{score.blue}</span>
          <span className="divider">:</span>
          <span className="red-score">{score.red}</span>
        </div>
        <div className="sat-status">
          <span className="sat-value">LINK_ACTIVE</span>
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
          <Crosshair size={40} className="active-target animate-pulse" />
        </div>
      </div>

      {/* 내 위치 재설정 버튼 */}
      <button
        className="recenter-btn"
        onClick={() => setRecenterTrigger(prev => prev + 1)}
        title="RECENTER POSITION"
      >
        <Navigation size={24} />
      </button>

      {/* 점령 액션 버튼 - 중앙 하단 */}
      <div
        className={`capture-overlay-btn team-${selectedTeam} ${isCapturing ? 'loading' : ''} ${!currentTile || isCapturedByMe ? 'disabled' : ''}`}
        onClick={handleCapture}
      >
        <div className="btn-glow"></div>
        <div className="btn-content">
          <Target size={24} />
          <span>{isCapturing ? 'SYNCING...' : isCapturedByMe ? 'RECLAIMED' : 'CAPTURE'}</span>
        </div>
      </div>
    </div>
  );
};

export default MainMapPage;
