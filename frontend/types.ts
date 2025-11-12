
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
  stack1?: number;
  stack2?: number;
  stack3?: number;
}

export interface KalecgosFightStat {
  fightId: number;
  timestamp: string;
  hits: number;
  totalDamage: number;
}

// 实际接口返回的万相拳玩家统计格式
export interface KalecgosPlayerStatActual {
  "游戏名": string;
  "失误次数": number;
  "失误轮次分布": string;
  // 新添加的字段，对应不同阶段的数据
  stack_1?: number;
  stack_2?: number;
  stack_3?: number;
  // 别名字段，支持新的数据结构
  name?: string;
  count?: number;
}

// 实际接口返回的万相拳分场次统计格式
export interface KalecgosFightStatActual {
  "id": number;
  "boss血量": string;
  "时间": number;
  "用时(秒)": number;
  "data": string;
}

// 扩展的分场次统计类型，包含明细数据和阶段数据
export interface ExtendedKalecgosFightStat extends KalecgosFightStat {
  detail?: string;
  stack1?: number;
  stack2?: number;
  stack3?: number;
}

export type TabId = 'skillHit' | 'kalecgos';

export interface TabInfo {
  id: TabId;
  label: string;
}
