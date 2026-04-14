import React, { createContext, useState, useEffect } from 'react';
import { TEAM_BLUE, TEAM_RED } from '../constants';
import { supabase } from '../lib/supabase';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [selectedTeam, setSelectedTeam] = useState(() => {
    // Initial fetch from localStorage
    return localStorage.getItem('nexus_selected_team') || null;
  });
  
  // 점령된 타일 정보를 관리하는 상태 (Key: TileID, Value: Tile Info)
  const [capturedTiles, setCapturedTiles] = useState({});

  // 전역 스코어
  const [score, setScore] = useState({
    blue: 0,
    red: 0,
  });

  // 보안을 위한 익명 세션 관리
  const [session, setSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 익명 인증 및 초기 데이터 로드
  useEffect(() => {
    const initGame = async () => {
      // 1. 익명 로그인 수행 (세션 확보)
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        await supabase.auth.signInAnonymously();
      }
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // 2. 초기 데이터 로드
      const { data, error } = await supabase
        .from('captured_tiles')
        .select('*');

      if (error) {
        console.error('Error fetching tiles:', error);
        return;
      }

      const tileMap = {};
      const newScore = { blue: 0, red: 0 };

      data.forEach(tile => {
        tileMap[tile.id] = tile;
        if (tile.owner === TEAM_BLUE.id) newScore.blue += 10;
        if (tile.owner === TEAM_RED.id) newScore.red += 10;
      });

      setCapturedTiles(tileMap);
      setScore(newScore);
    };

    initGame();

    // 실시간 동기화 (Realtime)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'captured_tiles' },
        (payload) => {
          const { eventType, new: newTile, old: oldTile } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            setCapturedTiles(prev => ({
              ...prev,
              [newTile.id]: newTile
            }));
            
            // 실시간 스코어 업데이트 (안전한 업데이트를 위해 이전 주인이 있을 경우 차감)
            setScore(prev => {
              const updatedScore = { ...prev };
              updatedScore[newTile.owner] += 10;
              if (oldTile?.owner && oldTile.owner !== newTile.owner) {
                updatedScore[oldTile.owner] -= 10;
              }
              return updatedScore;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const captureTile = async (tileInfo) => {
    if (!selectedTeam || !session || isProcessing) return false;
    const { id, bounds } = tileInfo;

    // 이미 같은 팀이 점령한 경우 무시 (클라이언트 1차 방어)
    if (capturedTiles[id]?.owner === selectedTeam) return false;

    setIsProcessing(true);
    try {
      const newTile = {
        id,
        bounds,
        owner: selectedTeam,
        captured_at: new Date().toISOString(),
        captured_by: session.user.id // 누가 점령했는지 기록 (보안용)
      };

      const { error } = await supabase
        .from('captured_tiles')
        .upsert(newTile);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Capture error:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const saveSelectedTeam = async (teamId) => {
    // 계정 정보 대신 로컬 저장소에 영구 저장
    localStorage.setItem('nexus_selected_team', teamId);
    setSelectedTeam(teamId);
  };

  const value = {
    selectedTeam,
    setSelectedTeam,
    saveSelectedTeam,
    score,
    setScore,
    capturedTiles,
    captureTile,
    teamData: selectedTeam === TEAM_BLUE.id ? TEAM_BLUE : selectedTeam === TEAM_RED.id ? TEAM_RED : null,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
