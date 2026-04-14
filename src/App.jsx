import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { GameProvider } from './contexts/GameContext';
import TeamSelectionPage from './pages/TeamSelectionPage';
import MainMapPage from './pages/MainMapPage';
import './styles/global.css';

function App() {
  return (
    <GameProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<TeamSelectionPage />} />
          <Route path="/map" element={<MainMapPage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
