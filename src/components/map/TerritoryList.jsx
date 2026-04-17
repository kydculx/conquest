import React, { useState, useMemo, useRef, useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { List, MapPin, X, ChevronRight } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { UI_TEXT, MAP_CONFIG } from '../../constants';
import { hexToLatLng } from '../../utils/geoUtils';
import TacticalPanel from '../common/TacticalPanel';
import './TerritoryList.css';

/**
 * 점령지 목록 가시화 및 이동 컴포넌트
 */
const TerritoryList = React.memo(() => {
  const map = useMap();
  const containerRef = useRef(null);
  const { capturedTiles, selectedTeam } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Leaflet 이벤트 전파 차단 (목록 위에서 휠/클릭/터치 시 지도가 반응하지 않도록)
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      L.DomEvent.disableScrollPropagation(el);
      L.DomEvent.disableClickPropagation(el);
      
      // 모바일 터치 이벤트가 지도로 전파되는 것을 추가로 차단
      L.DomEvent.on(el, 'touchstart touchmove pointerdown pointermove', (e) => {
        L.DomEvent.stopPropagation(e);
      });
    }
  }, []);

  // 내 팀의 점령지만 필터링하여 리스트로 변환
  // [최적화] 목록이 열려있을 때만 무거운 필터링 및 정렬 수행 (Violation 방지)
  const myTiles = useMemo(() => {
    if (!isOpen) return [];
    
    return Object.values(capturedTiles)
      .filter(tile => tile.owner === selectedTeam)
      .sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));
  }, [capturedTiles, selectedTeam, isOpen]);

  /**
   * 상대 시간 계산 (예: 2분 전)
   */
  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return UI_TEXT.timeJustNow || '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  /**
   * 목록 내 영토 클릭 시 해당 위치로 지도 이동
   */
  const handleTileClick = (q, r) => {
    const { lat, lng } = hexToLatLng(q, r);
    // '나의 위치 찾기'와 동일하게 미끄러지듯 이동(panTo)하도록 통일
    map.panTo([lat, lng], {
      animate: true,
      duration: MAP_CONFIG.FLY_DURATION 
    });
    // 모바일 등 좁은 화면에서는 이동 후 목록을 닫아줌
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`territory-list-container ${isOpen ? 'is-open' : ''}`}>
      {/* 목록 토글 버튼 */}
      <button 
        className={`list-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={UI_TEXT.territoryListTitle}
      >
        {isOpen ? <X size={20} /> : <List size={20} />}
      </button>

      {/* 목록 패널 */}
      <TacticalPanel 
        className="list-panel"
        showHeader={true}
        title={UI_TEXT.territoryListTitle}
        subtitle="Tactical Grid Overlay"
        icon={MapPin}
      >
        <div className="list-stats">
          <div className="stat-label">CAPTURED SECTORS</div>
          <div className="stat-value">{myTiles.length}</div>
        </div>

        <div className="list-content">
          {myTiles.length > 0 ? (
            <div className="tile-grid">
              {myTiles.map((tile, index) => (
                <div 
                  key={tile.id} 
                  className="tile-item"
                  onClick={() => handleTileClick(tile.q, tile.r)}
                  style={{ '--i': index }}
                >
                  <div className="tile-info">
                    <div className="tile-id">
                      <span className="coords">SEC_{tile.q}_{tile.r}</span>
                      <span className="timestamp">{getTimeAgo(tile.captured_at)}</span>
                    </div>
                  </div>
                  <div className="tile-action">
                    <ChevronRight size={14} className="entry-icon" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">!</div>
              <p>{UI_TEXT.territoryListEmpty}</p>
            </div>
          )}
        </div>
      </TacticalPanel>
    </div>
  );
});

export default TerritoryList;
