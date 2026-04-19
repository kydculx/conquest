import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layers, Check, X } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { MAP_THEMES } from '../../constants/mapConfig';
import './MapThemeSwitcher.css';

/**
 * MapThemeSwitcher: 지도 테마 바꾸기 컴포넌트
 * - 리뉴얼: 하단 독 내 버튼 배치 및 카툰 모달 스타일 적용
 */
const MapThemeSwitcher = () => {
  const { mapThemeId, saveMapTheme } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // 모달이 열릴 때 Body 스크롤 제한
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (id) => {
    saveMapTheme(id);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      <div className="adventure-theme-switcher">
        <button
          className={`theme-pop-btn ${isOpen ? 'active' : ''}`}
          onClick={handleToggle}
          title="지도 테마 바꾸기"
        >
          <Layers size={22} />
        </button>
      </div>

      {isOpen && createPortal(
        <div className="pop-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="pop-theme-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header Section */}
            <div className="pop-modal-header">
              <div className="header-icon-badge">
                <Layers size={20} />
              </div>
              <div className="header-title-group">
                <h3 className="pop-title">세상 테마 바꾸기</h3>
                <p className="pop-subtitle">CHOOSE YOUR WORLD THEME</p>
              </div>
              <button className="pop-modal-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Options Grid */}
            <div 
              className="pop-modal-content"
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="theme-pop-grid">
                {Object.values(MAP_THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-pop-card ${mapThemeId === theme.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(theme.id)}
                  >
                    <div className="theme-pop-visual" style={{ background: theme.preview }}>
                      {mapThemeId === theme.id && (
                        <div className="pop-selection-marker">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="theme-pop-info">
                      <span className="theme-pop-label">{theme.name}</span>
                      <span className="theme-pop-action">선택하기</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="pop-modal-footer">
              <span className="footer-tip">팁: 카툰 모드가 가장 예뻐요! ✨</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MapThemeSwitcher;
