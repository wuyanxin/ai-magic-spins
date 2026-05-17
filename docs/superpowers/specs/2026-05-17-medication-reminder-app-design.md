# 用药提醒应用详细设计文档

**项目名称**: MedReminder - 智能用药提醒应用  
**版本**: v1.0  
**日期**: 2026-05-17  
**状态**: 设计完成，待实现

---

## 目录

1. [整体架构](#1-整体架构)
2. [家人管理模块](#2-家人管理模块详细设计)
3. [药品添加模块](#3-药品添加模块详细设计)
4. [服药提醒模块](#4-服药提醒模块详细设计)
5. [LLM智能功能](#5-llm智能功能详细设计)
6. [数据库设计](#6-数据库设计)
7. [错误处理](#7-错误处理)
8. [测试策略](#8-测试策略)
9. [部署架构](#9-部署架构)
10. [后续扩展功能](#10-后续扩展功能)

---

## 1. 整体架构

### 1.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | Vue 3 + Vite | 现代化前端框架，开发效率高 |
| **状态管理** | Pinia | Vue 3 官方推荐的状态管理库 |
| **UI组件库** | Element Plus | 成熟的Vue 3 UI组件库 |
| **路由管理** | Vue Router | Vue官方路由管理器 |
| **后端框架** | Node.js + Express | 高性能JavaScript运行时+成熟框架 |
| **数据库** | MongoDB | 文档型数据库，适合灵活的数据结构 |
| **LLM服务** | OpenAI GPT-4 / Claude API | 强大的自然语言处理能力 |
| **通知服务** | Web Push + 短信 + 邮件 | 多渠道通知，确保提醒送达 |

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (Vue 3)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 家人管理  │  │ 药品添加  │  │ 服药提醒  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                    │
│  ┌────┴─────────────┴─────────────┴────┐              │
│  │         Pinia 状态管理               │              │
│  └────────────────┬────────────────────┘              │
└───────────────────┼────────────────────────────────────┘
                    │ HTTP/REST API
┌───────────────────┼────────────────────────────────────┐
│                   ▼           后端 (Node.js/Express)   │
│  ┌─────────────────────────────────────────┐           │
│  │           Express API Gateway           │           │
│  └────────────────┬────────────────────────┘           │
│       ┌──────────┼──────────┬──────────┐              │
│       ▼          ▼          ▼          ▼              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ 用户模块 │ │家人模块 │ │药品模块 │ │提醒模块 │         │
│  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘         │
│       │          │          │          │              │
│       └──────────┴────┬─────┴──────────┘              │
│                      ▼                                 │
│              ┌────────────┐                           │
│              │  MongoDB   │                           │
│              └────────────┘                           │
│                      │                                 │
│       ┌──────────────┼──────────────┐                │
│       ▼              ▼              ▼                │
│  ┌────────┐    ┌──────────┐   ┌────────┐            │
│  │ LLM服务  │    │ 通知服务  │   │ 定时任务 │            │
│  └────────┘    └──────────┘   └────────┘            │
└────────────────────────────────────────────────────────┘
```

### 1.3 核心模块划分

```
用药提醒应用
├── 1. 家人管理模块
│   ├── 家庭成员CRUD
│   ├── 权限管理（家长/成员角色）
│   ├── 服药记录关联
│   └── 代操作功能
│
├── 2. 药品添加模块
│   ├── 智能药品识别
│   │   ├── 拍照/上传处方单
│   │   ├── OCR文字识别
│   │   └── LLM解析用药信息
│   ├── 手动添加药品
│   ├── 药品信息管理
│   └── 用药计划设置
│
└── 3. 服药提醒模块
    ├── 提醒规则配置
    ├── 智能提醒引擎
    ├── 通知发送
    │   ├── Web Push
    │   ├── 短信通知
    │   └── 邮件通知
    ├── 服药确认
    └── 服药历史记录
```

---

## 2. 家人管理模块详细设计

### 2.1 功能需求

#### 家庭成员管理

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 添加成员 | 姓名、手机号、年龄、角色（家长/成员） | P0 |
| 编辑成员 | 修改成员信息 | P0 |
| 删除成员 | 移除家庭成员 | P0 |
| 查看成员 | 查看所有家庭成员列表 | P0 |

#### 权限管理

| 角色 | 权限范围 |
|------|---------|
| **家长** | 管理所有家庭成员用药计划、添加/编辑/删除成员、代家人确认服药、查看所有家人服药记录 |
| **普通成员** | 管理自己的用药计划、查看自己的服药记录 |

#### 服药记录关联

- 查看家庭成员的服药情况
- 家长的代操作功能
- 服药历史统计

### 2.2 数据模型

```javascript
// FamilyMember Schema
const FamilyMemberSchema = new mongoose.Schema({
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  name: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  role: { 
    type: String, 
    enum: ['parent', 'member'], 
    default: 'member' 
  },
  healthConditions: [{ type: String }],
  allergies: [{ type: String }],
  avatar: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2.3 API接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/family/members | 添加家庭成员 |
| GET | /api/family/members | 获取成员列表 |
| GET | /api/family/members/:id | 获取成员详情 |
| PUT | /api/family/members/:id | 更新成员信息 |
| DELETE | /api/family/members/:id | 删除成员 |
| GET | /api/family/members/:id/medications | 获取成员的用药记录 |

---

## 3. 药品添加模块详细设计

### 3.1 功能需求

#### 智能药品识别

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 拍照/上传处方单 | 支持相机实时拍照、从相册选择、上传已有处方单 | P0 |
| OCR文字识别 | 提取图片中的文字内容 | P0 |
| LLM智能解析 | 解析处方单内容，自动提取药品信息 | P0 |

#### 手动添加药品

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 输入药品名称 | 支持手动输入药品名称 | P0 |
| 设置药品规格 | 配置剂量单位 | P0 |
| 配置用法用量 | 设置单次剂量和频率 | P0 |
| 设置服药时间 | 配置具体服药时间点 | P0 |
| 添加用药说明 | 添加注意事项和说明 | P1 |

#### 药品信息管理

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 查看药品列表 | 查看所有添加的药品 | P0 |
| 编辑药品信息 | 修改药品详细信息 | P0 |
| 删除药品 | 移除不需要的药品 | P0 |
| 设置有效期提醒 | 药品过期提醒 | P2 |

#### 用药计划设置

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 配置服药频率 | 每天/每周/特定日期 | P0 |
| 设置服药时间点 | 配置具体提醒时间 | P0 |
| 配置服药剂量 | 设置每次服药数量 | P0 |
| 设置服药周期 | 开始日期和结束日期 | P0 |

### 3.2 智能添加流程

```
用户拍照/上传处方单
      ↓
前端上传图片到后端
      ↓
后端调用OCR服务提取文字
      ↓
将OCR结果发送给LLM服务
      ↓
LLM解析并返回结构化药品信息
      ↓
前端展示解析结果供用户确认
      ↓
用户确认后保存到数据库
      ↓
生成服药提醒计划
```

### 3.3 LLM Prompt 设计

```javascript
// 处方单解析Prompt
const prescriptionParsePrompt = `
你是一个专业的医疗助手。请分析以下处方单内容，提取药品信息。

处方单内容：
{ocr_text}

请以JSON格式返回：
{
  "medications": [
    {
      "name": "药品名称",
      "specification": "规格（如：10mg/片）",
      "dosage": "单次剂量（如：1片）",
      "frequency": "频率（如：每日3次）",
      "timing": "服药时间（如：饭后）",
      "duration": "用药周期（如：7天）",
      "notes": "注意事项"
    }
  ],
  "doctor_notes": "医生备注",
  "warnings": ["禁忌1", "禁忌2"]
}
`;
```

### 3.4 数据模型

```javascript
// Medication Schema
const MedicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  name: { type: String, required: true },
  specification: { type: String },
  dosage: { type: String },
  frequency: { type: String },
  timing: { type: String },
  duration: { type: String },
  instructions: { type: String },
  notes: { type: String },
  source: { 
    type: String, 
    enum: ['manual', 'prescription'], 
    default: 'manual' 
  },
  prescriptionImage: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// MedicationSchedule Schema
const MedicationScheduleSchema = new mongoose.Schema({
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheduleType: { 
    type: String, 
    enum: ['daily', 'weekly', 'custom'], 
    default: 'daily' 
  },
  times: [{ type: String }], // ['08:00', '12:00', '20:00']
  weekdays: [{ type: Number }], // [0,1,2,3,4,5,6] for weekly
  customDates: [{ type: Date }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 3.5 API接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/medications/parse | 解析处方单图片 |
| POST | /api/medications | 添加药品 |
| GET | /api/medications | 获取药品列表 |
| GET | /api/medications/:id | 获取药品详情 |
| PUT | /api/medications/:id | 更新药品信息 |
| DELETE | /api/medications/:id | 删除药品 |
| POST | /api/schedules | 创建服药计划 |
| GET | /api/schedules | 获取服药计划列表 |
| PUT | /api/schedules/:id | 更新服药计划 |
| DELETE | /api/schedules/:id | 删除服药计划 |

---

## 4. 服药提醒模块详细设计

### 4.1 功能需求

#### 提醒规则配置

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 设置提醒时间点 | 配置具体的提醒时间 | P0 |
| 配置提醒频率 | 设置提醒频率和重复规则 | P0 |
| 设置提前提醒 | 提前N分钟提醒 | P1 |
| 开启/关闭提醒 | 控制提醒的开关 | P0 |
| 重复提醒间隔 | 设置重复提醒的间隔 | P1 |

#### 智能提醒引擎

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 定时检查服药计划 | 定时任务检查需要提醒的计划 | P0 |
| 根据规则生成提醒 | 根据配置的规则生成提醒 | P0 |
| 智能调整提醒时间 | 根据用户习惯调整提醒时间 | P2 |
| 处理漏服情况 | 识别和处理漏服情况 | P1 |

#### 通知发送

| 渠道 | 描述 | 优先级 |
|------|------|--------|
| **Web Push** | 即时浏览器通知，支持后台运行 | P0 |
| **短信通知** | 集成短信服务商（阿里云/腾讯云） | P1 |
| **邮件通知** | 集成邮件服务（SMTP） | P1 |

#### 服药确认

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 确认服药按钮 | 一键确认已服药 | P0 |
| 确认时间记录 | 记录实际服药时间 | P0 |
| 漏服处理建议 | 提供漏服后的建议 | P1 |
| 异常情况上报 | 上报异常服药情况 | P2 |

#### 服药历史记录

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 查看服药历史 | 查看历史服药记录 | P0 |
| 服药依从性统计 | 统计服药依从性 | P1 |
| 服药提醒统计 | 统计提醒发送情况 | P1 |
| 生成服药报告 | 生成周期性服药报告 | P2 |

### 4.2 智能提醒流程

```
定时任务（每分钟执行）
      ↓
查询当前时间的提醒计划
      ↓
检查是否已发送提醒
      ↓
发送通知（Web Push/短信/邮件）
      ↓
记录提醒日志
      ↓
等待用户确认或超时
      ↓
更新服药记录
      ↓
处理漏服情况
```

### 4.3 智能调整算法

```javascript
// 智能调整提醒时间
function adjustReminderTime(basicTime, userBehavior, schedule) {
  // 1. 分析用户历史服药时间
  const avgTakeTime = calculateAverageTakeTime(userBehavior.history);
  
  // 2. 计算最佳提醒时间（提前10-15分钟）
  const optimalAdvanceTime = 10; // 分钟
  let reminderTime = moment(basicTime).subtract(optimalAdvanceTime, 'minutes');
  
  // 3. 避免在睡眠时间提醒（22:00 - 7:00）
  const hour = reminderTime.hour();
  if (hour >= 22 || hour < 7) {
    reminderTime = moment(basicTime).hour(8).minute(0);
  }
  
  // 4. 根据用户习惯微调
  if (userBehavior.prefersMorning) {
    reminderTime.hour(8).minute(0);
  }
  
  return reminderTime.format('HH:mm');
}
```

### 4.4 数据模型

```javascript
// ReminderLog Schema
const ReminderLogSchema = new mongoose.Schema({
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule', 
    required: true 
  },
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheduledTime: { type: Date, required: true },
  reminderTime: { type: Date },
  notificationSent: {
    webPush: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['pending', 'taken', 'missed', 'skipped'], 
    default: 'pending' 
  },
  takenTime: { type: Date },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseTime: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// MedicationLog Schema (服药记录)
const MedicationLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule' 
  },
  reminderLogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ReminderLog' 
  },
  scheduledTime: { type: Date },
  actualTime: { type: Date, default: Date.now },
  dosage: { type: String },
  status: { 
    type: String, 
    enum: ['taken', 'missed', 'skipped', 'partial'], 
    default: 'taken' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// NotificationPreference Schema
const NotificationPreferenceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  webPushEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  smsPhone: { type: String },
  emailEnabled: { type: Boolean, default: false },
  emailAddress: { type: String },
  quietHoursEnabled: { type: Boolean, default: true },
  quietHoursStart: { type: String, default: '22:00' },
  quietHoursEnd: { type: String, default: '07:00' },
  advanceNotice: { type: Number, default: 10 }, // minutes
  repeatInterval: { type: Number, default: 5 }, // minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4.5 API接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/reminders/send | 手动发送提醒 |
| GET | /api/reminders/logs | 获取提醒日志 |
| GET | /api/reminders/logs/:id | 获取提醒详情 |
| PUT | /api/reminders/logs/:id/confirm | 确认服药 |
| GET | /api/reminders/history | 获取服药历史 |
| GET | /api/reminders/statistics | 获取服药统计 |
| GET | /api/notifications/preferences | 获取通知设置 |
| PUT | /api/notifications/preferences | 更新通知设置 |
| POST | /api/notifications/test | 测试通知 |

---

## 5. LLM智能功能详细设计

### 5.1 功能模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| **医嘱解析** | 处方单OCR识别、智能药品信息提取、用药规则生成、禁忌识别 | P0 |
| **语音添加** | 语音转文字、自然语言理解、自动提取用药信息（可选扩展） | P2 |
| **用药咨询** | 药品相互作用查询、用药副作用解答、服药方法指导 | P1 |
| **用药建议** | 个性化提醒时间建议、漏服补救建议、用药依从性分析 | P1 |

### 5.2 LLM服务架构

```javascript
// LLM Service Layer
class LLMService {
  // 处方单解析
  async parsePrescription(imageBase64) {
    const ocrResult = await this.ocrService.extractText(imageBase64);
    const prompt = this.buildPrescriptionPrompt(ocrResult);
    const response = await this.callLLM(prompt);
    return this.parseStructuredResponse(response);
  }
  
  // 用药咨询
  async answerMedicationQuestion(question, context) {
    const prompt = this.buildConsultationPrompt(question, context);
    return await this.callLLM(prompt);
  }
  
  // 用药建议
  async generateSuggestions(userProfile, medicationHistory) {
    const prompt = this.buildSuggestionPrompt(userProfile, medicationHistory);
    return await this.callLLM(prompt);
  }
  
  // 漏服处理建议
  async suggestMissedDose(medication, missedTime, currentTime) {
    const prompt = this.buildMissedDosePrompt(medication, missedTime, currentTime);
    return await this.callLLM(prompt);
  }
}
```

### 5.3 Prompt Engineering

#### 5.3.1 医嘱解析Prompt

```javascript
// 处方单解析Prompt
const prescriptionParsePrompt = `
你是一个专业的医疗助手。请分析以下处方单内容，提取药品信息。

处方单内容：
{ocr_text}

请以JSON格式返回：
{
  "medications": [
    {
      "name": "药品名称",
      "specification": "规格（如：10mg/片）",
      "dosage": "单次剂量（如：1片）",
      "frequency": "频率（如：每日3次）",
      "timing": "服药时间（如：饭后）",
      "duration": "用药周期（如：7天）",
      "notes": "注意事项"
    }
  ],
  "doctor_notes": "医生备注",
  "warnings": ["禁忌1", "禁忌2"]
}

请确保返回的JSON格式正确，不要包含其他内容。
`;
```

#### 5.3.2 用药咨询Prompt

```javascript
// 用药咨询Prompt
const medicationConsultPrompt = `
你是专业的医疗助手。请回答用户的用药问题。

用户信息：
- 年龄：{age}
- 健康状况：{healthConditions}
- 过敏史：{allergies}

当前用药：
{currentMedications}

用户问题：{question}

注意事项：
1. 回答要专业、准确
2. 涉及医疗决策的建议咨询医生
3. 不要提供具体的用药剂量建议
4. 鼓励用户遵医嘱用药
5. 如果问题涉及严重不良反应，建议立即就医

请用友好的语言回答，并适当使用emoji增加可读性。
`;
```

#### 5.3.3 用药建议Prompt

```javascript
// 用药建议Prompt
const medicationSuggestionPrompt = `
根据用户的用药历史和习惯，提供个性化建议。

用户信息：
{userProfile}

用药历史：
{medicationHistory}

服药习惯分析：
{habitAnalysis}

请提供：
1. 提醒时间优化建议
2. 提高依从性的建议
3. 生活方式调整建议
4. 需要注意的事项

以JSON格式返回：
{
  "reminder_optimization": {
    "suggested_times": ["建议的提醒时间"],
    "reason": "优化理由"
  },
  "adherence_tips": ["提高依从性的建议"],
  "lifestyle_adjustments": ["生活方式调整建议"],
  "important_notes": ["重要注意事项"]
}
`;
```

#### 5.3.4 漏服处理Prompt

```javascript
// 漏服处理Prompt
const missedDosePrompt = `
用户漏服了药品，请提供处理建议。

药品信息：
- 名称：{medicationName}
- 规格：{specification}
- 正常剂量：{normalDosage}
- 服药频率：{frequency}

漏服情况：
- 计划服药时间：{scheduledTime}
- 当前时间：{currentTime}
- 距离漏服已过时间：{timeSinceMissed}

请提供：
1. 是否应该补服
2. 如何补服（如果应该）
3. 注意事项
4. 是否需要咨询医生

以JSON格式返回：
{
  "should_take": true/false,
  "how_to_take": "补服建议",
  "notes": ["注意事项"],
  "consult_doctor": true/false,
  "reason": "判断理由"
}
`;
```

---

## 6. 数据库设计

### 6.1 集合关系

```
User (用户)
  ├── Family (家庭)
  │     └── FamilyMember (家庭成员)
  │           ├── Medication (药品)
  │           │     └── MedicationSchedule (用药计划)
  │           │           └── ReminderLog (提醒日志)
  │           └── MedicationLog (服药记录)
  └── NotificationPreference (通知设置)
```

### 6.2 完整Schema定义

#### 6.2.1 User Schema

```javascript
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  name: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family' 
  },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ familyId: 1 });
```

#### 6.2.2 Family Schema

```javascript
const FamilySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  inviteCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
FamilySchema.index({ ownerId: 1 });
FamilySchema.index({ inviteCode: 1 });
```

#### 6.2.3 FamilyMember Schema

```javascript
const FamilyMemberSchema = new mongoose.Schema({
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  name: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  role: { 
    type: String, 
    enum: ['parent', 'member'], 
    default: 'member' 
  },
  healthConditions: [{ type: String }],
  allergies: [{ type: String }],
  avatar: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
FamilyMemberSchema.index({ familyId: 1 });
FamilyMemberSchema.index({ createdBy: 1 });
```

#### 6.2.4 Medication Schema

```javascript
const MedicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  name: { type: String, required: true },
  specification: { type: String },
  dosage: { type: String },
  frequency: { type: String },
  timing: { type: String },
  duration: { type: String },
  instructions: { type: String },
  notes: { type: String },
  source: { 
    type: String, 
    enum: ['manual', 'prescription'], 
    default: 'manual' 
  },
  prescriptionImage: { type: String },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
MedicationSchema.index({ userId: 1 });
MedicationSchema.index({ familyMemberId: 1 });
MedicationSchema.index({ isActive: 1 });
MedicationSchema.index({ expiryDate: 1 });
```

#### 6.2.5 MedicationSchedule Schema

```javascript
const MedicationScheduleSchema = new mongoose.Schema({
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheduleType: { 
    type: String, 
    enum: ['daily', 'weekly', 'custom'], 
    default: 'daily' 
  },
  times: [{ type: String }], // ['08:00', '12:00', '20:00']
  weekdays: [{ type: Number }], // [0,1,2,3,4,5,6] for weekly
  customDates: [{ type: Date }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
MedicationScheduleSchema.index({ medicationId: 1 });
MedicationScheduleSchema.index({ familyMemberId: 1 });
MedicationScheduleSchema.index({ userId: 1 });
MedicationScheduleSchema.index({ isActive: 1 });
MedicationScheduleSchema.index({ startDate: 1, endDate: 1 });
```

#### 6.2.6 ReminderLog Schema

```javascript
const ReminderLogSchema = new mongoose.Schema({
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule', 
    required: true 
  },
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheduledTime: { type: Date, required: true },
  reminderTime: { type: Date },
  notificationSent: {
    webPush: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['pending', 'taken', 'missed', 'skipped'], 
    default: 'pending' 
  },
  takenTime: { type: Date },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseTime: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 索引
ReminderLogSchema.index({ scheduleId: 1 });
ReminderLogSchema.index({ medicationId: 1 });
ReminderLogSchema.index({ familyMemberId: 1 });
ReminderLogSchema.index({ userId: 1 });
ReminderLogSchema.index({ status: 1 });
ReminderLogSchema.index({ scheduledTime: 1 });
ReminderLogSchema.index({ createdAt: 1 });
```

#### 6.2.7 MedicationLog Schema

```javascript
const MedicationLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: true 
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule' 
  },
  reminderLogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ReminderLog' 
  },
  scheduledTime: { type: Date },
  actualTime: { type: Date, default: Date.now },
  dosage: { type: String },
  status: { 
    type: String, 
    enum: ['taken', 'missed', 'skipped', 'partial'], 
    default: 'taken' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 索引
MedicationLogSchema.index({ userId: 1 });
MedicationLogSchema.index({ familyMemberId: 1 });
MedicationLogSchema.index({ medicationId: 1 });
MedicationLogSchema.index({ status: 1 });
MedicationLogSchema.index({ createdAt: 1 });
```

#### 6.2.8 NotificationPreference Schema

```javascript
const NotificationPreferenceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  webPushEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  smsPhone: { type: String },
  emailEnabled: { type: Boolean, default: false },
  emailAddress: { type: String },
  quietHoursEnabled: { type: Boolean, default: true },
  quietHoursStart: { type: String, default: '22:00' },
  quietHoursEnd: { type: String, default: '07:00' },
  advanceNotice: { type: Number, default: 10 }, // minutes
  repeatInterval: { type: Number, default: 5 }, // minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
NotificationPreferenceSchema.index({ userId: 1 });
```

---

## 7. 错误处理

### 7.1 错误类型定义

```javascript
// 错误类型
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',       // 数据验证错误
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR', // 认证错误
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',  // 授权错误
  NOT_FOUND: 'NOT_FOUND',                      // 资源不存在
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',          // 重复资源
  OCR_ERROR: 'OCR_ERROR',                      // OCR识别错误
  LLM_ERROR: 'LLM_ERROR',                      // LLM服务错误
  NOTIFICATION_ERROR: 'NOTIFICATION_ERROR',    // 通知发送错误
  INTERNAL_ERROR: 'INTERNAL_ERROR'            // 内部错误
};
```

### 7.2 错误响应格式

```javascript
// 标准错误响应
{
  success: false,
  error: {
    type: 'VALIDATION_ERROR',
    message: '验证失败',
    details: [
      { field: 'name', message: '药品名称不能为空' },
      { field: 'dosage', message: '剂量格式不正确' }
    ]
  }
}

// 成功响应
{
  success: true,
  data: { /* 响应数据 */ },
  message: '操作成功'
}
```

### 7.3 错误处理中间件

```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        type: ErrorTypes.VALIDATION_ERROR,
        message: '数据验证失败',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        type: ErrorTypes.DUPLICATE_ERROR,
        message: '资源已存在'
      }
    });
  }
  
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: {
        type: ErrorTypes.NOT_FOUND,
        message: '资源不存在'
      }
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        type: ErrorTypes.AUTHENTICATION_ERROR,
        message: '认证失败'
      }
    });
  }
  
  res.status(500).json({
    success: false,
    error: {
      type: ErrorTypes.INTERNAL_ERROR,
      message: '服务器内部错误'
    }
  });
}
```

### 7.4 业务错误类

```javascript
// 自定义业务错误
class AppError extends Error {
  constructor(message, statusCode, type, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用示例
throw new AppError('药品不存在', 404, ErrorTypes.NOT_FOUND);
throw new AppError('剂量格式错误', 400, ErrorTypes.VALIDATION_ERROR, [
  { field: 'dosage', message: '剂量必须是正数' }
]);
```

---

## 8. 测试策略

### 8.1 单元测试

#### 8.1.1 药品服务测试

```javascript
// test/medication.test.js
describe('Medication Service', () => {
  describe('addMedication', () => {
    it('should add a new medication', async () => {
      const medication = await medicationService.add({
        userId: testUserId,
        name: '阿司匹林',
        dosage: '100mg',
        frequency: '每日1次',
        timing: '饭后'
      });
      
      expect(medication).toHaveProperty('_id');
      expect(medication.name).toBe('阿司匹林');
      expect(medication.userId.toString()).toBe(testUserId.toString());
    });
    
    it('should validate required fields', async () => {
      await expect(medicationService.add({}))
        .rejects
        .toThrow(ValidationError);
    });
    
    it('should reject duplicate medication name for same user', async () => {
      await medicationService.add({
        userId: testUserId,
        name: '阿司匹林'
      });
      
      await expect(medicationService.add({
        userId: testUserId,
        name: '阿司匹林'
      })).rejects.toThrow();
    });
  });
  
  describe('parsePrescription', () => {
    it('should parse prescription image', async () => {
      const result = await llmService.parsePrescription(testImageBase64);
      
      expect(result).toHaveProperty('medications');
      expect(Array.isArray(result.medications)).toBe(true);
      expect(result.medications[0]).toHaveProperty('name');
      expect(result.medications[0]).toHaveProperty('dosage');
    });
    
    it('should handle OCR failure', async () => {
      await expect(llmService.parsePrescription(null))
        .rejects
        .toThrow(OCR_ERROR);
    });
  });
});
```

#### 8.1.2 提醒服务测试

```javascript
// test/reminder.test.js
describe('Reminder Service', () => {
  describe('createSchedule', () => {
    it('should create medication schedule', async () => {
      const schedule = await reminderService.createSchedule({
        medicationId: testMedicationId,
        userId: testUserId,
        scheduleType: 'daily',
        times: ['08:00', '20:00']
      });
      
      expect(schedule).toHaveProperty('_id');
      expect(schedule.times).toHaveLength(2);
      expect(schedule.isActive).toBe(true);
    });
  });
  
  describe('checkAndSendReminders', () => {
    it('should send notifications for due reminders', async () => {
      const schedule = await createTestSchedule({
        times: [moment().format('HH:mm')],
        medication: testMedication
      });
      
      await reminderService.checkAndSendReminders();
      
      const log = await ReminderLog.findOne({ scheduleId: schedule._id });
      expect(log.notificationSent.webPush).toBe(true);
    });
    
    it('should not send duplicate reminders', async () => {
      await reminderService.checkAndSendReminders();
      await reminderService.checkAndSendReminders();
      
      const logs = await ReminderLog.find({ 
        scheduledTime: { $gte: moment().startOf('minute').toDate() }
      });
      
      expect(logs.length).toBe(1);
    });
  });
});
```

### 8.2 集成测试

#### 8.2.1 API集成测试

```javascript
// test/api.test.js
describe('API Integration Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    const user = await createTestUser();
    authToken = generateTestToken(user);
  });
  
  describe('POST /api/medications', () => {
    it('should create medication with auth', async () => {
      const response = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '布洛芬',
          dosage: '200mg',
          frequency: '每日3次'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });
    
    it('should reject request without auth', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          name: '布洛芬',
          dosage: '200mg'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/medications/parse', () => {
    it('should parse prescription image', async () => {
      const response = await request(app)
        .post('/api/medications/parse')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', 'test/fixtures/prescription.jpg');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('medications');
    });
  });
});
```

#### 8.2.2 数据库集成测试

```javascript
// test/database.test.js
describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });
  
  afterAll(async () => {
    await disconnectTestDatabase();
  });
  
  beforeEach(async () => {
    await clearTestData();
  });
  
  it('should persist medication data', async () => {
    const medication = new Medication({
      userId: testUserId,
      name: '测试药品',
      dosage: '100mg'
    });
    
    await medication.save();
    const found = await Medication.findById(medication._id);
    
    expect(found).not.toBeNull();
    expect(found.name).toBe('测试药品');
  });
  
  it('should cascade delete related schedules', async () => {
    const medication = await createTestMedication();
    await createTestSchedule({ medicationId: medication._id });
    await createTestSchedule({ medicationId: medication._id });
    
    await Medication.findByIdAndDelete(medication._id);
    
    const schedules = await MedicationSchedule.find({ 
      medicationId: medication._id 
    });
    
    expect(schedules.length).toBe(0);
  });
});
```

### 8.3 E2E测试

```javascript
// e2e/medication-flow.spec.js
describe('Medication Management Flow', () => {
  beforeEach(async () => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  it('should complete full medication flow', async () => {
    // 1. Add family member
    await page.goto('/family');
    await page.click('button:contains("添加成员")');
    await page.fill('[name="name"]', '爷爷');
    await page.fill('[name="phone"]', '13800138000');
    await page.fill('[name="age"]', '70');
    await page.click('button:contains("保存")');
    await expect(page.locator('.family-member')).toHaveCount(1);
    
    // 2. Upload prescription
    await page.goto('/medications/add');
    await page.uploadFile('input[type="file"]', 'prescription.jpg');
    await page.waitForSelector('.parsed-result', { timeout: 10000 });
    
    // 3. Confirm parsed data
    await page.click('button:contains("确认添加")');
    await expect(page.locator('.medication-item')).toHaveCount(1);
    
    // 4. Set reminder
    await page.click('button:contains("设置提醒")');
    await page.fill('[name="time"]', '08:00');
    await page.click('button:contains("保存计划")');
    await expect(page.locator('.reminder-item')).toHaveCount(1);
    
    // 5. Verify reminder in list
    await page.goto('/reminders');
    await expect(page.locator('.reminder-item')).toHaveCount(1);
    await expect(page.locator('.reminder-time')).toContainText('08:00');
  });
  
  it('should handle prescription parsing failure', async () => {
    await page.goto('/medications/add');
    await page.uploadFile('input[type="file"]', 'invalid-image.jpg');
    
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('无法识别处方单');
  });
});
```

### 8.4 性能测试

```javascript
// performance/load.test.js
describe('Performance Tests', () => {
  it('should handle 100 concurrent users', async () => {
    const users = Array.from({ length: 100 }, (_, i) => ({
      email: `user${i}@test.com`,
      password: 'password123'
    }));
    
    const promises = users.map(user => 
      request(app)
        .post('/api/auth/login')
        .send(user)
    );
    
    const start = Date.now();
    const responses = await Promise.all(promises);
    const duration = Date.now() - start;
    
    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5秒内完成
  });
  
  it('should respond within 200ms for normal queries', async () => {
    const start = Date.now();
    await request(app)
      .get('/api/medications')
      .set('Authorization', `Bearer ${authToken}`);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200);
  });
});
```

---

## 9. 部署架构

### 9.1 开发环境

```
前端: localhost:3000 (Vite Dev Server)
后端: localhost:5000 (Node.js)
数据库: localhost:27017 (MongoDB)
```

### 9.2 生产环境架构

```
┌────────────────────────────────────────────────┐
│                   Nginx                          │
│              (负载均衡、反向代理)                  │
└────────────────┬───────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌───────┐  ┌───────┐  ┌───────┐
│Server1│  │Server2│  │Server3│
│Node.js│  │Node.js│  │Node.js│
│Port5000│ │Port5000│ │Port5000│
└───┬───┘  └───┬───┘  └───┬───┘
    │          │          │
    └──────────┼──────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌───────┐  ┌───────┐  ┌───────┐
│MongoDB│  │Redis  │  │  OSS  │
│ReplSet│  │Cache  │  │ 文件存储│
│Port27017│ │Port6379│ │ -     │
└───────┘  └───────┘  └───────┘
```

### 9.3 Docker部署配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: medreminder-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - medreminder-network

  redis:
    image: redis:7-alpine
    container_name: medreminder-redis
    ports:
      - "6379:6379"
    networks:
      - medreminder-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: medreminder-backend
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/medreminder
      REDIS_URL: redis://redis:6379
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    networks:
      - medreminder-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: medreminder-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - medreminder-network

volumes:
  mongodb_data:

networks:
  medreminder-network:
    driver: bridge
```

---

## 10. 后续扩展功能

### Phase 2 (后期 - v2.0)

| 功能 | 描述 | 优先级 |
|------|------|--------|
| **数据分析** | 服药依从性报告、健康趋势分析 | P1 |
| **智能推荐** | 基于AI的个性化健康建议 | P1 |
| **第三方集成** | 与医院HIS系统对接、医保查询 | P2 |
| **社区功能** | 用药经验分享、病友圈 | P2 |

### Phase 3 (长期 - v3.0)

| 功能 | 描述 | 优先级 |
|------|------|--------|
| **硬件集成** | 智能药盒、智能手表 | P2 |
| **远程医疗** | 在线问诊、处方上传 | P1 |
| **基因检测** | 个性化用药建议 | P3 |
| **跨境医疗** | 国际药品信息查询 | P3 |

---

## 附录

### A. 依赖清单

#### 前端依赖
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "cypress": "^13.6.0"
  }
}
```

#### 后端依赖
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.0",
    "node-cron": "^3.0.0",
    "nodemailer": "^6.9.0",
    "web-push": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0"
  }
}
```

### B. 环境变量示例

```bash
# .env.example

# 数据库
MONGODB_URI=mongodb://localhost:27017/medreminder
MONGODB_USER=admin
MONGODB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# LLM服务
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4

# 短信服务（阿里云）
ALIYUN_SMS_ACCESS_KEY_ID=xxxxx
ALIYUN_SMS_ACCESS_KEY_SECRET=xxxxx
ALIYUN_SMS_SIGN_NAME=用药提醒

# 邮件服务
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=password

# Web Push
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_SUBJECT=mailto:noreply@example.com

# 应用配置
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

**文档版本**: v1.0  
**最后更新**: 2026-05-17  
**作者**: AI Assistant  
**状态**: 已完成，等待实现
