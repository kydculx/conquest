import React, { useMemo } from 'react';
import { Shield, Zap } from 'lucide-react';
import { TEAM_BLUE, TEAM_RED } from '../../constants';
import './ScoreHUD.css';

/**
 * 모험 스코어보드 (상단 HUD)
 */
const ScoreHUD = ({ score }) => {
  const dominance = useMemo(() => {
    const total = score.blue + score.red;
    if (total === 0) return { blue: 50, red: 50 };
    return {
      blue: (score.blue / total) * 100,
      red: (score.red / total) * 100
    };
  }, [score]);

  return (
    <div className="adventure-scoreboard-container">
      <div className="scoreboard-frame">

        {/* 블루팀 구역 */}
        <div className="scoreboard-side team-blue">
          <div className="team-score">{score.blue}</div>
        </div>

        {/* 중앙 게이지 및 매치 상태 */}
        <div className="scoreboard-center">
          <div className="hud-vs-area">
            <Shield size={20} className="hud-team-icon blue" />
            <div className="vs-pop-badge">VS</div>
            <Zap size={20} className="hud-team-icon red" />
          </div>
          <div className="dominance-gauge">
            <div className="gauge-fill blue-fill" style={{ width: `${dominance.blue}%` }}></div>
            <div className="gauge-fill red-fill" style={{ width: `${dominance.red}%` }}></div>
          </div>
        </div>

        {/* 레드팀 구역 */}
        <div className="scoreboard-side team-red">
          <div className="team-score">{score.red}</div>
        </div>

      </div>
    </div>
  );
};

export default ScoreHUD;
