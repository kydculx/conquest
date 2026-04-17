import React, { useMemo } from 'react';
import { TEAM_BLUE, TEAM_RED } from '../../constants';
import TacticalPanel from '../common/TacticalPanel';
import './ScoreHUD.css';

/**
 * 점수 및 전장 점유율 HUD 컴포넌트
 * @param {Object} props
 * @param {Object} props.score - { blue: number, red: number } 형태의 점수 객체
 */
const ScoreHUD = ({ score }) => {
  // 점유율 계산 (전체 대비 각 팀의 비율)
  const dominance = useMemo(() => {
    const total = score.blue + score.red;
    if (total === 0) return { blue: 50, red: 50 }; // 초기 상태
    return {
      blue: (score.blue / total) * 100,
      red: (score.red / total) * 100
    };
  }, [score]);

  return (
    <TacticalPanel
      className="score-hud-container score-floating-ui"
      showHeader={false}
      title="SECTOR DOMINANCE MONITOR"
    >

      <div className="score-main-section">
        <div className="team-stats blue">
          <span className="team-name">{TEAM_BLUE.name}</span>
          <span className="score-val">{score.blue}</span>
        </div>

        <div className="dominance-gauge">
          <div
            className="gauge-fill blue"
            style={{ width: `${dominance.blue}%` }}
          ></div>
          <div
            className="gauge-fill red"
            style={{ width: `${dominance.red}%` }}
          ></div>
          <div className="vs-label">VS</div>
        </div>

        <div className="team-stats red">
          <span className="score-val">{score.red}</span>
          <span className="team-name">{TEAM_RED.name}</span>
        </div>
      </div>
    </TacticalPanel>
  );
};

export default ScoreHUD;
