import React from 'react';
import { Shield, Zap, Crosshair, Cpu, Network } from 'lucide-react';
import './TeamCard.css';

const TeamCard = ({ team, isSelected, onClick }) => {
  const teamIcon = team.id === 'blue' ? Shield : Zap;
  const IconComponent = teamIcon;

  return (
    <div
      className={`team-card ${team.id} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Cyber Grid Background */}
      <div className="card-grid"></div>
      
      {/* Animated Border */}
      <div className="card-border-animation"></div>
      
      <div className="card-content">
        <div className="card-header">
          <IconComponent size={32} className="team-icon" />
          <div className="card-callsign">{team.callsign}</div>
        </div>
        
        <h2 className="team-name">{team.name}</h2>
        
        <div className="card-divider"></div>
        
        <p className="team-description">{team.description}</p>
        
        <div className="card-stats">
          <div className="stat-item">
            <Network size={14} />
            <span>네트워크</span>
          </div>
          <div className="stat-item">
            <Cpu size={14} />
            <span>활성</span>
          </div>
          <div className="stat-item">
            <Crosshair size={14} />
            <span>대기</span>
          </div>
        </div>
      </div>
      
      <div className="selection-indicator">
        {isSelected && (
          <>
            <div className="indicator-ring"></div>
            <div className="indicator-glow"></div>
          </>
        )}
      </div>
      
      {/* Corner Decorations */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default TeamCard;
