# SnapSell 部署指南

本指南介绍如何将 SnapSell 部署到中国访问稳定的免费托管平台。

## 推荐平台

### 1. Vercel（推荐）⭐

**优点：**
- 完全免费
- 自动部署（连接 GitHub 后自动构建）
- 支持自定义域名
- 在中国访问相对稳定
- 专为 Next.js 优化

**部署步骤：**

#### 步骤 1: 准备 Git 仓库
```bash
# 在项目根目录初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
# 访问 https://github.com/new 创建新仓库
git remote add origin https://github.com/你的用户名/snapsell.git
git branch -M main
git push -u origin main
```

#### 步骤 2: 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择你的 SnapSell 仓库
5. 保持默认配置，点击 "Deploy"
6. 等待部署完成（约 2-3 分钟）

#### 步骤 3: 获取访问链接
部署成功后，Vercel 会提供一个 `.vercel.app` 域名，例如：
```
https://snapsell-xxx.vercel.app
```

---

### 2. Netlify

**优点：**
- 免费额度充足
- 操作简单
- 支持自定义域名

**部署步骤：**

1. 访问 [netlify.com](https://netlify.com)
2. 使用 GitHub 登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的 GitHub 仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
6. 点击 "Deploy site"

---

### 3. 阿里云/腾讯云 Serverless（国内最佳）

**优点：**
- 国内访问速度最快
- 免费额度充足
- 完全符合国内网络环境

**腾讯云 Webify 部署：**

1. 访问 [腾讯云 Webify](https://console.cloud.tencent.com/webify)
2. 创建应用，选择 "Next.js"
3. 连接 GitHub 仓库或直接上传代码
4. 自动部署

**阿里云 FC（函数计算）：**
- 参考 [阿里云函数计算文档](https://help.aliyun.com/document_detail/74756.html)

---

## 部署前准备

### 创建 `.gitignore` 文件
确保项目根目录有 `.gitignore` 文件：

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 环境变量（如需要）
如果将来需要添加环境变量（如 API 密钥），在 Vercel/Netlify 控制台的 "Environment Variables" 中添加。

---

## 自定义域名（可选）

### 使用自己的域名

1. **在 Vercel/Netlify 添加域名：**
   - 进入项目设置
   - 找到 "Domains" 选项
   - 添加你的域名（例如：`snapsell.yourdomain.com`）

2. **配置 DNS：**
   - 在你的域名服务商（如阿里云、腾讯云）添加 CNAME 记录
   - 指向 Vercel/Netlify 提供的地址

---

## 常见问题

### Q: 部署后页面无法访问？
A: 检查构建日志，确保 `npm run build` 成功。可能需要升级 Node.js 到 20.9.0+。

### Q: 中国访问速度慢？
A: 
- 优先使用腾讯云 Webify 或阿里云 FC
- 或使用国内 CDN 加速 Vercel 域名

### Q: 如何更新部署？
A: 只需推送代码到 GitHub，Vercel/Netlify 会自动重新部署。

```bash
git add .
git commit -m "Update features"
git push
```

---

## 快速部署命令（Vercel CLI）

如果你想通过命令行部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录运行
vercel

# 按提示操作即可
```

---

## 推荐方案总结

| 平台 | 国内访问速度 | 免费额度 | 部署难度 | 推荐指数 |
|------|------------|---------|---------|---------|
| 腾讯云 Webify | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vercel | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Netlify | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**最终建议：**
- **最简单**：使用 Vercel（5 分钟搞定）
- **国内最快**：使用腾讯云 Webify
- **长期稳定**：两者都部署，国内用腾讯云，海外用 Vercel
