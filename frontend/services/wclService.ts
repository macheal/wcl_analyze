import { Boss, Ability, SkillHit, KalecgosPlayerStat, KalecgosFightStat } from '../types';

const MOCK_DELAY = 800;

// Mock Data
const MOCK_BOSSES: Boss[] = [
  { id: 3122, name: '狩魂猎手', kill: true },
  { id: 3134, name: '节点之王萨哈达尔', kill: true },
];

const MOCK_ABILITIES: { [bossId: number]: Ability[] } = {
  3134: [
    { id: 376333, name: '万相拳' },
    { id: 396032, name: '咆哮烈焰吐息' },
    { id: 396035, name: '野火炸弹' },
  ],
  3122: [
    { id: 400001, name: '折磨' },
    { id: 400002, name: '灵魂之链' },
  ],
};

const generateMockSkillHits = (count: number): SkillHit[] => {
  const players = ['坦克一号', '治疗二号', '输出三号', '输出四号', '输出五号'];
  const hitTypes = ['命中', '暴击', '吸收', '未命中'];
  return Array.from({ length: count }, (_, i) => {
    const unmitigated = Math.floor(Math.random() * 150000) + 50000;
    const mitigated = Math.floor(Math.random() * unmitigated * 0.4);
    return {
      timestamp: `00:0${Math.floor(i/10)}:${(i%10)*5+Math.floor(Math.random()*5)}.123`,
      playerName: players[Math.floor(Math.random() * players.length)],
      amount: unmitigated - mitigated,
      mitigated,
      unmitigated,
      hitType: hitTypes[Math.floor(Math.random() * hitTypes.length)],
    };
  });
};

const MOCK_SKILL_HITS: { [abilityId: number]: SkillHit[] } = {
  376333: generateMockSkillHits(25),
  396032: generateMockSkillHits(15),
  396035: generateMockSkillHits(10),
  400001: generateMockSkillHits(30),
  400002: generateMockSkillHits(20),
};

const MOCK_KALECGOS_PLAYER_STATS: KalecgosPlayerStat[] = [
  { playerName: '盗贼一号', hits: 5, totalDamage: 1250000, avgDamage: 250000 },
  { playerName: '法师二号', hits: 4, totalDamage: 1100000, avgDamage: 275000 },
  { playerName: '战士三号', hits: 6, totalDamage: 1500000, avgDamage: 250000 },
  { playerName: '牧师四号', hits: 3, totalDamage: 780000, avgDamage: 260000 },
  { playerName: '猎人五号', hits: 5, totalDamage: 1300000, avgDamage: 260000 },
];

const MOCK_KALECGOS_FIGHT_STATS: KalecgosFightStat[] = [
  { fightId: 1, timestamp: '00:30.123', hits: 8, totalDamage: 2100000 },
  { fightId: 2, timestamp: '01:15.456', hits: 7, totalDamage: 1850000 },
  { fightId: 3, timestamp: '02:05.789', hits: 9, totalDamage: 2400000 },
  { fightId: 4, timestamp: '02:50.101', hits: 6, totalDamage: 1600000 },
];

// API Functions
export const getBosses = (reportId: string): Promise<Boss[]> => {
  console.log(`Fetching bosses for report: ${reportId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (reportId.includes('fail')) {
        reject(new Error('Invalid report ID'));
      } else {
        resolve(MOCK_BOSSES);
      }
    }, MOCK_DELAY);
  });
};

export const getAbilities = (reportId: string, bossId: number): Promise<Ability[]> => {
  console.log(`Fetching abilities for report: ${reportId}, boss: ${bossId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_ABILITIES[bossId] || []);
    }, MOCK_DELAY);
  });
};

export const getSkillHits = (reportId: string, bossId: number, abilityId: number): Promise<SkillHit[]> => {
  console.log(`Fetching skill hits for report: ${reportId}, boss: ${bossId}, ability: ${abilityId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_SKILL_HITS[abilityId] || []);
    }, MOCK_DELAY);
  });
};

export const getKalecgosPlayerStats = (reportId: string, bossId: number): Promise<KalecgosPlayerStat[]> => {
  console.log(`Fetching Kalecgos player stats for report: ${reportId}, boss: ${bossId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (bossId === 3134) {
        resolve(MOCK_KALECGOS_PLAYER_STATS);
      } else {
        resolve([]);
      }
    }, MOCK_DELAY);
  });
};

export const getKalecgosFightStats = (reportId: string, bossId: number): Promise<KalecgosFightStat[]> => {
  console.log(`Fetching Kalecgos fight stats for report: ${reportId}, boss: ${bossId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (bossId === 3134) {
        resolve(MOCK_KALECGOS_FIGHT_STATS);
      } else {
        resolve([]);
      }
    }, MOCK_DELAY);
  });
};
