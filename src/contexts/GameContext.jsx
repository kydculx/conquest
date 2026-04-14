import React, { createContext, useState, useEffect } from 'react';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
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

  const [isProcessing, setIsProcessing] = useState(false);
  
  // 알림 시스템 상태
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [{ id, message, type }, ...prev].slice(0, 5)); // 최대 5개 유지
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // 초기 데이터 로드 및 실시간 연동
  useEffect(() => {
    const initGame = async () => {
      try {
        // 초기 데이터 로드 (필터 없이 모든 점령 정보 가져오기)
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
      } catch (err) {
        console.error('Initialization error:', err);
      }
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
            setCapturedTiles(prev => {
              const prevTile = prev[newTile.id];
              
              // 알림 로직
              if (!prevTile) {
                // 새로운 구역 점령 (INSERT)
                if (newTile.owner === selectedTeam) {
                  addAlert(UI_TEXT.alertNeutralCapture, 'success');
                } else {
                  addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
                }
              } else if (prevTile.owner !== newTile.owner) {
                // 주인이 바뀐 경우 (UPDATE)
                if (newTile.owner === selectedTeam) {
                  addAlert(addAlert(UI_TEXT.alertCounterCapture, 'success'));
                } else if (prevTile.owner === selectedTeam) {
                  addAlert(UI_TEXT.alertEnemyInvasion, 'danger');
                } else {
                  addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
                }
              }
              
              return {
                ...prev,
                [newTile.id]: newTile
              };
            });
            
            // 실시간 스코어 업데이트
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
  }, [selectedTeam]); // 팀 변경 시 알림 로직 동기화를 위해 팀 상태 추가

  const captureTile = async (tileInfo) => {
    // 세션 체크 제거 - 오직 팀 선택 여부와 처리 중인 상태만 확인
    if (!selectedTeam || isProcessing) return false;
    const { id, bounds } = tileInfo;

    // 이미 같은 팀이 점령한 경우 무시
    if (capturedTiles[id]?.owner === selectedTeam) return false;

    setIsProcessing(true);
    try {
      const newTile = {
        id,
        bounds,
        owner: selectedTeam,
        captured_at: new Date().toISOString()
        // captured_by 필드 삭제 (유저 프로필 정보 비활성화)
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
    alerts,
    removeAlert,
    addAlert,
    teamData: selectedTeam === TEAM_BLUE.id ? TEAM_BLUE : selectedTeam === TEAM_RED.id ? TEAM_RED : null,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

