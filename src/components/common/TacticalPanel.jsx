import React from 'react';

/**
 * 전술 HUD 통합 디자인 템플릿 컴포넌트
 * - 모든 HUD 창의 공통 디자인(스캔라인, 브래킷, 배경 스타일)을 중앙 집중 관리합니다.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 내부 콘텐츠
 * @param {string} props.className - 전용 레이아웃 스타일(위치 등)을 위한 추가 클래스
 * @param {boolean} props.showHeader - 헤더 표시 여부
 * @param {string} props.title - 헤더 제목
 * @param {string} props.subtitle - 헤더 부제목
 * @param {React.ElementType} props.icon - Lucide 아이콘 컴포넌트
 * @param {Object} props.style - 인라인 스타일 (필요 시)
 */
const TacticalPanel = ({ 
  children, 
  className = '', 
  showHeader = false, 
  title = '', 
  subtitle = '', 
  icon: Icon = null,
  style = {}
}) => {
  return (
    <div className={`hud-panel ${className}`} style={style}>
      {/* 구식 택티컬 스캔라인 및 꺾쇠 디자인 제거됨 (V3.1 다크/글래스모피즘) */}
      
      {/* 헤더 템플릿(선택 사항) */}
      {showHeader && (
        <div className="list-header">
          {Icon && <Icon size={16} className="header-icon" />}
          <div className="header-text">
            <h3>{title}</h3>
            {subtitle && <span className="subtitle">{subtitle}</span>}
          </div>
        </div>
      )}
      
      {/* 실제 콘텐츠 영역 */}
      {children}
    </div>
  );
};

export default TacticalPanel;
