import React from 'react';
import './TeamCard.css';

const TeamCard = ({ team, isSelected, onClick }) => {
  return (
    <div 
      className={`team-card ${team.id} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-border" />
      <div className="card-content">
        <h2 className="team-name">{team.name}</h2>
      </div>
      <div className="selection-indicator">
        {isSelected && <div className="indicator-glow" />}
      </div>
    </div>
  );
};

export default TeamCard;
