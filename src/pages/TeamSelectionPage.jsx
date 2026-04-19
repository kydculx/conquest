/**
 * "CONQUEST" 초기 진영 선택 페이지
 * - 사용자가 게임에 처음 접속할 때 두 진영(Cyber Core, Shield Cell) 중 하나를 선택하는 관문입니다.
 * - 선택된 팀 정보는 서버(Supabase)와 로컬 상태에 저장됩니다.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import { Activity, Terminal } from 'lucide-react';
import TeamCard from '../components/team/TeamCard';
import './TeamSelectionPage.css';

const TeamSelectionPage = () => {
  const { saveSelectedTeam } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoveredTeam, setHoveredTeam] = useState(null);

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
    <div className={`page-container team-selection-page ${loading ? 'loading' : ''} hovered-${hoveredTeam || 'none'}`}>
      
      {/* 앰비언트 배경 & 인게임 동기화 스캔라인 */}
      <div className="ambient-background">
        <div className="ambient-glow" />
        <div className="tactical-grid" />
        <div className="tactical-particles" />
        <div className="background-vignette" />
        <div className="modal-scanline" />
      </div>

      <header className="page-header tactical-panel">
        <h1 className="title">{UI_TEXT.selectTeamTitle}</h1>
      </header>

      <div 
        className="teams-container" 
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', width: '100%', maxWidth: '1200px' }}
      >
        <TeamCard
          team={TEAM_BLUE}
          onClick={() => handleTeamClick(TEAM_BLUE.id)}
          onHover={setHoveredTeam}
        />

        <div className="center-divider">
          <div className="divider-line"></div>
          <span className="vs-label">VS</span>
          <div className="divider-line"></div>
        </div>

        <TeamCard
          team={TEAM_RED}
          onClick={() => handleTeamClick(TEAM_RED.id)}
          onHover={setHoveredTeam}
        />
      </div>

      {loading && (
        <div className="selection-loading">
          <div className="hud-spinner"></div>
          <div className="pulse-text">데이터 동기화 및 작전 승인 중...</div>
        </div>
      )}
    </div>
  );
};

export default TeamSelectionPage;
