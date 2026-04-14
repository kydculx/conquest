import { useGame } from './hooks/useGame';
import TacticalAlert from './components/common/TacticalAlert';

// Wrapper to use GameContext hooks
const TacticalAlertManager = () => {
  const { alerts, removeAlert } = useGame();
  return <TacticalAlert alerts={alerts} onRemove={removeAlert} />;
};

function App() {
  return (
    <GameProvider>
      <Router basename={import.meta.env.BASE_URL}>
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
