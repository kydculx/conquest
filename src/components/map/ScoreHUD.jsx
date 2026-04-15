import { Target } from 'lucide-react';
import { TEAM_BLUE, TEAM_RED } from '../../constants';

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
