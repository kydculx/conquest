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
const TeamCard = ({ team, onClick }) => {
  const IconComponent = team.id === 'blue' ? Shield : Zap;

  return (
    <div
      className={`team-card ${team.id}`}
      onClick={onClick}
    >
      <div className="card-grid"></div>
      <div className="card-border-animation"></div>
      
      <div className="card-content">
        <IconComponent size={40} className="team-icon" />
        <h2 className="team-name">{team.name}</h2>
      </div>
      
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default TeamCard;
