import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { GameProvider } from './contexts/GameContext';
import TeamSelectionPage from './pages/TeamSelectionPage';
import MainMapPage from './pages/MainMapPage';
import './styles/global.css';
import { useGame } from './hooks/useGame';
import TacticalAlert from './components/common/TacticalAlert';

/**
 * TacticalAlertManager: 전역 알림을 관리하는 내부 컴포넌트
 * GameProvider 내부에 위치해야 useGame 훅을 사용할 수 있습니다.
 */
const TacticalAlertManager = () => {
  const { alerts, removeAlert } = useGame();
  return <TacticalAlert alerts={alerts} onRemove={removeAlert} />;
};

/**
 * 넥서스 컨퀘스트(Nexus Conquest) 애플리케이션 최상위 컴포넌트
 * - 전역 상태(GameProvider)와 라우팅(HashRouter)을 설정합니다.
 */
function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          {/* 초기 진영 선택 페이지 */}
          <Route path="/" element={<TeamSelectionPage />} />
          {/* 메인 전술 지도 페이지 */}
          <Route path="/map" element={<MainMapPage />} />
        </Routes>
        {/* 모든 페이지에서 전역 알림 수신 대기 */}
        <TacticalAlertManager />
      </Router>
    </GameProvider>
  );
}

export default App;
