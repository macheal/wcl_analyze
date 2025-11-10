
export interface Boss {
  id: number;
  name: string;
  kill: boolean;
}

export interface Ability {
  id: number;
  name: string;
}

export interface SkillHit {
  timestamp: string;
  playerName: string;
  amount: number;
  mitigated: number;
  unmitigated: number;
  hitType: string;
}

export interface KalecgosPlayerStat {
  playerName: string;
  hits: number;
  totalDamage: number;
  avgDamage: number;
}

export interface KalecgosFightStat {
  fightId: number;
  timestamp: string;
  hits: number;
  totalDamage: number;
}

export type TabId = 'skillHit' | 'kalecgos';

export interface TabInfo {
  id: TabId;
  label: string;
}
