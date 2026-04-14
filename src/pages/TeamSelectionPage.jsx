import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import TeamCard from '../components/team/TeamCard';
import './TeamSelectionPage.css';

/**
 * 진영 선택(팀 가입) 화면 컴포넌트
 * - 사용자가 앱에 처음 진입했을 때 소속될 팀을 선택합니다.
 * - 선택 정보는 로컬 스토리지에 저장되어 이후 접속 시 자동으로 전술 지도로 투입됩니다.
 */

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
          <div className="pulse-text">현장 투입 중...</div>
        </div>
      )}
    </div>
  );
};

export default TeamSelectionPage;
