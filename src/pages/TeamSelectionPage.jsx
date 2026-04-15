import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import TeamCard from '../components/team/TeamCard';
import { Terminal, Activity } from 'lucide-react';
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
  const [bootSequence, setBootSequence] = React.useState(true);

  // 부트 시퀀스 애니메이션
  React.useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // 부트 시퀀스 화면
  if (bootSequence) {
    return (
      <div className="page-container team-selection-page boot-sequence">
        <div className="boot-terminal">
          <Terminal size={48} className="boot-icon animate-pulse" />
          <div className="boot-text">
            <span className="line">[시스템] NEXUS CONQUEST v2.0.26</span>
            <span className="line">[시스템] 사이버 워페어 프로토콜 초기화</span>
            <span className="line">[시스템] 보안 연결 설정 중...</span>
            <span className="loading-line">
              <span className="cursor"></span>
            </span>
          </div>
          <Activity size={24} className="activity-icon animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`page-container team-selection-page ${loading ? 'loading' : ''}`}>
      <header className="page-header">
        <div className="header-decoration"></div>
        <h1 className="title glitch-effect">{UI_TEXT.selectTeamTitle}</h1>
        <p className="subtitle">{UI_TEXT.selectTeamSubtitle}</p>
        <div className="status-bar">
          <span className="status-indicator online">시스템 온라인</span>
          <span className="status-indicator secure">암호화됨</span>
        </div>
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
