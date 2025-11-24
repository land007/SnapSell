# Vercel 部署指南

## 🚀 快速部署（推荐）

### 方法 1：通过网页部署（最简单）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击右上角 **Sign Up** 或 **Log In**

2. **使用 GitHub 登录**
   - 选择 "Continue with GitHub"
   - 授权 Vercel 访问您的 GitHub 账号

3. **导入项目**
   - 点击 **Add New...** → **Project**
   - 在列表中找到 `land007/SnapSell`
   - 点击 **Import**

4. **配置项目**
   - **Project Name**: `snapsell`（或保持默认）
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）

5. **部署**
   - 点击 **Deploy**
   - 等待 2-3 分钟
   - 部署成功！🎉

6. **获取访问链接**
   - 部署完成后会显示访问链接，例如：
     ```
     https://snapsell-xxx.vercel.app
     ```

---

### 方法 2：通过 CLI 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目目录运行
cd /Users/jiayiqiu/Desktop/闲置之家/SnapSell
vercel

# 4. 按提示操作
# - Set up and deploy? Yes
# - Which scope? 选择您的账号
# - Link to existing project? No
# - What's your project's name? snapsell
# - In which directory is your code located? ./
# - Want to override the settings? No

# 5. 部署成功后会显示访问链接
```

---

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub 的 `main` 分支，Vercel 会自动重新部署。

```bash
git add .
git commit -m "Update features"
git push
```

Vercel 会自动：
- ✅ 检测到新的提交
- ✅ 自动构建
- ✅ 自动部署
- ✅ 更新线上版本

---

## 🌐 自定义域名

### 添加自定义域名

1. 进入 Vercel 项目控制台
2. 点击 **Settings** → **Domains**
3. 输入您的域名，例如：
   - `snapsell.yourdomain.com`
   - 或 `www.snapsell.yourdomain.com`
4. 点击 **Add**

### 配置 DNS

Vercel 会提供 DNS 配置说明，通常是添加 CNAME 记录：

**阿里云 / 腾讯云 DNS 配置：**

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | `snapsell` | `cname.vercel-dns.com` |

**或使用 A 记录：**

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | `snapsell` | `76.76.21.21` |

### 启用 HTTPS

- Vercel 自动为所有域名提供免费 SSL 证书
- 无需手动配置
- 自动续期

---

## ⚙️ 环境变量（可选）

如果将来需要添加环境变量（如 API 密钥）：

1. 进入项目 **Settings** → **Environment Variables**
2. 添加变量：
   - **Name**: `NEXT_PUBLIC_API_KEY`
   - **Value**: `your-api-key`
   - **Environment**: Production / Preview / Development
3. 点击 **Save**
4. 重新部署以应用更改

---

## 📊 查看部署状态

### 在 Vercel 控制台

1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 查看 **Deployments** 标签
4. 可以看到：
   - 部署历史
   - 构建日志
   - 预览链接

### 在 GitHub

- 每次推送后，GitHub 的 commit 旁边会显示 Vercel 的部署状态
- ✅ 绿色勾：部署成功
- ❌ 红色叉：部署失败
- 🟡 黄色圈：部署中

---

## 🎯 Vercel 的优势

相比腾讯云 Webify，Vercel 提供：

| 特性 | Vercel | 腾讯云 Webify |
|------|--------|--------------|
| Next.js 支持 | ⭐⭐⭐⭐⭐ 完美 | ⭐⭐⭐ 仅静态 |
| 部署速度 | ⭐⭐⭐⭐⭐ 极快 | ⭐⭐⭐⭐ 快 |
| 自动 HTTPS | ✅ 免费 | ✅ 免费 |
| 自定义域名 | ✅ 无限 | ✅ 有限 |
| 中国访问速度 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 极快 |
| 免费额度 | 100GB 带宽/月 | 5GB 带宽/月 |

**推荐策略**：
- 国际用户 → Vercel
- 国内用户 → 腾讯云 Webify
- 或两者都部署，根据地区分流

---

## 🔧 常见问题

### Q: 部署失败怎么办？

**A:** 
1. 查看 Vercel 控制台的构建日志
2. 检查 `package.json` 中的依赖是否正确
3. 确保 Node.js 版本兼容（Vercel 默认使用 Node 20）

### Q: 如何回滚到之前的版本？

**A:** 
1. 进入 **Deployments** 标签
2. 找到之前成功的部署
3. 点击 **...** → **Promote to Production**

### Q: 如何查看访问统计？

**A:** 
1. 进入项目 **Analytics** 标签
2. 查看访问量、地理分布等数据
3. 免费版有基础统计

### Q: 部署后访问很慢？

**A:** 
- Vercel 的服务器在海外
- 中国访问可能较慢
- 建议同时部署到腾讯云 Webify

---

## 📱 访问您的应用

部署成功后，您的应用将可以通过以下地址访问：

```
https://snapsell-xxx.vercel.app
```

如果配置了自定义域名：

```
https://snapsell.yourdomain.com
```

---

## 🎉 下一步

1. ✅ 分享链接给用户
2. ✅ 配置自定义域名（可选）
3. ✅ 监控访问统计
4. ✅ 根据用户反馈持续优化

需要帮助？访问 [Vercel 文档](https://vercel.com/docs) 或联系 Vercel 支持。
