/**
 * "CONQUEST" 메인 어플리케이션 컴포넌트
 * - 라우팅(Routing) 및 전역 상태 제공(GameProvider)을 담당합니다.
 */
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { GameProvider } from './contexts/GameContext.jsx';
import TeamSelectionPage from './pages/TeamSelectionPage';
import MainMapPage from './pages/MainMapPage';
import './styles/global.css';
import { useGame } from './hooks/useGame';
import TacticalAlert from './components/common/TacticalAlert';

const TacticalAlertManager = () => {
  const { alerts, removeAlert } = useGame();
  return <TacticalAlert alerts={alerts} onRemove={removeAlert} />;
};

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TeamSelectionPage />} />
          <Route path="/map" element={<MainMapPage />} />
        </Routes>
        <TacticalAlertManager />
      </Router>
    </GameProvider>
  );
}

export default App;
