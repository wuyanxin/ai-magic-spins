# 🎯 MagicSpins 一键启动清单

## ⚡ 快速启动（3步完成）

### 第一步：打开终端，运行脚本
复制以下命令，粘贴到终端，按回车：

```bash
cd /Users/george/Documents/workspace/ai-magic-spins && bash STARTUP.command
```

或者双击文件 `STARTUP.command`

---

### 第二步：等待自动配置完成

脚本会自动检查：
- [ ] Xcode安装
- [ ] 许可协议
- [ ] XcodeGen
- [ ] 生成项目

如果某项需要手动操作，脚本会提示你。

---

### 第三步：在Xcode中运行

1. **打开项目**（如果脚本没有自动打开）
   ```bash
   open MagicSpins.xcodeproj
   ```

2. **添加依赖包**
   - 在Xcode中：File → Add Package Dependencies
   - 输入：`https://github.com/stephencelis/SQLite.swift`
   - 选择版本：0.15.3
   - 点击：Add Package

3. **运行项目**
   - 选择 iPhone 模拟器
   - 按 `Cmd + R`

---

## 📋 详细命令列表

### 如果你想分步骤操作：

#### 步骤1: 检查XcodeGen
```bash
which xcodegen
```

#### 步骤2: 安装XcodeGen（如果没有）
```bash
brew install xcodegen
```

#### 步骤3: 生成项目
```bash
cd /Users/george/Documents/workspace/ai-magic-spins
xcodegen generate
```

#### 步骤4: 打开项目
```bash
open MagicSpins.xcodeproj
```

#### 步骤5: 添加SQLite.swift依赖（手动）
```
在Xcode中操作：
1. 选择项目名称
2. Swift Package Dependencies
3. + 按钮
4. 粘贴: https://github.com/stephencelis/SQLite.swift
5. 选择版本 0.15.3
6. Add Package
```

#### 步骤6: 运行
```
在Xcode中：
1. 选择 iPhone 模拟器
2. Cmd + R
```

---

## 🎨 如果不想用XcodeGen，手动创建项目

### 方法1: 命令行创建
```bash
# 打开Xcode新建项目
open -a Xcode

# 然后手动：
# 1. File → New → Project
# 2. iOS → App
# 3. Product Name: MagicSpins
# 4. SwiftUI, Swift
# 5. 保存到项目目录
```

### 方法2: 直接打开
```bash
open /Applications/Xcode.app
```

然后手动创建项目，复制 `MagicSpins/` 文件夹中的代码。

---

## 🔧 常用Xcode命令

### 清理构建
```bash
Cmd + Shift + K  # 清理
Cmd + B          # 构建
Cmd + R          # 运行
Cmd + .          # 停止
```

### 快捷键
```bash
Cmd + 1          # 项目导航器
Cmd + 2          # 文件大纲
Cmd + 3          # 搜索
Cmd + \          # 断点
```

---

## 🆘 遇到问题？

### 问题1: "command not found: xcodegen"
```bash
# 安装XcodeGen
brew install xcodegen
```

### 问题2: "license not agreed"
```bash
# 需要sudo权限
sudo xcodebuild -license accept
```

### 问题3: "Cannot find module 'SQLite'"
```bash
# 确保添加了依赖包
# 在Xcode中：File → Add Package Dependencies
# 添加：https://github.com/stephencelis/SQLite.swift
```

### 问题4: 模拟器无法运行
```bash
# 重置模拟器
xcrun simctl shutdown all
xcrun simctl erase all
```

---

## 📚 更多文档

查看项目根目录的文档：
- 📄 **README.md** - 完整项目说明
- 📄 **QUICKSTART.md** - 快速开始指南
- 📄 **TROUBLESHOOTING.md** - 故障排除
- 📄 **CODE_REVIEW.md** - 代码验证

---

## ✅ 完成后检查清单

- [ ] XcodeGen已安装
- [ ] 项目文件已生成 (MagicSpins.xcodeproj)
- [ ] SQLite.swift依赖已添加
- [ ] 代码签名已配置
- [ ] 项目可以成功编译
- [ ] 模拟器可以运行应用

---

## 🎉 成功运行后

恭喜你！MagicSpins已经成功运行！

现在可以：
- 💊 添加你的第一个药物
- ⏰ 设置用药提醒
- 📊 查看服药记录
- 📈 追踪遵从率

---

**有问题？**
- 查看 TROUBLESHOOTING.md
- 查看 QUICKSTART.md
- 或问我！

**享受 MagicSpins！** 💊✨
