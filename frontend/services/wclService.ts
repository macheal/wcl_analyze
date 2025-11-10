import { Boss, Ability, SkillHit, KalecgosPlayerStat, KalecgosFightStat, KalecgosPlayerStatActual, KalecgosFightStatActual, ExtendedKalecgosFightStat } from '../types';
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
export const getBosses = async (reportId: string): Promise<Boss[]> => {
  console.log(`Fetching bosses for report: ${reportId}`);
  
  try {
    const url = '/api/v2/code/get_wcl_boss_by_report_id';
    const requestBody = JSON.stringify({ report_id: reportId });
    
    console.log(`API Request: POST ${url}`);
    console.log(`Request Body: ${requestBody}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 添加常见的认证头，根据实际情况调整
        'Authorization': 'Bearer token', // 如果需要token认证
        'X-Requested-With': 'XMLHttpRequest', // 标识AJAX请求
      },
      body: requestBody,
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      // 如果是401错误，尝试不使用认证头重新请求
      if (response.status === 401) {
        console.log('401 error, retrying without auth headers...');
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });
        
        console.log(`Retry Response Status: ${retryResponse.status}`);
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        const data = await retryResponse.json();
        console.log(`Retry API Response Data:`, data);
        return parseBossData(data);
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response Data:`, data);
    return parseBossData(data);
    
  } catch (error) {
    console.error('Failed to fetch bosses:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_BOSSES);
      }, MOCK_DELAY);
    });
  }
};

// 辅助函数：解析技能命中数据
const parseSkillHitData = (data: any): SkillHit[] => {
  // 根据终端实际返回的数据格式进行转换
  // 实际返回格式: [{"hits":"玩家1,玩家2,玩家3","session":21}]
  if (Array.isArray(data)) {
    const skillHits = data.map((hit: any, index: number) => ({
      timestamp: `Session ${hit.session || index + 1}`,
      playerName: hit.hits || '未知玩家',
      amount: 0,
      mitigated: 0,
      unmitigated: 0,
      hitType: '命中',
    }));
    console.log(`Parsed skill hits from array:`, skillHits);
    return skillHits;
  }
  
  // 如果返回的是对象格式，包含skill_hits数组
  if (data.skill_hits && Array.isArray(data.skill_hits)) {
    const skillHits = data.skill_hits.map((hit: any, index: number) => ({
      timestamp: `Session ${hit.session || index + 1}`,
      playerName: hit.hits || '未知玩家',
      amount: 0,
      mitigated: 0,
      unmitigated: 0,
      hitType: '命中',
    }));
    console.log(`Parsed skill hits:`, skillHits);
    return skillHits;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No skill hit data found in response`);
  return [];
};

// 辅助函数：解析技能数据
const parseAbilityData = (data: any): Ability[] => {
  // 根据API返回的数据格式进行转换
  // API返回的数据格式可能为: [{skill_id: 376333, skill_name: "万相拳"}]
  if (Array.isArray(data)) {
    const abilities = data.map((ability: any) => ({
      id: ability.skill_id || ability.id,  // 兼容skill_id和id字段
      name: ability.skill_name || ability.name,  // 兼容skill_name和name字段
    }));
    console.log(`Parsed abilities from array:`, abilities);
    return abilities;
  }
  
  // 如果返回的是对象格式，包含abilities数组
  if (data.abilities && Array.isArray(data.abilities)) {
    const abilities = data.abilities.map((ability: any) => ({
      id: ability.skill_id || ability.id,
      name: ability.skill_name || ability.name,
    }));
    console.log(`Parsed abilities:`, abilities);
    return abilities;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No ability data found in response`);
  return [];
};

// 辅助函数：解析万相拳玩家统计数据
const parseKalecgosPlayerStats = (data: any): KalecgosPlayerStat[] => {
  // 根据实际API返回的数据格式进行转换
  // 实际返回格式: [{"游戏名": "玩家1", "失误次数": 5, "失误轮次分布": "第2轮3次,第3轮2次"}]
  if (Array.isArray(data)) {
    const stats = data.map((stat: KalecgosPlayerStatActual) => ({
      playerName: stat["游戏名"] || '未知玩家',
      hits: stat["失误次数"] || 0,
      totalDamage: 0, // 实际接口没有返回总伤害，设为0
      avgDamage: 0,   // 实际接口没有返回平均伤害，设为0
      mistakeDistribution: stat["失误轮次分布"] || '', // 保留失误轮次分布信息
    }));
    console.log(`Parsed Kalecgos player stats:`, stats);
    return stats;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No Kalecgos player stats found in response`);
  return [];
};

// 辅助函数：解析万相拳分场次统计数据
const parseKalecgosFightStats = (data: any): ExtendedKalecgosFightStat[] => {
  // 根据实际API返回的数据格式进行转换
  // 实际返回格式: [{"id": 21, "boss血量": "95%(P1)", "时间": 8525658, "用时(秒)": 41, "data": ""}]
  if (Array.isArray(data)) {
    const stats = data.map((stat: KalecgosFightStatActual) => ({
      fightId: stat["id"] || 0,
      timestamp: stat["boss血量"] || '未知阶段',
      hits: stat["用时(秒)"] || 0,  // 用时作为命中次数的替代
      totalDamage: 0,  // 实际接口没有返回总伤害，设为0
      detail: stat["data"] || '', // 添加明细数据
    }));
    console.log(`Parsed Kalecgos fight stats:`, stats);
    return stats;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No Kalecgos fight stats found in response`);
  return [];
};

// 辅助函数：解析boss数据
const parseBossData = (data: any): Boss[] => {
  // 根据API返回的数据格式进行转换
  // API返回的数据格式为: [{boss_id: 3122, boss_name: "狩魂猎手"}]
  if (Array.isArray(data)) {
    const bosses = data.map((boss: any) => ({
      id: boss.boss_id || boss.id,  // 兼容boss_id和id字段
      name: boss.boss_name || boss.name,  // 兼容boss_name和name字段
      kill: boss.kill || false,
    }));
    console.log(`Parsed bosses from array:`, bosses);
    return bosses;
  }
  
  // 如果返回的是对象格式，包含bosses数组
  if (data.bosses && Array.isArray(data.bosses)) {
    const bosses = data.bosses.map((boss: any) => ({
      id: boss.boss_id || boss.id,
      name: boss.boss_name || boss.name,
      kill: boss.kill || false,
    }));
    console.log(`Parsed bosses:`, bosses);
    return bosses;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No boss data found in response`);
  return [];
};

export const getAbilities = async (reportId: string, bossId: number): Promise<Ability[]> => {
  console.log(`Fetching abilities for report: ${reportId}, boss: ${bossId}`);
  
  try {
    const url = '/api/v2/code/get_wcl_damage_taken_abilities_by_boss_id';
    const requestBody = JSON.stringify({ 
      report_id: reportId,
      boss_id: bossId 
    });
    
    console.log(`API Request: POST ${url}`);
    console.log(`Request Body: ${requestBody}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response Data:`, data);
    return parseAbilityData(data);
    
  } catch (error) {
    console.error('Failed to fetch abilities:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ABILITIES[bossId] || []);
      }, MOCK_DELAY);
    });
  }
};

export const getSkillHits = async (reportId: string, bossId: number, abilityId: number): Promise<SkillHit[]> => {
  console.log(`Fetching skill hits for report: ${reportId}, boss: ${bossId}, ability: ${abilityId}`);
  
  try {
    const url = '/api/v2/code/boss_skill_hit_list';
    const requestBody = JSON.stringify({ 
      report_id: reportId,
      boss_id: bossId,
      skill_id: abilityId
    });
    
    console.log(`API Request: POST ${url}`);
    console.log(`Request Body: ${requestBody}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response Data:`, data);
    return parseSkillHitData(data);
    
  } catch (error) {
    console.error('Failed to fetch skill hits:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_SKILL_HITS[abilityId] || []);
      }, MOCK_DELAY);
    });
  }
};

export const getKalecgosPlayerStats = async (reportId: string, bossId: number): Promise<KalecgosPlayerStat[]> => {
  console.log(`Fetching Kalecgos player stats for report: ${reportId}, boss: ${bossId}`);
  
  try {
    const url = '/api/v2/code/boss_kls_M7_wxq';
    const requestBody = JSON.stringify({ 
      report_id: reportId
    });
    
    console.log(`API Request: POST ${url}`);
    console.log(`Request Body: ${requestBody}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response Data:`, data);
    
    // 解析万相拳汇总统计数据
    return parseKalecgosPlayerStats(data);
    
  } catch (error) {
    console.error('Failed to fetch Kalecgos player stats:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        if (bossId === 3134) {
          resolve(MOCK_KALECGOS_PLAYER_STATS);
        } else {
          resolve([]);
        }
      }, MOCK_DELAY);
    });
  }
};

export const getKalecgosFightStats = async (reportId: string, bossId: number): Promise<ExtendedKalecgosFightStat[]> => {
  console.log(`Fetching Kalecgos fight stats for report: ${reportId}, boss: ${bossId}`);
  
  try {
    const url = '/api/v2/code/boss_kls_M7_wxq_list';
    const requestBody = JSON.stringify({ 
      report_id: reportId
    });
    
    console.log(`API Request: POST ${url}`);
    console.log(`Request Body: ${requestBody}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response Data:`, data);
    
    // 解析万相拳分场次统计数据
    return parseKalecgosFightStats(data);
    
  } catch (error) {
    console.error('Failed to fetch Kalecgos fight stats:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        if (bossId === 3134) {
          resolve(MOCK_KALECGOS_FIGHT_STATS);
        } else {
          resolve([]);
        }
      }, MOCK_DELAY);
    });
  }
};
