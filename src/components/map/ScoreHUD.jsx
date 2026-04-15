/**
 * 상단 전술 HUD 컴포넌트
 * - 블루팀과 레드팀의 현재 점령지 점수 현황을 리얼타임으로 시괄화합니다.
 */
import { Target } from 'lucide-react';
import { TEAM_BLUE, TEAM_RED } from '../../constants';

/**
 * 점수 HUD 컴포넌트
 * @param {Object} props
 * @param {Object} props.score - { blue: number, red: number } 형태의 점수 객체
 */
const ScoreHUD = ({ score }) => {
  return (
    <div className="score-floating-ui hud-panel">
      <div className="hud-header-center">
        <Target size={14} />
        <span>영토 점유율</span>
      </div>
      <div className="score-section">
        <div className="team-score blue">
          <span className="score-number">{score.blue}</span>
          <span className="score-label">{TEAM_BLUE.name}</span>
        </div>
        <div className="vs-divider">VS</div>
        <div className="team-score red">
          <span className="score-number">{score.red}</span>
          <span className="score-label">{TEAM_RED.name}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreHUD;
