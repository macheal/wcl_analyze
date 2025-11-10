<!--
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 16:24:18
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-10 16:26:23
 * @FilePath: /wcl_analyze/DEPLOYMENT-NGINX.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# WCL 分析系统 Nginx 静态部署

## 📦 部署包内容

```
deploy/
├── nginx.conf                    # Nginx 配置文件
deploy-nginx.sh                   # 部署脚本
DEPLOYMENT-NGINX.md               # 本说明文档
```

## 🚀 一键部署

```bash
sudo ./deploy-nginx.sh
```

## 📋 部署后文件位置

- **静态文件**: `/var/www/wcl-analyze/`
- **Nginx 配置**: `/etc/nginx/sites-available/wcl-analyze`
- **访问日志**: `/var/log/nginx/wcl-access.log`
- **错误日志**: `/var/log/nginx/wcl-error.log`

## 🔍 验证部署

```bash
# 访问应用
curl http://localhost

# 健康检查
curl http://localhost/health

# 查看日志
tail -f /var/log/nginx/wcl-access.log
```

## ⚙️ 主要配置

- **监听端口**: 80
- **API 代理**: `/api/` → `http://120.48.142.225:18080`
- **Gzip 压缩**: 已启用
- **静态缓存**: 1年缓存期
- **安全头**: 已配置

部署完成后，应用将在 http://localhost 可访问。