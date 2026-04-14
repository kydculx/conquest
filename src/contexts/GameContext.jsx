/**
 * 게임의 전역 상태를 관리하는 컨텍스트
 * - 선택된 팀, 점령된 타일 데이터, 실시간 점수, 알림 시스템을 총괄합니다.
 * - Supabase Realtime을 사용하여 모든 플레이어의 점령 현황을 실시간으로 동기화합니다.
 */
import React, { createContext, useState, useEffect } from 'react';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import { supabase } from '../lib/supabase';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // 사용자가 선택한 진영 (블루/레드) - 로컬 스토리지에 저장하여 새로고침 시에도 유지
  const [selectedTeam, setSelectedTeam] = useState(() => {
    return localStorage.getItem('nexus_selected_team') || null;
  });
  
  // 점령된 타일 정보를 관리하는 상태 (Key: 타일ID, Value: 타일 객체)
  const [capturedTiles, setCapturedTiles] = useState({});

  // 양 팀의 전역 스코어 (점령지 개수 기반)
  const [score, setScore] = useState({
    blue: 0,
    red: 0,
  });

  // 점령 프로세스 중복 방지 플래그
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 전술 상황 알림(Alert) 리스트
  const [alerts, setAlerts] = useState([]);

  /**
   * 전술 알림 추가 함수
   * @param {string} message - 표시할 메시지
   * @param {string} type - 알림 타입 (success, danger, info)
   */
  const addAlert = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [{ id, message, type }, ...prev].slice(0, 5)); // 최신 5개 알림만 유지
  };

  /**
   * 전술 알림 제거 함수 (타이머 완료 시 호출)
   */
  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // 초기 데이터 로드 및 실시간 연동 (최초 1회 실행)
  useEffect(() => {
    /**
     * DB에서 기존의 모든 점령 데이터를 가져와 초기 상태를 설정합니다.
     */
    const initGame = async () => {
      try {
        const { data, error } = await supabase
          .from('captured_tiles')
          .select('*');

        if (error) {
          console.error('점령 데이터 로드 실패:', error);
          return;
        }

        const tileMap = {};
        const newScore = { blue: 0, red: 0 };

        data.forEach(tile => {
          tileMap[tile.id] = tile;
          // 타일 하나당 1점씩 합산
          if (tile.owner === TEAM_BLUE.id) newScore.blue += 1;
          if (tile.owner === TEAM_RED.id) newScore.red += 1;
        });

        setCapturedTiles(tileMap);
        setScore(newScore);
      } catch (err) {
        console.error('초기화 에러:', err);
      }
    };

    initGame();

    /**
     * Supabase Realtime 구독 설정
     * DB의 'captured_tiles' 테이블에 변화(INSERT, UPDATE 등)가 생기면 즉시 이벤트를 수신합니다.
     */
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'captured_tiles' },
        (payload) => {
          const { eventType, new: newTile, old: oldTile } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // [알림 발생 로직] - 상태 업데이트 함수 밖에서 실행하여 중복 방지
            // oldTile이 없으면 신규 점령, 주인(owner)이 다르면 탈환/침공
            if (eventType === 'INSERT') {
              if (newTile.owner === selectedTeam) {
                addAlert(UI_TEXT.alertNeutralCapture, 'success');
              } else {
                addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
              }
            } else if (eventType === 'UPDATE' && oldTile && oldTile.owner !== newTile.owner) {
              if (newTile.owner === selectedTeam) {
                addAlert(UI_TEXT.alertCounterCapture, 'success');
              } else if (oldTile.owner === selectedTeam) {
                addAlert(UI_TEXT.alertEnemyInvasion, 'danger');
              } else {
                addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
              }
            }

            // [타일 데이터 업데이트]
            setCapturedTiles(prev => ({
              ...prev,
              [newTile.id]: newTile
            }));
            
            // [점수 업데이트] - 소유주가 변경된 경우에만 갯수 조정
            setScore(prev => {
              const updatedScore = { ...prev };
              
              if (eventType === 'INSERT') {
                // 신규 점령일 때만 +1
                updatedScore[newTile.owner] += 1;
              } else if (eventType === 'UPDATE' && oldTile && oldTile.owner !== newTile.owner) {
                // 소유주가 바뀌었을 때만 새로운 진영 +1, 기존 진영 -1
                updatedScore[newTile.owner] += 1;
                if (oldTile.owner) {
                  updatedScore[oldTile.owner] -= 1;
                }
              }
              
              return updatedScore;
            });
          }
        }
      )
      .subscribe();

    // 언마운트 시 실시간 채널 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTeam]); 

  /**
   * 현재 위치의 타일을 점령하는 함수
   * @param {object} tileInfo - 점령할 타일의 정보 (ID, 영역 등)
   */
  const captureTile = async (tileInfo) => {
    // 팀을 선택하지 않았거나 이미 처리 중인 경우 무시
    if (!selectedTeam || isProcessing) return false;
    const { id, bounds } = tileInfo;

    // 이미 우리 팀이 점령 중인 곳이라면 중복 처리 방지
    if (capturedTiles[id]?.owner === selectedTeam) return false;

    setIsProcessing(true);
    try {
      const newTile = {
        id,
        bounds,
        owner: selectedTeam,
        captured_at: new Date().toISOString()
      };

      // Upsert: 데이터가 없으면 삽입, 있으면 업데이트
      const { error } = await supabase
        .from('captured_tiles')
        .upsert(newTile);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('점령 실패:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 팀 선택 정보를 로컬 스토리지에 저장
   */
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

