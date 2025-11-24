# 防止 Vercel 被墙的解决方案

## 🚨 问题说明

Vercel 的默认域名（`*.vercel.app`）在中国大陆可能会遇到访问不稳定或被墙的情况。

---

## ✅ 解决方案

### 方案 1：使用自定义域名（最推荐）⭐⭐⭐⭐⭐

**原理**：使用您自己的域名，避开 `vercel.app` 域名的限制。

**步骤**：

1. **准备已备案的域名**
   - 如果域名未备案，在中国使用可能仍有风险
   - 推荐使用已备案域名

2. **在 Vercel 添加自定义域名**
   - 参考 `VERCEL_DOMAIN.md` 配置
   - 例如：`snapsell.yourdomain.com`

3. **配置 DNS**
   - 使用国内 DNS 服务商（阿里云/腾讯云）
   - 添加 CNAME 记录指向 `cname.vercel-dns.com`

4. **优势**
   - ✅ 完全避开 `vercel.app` 域名
   - ✅ 使用自己的品牌域名
   - ✅ 访问更稳定
   - ✅ 可以备案（如需要）

**示例配置**：
```
域名：snapsell.yourdomain.com
DNS：CNAME → cname.vercel-dns.com
访问：https://snapsell.yourdomain.com
```

---

### 方案 2：双部署策略（最稳定）⭐⭐⭐⭐⭐

**原理**：同时部署到 Vercel 和国内平台，根据用户地区分流。

**实施方案**：

#### A. Vercel + 腾讯云 Webify

1. **Vercel 部署**（已完成）
   - 域名：`snapsell-global.yourdomain.com`
   - 服务：国际用户

2. **腾讯云 Webify 部署**（已配置 GitHub Actions）
   - 域名：`snapsell.yourdomain.com`
   - 服务：中国用户

3. **DNS 智能解析**
   - 在阿里云/腾讯云 DNS 配置智能解析
   - 国内线路 → 腾讯云 Webify
   - 海外线路 → Vercel

**DNS 配置示例（腾讯云 DNSPod）**：

| 主机记录 | 记录类型 | 线路类型 | 记录值 |
|---------|---------|---------|--------|
| `snapsell` | CNAME | 默认 | `cname.vercel-dns.com` |
| `snapsell` | CNAME | 境内 | `cloud1-xxx.tcloudbaseapp.com` |

#### B. Vercel + Cloudflare CDN

1. **使用 Cloudflare 作为 CDN**
   - 将域名 DNS 托管到 Cloudflare
   - 开启 Cloudflare CDN
   - 在中国有节点，访问更稳定

2. **配置步骤**：
   - 注册 Cloudflare 账号
   - 添加您的域名
   - 修改域名 NS 记录指向 Cloudflare
   - 在 Cloudflare 添加 CNAME 记录指向 Vercel

---

### 方案 3：使用 Cloudflare Workers（进阶）⭐⭐⭐⭐

**原理**：通过 Cloudflare Workers 反向代理 Vercel。

**优势**：
- ✅ 不需要修改 Vercel 配置
- ✅ 可以使用自定义域名
- ✅ Cloudflare 在中国有 CDN 节点

**实施步骤**：

1. **创建 Cloudflare Workers**
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  url.hostname = 'snapsell-indol.vercel.app'
  
  return fetch(url, {
    headers: request.headers,
    method: request.method,
    body: request.body
  })
}
```

2. **绑定自定义域名**
   - 在 Cloudflare Workers 绑定您的域名
   - 例如：`snapsell.yourdomain.com`

---

### 方案 4：使用国内 CDN 加速（推荐）⭐⭐⭐⭐

**适用场景**：已有备案域名

**实施方案**：

#### A. 阿里云 CDN

1. **开通阿里云 CDN**
   - 登录阿里云控制台
   - 开通 CDN 服务

2. **添加加速域名**
   - 加速域名：`snapsell.yourdomain.com`
   - 源站类型：域名
   - 源站地址：`snapsell-indol.vercel.app`

3. **配置 CNAME**
   - 阿里云会提供 CDN CNAME
   - 在 DNS 添加记录指向该 CNAME

#### B. 腾讯云 CDN

1. **开通腾讯云 CDN**
2. **添加域名**
   - 源站：`snapsell-indol.vercel.app`
3. **配置 DNS**

**优势**：
- ✅ 国内访问速度极快
- ✅ 稳定性高
- ✅ 可以备案

---

## 🎯 推荐策略

### 个人/小型项目
```
方案 1：使用自定义域名
成本：域名费用（约 50-100 元/年）
难度：⭐⭐
效果：⭐⭐⭐⭐
```

### 中型项目
```
方案 2：Vercel + 腾讯云 Webify 双部署
成本：免费
难度：⭐⭐⭐
效果：⭐⭐⭐⭐⭐
```

### 企业级项目
```
方案 4：国内 CDN + Vercel
成本：CDN 费用（按流量计费）
难度：⭐⭐⭐⭐
效果：⭐⭐⭐⭐⭐
```

---

## 📋 快速实施指南

### 最简单方案（5 分钟）

1. **购买/使用已有域名**
2. **在 Vercel 添加域名**
   - 输入：`snapsell.yourdomain.com`
   - 点击 Add
3. **配置 DNS**
   - 添加 CNAME 记录
   - 指向：`cname.vercel-dns.com`
4. **等待生效**
   - 10-30 分钟

### 最稳定方案（已配置）

您的项目已经配置了 GitHub Actions 自动部署到腾讯云 Webify！

1. **配置 GitHub Secrets**（参考 `WEBIFY_SETUP.md`）
   - `TCB_ENV_ID`
   - `TCB_SECRET_ID`
   - `TCB_SECRET_KEY`

2. **推送代码触发部署**
   ```bash
   git push
   ```

3. **配置双域名**
   - Vercel：`snapsell-global.yourdomain.com`（国际）
   - Webify：`snapsell.yourdomain.com`（国内）

---

## ⚠️ 重要提醒

### 关于备案

- **如果使用国内 CDN**：必须备案
- **如果只用 Vercel + 自定义域名**：不强制备案，但可能仍有风险
- **推荐**：使用已备案域名 + 双部署策略

### 关于成本

| 方案 | 成本 | 说明 |
|------|------|------|
| 自定义域名 | 50-100元/年 | 域名注册费 |
| 双部署 | 免费 | Vercel + Webify 都有免费额度 |
| CDN 加速 | 按流量计费 | 小项目每月几元到几十元 |

---

## 🔧 故障排查

### Q: 配置了自定义域名还是访问不了？

**A:** 
1. 检查域名是否已备案
2. 尝试使用不同网络（移动/联通/电信）
3. 清除 DNS 缓存
4. 考虑使用双部署方案

### Q: Cloudflare CDN 在中国快吗？

**A:** 
- Cloudflare 在中国有合作节点
- 速度中等，比直连 Vercel 快
- 不如国内 CDN（阿里云/腾讯云）

### Q: 双部署会增加维护成本吗？

**A:** 
- 不会！GitHub Actions 自动同步部署
- 推送一次代码，两个平台都更新
- 零额外维护成本

---

## 📞 推荐行动方案

基于您的项目，我推荐：

1. **立即执行**：配置自定义域名到 Vercel
2. **同时配置**：完成腾讯云 Webify 部署（GitHub Actions 已配置）
3. **长期优化**：使用 DNS 智能解析分流国内外用户

这样可以确保：
- ✅ 国内用户访问稳定（Webify）
- ✅ 国际用户访问快速（Vercel）
- ✅ 自动部署，零维护成本
- ✅ 完全避开被墙风险

需要我帮您配置具体的方案吗？
