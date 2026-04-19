/**
 * 게임의 두 진영(Cyber Core, Shield Cell) 정의 및 속성
 */
export const TEAM_RED = {
  id: "red",
  name: "레드 팬텀",
  description: "공격형 해킹 특화. 적 네트워크를 마비시키고 시스템을 장악합니다.",
  color: "var(--color-neon-red)",
  callsign: "레드 팬텀",
};

export const TEAM_BLUE = {
  id: "blue",
  name: "블루 센티널",
  description: "방어형 보안 특화. 아군 네트워크를 보호하고 역공을 전개합니다.",
  color: "var(--color-neon-blue)",
  callsign: "블루 센티널",
};

// 모든 팀의 리스트 (UI 및 선택 화면에서 사용)
export const ALL_TEAMS = [TEAM_BLUE, TEAM_RED];

/**
 * ID를 기반으로 특정 팀 정보를 검색
 * @param {string} id - 팀 ID ('blue' | 'red')
 * @returns {Object|null} 팀 객체 또는 null
 */
export const getTeamById = (id) => {
  return ALL_TEAMS.find(team => team.id === id) || null;
};
