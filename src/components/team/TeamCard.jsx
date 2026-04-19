/**
 * 진영(Team) 정보를 시각화하는 카드 컴포넌트
 */
import { Shield, Zap } from 'lucide-react';
import './TeamCard.css';

/**
 * 팀 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.team - {id, name, description, color} 형태의 팀 정보 객체
 * @param {Function} props.onClick - 클릭 핸들러
 */
const TeamCard = ({ team, onClick, onHover }) => {
  const IconComponent = team.id === 'blue' ? Shield : Zap;

  // 가상의 전술 데이터 생성 (디자인용)
  const tacticalData = team.id === 'blue' 
    ? { cap: '88%', stability: 'STABLE', alert: 'NORMAL' }
    : { cap: '94%', stability: 'VOLATILE', alert: 'HIGH' };

  return (
    <div
      className={`team-card ${team.id}`}
      onClick={onClick}
      onMouseEnter={() => onHover && onHover(team.id)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="side-indicator"></div>
      <div className="card-scanline"></div>
      <div className="card-grid"></div>
      
      <div className="card-content">
        <div className="icon-wrapper">
          <IconComponent size={64} className="team-icon" />
          <div className="icon-ring"></div>
        </div>
        
        <div className="team-info">
          <h2 className="team-name">{team.name}</h2>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
