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

  // DB에서 초기 데이터 로드 및 스코어 계산
  useEffect(() => {
    const fetchTiles = async () => {
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

    fetchTiles();

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
            
            // 실시간 스코어 업데이트
            setScore(prev => ({
              ...prev,
              [newTile.owner]: prev[newTile.owner] + 10,
              ...(oldTile?.owner && oldTile.owner !== newTile.owner ? { [oldTile.owner]: prev[oldTile.owner] - 10 } : {})
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const captureTile = async (tileInfo) => {
    if (!selectedTeam) return false;
    const { id, bounds } = tileInfo;

    // 이미 같은 팀이 점령한 경우 무시
    if (capturedTiles[id]?.owner === selectedTeam) return false;

    const newTile = {
      id,
      bounds,
      owner: selectedTeam,
      captured_at: new Date().toISOString()
    };

    // Supabase DB에 기록 (Upsert) - RLS 정책이 anon에게 허용되어야 함
    const { error } = await supabase
      .from('captured_tiles')
      .upsert(newTile);

    if (error) {
      console.error('Error capturing tile in DB:', error);
      // 만약 RLS 때문에 실패하더라도 로컬 반응은 줄 수 있지만, 
      // 여기서는 DB 에러 시 조기 종료합니다.
      return false;
    }

    setCapturedTiles(prev => ({
      ...prev,
      [id]: newTile
    }));

    setScore(prev => ({
      ...prev,
      [selectedTeam]: prev[selectedTeam] + 10
    }));
    
    return true;
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
