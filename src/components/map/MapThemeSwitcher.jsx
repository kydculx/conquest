import { useState, useRef, useEffect } from 'react';
import { Layers, Check } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { MAP_THEMES } from '../../constants/mapConfig';
import TacticalPanel from '../common/TacticalPanel';
import './MapThemeSwitcher.css';

/**
 * 지도 테마 전환 컴포넌트 (우측 상단 플로팅)
 */
const MapThemeSwitcher = () => {
  const { mapThemeId, saveMapTheme } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (id) => {
    saveMapTheme(id);
    setIsOpen(false);
  };

  return (
    <div className={`map-theme-switcher ${isOpen ? 'is-open' : ''}`} ref={menuRef}>
      <button
        className={`theme-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        title="지도 테마 변경"
      >
        <Layers size={20} />
      </button>

      {isOpen && (
        <TacticalPanel 
          className="theme-menu"
          showHeader={true}
          title="지도 레이어 설정"
          subtitle="전술 지도 오버레이"
          icon={Layers}
        >
          <div className="theme-options">
            {Object.values(MAP_THEMES).map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${mapThemeId === theme.id ? 'selected' : ''}`}
                onClick={() => handleSelect(theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{ backgroundColor: theme.preview }}
                >
                  {mapThemeId === theme.id && <Check size={14} />}
                </div>
                <span className="theme-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </TacticalPanel>
      )}
    </div>
  );
};

export default MapThemeSwitcher;
