import React, { createContext, useState, useEffect } from 'react';
import { TEAM_BLUE, TEAM_RED } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // 계정에 귀속된 진영 정보가 있으면 자동 설정
  useEffect(() => {
    if (profile?.team_id) {
      setSelectedTeam(profile.team_id);
    }
  }, [profile]);
  
  // 점령된 타일 정보를 관리하는 상태 (Key: TileID, Value: Tile Info)
  const [capturedTiles, setCapturedTiles] = useState({});

  // 전역 스코어 (초기값 - DB에서 계산될 예정)
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
            
            // 실시간 스코어 업데이트 (간이 방식: 전체 다시 계산하거나 차이만 반영)
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

    // Supabase DB에 기록 (Upsert)
    const { error } = await supabase
      .from('captured_tiles')
      .upsert(newTile);

    if (error) {
      console.error('Error capturing tile in DB:', error);
      return false;
    }

    // 로컬 상태는 Realtime 구독을 통해 업데이트되거나, 즉각적인 반응을 위해 수동 업데이트 가능
    // 여기서는 Realtime이 처리하도록 하거나 즉시 업데이트
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
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        team_id: teamId, 
        updated_at: new Date().toISOString() 
      });

    if (error) {
      console.error('Error saving team to profile:', error);
      throw error;
    }

    await refreshProfile();
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
