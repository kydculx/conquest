/**
 * 게임의 전역 상태를 관리하는 Provider
 * - 선택된 팀, 점령된 타일 데이터, 실시간 점수, 알림 시스템을 총괄합니다.
 * - Supabase Realtime을 사용하여 모든 플레이어의 점령 현황을 실시간으로 동기화합니다.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameContext } from './GameContext.js';
import { TEAM_BLUE, TEAM_RED, UI_TEXT } from '../constants';
import { supabase } from '../lib/supabase';

/**
 * GameProvider 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const GameProvider = ({ children }) => {
  // 사용자의 선택 팀 상태 (로컬 스토리지와 동기화)
  const [selectedTeam, setSelectedTeam] = useState(() => {
    return localStorage.getItem('conquest_selected_team') || null;
  });

  // 전체 점령 타일 맵 데이터 { [tileId]: tileObject }
  const [capturedTiles, setCapturedTiles] = useState({});

  /**
   * 전술 상황 알림(Alert) 목록 상태 관리
   * { id, message, type } 객체의 배열
   */
  const [alerts, setAlerts] = useState([]);

  /**
   * 현재 세션의 실시간 점수 계산 (타일 소유권 기반)
   * capturedTiles 상태가 변경될 때마다 점수를 재계산합니다.
   */
  const score = useMemo(() => {
    const counts = { blue: 0, red: 0 };
    Object.values(capturedTiles).forEach(tile => {
      if (tile.owner === TEAM_BLUE.id) counts.blue += 1;
      if (tile.owner === TEAM_RED.id) counts.red += 1;
    });
    return counts;
  }, [capturedTiles]);

  /**
   * 전술 상황 발생 시 알림 시스템에 추가
   * @param {string} message - 표시할 메시지 텍스트
   * @param {string} type - 알림 강조 타입 (success: 탈환, danger: 침공, info: 일반)
   */
  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [{ id, message, type }, ...prev].slice(0, 5)); // 최신 5개만 유지
  }, []);

  /**
   * 지정된 ID의 알림을 제거
   * @param {number|string} id - 삭제할 알림의 고유 ID
   */
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // [중요 로직] 앱 구동 시 초기 데이터 동기화 및 실시간 변경 감지 설정
  useEffect(() => {
    /**
     * DB(Supabase)로부터 기존 점령 상태를 전부 로드하여 초기 메모리에 적재
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
        data.forEach(tile => {
          tileMap[tile.id] = tile;
        });

        setCapturedTiles(tileMap);
      } catch (err) {
        console.error('초기화 에러:', err);
      }
    };

    initGame();

    /**
     * Supabase Realtime 구독 (PostgreSQL 변화 감지)
     * - 타일 점령/탈환이 발생할 때마다 다른 플레이어에게도 즉시 반영되도록 합니다.
     */
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'captured_tiles' },
        (payload) => {
          const { eventType, new: newTile, old: oldTile } = payload;

          // 삽입(신규 점령) 또는 업데이트(탈환) 감지 시
          if (eventType === 'INSERT' || eventType === 'UPDATE') {

            // 1. 상황별 전술 알림 로직
            if (eventType === 'INSERT') {
              // 중립 지역 최초 점령 시
              if (newTile.owner === selectedTeam) {
                addAlert(UI_TEXT.alertNeutralCapture, 'success');
              } else {
                addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
              }
            } else if (eventType === 'UPDATE' && oldTile && oldTile.owner !== newTile.owner) {
              // 소유권이 변경된 경우 (탈환 또는 침공)
              if (newTile.owner === selectedTeam) {
                // 우리 팀이 다시 뺏어온 경우
                addAlert(UI_TEXT.alertCounterCapture, 'success');
              } else if (oldTile.owner === selectedTeam) {
                // 우리 팀 땅을 뺏긴 경우
                addAlert(UI_TEXT.alertEnemyInvasion, 'danger');
              } else {
                // 다른 팀들끼리 싸우는 경우
                addAlert(UI_TEXT.alertOtherTeamCapture, 'info');
              }
            }

            // 2. 메모리 상의 타일 상태 업데이트
            setCapturedTiles(prev => ({
              ...prev,
              [newTile.id]: newTile
            }));
          }
        }
      )
      .subscribe();

    // 언마운트 시 실시간 채널 연결 해제하여 리소스 반환
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTeam, addAlert]);

  /**
   * 특정 타일을 DB에 점령 기록 (Upsert)
   * @param {Object} tileInfo - 점령할 타일의 메타데이터 (id, q, r, bounds 등)
   * @returns {Promise<boolean>} 점령 성공 여부
   */
  const captureTile = async (tileInfo) => {
    if (!selectedTeam) return false;
    const { id, q, r, bounds, owner, capture_started_at, capture_status } = tileInfo;

    // 이미 우리 팀이 소유한 구역인 경우 중복 기록 방지
    if (capturedTiles[id]?.owner === selectedTeam) {
      return false;
    }

    const newTile = {
      id,
      q,
      r,
      bounds,
      owner: owner || selectedTeam,
      captured_at: new Date().toISOString(),
      ...(capture_started_at && { capture_started_at }),
      ...(capture_status && { capture_status })
    };

    // Supabase DB에 덮어쓰기 혹은 삽입 (Upsert)
    const { error } = await supabase
      .from('captured_tiles')
      .upsert(newTile);

    if (error) {
      console.error('점령 실패:', error);
      return false;
    }

    return true;
  };

  /**
   * 팀 선택 정보를 상태와 로컬 스토리지에 유지
   * @param {string} teamId - 선택한 팀 ID (TEAM_BLUE.id 또는 TEAM_RED.id)
   */
  const saveSelectedTeam = async (teamId) => {
    localStorage.setItem('conquest_selected_team', teamId);
    setSelectedTeam(teamId);
  };

  // 컨텍스트에서 외부로 노출할 값들 정리
  // useMemo를 사용하여 불필요한 하위 컴포넌트 리렌더링을 방지합니다.
  const value = useMemo(() => ({
    selectedTeam,      // 현재 활성화된 팀 ID
    setSelectedTeam,   // 팀 상태 직접 변경 함수
    saveSelectedTeam,  // 팀 상태 및 로컬 스토리지 저장 함수
    score,             // 실시간 팀별 점수 { blue, red }
    capturedTiles,     // 전체 점령 타일 맵
    captureTile,       // 타일 점령 로직 실행 함수
    alerts,            // 현재 활성화된 전술 알림 목록
    removeAlert,       // 알림 제거 함수
    addAlert,          // 알림 수동 추가 함수
    // 현재 선택된 팀의 상세 설정 데이터 (색상, 이름 등)
    teamData: selectedTeam === TEAM_BLUE.id ? TEAM_BLUE : selectedTeam === TEAM_RED.id ? TEAM_RED : null,
  }), [selectedTeam, score, capturedTiles, alerts, removeAlert, addAlert]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};