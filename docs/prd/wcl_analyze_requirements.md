<!--
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 11:15:59
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-13 11:21:14
 * @FilePath: /wcl_analyze/docs/prd/wcl_analyze_requirements.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# WCL战斗日志分析系统 - 前端查询页面需求文档

## 项目背景

WCL (Warcraft Logs) 是一个魔兽世界战斗日志分析平台，本项目旨在为WCL战斗日志提供一个可视化的查询和分析界面，帮助玩家和团队更好地分析战斗数据，提升游戏表现。

## 项目目标

构建一个用户友好的Web前端界面，提供以下核心功能：
1. 战斗报告查询入口
2. Boss选择和管理
3. 技能命中分析
4. 卡雷什M7万相拳统计分析

## 用户画像

**主要用户群体：**
- 魔兽世界团队副本团长和指挥
- 团队分析师和数据爱好者
- 个人玩家寻求提升表现

**用户特征：**
- 熟悉WCL平台的基本使用
- 需要快速查看特定战斗数据
- 关注技能命中和伤害统计
- 需要直观的数据展示方式

## 功能列表

### 1. 报告ID输入功能
- **描述**：页面加载时弹出模态框，要求用户输入WCL报告ID
- **输入要求**：支持标准的WCL报告ID格式（如：tTAM3BKp9Yjd7RHr）
- **验证**：基本的格式验证，确保输入不为空
- **用户体验**：提供示例和错误提示

### 2. Boss选择功能
- **描述**：根据输入的报告ID，获取并显示可用的Boss列表
- **数据来源**：调用 `/api/v2/code/get_wcl_boss_by_report_id` 接口
- **交互方式**：下拉选择框，支持搜索过滤
- **显示内容**：Boss名称、ID、击杀状态

### 3. Tab页切换功能
- **描述**：提供两个主要的分析tab页
- **Tab 1 - 命中技能查询**：
  - 显示技能列表（调用 `/api/v2/code/get_wcl_damage_taken_abilities`）
  - 支持按技能筛选和查询详细命中数据（调用 `/api/v2/code/boss_skill_hit_list`）
  - 展示技能命中统计表格
  
- **Tab 2 - 卡雷什M7万相拳统计**：
  - 分人统计（调用 `/api/v2/code/boss_kls_M7_wxq`）
  - 分场次统计（调用 `/api/v2/code/boss_kls_M7_wxq_list`）
  - 图表化展示数据分布

### 4. 数据展示功能
- **表格展示**：清晰的数据表格，支持排序和筛选


## 非功能性要求

### 性能要求
- 页面加载时间 < 2秒
- API响应时间 < 3秒
- 支持并发用户 > 50人

### 用户体验要求
- 界面简洁直观，符合现代Web设计标准
- 提供加载状态和错误处理
- 支持键盘快捷键操作
- 响应式设计，支持移动端访问

### 技术规范
- 使用React或Vue.js框架
- 支持现代浏览器（Chrome, Firefox, Safari, Edge）
- 遵循RESTful API设计原则
- 代码结构清晰，易于维护

### 安全要求
- 输入验证和消毒处理
- HTTPS协议传输
- 防止XSS和CSRF攻击

## 接口依赖

项目依赖以下后端API接口：
- `POST /api/v2/code/get_wcl_boss_by_report_id` - 获取Boss列表
- `POST /api/v2/code/get_wcl_damage_taken_abilities` - 获取技能列表
- `POST /api/v2/code/boss_skill_hit_list` - 获取技能命中详情
- `POST /api/v2/code/boss_kls_M7_wxq` - 卡雷什M7万相拳分人统计
- `POST /api/v2/code/boss_kls_M7_wxq_list` - 卡雷什M7万相拳分场次统计

## 项目交付物

1. 完整的前端Web应用
2. 项目文档和使用说明
3. 部署脚本和配置文件
4. 测试用例和测试报告

