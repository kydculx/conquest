import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext.js';

/**
 * GameContext에 접근하기 위한 커스텀 훅
 * - 컴포넌트 내에서 전역 게임 상태(팀, 점수, 타일 현황 등)를 편리하게 가져옵니다.
 * @returns {Object} GameProvider에서 제공하는 전역 상태 객체
 */
export const useGame = () => {
  const context = useContext(GameContext);
  
  // Provider 외부에서 사용 시 런타임 에러를 발생시켜 디버깅을 돕습니다.
  if (!context) {
    throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};
