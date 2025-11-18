import { Boss, Ability, SkillHit, KalecgosPlayerStat, SkillHitSummary } from '../types';
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

// 模拟万相拳分阶段统计数据 - 匹配实际接口格式
const MOCK_KALECGOS_PHASE_STATS = [
  { id: 1, boss_percentage: 'P1_65%', cost: 150, stack_1: ['盗贼一号', '法师二号'], stack_2: ['战士三号'], stack_3: ['牧师四号', '猎人五号'], url: 'https://www.warcraftlogs.com/reports/abcd1234#fight=1' },
  { id: 2, boss_percentage: 'P1_68%', cost: 164, stack_1: ['碧山玄宗'], stack_2: [], stack_3: [], url: 'https://www.warcraftlogs.com/reports/abcd1234#fight=2' },
  { id: 3, boss_percentage: 'P1_69%', cost: 113, stack_1: [], stack_2: ['薛定谔的狗'], stack_3: ['神勇小饭团'], url: 'https://www.warcraftlogs.com/reports/abcd1234#fight=3' },
  { id: 4, boss_percentage: 'P1_58%', cost: 194, stack_1: [], stack_2: ['捕蛇鹰'], stack_3: [], url: 'https://www.warcraftlogs.com/reports/abcd1234#fight=4' },
  { id: 5, boss_percentage: 'P2_64%', cost: 136, stack_1: [], stack_2: [], stack_3: ['馒头墩儿', '云边落叶'], url: 'https://www.warcraftlogs.com/reports/abcd1234#fight=5' },
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

// 获取技能命中汇总数据
export const getSkillHitSummary = async (reportId: string, bossId: number, skillId: number): Promise<SkillHitSummary[]> => {
  console.log(`Fetching skill hit summary for report: ${reportId}, boss: ${bossId}, skill: ${skillId}`);
  
  try {
    const url = '/api/v2/code/boss_skill_hit_sum';
    const requestBody = JSON.stringify({ 
      report_id: reportId,
      boss_id: bossId,
      skill_id: skillId.toString() // 接口需要string类型的skill_id
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
    return data as SkillHitSummary[];
    
  } catch (error) {
    console.error('Failed to fetch skill hit summary:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
};

// 获取万相拳分阶段详细数据（调用新接口）
export const getKalecgosPhaseStats = async (reportId: string): Promise<any[]> => {
  console.log(`Fetching Kalecgos phase stats for report: ${reportId}`);
  
  try {
    const url = '/api/v2/code/boss_kls_M7_wxq_detail';
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
    return data;
    
  } catch (error) {
    console.error('Failed to fetch Kalecgos phase stats:', error);
    console.log('Falling back to mock data');
    // 如果API调用失败，回退到mock数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_KALECGOS_PHASE_STATS);
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
  
  // 处理新的返回值结构 - 如果返回对象包含特定字段
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 假设新结构可能将数据嵌套在某个字段中
      if (data.players && Array.isArray(data.players)) {
        const stats = data.players.map((stat: any) => ({
          playerName: stat["游戏名"] || stat.playerName || stat.name || '未知玩家',
          hits: stat["失误次数"] || stat.mistakes || stat.hits || stat.count || 0,
          totalDamage: 0, // 实际接口没有返回总伤害，设为0
          avgDamage: 0,   // 实际接口没有返回平均伤害，设为0
          mistakeDistribution: stat["失误轮次分布"] || stat.distribution || stat.mistakeDistribution || '',
          // 添加阶段相关字段
          stack_1: stat["stack_1"] || stat["stack1"] || 0,
          stack_2: stat["stack_2"] || stat["stack2"] || 0,
          stack_3: stat["stack_3"] || stat["stack3"] || 0,
        }));
      console.log(`Parsed Kalecgos player stats from new structure:`, stats);
      return stats;
    }
    // 另一种可能的新结构 - 直接包含统计数据字段
      if (data.stats && Array.isArray(data.stats)) {
        const stats = data.stats.map((stat: any) => ({
          playerName: stat["游戏名"] || stat.playerName || stat.name || '未知玩家',
          hits: stat["失误次数"] || stat.mistakes || stat.hits || stat.count || 0,
          totalDamage: 0,
          avgDamage: 0,
          mistakeDistribution: stat["失误轮次分布"] || stat.distribution || stat.mistakeDistribution || '',
          // 添加阶段相关字段
          stack_1: stat["stack_1"] || stat["stack1"] || 0,
          stack_2: stat["stack_2"] || stat["stack2"] || 0,
          stack_3: stat["stack_3"] || stat["stack3"] || 0,
        }));
      console.log(`Parsed Kalecgos player stats from stats array:`, stats);
      return stats;
    }
  }
  
  // 兼容新的数据结构格式: [{"count": 1, "name": "馒头墩儿"}]
  // 以及旧的返回值结构: [{"游戏名": "玩家1", "失误次数": 5, "失误轮次分布": "第2轮3次,第3轮2次"}]
  if (Array.isArray(data)) {
    const stats = data.map((stat: any) => ({
      playerName: stat["游戏名"] || stat.playerName || stat.name || '未知玩家',
      hits: stat["失误次数"] || stat.mistakes || stat.hits || stat.count || 0,
      totalDamage: 0, // 实际接口没有返回总伤害，设为0
      avgDamage: 0,   // 实际接口没有返回平均伤害，设为0
      mistakeDistribution: stat["失误轮次分布"] || stat.distribution || stat.mistakeDistribution || '',
      // 添加阶段相关字段
      stack_1: stat["stack_1"] || stat["stack1"] || 0,
      stack_2: stat["stack_2"] || stat["stack2"] || 0,
      stack_3: stat["stack_3"] || stat["stack3"] || 0,
    }));
    console.log(`Parsed Kalecgos player stats from array:`, stats);
    return stats;
  }
  
  // 如果没有数据，返回空数组
  console.log(`No Kalecgos player stats found in response`);
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
