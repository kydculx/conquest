import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, ChevronRight, LayoutList, Search, Map, Globe } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { UI_TEXT, MAP_CONFIG } from '../../constants';
import { TACTICAL_HUBS } from '../../constants/tacticalHubs';
import { hexToLatLng } from '../../utils/geoUtils';
import './TacticalDataModal.css';

/**
 * TacticalDataModal: 중앙 전술 통합 데이터 모달 (V3.3/V3.4 Final)
 */
const TacticalDataModal = ({ isOpen, onClose, map }) => {
  const { capturedTiles, selectedTeam } = useGame();
  const [activeTab, setActiveTab] = useState('hubs'); 
  const [searchTerm, setSearchTerm] = useState('');

  // 내 팀의 점령지 필터링
  const myTiles = useMemo(() => {
    return Object.values(capturedTiles)
      .filter(tile => tile.owner === selectedTeam)
      .sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));
  }, [capturedTiles, selectedTeam]);

  // 거점 데이터 지역별 그룹화 및 검색 필터링
  const filteredHubs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return TACTICAL_HUBS;
    return TACTICAL_HUBS.filter(hub => 
      hub.name.toLowerCase().includes(term) || 
      hub.region.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const groupedHubs = useMemo(() => {
    const groups = {};
    filteredHubs.forEach(hub => {
      if (!groups[hub.region]) groups[hub.region] = [];
      groups[hub.region].push(hub);
    });
    return groups;
  }, [filteredHubs]);

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const handleHubClick = (lat, lng) => {
    if (map) {
      map.flyTo([lat, lng], MAP_CONFIG.DEFAULT_ZOOM, {
        animate: true,
        duration: 1.5
      });
      if (window.innerWidth < 768) onClose();
    }
  };

  const handleTileClick = (q, r) => {
    const { lat, lng } = hexToLatLng(q, r);
    handleHubClick(lat, lng);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="tactical-modal-overlay" onClick={onClose}>
      <div className="tactical-modal-frame" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <LayoutList size={18} className="title-icon" />
            <h2 className="modal-title">전술 데이터베이스</h2>
          </div>
          <button className="modal-close-trigger" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tactical-tab-btn ${activeTab === 'hubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('hubs')}
          >
            <Map size={16} className="tab-icon" />
            <span className="tab-label">전술 지도 목록</span>
          </button>
          <button 
            className={`tactical-tab-btn ${activeTab === 'captured' ? 'active' : ''}`}
            onClick={() => setActiveTab('captured')}
          >
            <Globe size={16} className="tab-icon" />
            <span className="tab-label">확보 영역 목록</span>
          </button>
        </div>

        <div className="modal-stats-bar">
          <div className="stats-label">
            {activeTab === 'hubs' ? '탐지된 거점 총수' : '확보된 점령 구역'}
          </div>
          <div className="stats-value-wrapper">
            <span className="stats-value">
              {activeTab === 'hubs' ? filteredHubs.length : myTiles.length}
            </span>
            <span className="stats-unit">단위</span>
          </div>
        </div>

        {activeTab === 'hubs' && (
          <div className="modal-search-box">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="거점 또는 지역 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}

        <div 
          className="modal-content-scroller"
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="modal-list-grid">
            {activeTab === 'hubs' ? (
              Object.entries(groupedHubs).map(([region, hubs]) => (
                <div key={region} className="region-section">
                  <div className="region-header">
                    <span className="region-name">{region}</span>
                    <span className="region-count">[{hubs.length}]</span>
                  </div>
                  <div className="region-items">
                    {hubs.map((hub) => (
                      <div key={hub.id} className="modal-item-card" onClick={() => handleHubClick(hub.lat, hub.lng)}>
                        <div className="item-meta">
                          <span className="item-meta-title">{hub.name}</span>
                          <span className="item-meta-sub">{hub.type.toUpperCase()} 지점</span>
                        </div>
                        <div className="item-action">
                          <span className="action-text">이동하기</span>
                          <ChevronRight size={16} className="item-action-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              myTiles.length > 0 ? (
                myTiles.map((tile) => (
                  <div key={tile.id} className="modal-item-card" onClick={() => handleTileClick(tile.q, tile.r)}>
                    <div className="item-meta">
                      <span className="item-meta-title">SEC_{tile.q.toString().padStart(3, '0')}_{tile.r.toString().padStart(3, '0')}</span>
                      <span className="item-meta-sub">{getTimeAgo(tile.captured_at).toUpperCase()} 확보 완료</span>
                    </div>
                    <div className="item-action">
                      <span className="action-text">위치 보기</span>
                      <ChevronRight size={16} className="item-action-icon" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-placeholder">
                  <div className="empty-icon-ring">
                    <MapPin size={32} />
                  </div>
                  <p className="empty-text">{UI_TEXT.territoryListEmpty}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* HUD Deco elements */}
        <div className="modal-deco-border-bl" />
        <div className="modal-deco-border-br" />
        <div className="modal-scanline" />
      </div>
    </div>,
    document.body
  );
};

export default TacticalDataModal;
