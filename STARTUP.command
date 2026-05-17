#!/bin/bash
set -e  # 遇到错误立即退出

# ===========================================
# MagicSpins 一键启动脚本
# ===========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}  MagicSpins 一键启动脚本${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[i] $1${NC}"
}

# ===========================================
# 步骤1: 检查Xcode
# ===========================================
check_xcode() {
    print_header
    echo -e "${BLUE}步骤1: 检查Xcode安装${NC}"
    echo ""
    
    if ! command -v xcode-select &> /dev/null; then
        print_error "Xcode未安装"
        echo ""
        echo "请先从Mac App Store安装Xcode"
        exit 1
    fi
    
    print_step "Xcode已安装"
    echo ""
}

# ===========================================
# 步骤2: 接受许可协议
# ===========================================
accept_license() {
    echo -e "${BLUE}步骤2: 检查许可协议${NC}"
    echo ""
    
    # 检查是否已接受许可
    if xcodebuild -checkFirstLaunchStatus 2>&1 | grep -q "agree"; then
        print_warning "需要接受Xcode许可协议"
        echo ""
        echo "正在尝试自动接受许可..."
        echo ""
        
        # 尝试不需要sudo的方法
        if xcodebuild -license 2>&1 | grep -q "MIT License"; then
            echo "agree" | xcodebuild -license
            print_step "许可协议已接受"
        else
            print_warning "需要手动接受许可协议"
            echo ""
            echo "请在终端中运行以下命令："
            echo -e "${GREEN}  sudo xcodebuild -license accept${NC}"
            echo ""
            echo "或者："
            echo "1. 打开Xcode"
            echo "2. 接受许可协议"
            echo "3. 然后重新运行此脚本"
            echo ""
            read -p "按回车键继续（跳过许可步骤）..."
        fi
    else
        print_step "许可协议已接受"
    fi
    echo ""
}

# ===========================================
# 步骤3: 安装XcodeGen
# ===========================================
install_xcodegen() {
    echo -e "${BLUE}步骤3: 检查XcodeGen${NC}"
    echo ""
    
    if command -v xcodegen &> /dev/null; then
        XCODEGEN_VERSION=$(xcodegen --version)
        print_step "XcodeGen已安装 (版本: $XCODEGEN_VERSION)"
    else
        print_warning "XcodeGen未安装"
        echo ""
        echo "正在尝试安装..."
        echo ""
        
        # 尝试使用Homebrew安装
        if command -v brew &> /dev/null; then
            echo "使用Homebrew安装..."
            brew install xcodegen
            
            if [ $? -eq 0 ]; then
                print_step "XcodeGen安装成功"
            else
                print_error "Homebrew安装失败"
                echo ""
                echo "请手动安装XcodeGen："
                echo "1. 访问: https://github.com/yonaskolb/XcodeGen/releases"
                echo "2. 下载最新版本"
                echo "3. 解压并放到应用程序文件夹"
                echo ""
                read -p "按回车键继续（跳过XcodeGen）..."
            fi
        else
            print_warning "Homebrew未安装"
            echo ""
            echo "请手动安装XcodeGen："
            echo ""
            echo "方法1: 安装Homebrew后安装XcodeGen"
            echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "brew install xcodegen"
            echo ""
            echo "方法2: 手动下载"
            echo "1. 访问: https://github.com/yonaskolb/XcodeGen/releases"
            echo "2. 下载XcodeGen.zip"
            echo "3. 解压并添加到PATH"
            echo ""
            read -p "按回车键继续（跳过XcodeGen）..."
        fi
    fi
    echo ""
}

# ===========================================
# 步骤4: 生成Xcode项目
# ===========================================
generate_project() {
    echo -e "${BLUE}步骤4: 生成Xcode项目${NC}"
    echo ""
    
    # 检查project.yml是否存在
    if [ ! -f "project.yml" ]; then
        print_error "project.yml文件不存在"
        exit 1
    fi
    
    # 备份旧项目（如果存在）
    if [ -d "MagicSpins.xcodeproj" ]; then
        print_warning "删除旧项目文件..."
        rm -rf MagicSpins.xcodeproj
    fi
    
    # 生成项目
    if command -v xcodegen &> /dev/null; then
        print_info "正在生成Xcode项目..."
        xcodegen generate
        
        if [ $? -eq 0 ]; then
            print_step "Xcode项目生成成功"
        else
            print_error "项目生成失败"
            exit 1
        fi
    else
        print_warning "XcodeGen未安装，跳过自动生成"
        echo ""
        echo "请手动创建Xcode项目："
        echo "1. 打开Xcode"
        echo "2. File > New > Project"
        echo "3. 选择iOS > App"
        echo "4. Product Name: MagicSpins"
        echo "5. Interface: SwiftUI"
        echo "6. Language: Swift"
        echo "7. 将MagicSpins文件夹中的代码文件添加到项目"
    fi
    echo ""
}

# ===========================================
# 步骤5: 添加依赖包
# ===========================================
add_dependencies() {
    echo -e "${BLUE}步骤5: 配置依赖包${NC}"
    echo ""
    
    print_info "SQLite.swift依赖配置说明："
    echo ""
    echo "请在Xcode中完成以下步骤："
    echo ""
    echo "1. 如果已生成项目文件，双击打开："
    echo "   open MagicSpins.xcodeproj"
    echo ""
    echo "2. 选择项目名称（在左侧导航栏）"
    echo ""
    echo "3. 选择 'Swift Package Dependencies' 标签"
    echo ""
    echo "4. 点击 '+' 按钮"
    echo ""
    echo "5. 在搜索框中输入以下URL："
    echo -e "   ${GREEN}https://github.com/stephencelis/SQLite.swift${NC}"
    echo ""
    echo "6. 选择版本 '0.15.3' 或更高版本"
    echo ""
    echo "7. 点击 'Add Package'"
    echo ""
    
    if [ -f "MagicSpins.xcodeproj" ]; then
        echo "是否要自动打开项目？"
        read -p "输入 'y' 打开，或按回车键跳过: " OPEN_PROJECT
        
        if [ "$OPEN_PROJECT" = "y" ] || [ "$OPEN_PROJECT" = "Y" ]; then
            open MagicSpins.xcodeproj
            print_step "项目已打开"
        fi
    fi
    echo ""
}

# ===========================================
# 步骤6: 配置代码签名
# ===========================================
setup_signing() {
    echo -e "${BLUE}步骤6: 代码签名配置${NC}"
    echo ""
    
    print_info "代码签名配置说明："
    echo ""
    echo "在Xcode中："
    echo "1. 选择项目名称"
    echo "2. 选择 'Signing & Capabilities' 标签"
    echo "3. 勾选 'Automatically manage signing'"
    echo "4. 在Team下拉框中选择你的Apple ID"
    echo ""
    echo "如果没有Apple ID："
    echo "1. 访问 https://developer.apple.com"
    echo "2. 注册免费的Apple Developer账号"
    echo ""
}

# ===========================================
# 步骤7: 运行项目
# ===========================================
run_project() {
    echo -e "${BLUE}步骤7: 运行项目${NC}"
    echo ""
    
    print_info "运行MagicSpins应用："
    echo ""
    echo "在Xcode中："
    echo "1. 选择目标设备（如 iPhone 15 模拟器）"
    echo "2. 按 Cmd + R 运行项目"
    echo ""
    
    if [ -f "MagicSpins.xcodeproj" ]; then
        echo "是否要现在打开Xcode？"
        read -p "输入 'y' 打开: " OPEN_XCODE
        
        if [ "$OPEN_XCODE" = "y" ] || [ "$OPEN_XCODE" = "Y" ]; then
            open MagicSpins.xcodeproj
            print_step "Xcode已打开"
            echo ""
            echo "请在Xcode中："
            echo "1. 选择 iPhone 模拟器"
            echo "2. 按 Cmd + R 运行"
        fi
    fi
    echo ""
}

# ===========================================
# 完成提示
# ===========================================
show_completion() {
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}  🎉 MagicSpins 设置完成！${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo ""
    echo -e "${BLUE}项目位置:${NC} $(pwd)"
    echo ""
    echo -e "${BLUE}下一步:${NC}"
    echo "1. 打开项目: open MagicSpins.xcodeproj"
    echo "2. 添加SQLite.swift依赖"
    echo "3. 配置代码签名"
    echo "4. 选择模拟器并运行 (Cmd + R)"
    echo ""
    echo -e "${BLUE}遇到问题？${NC} 查看以下文档："
    echo "- README.md - 项目说明"
    echo "- QUICKSTART.md - 快速开始"
    echo "- TROUBLESHOOTING.md - 故障排除"
    echo "- CODE_REVIEW.md - 代码验证"
    echo ""
    echo -e "${GREEN}祝你使用愉快！💊✨${NC}"
    echo ""
}

# ===========================================
# 主函数
# ===========================================
main() {
    # 切换到脚本所在目录
    cd "$(dirname "$0")"
    
    # 执行各步骤
    check_xcode
    accept_license
    install_xcodegen
    generate_project
    add_dependencies
    setup_signing
    run_project
    show_completion
}

# 运行主函数
main
