import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext.js';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};
