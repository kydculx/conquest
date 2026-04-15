/**
 * 게임 전역 상태 컨텍스트 정의
 * - 별도의 파일로 분리하여 Fast Refresh 호환성 보장
 */
import { createContext } from 'react';

export const GameContext = createContext();
