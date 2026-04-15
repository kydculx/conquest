import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import TeamCard from '../components/team/TeamCard';
import './TeamSelectionPage.css';

const TeamSelectionPage = () => {
  const { saveSelectedTeam } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
        <div className="header-decoration"></div>
        <h1 className="title glitch-effect">{UI_TEXT.selectTeamTitle}</h1>
        <p className="subtitle">{UI_TEXT.selectTeamSubtitle}</p>
      </header>

      <div className="teams-container">
        <TeamCard
          team={TEAM_BLUE}
          onClick={() => handleTeamClick(TEAM_BLUE.id)}
        />

        <TeamCard
          team={TEAM_RED}
          onClick={() => handleTeamClick(TEAM_RED.id)}
        />
      </div>

      {loading && (
        <div className="selection-loading">
          <div className="pulse-text">네트워크 연결 중...</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSelectionPage;
