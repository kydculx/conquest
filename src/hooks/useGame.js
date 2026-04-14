import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

/**
 * 게임 전용 컨텍스트 사용을 위한 커스텀 훅
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    // GameProvider 외부에서 호출 시 경고 발생
    throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};
