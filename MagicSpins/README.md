# MagicSpins - 药吃了么

智能用药管理iOS应用MVP版本

## 项目概述

MagicSpins（药吃了么）是一款帮助用户科学管理用药的iOS应用，通过智能提醒和记录追踪，确保用药遵从性，维护健康。

## 功能特点

- 💊 药物管理 - 轻松添加、编辑和删除药物信息
- ⏰ 智能提醒 - 准时提醒您服药
- 📊 数据追踪 - 记录服药历史，追踪用药遵从率
- 📈 统计报告 - 查看服药遵从率统计
- 🎨 简洁界面 - 直观易用的设计

## 技术栈

- **前端框架**: SwiftUI
- **编程语言**: Swift 5.9+
- **数据库**: SQLite.swift
- **通知系统**: UserNotifications
- **架构模式**: MVVM

## 项目结构

```
MagicSpins/
├── App/
│   └── MagicSpinsApp.swift          # 应用入口
├── Models/
│   ├── Enums.swift                  # 枚举类型
│   ├── Medication.swift             # 药物模型
│   └── DoseRecord.swift             # 服药记录模型
├── Services/
│   ├── DatabaseService.swift        # 数据库服务
│   └── NotificationService.swift    # 通知服务
├── ViewModels/
│   ├── MedicationViewModel.swift    # 药物ViewModel
│   ├── ReminderViewModel.swift      # 提醒ViewModel
│   └── HistoryViewModel.swift       # 历史ViewModel
├── Views/
│   ├── ContentView.swift            # TabBar容器
│   ├── Home/
│   │   ├── HomeView.swift          # 首页
│   │   └── MedicationCard.swift   # 药物卡片组件
│   ├── Medication/
│   │   ├── MedicationListView.swift    # 药物列表
│   │   ├── AddMedicationView.swift     # 添加药物
│   │   └── MedicationDetailView.swift  # 药物详情
│   ├── History/
│   │   └── HistoryView.swift       # 历史记录
│   └── Settings/
│       └── SettingsView.swift       # 设置
└── Utilities/
    ├── Constants.swift              # 常量定义
    └── Extensions.swift            # 扩展
```

## 在Xcode中打开项目

### 方法一：使用Xcode手动创建项目（推荐）

由于需要添加SQLite.swift依赖，建议按照以下步骤创建项目：

1. **打开Xcode**
   ```bash
   open -a Xcode
   ```

2. **创建新项目**
   - 点击 "Create a new Xcode project"
   - 选择 "iOS" -> "App"
   - 点击 "Next"

3. **配置项目信息**
   - Product Name: `MagicSpins`
   - Interface: `SwiftUI`
   - Language: `Swift`
   - 点击 "Next"

4. **保存项目**
   - 选择保存位置（建议保存在 `MagicSpins/` 目录内）
   - 点击 "Create"

5. **复制源代码文件**
   - 将 `MagicSpins/` 目录下的所有文件复制到新创建的项目中
   - 覆盖Xcode自动生成的文件

6. **添加SQLite.swift依赖**
   - 选择项目名称 -> "Swift Package Dependencies"
   - 点击 "+"
   - 输入: `https://github.com/stephencelis/SQLite.swift`
   - 选择最新版本
   - 点击 "Add Package"

7. **配置Capabilities**
   - 选择项目名称 -> "Signing & Capabilities"
   - 添加 "Push Notifications" capability

8. **运行项目**
   - 选择模拟器（如 iPhone 15）
   - 按 `Cmd + R` 运行

### 方法二：使用命令行工具

如果你熟悉命令行，可以使用以下工具：

#### 使用 XcodeGen

1. 创建 `project.yml` 文件
2. 运行 `xcodegen generate`
3. 使用 `open MagicSpins.xcodeproj` 打开项目

#### 使用 Swift Package Manager

```bash
cd MagicSpins
swift package init
swift package add Package.swift
```

## 使用说明

### 添加药物

1. 打开应用，进入 "药物" 标签页
2. 点击右上角的 "+" 按钮
3. 填写药物信息：
   - 药物名称（必填）
   - 剂量（如 "500mg"）
   - 服药频率
   - 提醒时间
   - 分类（早餐/午餐/晚餐/睡前）
4. 点击 "保存"

### 查看今日计划

- 首页自动显示今日用药计划
- 显示服药遵从率统计
- 点击药物卡片可以标记服用或跳过

### 查看历史记录

- 进入 "历史" 标签页
- 选择时间范围（本周/本月/全部）
- 查看遵从率统计和服药记录

### 管理设置

- 在 "设置" 标签页中：
  - 开启/关闭通知
  - 调整提醒声音
  - 导出服药记录
  - 查看应用信息

## 开发注意事项

### 必需权限

应用需要以下权限才能正常工作：
- **通知权限**: 用于发送服药提醒
- 在首次添加药物时会请求通知权限

### 数据库存储

- 所有数据存储在本地SQLite数据库
- 数据库文件位置: `Documents/magicSpins.sqlite3`

### 通知配置

- 通知使用本地通知（Local Notifications）
- 无需网络连接即可使用提醒功能
- 支持每日重复提醒

## 版本信息

- **当前版本**: 1.0.0 (MVP)
- **发布日期**: 2026-05-17

## 后续版本规划

- V2.0: AI智能识别、家庭成员管理、云端同步
- V3.0: 药物相互作用检测、健康设备联动

## 许可证

本项目仅供学习和开发使用。

## 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

**MagicSpins - 让用药管理更智能，更简单！** 💊✨
