# MedReminder 用药提醒应用 - 快速启动指南

## 📋 项目概览

MedReminder 是一款智能用药提醒应用，具备以下核心功能：

- ✅ **家人管理** - 添加和管理家庭成员，设置家长/成员角色
- ✅ **药品添加** - 支持拍照上传处方单，AI 智能解析药品信息
- ✅ **服药提醒** - 多渠道提醒（Web Push、短信、邮件），智能提醒引擎
- ✅ **LLM 智能功能** - 医嘱解析、用药咨询、个性化建议

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### 步骤 1：安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 步骤 2：配置环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/medreminder

# JWT配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# LLM服务配置（可选，用于AI功能）
OPENAI_API_KEY=sk-your-openai-api-key

# 其他配置根据需要添加...
```

### 步骤 3：启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 步骤 4：启动应用

**开发模式：**

```bash
# 终端 1：启动后端
cd backend
npm run dev

# 终端 2：启动前端
cd frontend
npm run dev
```

**生产模式：**

```bash
# 构建前端
cd frontend
npm run build

# 启动后端
cd ../backend
npm start
```

### 步骤 5：访问应用

打开浏览器访问：
- 前端：http://localhost:3000
- 后端 API：http://localhost:5000
- API 文档：http://localhost:5000/api/health

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

应用将在以下地址运行：
- 前端：http://localhost:3000
- 后端：http://localhost:5000
- MongoDB：localhost:27017

## 📁 项目结构

```
MedReminder/
├── frontend/                 # Vue 3 前端应用
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── views/           # 页面视图
│   │   │   ├── Login.vue    # 登录页
│   │   │   ├── Register.vue # 注册页
│   │   │   ├── Dashboard.vue # 仪表板
│   │   │   ├── Family.vue   # 家人管理
│   │   │   ├── Medications.vue # 药品管理
│   │   │   ├── AddMedication.vue # 添加药品
│   │   │   ├── Reminders.vue # 服药提醒
│   │   │   └── Consult.vue  # 用药咨询
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   │   └── auth.js      # 认证状态
│   │   ├── services/        # API 服务
│   │   │   └── api.js       # Axios 实例
│   │   └── main.js          # 应用入口
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js/Express 后端
│   ├── src/
│   │   ├── models/          # MongoDB 数据模型
│   │   │   ├── User.js      # 用户模型
│   │   │   ├── Family.js    # 家庭模型
│   │   │   ├── FamilyMember.js # 家庭成员模型
│   │   │   ├── Medication.js # 药品模型
│   │   │   ├── MedicationSchedule.js # 用药计划模型
│   │   │   ├── ReminderLog.js # 提醒日志模型
│   │   │   ├── MedicationLog.js # 服药记录模型
│   │   │   └── NotificationPreference.js # 通知设置模型
│   │   ├── routes/          # 路由定义
│   │   │   ├── auth.js      # 认证路由
│   │   │   ├── family.js    # 家人管理路由
│   │   │   ├── medications.js # 药品管理路由
│   │   │   ├── reminders.js # 提醒管理路由
│   │   │   └── consult.js   # 用药咨询路由
│   │   ├── controllers/      # 控制器
│   │   │   ├── authController.js
│   │   │   ├── familyController.js
│   │   │   ├── medicationController.js
│   │   │   ├── reminderController.js
│   │   │   └── consultController.js
│   │   ├── middlewares/     # 中间件
│   │   │   └── auth.js      # JWT 认证中间件
│   │   ├── services/        # 业务逻辑
│   │   │   ├── llmService.js # LLM 服务
│   │   │   ├── notificationService.js # 通知服务
│   │   │   └── reminderEngine.js # 提醒引擎
│   │   ├── config/         # 配置文件
│   │   │   └── database.js # 数据库配置
│   │   └── index.js        # 应用入口
│   ├── test/               # 测试文件
│   ├── package.json
│   └── .env.example
│
├── docs/                    # 文档
│   └── superpowers/
│       └── specs/
│           └── 2026-05-17-medication-reminder-app-design.md # 设计文档
│
├── docker-compose.yml       # Docker Compose 配置
├── README.md               # 项目说明
└── .gitignore             # Git 忽略文件
```

## 🔌 API 接口

### 认证接口

```
POST /api/auth/register    - 用户注册
POST /api/auth/login       - 用户登录
GET  /api/auth/me         - 获取当前用户
PUT  /api/auth/profile    - 更新个人资料
```

### 家人管理接口

```
POST   /api/family/members           - 添加家庭成员
GET    /api/family/members           - 获取成员列表
GET    /api/family/members/:id       - 获取成员详情
PUT    /api/family/members/:id       - 更新成员信息
DELETE /api/family/members/:id       - 删除成员
GET    /api/family/members/:id/medications - 获取成员的用药记录
```

### 药品管理接口

```
POST   /api/medications/parse        - 解析处方单图片
POST   /api/medications              - 添加药品
GET    /api/medications              - 获取药品列表
GET    /api/medications/:id          - 获取药品详情
PUT    /api/medications/:id          - 更新药品信息
DELETE /api/medications/:id          - 删除药品

POST   /api/medications/schedules    - 创建用药计划
GET    /api/medications/schedules    - 获取用药计划列表
PUT    /api/medications/schedules/:id - 更新用药计划
DELETE /api/medications/schedules/:id - 删除用药计划
```

### 服药提醒接口

```
GET    /api/reminders/logs           - 获取提醒日志
PUT    /api/reminders/logs/:id/confirm - 确认服药
PUT    /api/reminders/logs/:id/skip  - 跳过服药
GET    /api/reminders/history        - 获取服药历史
GET    /api/reminders/statistics     - 获取服药统计
```

### 通知设置接口

```
GET    /api/reminders/notifications/preferences - 获取通知设置
PUT    /api/reminders/notifications/preferences - 更新通知设置
POST   /api/reminders/notifications/test        - 测试通知
```

### 用药咨询接口

```
POST   /api/consult                  - 用药咨询
GET    /api/consult/suggestions      - 获取用药建议
```

## 🧪 测试

### 运行单元测试

```bash
cd backend
npm test
```

### 运行特定测试

```bash
# 运行 API 测试
npm test -- api.test.js
```

## 🔧 配置说明

### 必需配置

```env
MONGODB_URI=mongodb://localhost:27017/medreminder
JWT_SECRET=your-secret-key
```

### 可选配置

#### LLM 服务（AI 功能）

```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4
```

#### 短信服务

```env
ALIYUN_SMS_ACCESS_KEY_ID=your-key-id
ALIYUN_SMS_ACCESS_KEY_SECRET=your-key-secret
ALIYUN_SMS_SIGN_NAME=用药提醒
```

#### 邮件服务

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

#### Web Push

```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

## 🎯 核心功能使用

### 1. 添加家庭成员

1. 登录后进入"家人管理"页面
2. 点击"添加成员"按钮
3. 填写成员信息（姓名、年龄、角色等）
4. 点击"添加"完成

### 2. 添加药品

**方式一：智能识别处方单**

1. 进入"药品管理"页面
2. 点击"添加药品"
3. 选择"智能识别"方式
4. 上传处方单图片
5. AI 自动识别药品信息
6. 确认并修改信息
7. 设置用药计划

**方式二：手动添加**

1. 进入"药品管理"页面
2. 点击"添加药品"
3. 选择"手动添加"方式
4. 填写药品信息
5. 设置用药计划

### 3. 设置服药提醒

1. 在添加药品时设置提醒时间
2. 或在药品详情页添加用药计划
3. 配置提醒频率（每天/每周/自定义）
4. 设置通知渠道

### 4. 用药咨询

1. 进入"用药咨询"页面
2. 选择咨询的成员（可选）
3. 输入用药问题
4. AI 助手提供专业解答

## 🛠️ 故障排除

### MongoDB 连接失败

```bash
# 检查 MongoDB 服务状态
mongosh

# 如果连接被拒绝，启动 MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :5000  # 后端端口
lsof -i :3000  # 前端端口

# 杀掉进程
kill -9 <PID>
```

### 前端无法连接后端

检查 `frontend/vite.config.js` 中的代理配置：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

## 📈 性能优化

### 生产环境建议

1. **启用生产模式**
   ```bash
   NODE_ENV=production npm start
   ```

2. **启用 Redis 缓存**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. **配置 Nginx 反向代理**
   ```nginx
   location / {
     proxy_pass http://localhost:3000;
   }
   location /api {
     proxy_pass http://localhost:5000;
   }
   ```

4. **启用 HTTPS**
   使用 Let's Encrypt 免费证书或云服务商证书

## 🔒 安全建议

1. **修改默认密钥**
   - 生产环境务必修改 `JWT_SECRET`
   - 使用强密码和随机字符串

2. **启用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 配置 HSTS

3. **限制 API 访问**
   - 使用速率限制（Rate Limiting）
   - 配置 CORS 白名单

4. **数据加密**
   - 敏感数据加密存储
   - 使用环境变量存储密钥

## 📚 相关文档

- [详细设计文档](docs/superpowers/specs/2026-05-17-medication-reminder-app-design.md)
- [MongoDB 文档](https://docs.mongodb.com/)
- [Vue 3 文档](https://vuejs.org/)
- [Express 文档](https://expressjs.com/)
- [Element Plus 文档](https://element-plus.org/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请联系：support@medreminder.example.com

---

**版本**: 1.0.0  
**最后更新**: 2026-05-17  
**开发者**: AI Assistant
