import { Shield, Zap } from 'lucide-react';
import './TeamCard.css';

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
