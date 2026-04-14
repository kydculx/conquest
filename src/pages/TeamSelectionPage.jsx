import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import TeamCard from '../components/team/TeamCard';
import Button from '../components/common/Button';
import './TeamSelectionPage.css';

const TeamSelectionPage = () => {
  const { selectedTeam, saveSelectedTeam } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  // 이미 진영이 선택된 유저라면 즉시 지도로 투입
  React.useEffect(() => {
    if (selectedTeam && !loading) {
      navigate('/map', { replace: true });
    }
  }, [selectedTeam, navigate, loading]);

  const handleTeamClick = async (teamId) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await saveSelectedTeam(teamId);
      navigate('/map');
    } catch (err) {
      console.error('Save team error:', err);
      setLoading(false);
    }
  };

  return (
    <div className={`page-container team-selection-page ${loading ? 'loading' : ''}`}>
      <header className="page-header">
        <h1 className="title">{UI_TEXT.selectTeamTitle}</h1>
      </header>
      
      <div className="teams-container">
        <TeamCard 
          team={TEAM_BLUE} 
          isSelected={selectedTeam === TEAM_BLUE.id}
          onClick={() => handleTeamClick(TEAM_BLUE.id)}
        />
        
        <TeamCard 
          team={TEAM_RED} 
          isSelected={selectedTeam === TEAM_RED.id}
          onClick={() => handleTeamClick(TEAM_RED.id)}
        />
      </div>

      {loading && (
        <div className="selection-loading">
          <div className="pulse-text">SYNCHRONIZING...</div>
        </div>
      )}
    </div>
  );
};

export default TeamSelectionPage;
