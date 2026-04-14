import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import { useAuth } from '../hooks/useAuth';
import TeamCard from '../components/team/TeamCard';
import Button from '../components/common/Button';
import './TeamSelectionPage.css';

const TeamSelectionPage = () => {
  const { selectedTeam, setSelectedTeam, saveSelectedTeam } = useGame();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // 이미 진영이 선택된 유저라면 즉시 지도로 투입 (계정 귀속)
  React.useEffect(() => {
    if (profile?.team_id) {
      navigate('/map', { replace: true });
    }
  }, [profile, navigate]);

  const handleSelect = (teamId) => {
    setSelectedTeam(teamId);
  };

  const handleConfirm = async () => {
    if (selectedTeam) {
      try {
        // DB에 진영 정보 영구 귀속
        await saveSelectedTeam(selectedTeam);
        navigate('/map');
      } catch (err) {
        console.error('Confirm error:', err);
      }
    }
  };

  return (
    <div className="page-container team-selection-page">
      <header className="page-header">
        <h1 className="title">{UI_TEXT.selectTeamTitle}</h1>
      </header>
      
      <div className="teams-container">
        <TeamCard 
          team={TEAM_BLUE} 
          isSelected={selectedTeam === TEAM_BLUE.id}
          onClick={() => handleSelect(TEAM_BLUE.id)}
        />
        

        
        <TeamCard 
          team={TEAM_RED} 
          isSelected={selectedTeam === TEAM_RED.id}
          onClick={() => handleSelect(TEAM_RED.id)}
        />
      </div>
      
      <div className="action-container">
        <Button 
          variant={selectedTeam === TEAM_BLUE.id ? 'blue' : selectedTeam === TEAM_RED.id ? 'red' : 'primary'}
          disabled={!selectedTeam}
          onClick={handleConfirm}
          fullWidth
        >
          {UI_TEXT.readyBtn}
        </Button>
      </div>
    </div>
  );
};

export default TeamSelectionPage;
