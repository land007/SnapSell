# 腾讯云 Webify 部署配置指南

## 前置准备

### 1. 创建腾讯云账号并开通云开发服务

1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索"云开发 CloudBase"
3. 创建一个新的环境（免费版即可）
4. 记录下**环境 ID**（格式类似：`your-env-id-xxxxx`）

### 2. 获取 API 密钥

1. 访问 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 点击"新建密钥"
3. 记录下：
   - **SecretId**
   - **SecretKey**

⚠️ **重要**：请妥善保管这些密钥，不要泄露！

---

## GitHub Secrets 配置

在 GitHub 仓库中添加以下 Secrets：

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下三个 secrets：

| Name | Value | 说明 |
|------|-------|------|
| `TCB_ENV_ID` | `your-env-id-xxxxx` | 云开发环境 ID |
| `TCB_SECRET_ID` | `AKIDxxxxxxxxxx` | 腾讯云 API SecretId |
| `TCB_SECRET_KEY` | `xxxxxxxxxxxxxxxx` | 腾讯云 API SecretKey |

---

## 部署流程

### 自动部署（推荐）

配置完成后，每次推送代码到 `main` 分支，GitHub Actions 会自动：

1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 构建 Next.js 项目
4. ✅ 部署到腾讯云 Webify

查看部署状态：
- 进入 GitHub 仓库的 **Actions** 标签页
- 查看最新的 workflow 运行状态

### 手动部署

如果需要手动部署：

```bash
# 1. 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 2. 登录
tcb login --apiKeyId YOUR_SECRET_ID --apiKey YOUR_SECRET_KEY

# 3. 构建项目
npm run build

# 4. 部署
tcb hosting deploy ./.next /snapsell -e YOUR_ENV_ID
```

---

## 访问你的应用

部署成功后，访问：

```
https://your-env-id-xxxxx.tcloudbaseapp.com/snapsell
```

如果部署到根目录（修改 deploy.yml 中的路径为 `/`），则访问：

```
https://your-env-id-xxxxx.tcloudbaseapp.com/
```

---

## 自定义域名（可选）

1. 进入 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择你的环境
3. 进入 **静态网站托管** → **设置**
4. 添加自定义域名
5. 按提示配置 DNS 解析

---

## 常见问题

### Q: 部署失败，提示权限错误？
A: 检查 GitHub Secrets 中的 `TCB_SECRET_ID` 和 `TCB_SECRET_KEY` 是否正确。

### Q: 部署成功但访问 404？
A: 
1. 检查部署路径是否正确
2. Next.js 项目需要部署 `.next` 目录
3. 确认环境 ID 正确

### Q: 如何查看部署日志？
A: 在 GitHub 仓库的 **Actions** 标签页查看详细日志。

### Q: 免费版有什么限制？
A: 
- 存储空间：5GB
- 流量：5GB/月
- 对于个人项目和小型社区完全够用

---

## 下一步优化

1. **配置环境变量**：如果需要 API 密钥等，在云开发控制台配置
2. **CDN 加速**：在云开发控制台开启 CDN
3. **监控告警**：设置流量和错误监控

---

## 参考文档

- [腾讯云开发文档](https://cloud.tencent.com/document/product/876)
- [CloudBase CLI 文档](https://docs.cloudbase.net/cli/intro.html)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
