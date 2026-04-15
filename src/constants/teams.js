export const TEAM_RED = {
  id: "red",
  name: "사이버 코어",
  description: "공격형 해킹 특화. 적 네트워크를 마비시키고 시스템을 장악합니다.",
  color: "var(--color-neon-red)",
  callsign: "레드 팬텀",
};

export const TEAM_BLUE = {
  id: "blue",
  name: "실드 셀",
  description: "방어형 보안 특화. 아군 네트워크를 보호하고 역공을 전개합니다.",
  color: "var(--color-neon-blue)",
  callsign: "블루 센티널",
};

export const ALL_TEAMS = [TEAM_BLUE, TEAM_RED];

export const getTeamById = (id) => {
  return ALL_TEAMS.find(team => team.id === id) || null;
};
