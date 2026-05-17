# MedReminder - 智能用药提醒应用

## 项目概述

MedReminder 是一款智能用药提醒应用，旨在帮助家庭用户管理家庭成员的用药情况，确保按时服药，提高用药依从性。

### 核心功能

- **家人管理**：添加和管理家庭成员，设置不同角色（家长/成员）
- **药品添加**：支持拍照上传处方单，AI 智能解析药品信息
- **服药提醒**：多渠道提醒（Web Push、短信、邮件），智能提醒引擎
- **LLM 智能功能**：医嘱解析、用药咨询、个性化建议

## 技术架构

### 技术栈

- **前端**：Vue 3 + Vite + Pinia + Element Plus
- **后端**：Node.js + Express + MongoDB
- **LLM 服务**：OpenAI GPT-4 / Claude API
- **通知服务**：Web Push + 短信 + 邮件

### 项目结构

```
medreminder/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── views/           # 页面视图
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── services/        # API 服务
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── package.json
│
├── backend/                  # 后端应用
│   ├── src/
│   │   ├── models/          # 数据模型
│   │   ├── routes/           # 路由定义
│   │   ├── controllers/      # 控制器
│   │   ├── middlewares/      # 中间件
│   │   ├── services/         # 业务逻辑
│   │   ├── utils/            # 工具函数
│   │   └── config/           # 配置文件
│   ├── test/                # 测试文件
│   ├── scripts/             # 脚本文件
│   └── package.json
│
└── docs/                    # 文档
    └── superpowers/
        └── specs/           # 设计文档
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/medreminder

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# LLM 服务配置
OPENAI_API_KEY=sk-your-api-key

# 短信服务（可选）
ALIYUN_SMS_ACCESS_KEY_ID=your-key-id
ALIYUN_SMS_ACCESS_KEY_SECRET=your-key-secret

# 邮件服务（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-password

# Web Push 配置
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### 启动应用

```bash
# 开发模式（前端）
cd frontend
npm run dev

# 开发模式（后端）
cd backend
npm run dev

# 生产模式
cd backend
npm start
```

应用启动后，访问：
- 前端：http://localhost:3000
- 后端 API：http://localhost:5000

## 核心模块

### 1. 家人管理模块

#### 功能特性

- 添加、编辑、删除家庭成员
- 设置成员角色（家长/成员）
- 查看家庭成员服药情况
- 家长可代家人确认服药

#### API 接口

```
POST   /api/family/members           # 添加家庭成员
GET    /api/family/members           # 获取成员列表
GET    /api/family/members/:id       # 获取成员详情
PUT    /api/family/members/:id       # 更新成员信息
DELETE /api/family/members/:id       # 删除成员
```

### 2. 药品添加模块

#### 功能特性

- 拍照或上传处方单
- AI 智能识别和解析处方
- 手动添加药品信息
- 配置用药计划

#### API 接口

```
POST   /api/medications/parse        # 解析处方单
POST   /api/medications              # 添加药品
GET    /api/medications              # 获取药品列表
GET    /api/medications/:id          # 获取药品详情
PUT    /api/medications/:id          # 更新药品信息
DELETE /api/medications/:id          # 删除药品
```

### 3. 服药提醒模块

#### 功能特性

- 多渠道通知（Web Push、短信、邮件）
- 智能提醒引擎
- 服药确认和记录
- 服药历史统计

#### API 接口

```
POST   /api/reminders/send           # 手动发送提醒
GET    /api/reminders/logs           # 获取提醒日志
PUT    /api/reminders/logs/:id/confirm  # 确认服药
GET    /api/reminders/history        # 获取服药历史
GET    /api/reminders/statistics     # 获取服药统计
```

### 4. LLM 智能功能

#### 医嘱解析

上传处方单图片，自动识别和提取药品信息，包括：
- 药品名称
- 规格和剂量
- 服药频率和时间
- 注意事项

#### 用药咨询

回答用户的用药相关问题：
- 药品相互作用
- 副作用解答
- 服药方法指导

#### 个性化建议

根据用户用药历史和习惯，提供：
- 最佳提醒时间建议
- 提高依从性的建议
- 漏服处理方案

## 数据库模型

### 核心集合

1. **User** - 用户信息
2. **Family** - 家庭信息
3. **FamilyMember** - 家庭成员
4. **Medication** - 药品信息
5. **MedicationSchedule** - 用药计划
6. **ReminderLog** - 提醒日志
7. **MedicationLog** - 服药记录
8. **NotificationPreference** - 通知设置

详细字段定义请参考：[设计文档](docs/superpowers/specs/2026-05-17-medication-reminder-app-design.md)

## 开发指南

### 代码规范

- 遵循 ESLint 规范
- 使用语义化的提交信息
- 编写单元测试和集成测试

### 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration
```

## 部署

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d
```

### 手动部署

1. 构建前端应用
   ```bash
   cd frontend
   npm run build
   ```

2. 配置生产环境
   - 设置环境变量
   - 配置 Nginx 反向代理
   - 启动 MongoDB 服务
   - 启动后端服务

## 扩展功能

### Phase 2

- 数据分析和报告
- 第三方系统集成
- 社区功能

### Phase 3

- 智能硬件集成
- 远程医疗服务
- 基因检测对接

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- 邮箱：support@medreminder.example.com
- 网站：https://medreminder.example.com
