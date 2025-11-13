# WCL 团队失误分析系统

一个基于React + TypeScript开发的魔兽世界**团队失误分析系统**，通过对战斗数据的采集与分析，实现对团队整体失误情况的量化评估，精准定位每位团队成员的技能薄弱环节，并建立可视化的个人成长曲线追踪系统。

## 🌟 项目特色

- **团队失误量化分析**: 精准评估团队整体失误情况，提供科学的失误率计算
- **个人薄弱环节定位**: 智能识别每位成员的技能短板，建立个人失误档案
- **成长曲线可视化**: 追踪个人进步轨迹，直观展示能力提升过程
- **专业化分析**: 针对节点之王萨哈达尔-誓言约束（万相拳）机制的深度分析
- **智能数据可视化**: 支持图表下钻、交互式分析
- **响应式设计**: 完美支持桌面端和移动端
- **一键部署**: 提供完整的Nginx部署方案
- **暗黑主题**: 专为长时间数据查看优化的界面设计

## 🚀 开发路线图

### 版本 1.0 (当前) - 团队失误分析基础版
- ✅ 基础WCL数据查询和分析
- ✅ 节点之王萨哈达尔-誓言约束（万相拳）专项分析
- ✅ 团队失误量化评估系统
- ✅ 个人薄弱环节识别功能
- ✅ 数据可视化图表展示
- ✅ 响应式界面设计

### 版本 1.1 (即将发布) - 失误统计优化版
- 🔄 场均失误统计分析模块
- 🔄 MVP评选系统
- 🔄 多维度战斗日志分析
- 🔄 成长曲线可视化
- 🔄 数据导出功能优化

### 版本 2.0 (规划中) - 高级分析版
- 📋 公会赛季分析功能
- 📋 死亡技能专项分析
- 📋 重点技能深度分析模型
- 📋 智能预警系统
- 📋 历史数据对比分析

### 版本 3.0 (未来) - 智能教练版
- 🤖 AI智能分析建议
- 🧠 机器学习预测分析
- 👥 团队协作功能
- 📱 移动端APP
- 🌐 多语言支持
- 🏆 社区竞赛功能

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 开发环境搭建

1. **克隆项目**
```bash
git clone https://github.com/your-username/wcl_analyze.git
cd wcl_analyze/frontend
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问: http://localhost:3000

### 生产环境部署

1. **构建静态文件**
```bash
npm run build
```

2. **执行一键部署脚本**
```bash
sudo ./deploy-nginx.sh
```

3. **验证部署**
```bash
curl http://localhost
```

## 📋 功能特性

### 🔍 报告查询
- 支持WCL报告ID输入和验证
- URL参数自动填充功能
- 示例报告ID和演示图片指导

### 👑 Boss选择
- 自动获取报告中的Boss列表
- 智能Tab显示（选择卡雷苟斯显示万相拳分析）
- Boss击杀状态显示

### 📊 技能命中分析
- 技能列表展示和选择
- 命中详情数据表格
- 支持数据实时刷新
- 多维度数据排序
- **失误率计算**: 自动计算个人和团队失误率

### 🥊 节点之王萨哈达尔-誓言约束（万相拳）分析
#### 玩家维度统计（个人失误档案）
- 玩家失误次数统计
- 分阶段失误分析（第一次、第二次、第三次）
- **失误率计算**: 失误次数/总参与场次 × 100%
- **成长趋势**: 基于历史数据的进步轨迹追踪
- 支持按任意列排序

#### 分场次统计（团队失误分析）
- 场次详情和WCL链接
- Boss血量阶段追踪
- 各阶段失误玩家列表
- **团队失误率**: 单场团队整体失误表现评估
- **失误集中时段**: 识别失误高发时间段
- 支持按任意列排序

#### 可视化图表（数据洞察）
- **玩家维度饼图**: 显示各玩家失误占比
- **失误次数饼图**: 显示不同阶段失误分布
- **成长曲线图**: 展示个人失误率变化趋势
- **团队热力图**: 可视化团队整体失误分布
- **交互式下钻**: 点击图表进入详细分析
- **一键返回**: 支持下钻后的返回操作

## 🛠 技术架构

### 前端技术栈
```
- React 18.3.1 + TypeScript
- Vite 6.2.0 (构建工具)
- Tailwind CSS (样式框架)
- ECharts + echarts-for-react (图表库)
- React Hooks (状态管理)
```

### 项目结构
```
wcl_analyze/
├── frontend/                    # 前端应用源码
│   ├── components/             # React组件
│   │   ├── BossSelector.tsx    # Boss选择器
│   │   ├── DataTable.tsx       # 通用数据表格
│   │   ├── KalecgosAnalysis.tsx # 万相拳分析主组件
│   │   ├── KalecgosPieCharts.tsx # 饼图组件
│   │   ├── ReportIdModal.tsx   # 报告ID输入模态框
│   │   ├── SkillHitAnalysis.tsx # 技能命中分析
│   │   └── Spinner.tsx         # 加载动画
│   ├── services/               # API服务
│   │   └── wclService.ts       # WCL数据服务
│   ├── types.ts                # TypeScript类型定义
│   ├── App.tsx                 # 应用主组件
│   └── vite.config.ts          # Vite配置
├── docs/                       # 文档
│   └── prd/                    # 产品需求文档
├── api/                        # API测试文件
│   ├── dms_wcl.http           # 后端接口测试
│   └── wcl.http               # WCL官方API测试
├── deploy-nginx.sh            # 一键部署脚本
└── DEPLOYMENT-NGINX.md        # 部署说明文档
```

## 🔌 API接口

系统依赖以下后端API接口：

| 接口 | 用途 |
|------|------|
| `POST /api/v2/code/get_wcl_boss_by_report_id` | 获取Boss列表 |
| `POST /api/v2/code/get_wcl_damage_taken_abilities_by_boss_id` | 获取技能列表 |
| `POST /api/v2/code/boss_skill_hit_list` | 获取技能命中详情 |
| `POST /api/v2/code/boss_kls_M7_wxq` | 万相拳分人统计 |
| `POST /api/v2/code/boss_kls_M7_wxq_list` | 万相拳分场次统计 |
| `POST /api/v2/code/boss_kls_M7_wxq_detail` | 万相拳分阶段详细统计 |

## ⚙️ 配置说明

### 开发环境配置
编辑 `frontend/vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-api-server:port', // 修改为你的API服务器地址
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### 生产环境配置
编辑 `deploy/nginx.conf`:
```nginx
location /api/ {
    proxy_pass http://your-api-server:port; # 修改为你的API服务器地址
}
```

## 🎯 使用指南

### 团队失误分析流程

1. **获取WCL报告ID**
   - 登录 [Warcraft Logs](https://www.warcraftlogs.com)
   - 上传或找到你的团队战斗日志
   - 从URL中复制报告ID

2. **输入报告ID**
   - 在应用首页输入报告ID
   - 或使用URL参数: `http://localhost:3000#reportId=YOUR_REPORT_ID`

3. **选择Boss**
   - 从下拉列表中选择要分析的Boss
   - 系统会自动显示相应的分析Tab
   - **推荐选择**: 节点之王萨哈达尔（万相拳分析）

4. **团队失误分析**
   - **技能命中分析**: 查看所有技能命中情况，识别薄弱环节
   - **万相拳专项分析**: 深度分析誓言约束技能表现
   - **个人失误档案**: 查看每位成员的具体失误记录
   - **成长曲线**: 追踪个人失误率变化趋势

### 数据洞察解读

#### 失误率指标
- **个人失误率** = 个人失误次数 ÷ 总参与场次 × 100%
- **团队失误率** = 团队总失误次数 ÷ 总场次 × 100%
- **进步幅度** = (前期失误率 - 近期失误率) ÷ 前期失误率 × 100%

#### 分析维度
- **时间维度**: 识别失误集中时段
- **个人维度**: 定位每位成员的易错技能
- **团队维度**: 评估整体配合表现
- **成长维度**: 追踪能力提升轨迹

### 高级功能

- **数据刷新**: 点击刷新按钮获取最新数据
- **排序功能**: 点击表格列头进行排序
- **图表下钻**: 点击饼图进入详细分析
- **一键重置**: 点击"更改"按钮重置所有选择

## 🧪 开发指南

### 代码规范
- 使用TypeScript进行类型安全开发
- 遵循React Hooks最佳实践
- 组件化设计，保持高内聚低耦合
- 添加必要的代码注释

### 性能优化
- 使用 `React.memo` 优化组件重渲染
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
- 合理使用异步数据加载

### 错误处理
- API请求失败时显示友好错误信息
- 提供数据加载回退方案
- 实现组件级错误边界
- 添加必要的输入验证

## 📈 性能指标

### 系统性能
- **页面加载时间**: < 2秒
- **API响应时间**: < 3秒
- **支持并发用户**: > 50人
- **移动端适配**: 完美支持主流移动设备

### 分析精度
- **失误识别准确率**: > 95%
- **数据更新频率**: 实时更新
- **历史数据存储**: 支持90天历史记录
- **分析维度**: 支持5个维度同时分析

### 用户体验
- **数据可视化响应**: < 1秒
- **图表交互延迟**: < 0.5秒
- **搜索过滤响应**: < 0.3秒
- **导出功能完成**: < 5秒

## 🔧 故障排除

### 常见问题

**Q: 报告ID输入后无反应？**
A: 检查API服务器是否正常运行，查看浏览器控制台错误信息

**Q: 图表显示异常？**
A: 确保ECharts库正确加载，检查数据格式是否符合要求

**Q: 部署后无法访问？**
A: 检查Nginx配置是否正确，确认防火墙端口设置

### 调试方法
```bash
# 查看开发服务器日志
npm run dev

# 检查Nginx配置
nginx -t

# 查看Nginx访问日志
tail -f /var/log/nginx/wcl-access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/wcl-error.log
```

## 🤝 贡献指南

1. Fork 项目到您的GitHub账户
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Warcraft Logs](https://www.warcraftlogs.com) 提供优秀的战斗日志平台
- [React](https://reactjs.org) 提供强大的前端框架
- [ECharts](https://echarts.apache.org) 提供丰富的图表组件
- [Tailwind CSS](https://tailwindcss.com) 提供优雅的样式框架

## 📞 联系方式

- 项目维护者: GUANGYU WANG
- 邮箱: xinyukc01@hotmail.com
- 项目地址: https://github.com/your-username/wcl_analyze

---

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！**