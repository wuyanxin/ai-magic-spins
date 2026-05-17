# MagicSpins - 药吃了么 智能用药管理应用 MVP 设计文档

**版本：** V1.0 (MVP)  
**产品名称：** MagicSpins（药吃了么）

---

## 1. 项目概述

### 1.1 产品名称
**MagicSpins（药吃了么）** - 智能用药管理应用

### 1.2 核心价值主张
帮助用户（特别是慢性病患者和家庭成员）科学管理用药，通过智能提醒和记录追踪，确保用药遵从性，维护健康。

### 1.3 MVP目标
在2.5小时内构建一个可运行的iOS应用，实现：
- 药物添加和管理
- 智能用药提醒
- 服药记录追踪
- 基础遵从率统计

### 1.4 目标用户
- 慢性病患者（高血压、糖尿病等）
- 需要长期服药的用户
- 家庭健康管理需求

---

## 2. 技术架构

### 2.1 技术栈
| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | SwiftUI | 现代声明式UI框架，开发效率高 |
| 编程语言 | Swift 5.9+ | Apple最新Swift版本 |
| 本地数据库 | SQLite.swift | 轻量级本地数据持久化 |
| 通知系统 | UserNotifications | 原生本地通知框架 |
| 认证 | Sign in with Apple | 快速安全的用户认证 |
| 架构模式 | MVVM | 简洁的视图-模型分离 |

### 2.2 项目结构
```
MagicSpins/
├── App/
│   ├── MagicSpinsApp.swift        # 应用入口
│   └── ContentView.swift         # 根视图
├── Views/
│   ├── Home/                      # 首页模块
│   │   ├── HomeView.swift         # 今日仪表盘
│   │   └── MedicationCard.swift   # 药物卡片组件
│   ├── Medication/                 # 药物管理模块
│   │   ├── MedicationListView.swift
│   │   ├── AddMedicationView.swift
│   │   └── MedicationDetailView.swift
│   ├── History/                   # 历史记录模块
│   │   └── HistoryView.swift
│   └── Settings/                  # 设置模块
│       └── SettingsView.swift
├── ViewModels/
│   ├── MedicationViewModel.swift
│   ├── ReminderViewModel.swift
│   └── HistoryViewModel.swift
├── Models/
│   ├── Medication.swift
│   ├── Reminder.swift
│   └── DoseRecord.swift
├── Services/
│   ├── DatabaseService.swift      # 数据库服务
│   ├── NotificationService.swift  # 通知服务
│   └── AuthenticationService.swift # 认证服务
├── Utilities/
│   ├── Constants.swift
│   └── Extensions.swift
└── Resources/
    └── Assets.xcassets
```

### 2.3 数据模型

#### Medication（药物）
```swift
struct Medication {
    var id: UUID
    var name: String              // 药物名称
    var dosage: String            // 剂量（如"500mg"）
    var frequency: Frequency      // 服药频率
    var reminderTimes: [Date]     // 提醒时间列表
    var category: MedicationCategory  // 分类
    var notes: String?            // 备注
    var createdAt: Date
    var updatedAt: Date
}

enum Frequency: String {
    case daily = "每日一次"
    case twiceDaily = "每日两次"
    case threeTimesDaily = "每日三次"
    case fourTimesDaily = "每日四次"
    case asNeeded = "必要时"
}

enum MedicationCategory: String {
    case morning = "早餐"
    case lunch = "午餐"
    case dinner = "晚餐"
    case bedtime = "睡前"
    case other = "其他"
}
```

#### DoseRecord（服药记录）
```swift
struct DoseRecord {
    var id: UUID
    var medicationId: UUID
    var scheduledTime: Date
    var actualTime: Date?
    var status: DoseStatus
    var skippedReason: String?
}

enum DoseStatus: String {
    case taken = "已服用"
    case skipped = "跳过"
    case missed = "未服用"
    case pending = "待服用"
}
```

---

## 3. UI/UX 设计

### 3.1 设计原则
1. **简洁直观** - 用户能在3秒内理解界面
2. **操作便捷** - 添加药物不超过3步
3. **视觉清晰** - 大字号、高对比度，适合各年龄段
4. **反馈及时** - 每个操作都有明确的视觉反馈

### 3.2 配色方案
| 用途 | 颜色名称 | Hex值 |
|------|----------|-------|
| 主色 | 健康蓝 | #007AFF |
| 成功色 | 服用绿 | #34C759 |
| 警告色 | 提醒橙 | #FF9500 |
| 危险色 | 漏服红 | #FF3B30 |
| 背景色 | 浅灰白 | #F2F2F7 |
| 文字主色 | 深灰 | #1C1C1E |
| 文字次色 | 中灰 | #8E8E93 |

### 3.3 页面结构

#### TabBar导航（底部标签栏）
1. **首页** - 今日用药计划
2. **药物** - 药物列表管理
3. **历史** - 服药记录
4. **设置** - 应用设置

#### 页面1：首页（HomeView）
**功能：** 展示今日用药计划，快速标记服用状态

**布局：**
- 顶部：日期 + 遵从率统计
- 中部：今日药物卡片列表（按时间排序）
- 每个卡片包含：
  - 药物名称和剂量
  - 提醒时间
  - 服用状态（待服用/已服用/跳过）
  - 快速操作按钮

**交互：**
- 点击卡片：展开详情或标记服用
- 左滑：跳过服药并选择原因
- 右滑：标记为已服用

#### 页面2：药物列表（MedicationListView）
**功能：** 管理所有药物

**布局：**
- 顶部：搜索栏 + 添加按钮
- 中部：药物列表（按分类分组）
- 每个药物卡片：
  - 药物名称
  - 剂量和频率
  - 下次提醒时间

**交互：**
- 点击：查看详情
- 左滑：编辑或删除
- 点击"+": 添加新药物

#### 页面3：添加/编辑药物（AddMedicationView）
**功能：** 添加新药物或编辑现有药物

**表单字段：**
1. 药物名称（必填）
2. 剂量（必填，如"500mg"）
3. 服药频率（必填，单选）
4. 提醒时间（必填，最多4个时间点）
5. 分类（必填，单选）
6. 备注（可选）

**交互：**
- 时间选择器：滚轮选择时间
- 保存：验证并保存到数据库
- 取消：返回上级页面

#### 页面4：历史记录（HistoryView）
**功能：** 查看历史服药情况

**布局：**
- 顶部：时间筛选（本周/本月）
- 中部：日历视图（可选）或列表视图
- 统计卡片：
  - 总遵从率
  - 本周服药次数
  - 漏服次数

**交互：**
- 下拉刷新：更新数据
- 点击日期：查看当日详情

#### 页面5：设置（SettingsView）
**功能：** 应用配置

**设置项：**
- 通知开关
- 提醒声音选择
- 深色模式切换
- 数据导出（PDF报告）
- 隐私政策
- 关于我们

---

## 4. 核心功能实现

### 4.1 药物管理

#### 添加药物流程
1. 用户点击"+"按钮
2. 填写药物信息表单
3. 选择提醒时间（最多4个）
4. 点击"保存"
5. 系统创建药物记录和提醒任务
6. 显示成功提示，返回列表页

#### 数据验证规则
- 药物名称：必填，长度2-50字符
- 剂量：必填，格式如"500mg"
- 提醒时间：至少选择1个时间点

### 4.2 用药提醒系统

#### 通知配置
- 使用UserNotifications框架
- 请求通知权限（首次添加药物时）
- 设置循环通知（每日重复）
- 支持跳过和延后操作

#### 提醒逻辑
1. 到达提醒时间 → 发送本地通知
2. 用户点击通知 → 打开应用并显示该药物
3. 用户操作：
   - "已服用" → 记录actualTime为当前时间
   - "跳过" → 记录status为skipped
   - 无操作 → 30分钟后再次提醒

#### 通知内容模板
- **标题：** 📋 该服药啦
- **内容：** [药物名称] [剂量]，请按时服用
- **动作按钮：** "已服用" | "跳过" | "延后"

### 4.3 服药记录追踪

#### 记录生成
- 每个提醒时间点对应一条DoseRecord
- 初始状态：pending
- 用户操作后更新状态

#### 遵从率计算
```
遵从率 = (已服用次数 + 跳过次数) / 总提醒次数 × 100%
```

#### 统计维度
- 今日遵从率
- 本周遵从率
- 本月遵从率
- 连续服药天数

---

## 5. 数据库设计

### 5.1 SQLite表结构

#### medications表
```sql
CREATE TABLE medications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);
```

#### reminder_times表
```sql
CREATE TABLE reminder_times (
    id TEXT PRIMARY KEY,
    medicationId TEXT NOT NULL,
    time TEXT NOT NULL,
    FOREIGN KEY (medicationId) REFERENCES medications(id)
);
```

#### dose_records表
```sql
CREATE TABLE dose_records (
    id TEXT PRIMARY KEY,
    medicationId TEXT NOT NULL,
    scheduledTime TEXT NOT NULL,
    actualTime TEXT,
    status TEXT NOT NULL,
    skippedReason TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (medicationId) REFERENCES medications(id)
);
```

### 5.2 数据库服务
```swift
class DatabaseService {
    func addMedication(_ medication: Medication) throws
    func updateMedication(_ medication: Medication) throws
    func deleteMedication(id: UUID) throws
    func fetchAllMedications() throws -> [Medication]
    func addDoseRecord(_ record: DoseRecord) throws
    func updateDoseRecord(_ record: DoseRecord) throws
    func fetchDoseRecords(for date: Date) throws -> [DoseRecord]
    func calculateComplianceRate(from: Date, to: Date) throws -> Double
}
```

---

## 6. 开发时间分配

### 6.1 时间预算（150分钟）

| 阶段 | 任务 | 时间 | 负责人 |
|------|------|------|--------|
| **初始化** | 项目创建和配置 | 10分钟 | 开发 |
| | Xcode项目创建 | 3分钟 | |
| | SwiftUI结构搭建 | 4分钟 | |
| | SQLite配置 | 3分钟 | |
| **数据层** | 数据模型定义 | 10分钟 | 开发 |
| | 数据库服务实现 | 15分钟 | |
| **认证** | Apple Sign In集成 | 15分钟 | 开发 |
| **业务逻辑** | 药物ViewModel | 10分钟 | 开发 |
| | 提醒ViewModel | 10分钟 | |
| | 历史ViewModel | 10分钟 | |
| **通知服务** | 通知服务实现 | 20分钟 | 开发 |
| **UI界面** | 首页视图 | 10分钟 | 开发 |
| | 药物列表页 | 10分钟 | |
| | 添加药物页 | 10分钟 | |
| | 历史记录页 | 8分钟 | |
| | 设置页 | 7分钟 | |
| **测试** | 模拟器测试 | 10分钟 | 开发 |
| | Bug修复 | 5分钟 | |
| **总计** | | **150分钟** | |

### 6.2 里程碑
- **T+0分钟**：项目初始化完成
- **T+35分钟**：数据层和数据库完成
- **T+70分钟**：通知服务完成
- **T+130分钟**：所有UI页面完成
- **T+150分钟**：测试和修复完成

---

## 7. MVP版本限制和后续规划

### 7.1 MVP排除的功能
| 功能 | 排除原因 | 后续版本 |
|------|----------|----------|
| AI智能识别 | 需要AI模型或API | V2.0 |
| 扫码识别 | 需要SDK集成 | V2.0 |
| 处方导入 | 需要OCR和API | V2.0 |
| 家庭成员管理 | 权限系统复杂 | V2.0 |
| 云端同步 | 需要后端服务 | V2.0 |
| Apple Health集成 | 需要额外配置 | V2.0 |
| 健康设备联动 | 需要蓝牙开发 | V2.0 |
| 药物相互作用检测 | 需要专业数据库 | V3.0 |
| 库存预警 | 需要购药服务 | V3.0 |
| SOS紧急功能 | 需要联系人服务 | V3.0 |
| 订阅和付费 | 需要支付集成 | V2.0 |

### 7.2 V2.0功能规划
1. AI智能识别（拍照识别药品）
2. 家庭成员管理
3. 云端数据同步
4. Apple Health集成
5. 扫码识别
6. 订阅系统

### 7.3 V3.0功能规划
1. 药物相互作用检测
2. 健康设备联动
3. 医院系统对接
4. SOS紧急求助
5. 药品库存管理

---

## 8. 测试计划

### 8.1 功能测试用例
| 测试项 | 输入 | 预期结果 |
|--------|------|----------|
| 添加药物 | 完整信息 | 药物出现在列表中 |
| 添加药物 | 缺少必填项 | 显示错误提示 |
| 设置提醒 | 选择时间 | 本地通知生效 |
| 标记服用 | 点击"已服用" | 记录时间更新，界面刷新 |
| 跳过服药 | 选择跳过 | 显示跳过原因选项 |
| 查看历史 | 切换日期 | 显示对应日期记录 |
| 计算遵从率 | 有记录数据 | 正确计算百分比 |

### 8.2 测试场景
1. **正常流程**：添加药物 → 设置提醒 → 到点提醒 → 标记服用 → 查看历史
2. **跳过流程**：到点提醒 → 跳过服药 → 查看记录
3. **编辑流程**：编辑药物信息 → 确认更新
4. **删除流程**：删除药物 → 确认删除 → 相关记录清除

---

## 9. 风险评估和缓解

### 9.1 技术风险
| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 通知权限被拒绝 | 高 | 中 | 引导用户手动开启权限 |
| 数据库写入失败 | 高 | 低 | 添加错误处理和重试逻辑 |
| UI性能问题 | 中 | 低 | 使用LazyVStack优化列表 |

### 9.2 时间风险
| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 功能范围蔓延 | 高 | 中 | 严格遵守MVP范围 |
| 测试发现严重Bug | 高 | 低 | 保留10分钟缓冲时间 |
| 依赖项安装问题 | 中 | 低 | 提前检查Xcode版本 |

### 9.3 质量风险
- **单元测试**：MVP阶段跳过，V2.0开始引入
- **代码审查**：MVP阶段简化，聚焦功能可用性
- **UI一致性**：使用系统组件和统一的设计语言

---

## 10. 成功标准

### 10.1 MVP成功指标
- ✅ 应用能在模拟器上成功运行
- ✅ 用户能添加至少5种药物
- ✅ 提醒通知能正常发送
- ✅ 服药记录能正确保存和显示
- ✅ 遵从率统计显示正确
- ✅ 核心流程（添加→提醒→记录）无Bug

### 10.2 用户体验标准
- ⏱️ 添加一个药物 < 30秒
- 📱 界面加载 < 1秒
- ✅ 操作反馈 < 100ms
- 🔔 通知延迟 < 5秒

---

## 11. 文档和交付物

### 11.1 MVP交付物
- ✅ 可运行的iOS应用（.app文件）
- ✅ 完整源代码
- ✅ 设计文档（本文件）
- ✅ 简单的用户使用指南

### 11.2 代码规范
- 遵循Swift代码规范
- 使用SwiftUI最佳实践
- 添加必要的注释和文档字符串
- 使用English命名（国际标准）

---

**文档状态：** 已完成  
**下次更新：** V2.0规划时  
**维护者：** MagicSpins开发团队
