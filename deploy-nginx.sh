#!/bin/bash
###
 # @Author: GUANGYU WANG xinyukc01@hotmail.com
 # @Date: 2025-11-10 16:22:59
 # @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 # @LastEditTime: 2025-11-10 16:23:00
 # @FilePath: /wcl_analyze/deploy-nginx.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 

# WCL 分析系统 Nginx 静态部署脚本

echo "🚀 开始部署 WCL 分析系统..."

# 部署目录
DEPLOY_DIR="/var/www/wcl-analyze"
NGINX_CONF="/etc/nginx/sites-available/wcl-analyze"
NGINX_ENABLED="/etc/nginx/sites-enabled/wcl-analyze"

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 sudo 运行此脚本"
    exit 1
fi

# 创建部署目录
echo "📁 创建部署目录..."
mkdir -p $DEPLOY_DIR/images

# 复制文件
echo "📂 复制文件到部署目录..."
cp -r deploy/var/www/wcl-analyze/* $DEPLOY_DIR/

# 复制 Nginx 配置
echo "⚙️ 配置 Nginx..."
cp deploy/nginx.conf $NGINX_CONF

# 启用站点
if [ -f "$NGINX_ENABLED" ]; then
    rm $NGINX_ENABLED
fi
ln -s $NGINX_CONF $NGINX_ENABLED

# 测试配置
echo "🔍 测试 Nginx 配置..."
nginx -t

# 重载 Nginx
echo "🔄 重载 Nginx..."
systemctl reload nginx

echo "✅ 部署完成！"
echo "🌐 应用地址: http://localhost"
echo "📊 健康检查: curl http://localhost/health"

# 显示部署信息
echo ""
echo "📋 部署信息:"
echo "  部署目录: $DEPLOY_DIR"
echo "  配置文件: $NGINX_CONF"
echo "  日志文件: /var/log/nginx/wcl-access.log"
echo "  错误日志: /var/log/nginx/wcl-error.log"