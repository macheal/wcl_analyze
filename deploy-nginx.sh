#!/bin/bash
###
# WCL 分析系统构建脚本
# 
# 功能:
# - 构建前端应用
# - 复制文件到 nginx-deploy-package
###

set -e  # 遇到错误立即退出

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DEPLOY_PACKAGE_DIR="$PROJECT_DIR/nginx-deploy-package"

# 检查依赖
check_dependencies() {
    log_info "检查依赖项..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        echo "安装命令: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    log_info "依赖检查通过"
}

# 构建前端应用
build_frontend() {
    log_info "构建前端应用..."
    
    # 检查前端目录
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "前端目录不存在: $FRONTEND_DIR"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖（如果不存在 node_modules）
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi
    
    # 构建应用
    log_info "构建生产版本..."
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        log_error "构建失败，未找到 dist 目录"
        exit 1
    fi
    
    # 检查构建文件
    if [ ! -f "dist/index.html" ]; then
        log_error "构建失败，未找到 index.html"
        exit 1
    fi
    
    log_info "前端构建完成"
}

# 准备部署包
prepare_deploy_package() {
    log_info "准备部署包目录..."
    
    # 如果部署包目录存在，先清空（保留目录结构）
    if [ -d "$DEPLOY_PACKAGE_DIR" ]; then
        log_info "清空现有部署包目录..."
        find "$DEPLOY_PACKAGE_DIR" -mindepth 1 -delete 2>/dev/null || true
        rm -rf "$DEPLOY_PACKAGE_DIR"/* 2>/dev/null || true
    fi
    
    # 重新创建部署包目录结构
    mkdir -p "$DEPLOY_PACKAGE_DIR/var/www"
    mkdir -p "$DEPLOY_PACKAGE_DIR/var/log/nginx"
    
    log_info "部署包目录准备完成"
}

# 复制文件到部署包
copy_files_to_package() {
    log_info "复制构建文件到部署包..."
    
    # 检查构建输出
    if [ ! -d "$FRONTEND_DIR/dist" ]; then
        log_error "构建输出目录不存在: $FRONTEND_DIR/dist"
        exit 1
    fi
    
    # 复制构建文件
    WWW_DIR="$DEPLOY_PACKAGE_DIR/var/www"
    cp -r "$FRONTEND_DIR/dist/"* "$WWW_DIR/"
    
    # 复制图片资源（如果存在）
    if [ -d "$FRONTEND_DIR/images" ]; then
        mkdir -p "$WWW_DIR/images"
        cp -r "$FRONTEND_DIR/images/"* "$WWW_DIR/images/" 2>/dev/null || true
    fi
    
    log_info "文件复制完成"
}

# 复制配置文件
copy_config_files() {
    log_info "复制配置文件..."
    
    CONFIG_DIR="$PROJECT_DIR/deploy-configs"
    
    # 检查配置文件目录
    if [ ! -d "$CONFIG_DIR" ]; then
        log_error "配置文件目录不存在: $CONFIG_DIR"
        echo "请确保 deploy-configs 目录存在，包含 docker-compose.yaml 和 nginx.conf"
        exit 1
    fi
    
    # 复制配置文件
    if [ -f "$CONFIG_DIR/docker-compose.yaml" ]; then
        cp "$CONFIG_DIR/docker-compose.yaml" "$DEPLOY_PACKAGE_DIR/"
        log_info "已复制 docker-compose.yaml"
    else
        log_warn "未找到 docker-compose.yaml"
    fi
    
    if [ -f "$CONFIG_DIR/nginx.conf" ]; then
        cp "$CONFIG_DIR/nginx.conf" "$DEPLOY_PACKAGE_DIR/"
        log_info "已复制 nginx.conf"
    else
        log_warn "未找到 nginx.conf"
    fi
    
    if [ -f "$CONFIG_DIR/README.md" ]; then
        cp "$CONFIG_DIR/README.md" "$DEPLOY_PACKAGE_DIR/"
        log_info "已复制 README.md"
    fi
    
    log_info "配置文件复制完成"
}

# 显示完成信息
show_completion_info() {
    echo ""
    log_info "构建和文件复制完成！🎉"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📁 部署包目录: $DEPLOY_PACKAGE_DIR"
    echo "  📂 前端文件目录: $DEPLOY_PACKAGE_DIR/var/www"
    echo "  ⚙️  配置文件目录: $DEPLOY_PACKAGE_DIR"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 显示文件统计
    WWW_DIR="$DEPLOY_PACKAGE_DIR/var/www"
    if [ -d "$WWW_DIR" ]; then
        FILE_COUNT=$(find "$WWW_DIR" -type f | wc -l)
        DIR_SIZE=$(du -sh "$WWW_DIR" 2>/dev/null | cut -f1)
        echo "  📊 前端文件统计:"
        echo "     文件数量: $FILE_COUNT"
        echo "     目录大小: $DIR_SIZE"
        echo ""
    fi
    
    # 显示配置文件统计
    CONFIG_COUNT=0
    if [ -f "$DEPLOY_PACKAGE_DIR/docker-compose.yaml" ]; then
        CONFIG_COUNT=$((CONFIG_COUNT + 1))
    fi
    if [ -f "$DEPLOY_PACKAGE_DIR/nginx.conf" ]; then
        CONFIG_COUNT=$((CONFIG_COUNT + 1))
    fi
    if [ -f "$DEPLOY_PACKAGE_DIR/README.md" ]; then
        CONFIG_COUNT=$((CONFIG_COUNT + 1))
    fi
    
    echo "  📋 配置文件: $CONFIG_COUNT 个文件已复制"
    echo ""
    echo "  ✅ 部署包已准备就绪，包含前端文件和配置文件"
    echo ""
}

# 显示部署信息
show_deployment_info() {
    echo ""
    log_info "部署完成！"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🌐 应用地址: http://localhost"
    echo "  🔍 健康检查: curl http://localhost/health"
    echo ""
    echo "  📁 部署包目录: $DEPLOY_PACKAGE_DIR"
    echo "  🐳 Docker Compose: docker-compose ps"
    echo "  📝 查看日志: docker-compose logs -f"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 显示文件统计
    WWW_DIR="$DEPLOY_PACKAGE_DIR/var/www"
    if [ -d "$WWW_DIR" ]; then
        FILE_COUNT=$(find "$WWW_DIR" -type f | wc -l)
        DIR_SIZE=$(du -sh "$WWW_DIR" 2>/dev/null | cut -f1)
        echo "  📊 文件统计:"
        echo "     文件数量: $FILE_COUNT"
        echo "     目录大小: $DIR_SIZE"
        echo ""
    fi
    
    echo "  🔧 常用命令："
    echo "     停止服务: docker-compose down"
    echo "     重启服务: docker-compose restart"
    echo "     查看日志: docker-compose logs -f"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "🚀 WCL 分析系统构建脚本"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 检查依赖
    check_dependencies
    
    # 执行构建步骤
    build_frontend
    prepare_deploy_package
    copy_files_to_package
    copy_config_files
    show_completion_info
    
    echo ""
    log_info "构建完成！🎉"
    echo ""
}

# 错误处理
trap 'log_error "脚本执行失败，退出码: $?"; exit 1' ERR

# 运行主函数
main "$@"