# 🚨 MagicSpins 故障排除指南

## 常见问题及解决方案

### 1. XcodeGen 安装问题

#### 问题: "XcodeGen not found"
```
bash: xcodegen: command not found
```

**解决方案:**

**方法A: 使用Homebrew安装（推荐）**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install xcodegen
```

**方法B: 使用MacPorts**
```bash
sudo port install xcodegen
```

**方法C: 手动下载**
1. 访问: https://github.com/yonaskolb/XcodeGen/releases
2. 下载最新版本的XcodeGen.zip
3. 解压并放到 `/usr/local/bin/` 目录
4. 添加执行权限: `chmod +x xcodegen`

---

### 2. Xcode License 许可问题

#### 问题: "You have not agreed to the Xcode license"
```
You have not agreed to the Xcode license. 
Please resolve this by running:
  sudo xcodebuild -license accept
```

**解决方案:**

**方法A: 使用sudo接受许可（推荐）**
```bash
sudo xcodebuild -license accept
```

**方法B: 手动接受**
1. 打开Xcode
2. 接受许可协议提示
3. 或者运行: `sudo xcodebuild -license`

**方法C: 如果没有sudo权限**
```bash
xcodebuild -license
# 会显示许可协议内容
# 按空格键阅读
# 输入 "agree" 接受
```

---

### 3. SQLite.swift 依赖问题

#### 问题: "Cannot find module 'SQLite'" 或编译错误

**解决方案:**

**方法A: Swift Package Manager（推荐）**

1. 打开项目文件: `open MagicSpins.xcodeproj`

2. 选择项目名称（在左侧导航栏）

3. 选择 "Swift Package Dependencies" 标签

4. 点击 `+` 按钮

5. 在搜索框中输入:
   ```
   https://github.com/stephencelis/SQLite.swift
   ```

6. 选择版本 `0.15.3` 或更高

7. 点击 "Add Package"

**方法B: 使用XcodeGen自动管理**

`project.yml` 已配置SQLite.swift依赖，只需确保：
1. 运行 `xcodegen generate`
2. Xcode会自动下载依赖

---

### 4. 项目文件问题

#### 问题: 项目文件结构不正确

**解决方案:**

1. 删除现有项目文件（如果有）:
   ```bash
   rm -rf MagicSpins.xcodeproj
   ```

2. 重新生成:
   ```bash
   xcodegen generate
   ```

3. 确认文件结构:
   ```bash
   ls -la MagicSpins/
   # 应该看到 App/ Models/ Services/ ViewModels/ Views/ 等目录
   ```

---

### 5. 编译错误

#### 错误类型及解决方案:

**A. Swift版本不兼容**
```
error: invalid Swift version
```
**解决:** 确保使用Swift 5.9+
- 检查: `swift --version`
- 在Xcode中: Build Settings > Swift Language Version

**B. iOS版本不支持**
```
error: unsupported iOS version
```
**解决:** 
- 在 `project.yml` 中设置: `deploymentTarget: iOS: "17.0"`
- 或在Xcode中修改: Deployment Target

**C. 缺少依赖包**
```
error: missing required module 'SQLite'
```
**解决:** 按照步骤3添加SQLite.swift依赖

**D. 代码签名错误**
```
error: unable to initiate Codesign
```
**解决:**
1. 选择项目 > Signing & Capabilities
2. 取消勾选 "Automatically manage signing"
3. 重新选择Team
4. 或勾选 "Automatically manage signing"

---

### 6. 模拟器运行问题

#### 问题: 模拟器无法启动或应用无法安装

**解决方案:**

**A. 重置模拟器**
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```

**B. 检查可用模拟器**
```bash
xcrun simctl list devices available
```

**C. 指定特定模拟器**
```bash
# 在project.yml中设置
targets:
  MagicSpins:
    settings:
      IPHONEOS_DEPLOYMENT_TARGET: "17.0"

# 或在Xcode中手动选择
```

**D. 清理构建缓存**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
# 然后重新运行
```

---

### 7. 数据库问题

#### 问题: 应用启动时数据库错误

**错误信息:**
```
Database setup failed
```

**解决方案:**

**A. 检查Documents目录权限**
- 应用需要在Documents目录创建数据库文件
- iOS模拟器: `~/Library/Developer/CoreSimulator/Devices/`

**B. 删除旧数据库（重置数据）**
```bash
rm ~/Library/Developer/Xcode/Devices/*/data/Library/Preferences/com.magicspins.app.plist
# 注意：这会删除所有应用数据
```

**C. 检查SQLite.swift版本兼容性**
- 确保使用版本 0.15.3 或更高
- 旧版本可能有API不兼容问题

---

### 8. 通知权限问题

#### 问题: 通知不工作

**解决方案:**

**A. 在应用中请求权限**
- 应用首次添加药物时会自动请求通知权限
- 或在设置中手动开启

**B. 系统权限设置**
1. 打开 iOS "设置" 应用
2. 找到 "药吃了么" 或 "MagicSpins"
3. 开启 "通知" 权限

**C. 检查通知配置**
- 确保应用有 "Push Notifications" capability
- 本地通知需要用户授权

---

### 9. 代码文件缺失

#### 问题: 编译提示找不到文件

**解决方案:**

**A. 确认文件存在**
```bash
ls MagicSpins/**/*.swift
# 应该看到所有19个Swift文件
```

**B. 检查project.yml配置**
```yaml
targets:
  MagicSpins:
    sources:
      - path: MagicSpins
        excludes:
          - "**/.DS_Store"
```

**C. 重新添加到Xcode**
1. 在Xcode中右键点击项目
2. 选择 "Add Files to 'MagicSpins'"
3. 选择整个 `MagicSpins` 文件夹
4. 确保勾选 "Create groups"
5. 点击 "Add"

---

### 10. 其他常见问题

#### Q: 如何查看详细编译日志?
**A:** 
- Xcode: View > Navigators > Report Navigator
- 或 Product > Build For > Profiling

#### Q: 如何清理项目?
**A:**
```bash
# Xcode清理
Cmd + Shift + K

# 完全清理
Cmd + Option + Shift + K
```

#### Q: 如何查看应用数据?
**A:**
```bash
# 使用SimPholders应用（第三方）
# 或手动访问
~/Library/Developer/CoreSimulator/Devices/
```

#### Q: 如何导出数据库查看?
**A:**
1. 在Xcode中打开Devices窗口
2. 选择模拟器
3. 找到应用
4. 点击齿轮图标 > Download Container
5. 解压后访问 `Documents/magicSpins.sqlite3`

---

## 🆘 获取帮助

如果以上解决方案都无法解决你的问题:

### 1. 检查GitHub仓库
- 访问: https://github.com/wuyanxin/ai-magic-spins
- 查看Issues部分
- 搜索类似问题

### 2. 查看文档
- README.md - 项目说明
- QUICKSTART.md - 快速开始
- CODE_REVIEW.md - 代码验证清单

### 3. 创建新Issue
在GitHub仓库中创建Issue，包含:
- 错误信息（完整复制）
- 你的macOS版本
- Xcode版本
- 已尝试的解决方案
- 复现步骤

### 4. 联系支持
- GitHub Issues: https://github.com/wuyanxin/ai-magic-spins/issues
- 描述清楚问题，我会尽快回复

---

## ✅ 快速检查清单

在运行项目前，确保:

- [ ] Xcode已安装并打开
- [ ] Xcode许可协议已接受
- [ ] XcodeGen已安装 (optional)
- [ ] 项目文件已生成
- [ ] SQLite.swift依赖已添加
- [ ] 选择了正确的模拟器
- [ ] 代码签名已配置

如果以上都OK，运行项目:
```bash
Cmd + R
```

---

**最后更新**: 2026-05-17
**版本**: 1.0.0 MVP
**维护者**: MagicSpins Development Team
