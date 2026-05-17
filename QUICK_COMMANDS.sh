#!/bin/bash

# MagicSpins 一键命令指南
# 复制以下命令在终端中运行

echo "========================================"
echo "MagicSpins 快速启动命令"
echo "========================================"
echo ""

# 1. 进入项目目录
echo "1️⃣ 进入项目目录"
echo "---------------------------------------"
echo "cd /Users/george/Documents/workspace/ai-magic-spins"
echo ""

# 2. 检查XcodeGen
echo "2️⃣ 检查XcodeGen"
echo "---------------------------------------"
echo "# 检查是否安装"
echo "which xcodegen"
echo ""
echo "# 如果未安装，使用Homebrew安装"
echo "brew install xcodegen"
echo ""

# 3. 生成项目
echo "3️⃣ 生成Xcode项目"
echo "---------------------------------------"
echo "# 在项目目录中运行"
echo "xcodegen generate"
echo ""

# 4. 打开项目
echo "4️⃣ 打开Xcode项目"
echo "---------------------------------------"
echo "open MagicSpins.xcodeproj"
echo ""

# 5. 添加依赖（手动步骤）
echo "5️⃣ 添加SQLite.swift依赖（需手动）"
echo "---------------------------------------"
echo "在Xcode中："
echo "1. 选择项目 > Swift Package Dependencies"
echo "2. 点击 +"
echo "3. 输入: https://github.com/stephencelis/SQLite.swift"
echo "4. 选择版本 0.15.3"
echo "5. Add Package"
echo ""

# 6. 运行
echo "6️⃣ 运行项目"
echo "---------------------------------------"
echo "在Xcode中："
echo "1. 选择 iPhone 模拟器"
echo "2. 按 Cmd + R"
echo ""

echo "========================================"
echo "完整脚本已创建: STARTUP.command"
echo "双击即可运行自动化设置"
echo "========================================"
