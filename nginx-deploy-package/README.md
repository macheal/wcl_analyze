<!--
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-13 14:18:16
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-13 14:23:42
 * @FilePath: /wcl_analyze/nginx-deploy-package/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# Nginx 部署包

这个文件夹包含了可以直接部署到 Nginx 服务器的文件。

## 文件结构

```
nginx-deploy-package/
├── README.md              # 部署说明文档
├── docker-compose.yaml    # Docker Compose 配置文件
├── nginx.conf             # Nginx配置文件
└── var/
    └── www/               # 网站文件目录
        ├── index.html     # 前端入口文件
        ├── assets/
        │   └── index-CIVpaUoA.js  # 打包后的JavaScript文件
        └── images/
            └── demo.png   # 图片资源
```

## 部署方式

### Docker Compose 部署

1. **使用 Docker Compose 启动：**
   ```bash
   docker-compose up -d
   ```

2. **验证部署：**
   ```bash
   docker-compose ps
   docker-compose logs nginx
   ```

3. **目录说明：**
   - 网站文件位于 `var/www/` 目录下
   - Nginx 配置通过卷挂载到容器内
   - 所有文件都以只读方式挂载，确保安全性

4. **常用命令：**
   ```bash
   # 启动服务
   docker-compose up -d

   # 查看状态
   docker-compose ps

   # 查看日志
   docker-compose logs -f

   # 停止服务
   docker-compose down
   ```

## 注意事项

- 确保 Docker 和 Docker Compose 已安装
- 检查防火墙设置（端口 80/443）
- 验证后端 API 地址是否正确
- 所有文件以只读方式挂载，确保安全性

## 技术支持

如有问题，请检查：
1. Docker 容器日志：`docker-compose logs -f`
2. 浏览器开发者工具的网络标签
3. 确保端口未被占用：`docker-compose ps`
4. 检查容器状态：`docker-compose ps`