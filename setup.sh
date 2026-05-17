#!/bin/bash

# MagicSpins 自动设置脚本
# 使用方法: bash setup.sh

echo "🚀 MagicSpins 项目设置脚本"
echo "================================"

# 检查Xcode是否安装
if ! command -v xcode-select &> /dev/null; then
    echo "❌ Xcode未安装，请先安装Xcode"
    exit 1
fi

# 检查Xcode license
echo "📋 检查Xcode许可协议..."
if ! xcodebuild -checkFirstLaunchStatus &> /dev/null; then
    echo "⚠️  需要接受Xcode许可协议"
    echo "请在终端运行: sudo xcodebuild -license accept"
    echo "或者手动打开Xcode并接受许可协议"
    echo ""
    echo "如果你已经接受过许可协议，可以继续..."
fi

# 检查是否已安装XcodeGen
if command -v xcodegen &> /dev/null; then
    echo "✅ XcodeGen已安装"
    
    # 生成Xcode项目
    echo "🔨 生成Xcode项目..."
    xcodegen generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Xcode项目生成成功！"
        echo ""
        echo "📱 下一步："
        echo "1. 打开项目: open MagicSpins.xcodeproj"
        echo "2. 添加SQLite.swift依赖包"
        echo "3. 选择模拟器并运行 (Cmd + R)"
    else
        echo "❌ 项目生成失败"
    fi
else
    echo "⚠️  XcodeGen未安装"
    echo ""
    echo "安装选项："
    echo "----------------------------------------"
    echo "选项1: Homebrew (推荐)"
    echo "  brew install xcodegen"
    echo ""
    echo "选项2: MacPorts"
    echo "  sudo port install xcodegen"
    echo ""
    echo "选项3: 手动下载"
    echo "  https://github.com/yonaskolb/XcodeGen/releases"
    echo "----------------------------------------"
    echo ""
    echo "安装完成后，运行: bash setup.sh"
    echo ""
    echo "或者手动创建项目："
    echo "1. 打开Xcode"
    echo "2. File > New > Project"
    echo "3. 选择iOS > App"
    echo "4. Product Name: MagicSpins"
    echo "5. 将代码文件添加到项目中"
fi

echo ""
echo "================================"
echo "设置脚本完成！"
