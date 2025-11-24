# 使用 Cloudflare 优化 Vercel 访问指南

## 🌐 为什么选择 Cloudflare？

Cloudflare 是全球最大的 CDN 服务商之一，具有以下优势：

- ✅ **免费计划功能强大** - 无限流量、免费 SSL
- ✅ **全球节点** - 在中国有合作节点，访问相对稳定
- ✅ **简单易用** - 配置简单，几分钟搞定
- ✅ **额外功能** - DDoS 防护、缓存优化、安全防护
- ✅ **与 Vercel 完美配合** - Vercel 官方推荐

---

## 🚀 方案 1：Cloudflare DNS + CDN（推荐）

### 步骤 1：注册 Cloudflare 账号

1. 访问 [cloudflare.com](https://cloudflare.com)
2. 点击 "Sign Up" 注册账号
3. 验证邮箱

### 步骤 2：添加您的域名

1. 登录后点击 "Add a Site"
2. 输入您的域名（例如：`yourdomain.com`）
3. 选择 **Free** 计划
4. 点击 "Continue"

### 步骤 3：扫描 DNS 记录

1. Cloudflare 会自动扫描您现有的 DNS 记录
2. 检查记录是否正确
3. 点击 "Continue"

### 步骤 4：修改域名 NS 记录

Cloudflare 会提供两个 NS（Name Server）地址，例如：
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**在您的域名注册商修改 NS 记录：**

#### 阿里云
1. 登录阿里云控制台
2. 进入域名管理
3. 找到您的域名，点击 "管理"
4. 点击 "DNS 修改"
5. 修改为 Cloudflare 提供的 NS 地址

#### 腾讯云
1. 登录腾讯云控制台
2. 进入域名管理
3. 修改 DNS 服务器为 Cloudflare 的 NS

**等待生效**：通常需要 2-24 小时

### 步骤 5：在 Cloudflare 添加 DNS 记录

NS 生效后，在 Cloudflare DNS 管理页面添加记录：

#### 为 Vercel 添加记录

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | `snapsell` | `cname.vercel-dns.com` | ✅ Proxied（橙色云朵） |

**重要**：
- ✅ 必须开启 "Proxied"（橙色云朵图标）
- ✅ 这样流量会经过 Cloudflare CDN

### 步骤 6：在 Vercel 添加域名

1. 进入 Vercel 项目设置 → Domains
2. 添加域名：`snapsell.yourdomain.com`
3. Vercel 会自动验证（可能需要几分钟）

### 步骤 7：配置 SSL/TLS

在 Cloudflare 控制台：

1. 点击 **SSL/TLS** 标签
2. 选择加密模式：**Full (strict)** 或 **Full**
3. 开启 **Always Use HTTPS**
4. 开启 **Automatic HTTPS Rewrites**

---

## 🔧 方案 2：Cloudflare Workers 反向代理

### 适用场景
- 不想修改域名 NS
- 需要更灵活的控制
- 想要自定义缓存规则

### 步骤 1：创建 Worker

1. 登录 Cloudflare
2. 点击 **Workers & Pages**
3. 点击 **Create Application**
4. 选择 **Create Worker**
5. 命名：`snapsell-proxy`

### 步骤 2：编写 Worker 代码

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 目标 Vercel 域名
  const targetHost = 'snapsell-indol.vercel.app'
  
  // 克隆请求
  const url = new URL(request.url)
  url.hostname = targetHost
  
  // 创建新请求
  const modifiedRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  })
  
  // 获取响应
  const response = await fetch(modifiedRequest)
  
  // 克隆响应以便修改
  const modifiedResponse = new Response(response.body, response)
  
  // 添加 CORS 头（如果需要）
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
  
  return modifiedResponse
}
```

### 步骤 3：部署 Worker

1. 点击 **Save and Deploy**
2. 获得 Worker 地址：`snapsell-proxy.your-subdomain.workers.dev`

### 步骤 4：绑定自定义域名

1. 在 Worker 页面点击 **Triggers**
2. 点击 **Add Custom Domain**
3. 输入：`snapsell.yourdomain.com`
4. 点击 **Add Custom Domain**

Cloudflare 会自动配置 DNS 和 SSL。

---

## ⚡ 优化配置

### 1. 开启缓存优化

在 Cloudflare 控制台：

**Caching** → **Configuration**
- Browser Cache TTL: `4 hours`
- Caching Level: `Standard`

**Page Rules**（可选）：
```
URL: snapsell.yourdomain.com/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 4 hours
```

### 2. 开启性能优化

**Speed** → **Optimization**
- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli
- ✅ Early Hints
- ✅ HTTP/2
- ✅ HTTP/3 (with QUIC)

### 3. 开启安全防护

**Security** → **Settings**
- ✅ Security Level: Medium
- ✅ Challenge Passage: 30 minutes
- ✅ Browser Integrity Check

---

## 📊 方案对比

| 特性 | DNS + CDN | Workers 反向代理 |
|------|-----------|-----------------|
| 配置难度 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| 访问速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 需要修改 NS | ✅ 是 | ❌ 否 |
| 免费额度 | 无限 | 100k 请求/天 |
| 推荐指数 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 推荐配置流程

### 最简单方案（推荐）

```
1. 注册 Cloudflare
2. 添加域名
3. 修改 NS 到 Cloudflare
4. 添加 CNAME 记录（开启 Proxied）
5. 在 Vercel 添加域名
6. 完成！
```

**时间**：30 分钟（包括 NS 生效时间）
**成本**：免费
**效果**：⭐⭐⭐⭐⭐

---

## 🔍 验证配置

### 检查 DNS 是否生效

```bash
# 检查 NS 记录
dig NS yourdomain.com

# 检查 CNAME 记录
dig snapsell.yourdomain.com

# 检查是否经过 Cloudflare
curl -I https://snapsell.yourdomain.com
# 应该看到 "cf-ray" 头，表示经过 Cloudflare
```

### 检查访问速度

访问：`https://snapsell.yourdomain.com`

在浏览器开发者工具查看：
- Response Headers 应该包含 `cf-ray`
- Server 应该是 `cloudflare`

---

## 🌍 中国访问优化

### Cloudflare 在中国的表现

**优势**：
- ✅ 有中国合作节点（通过中国联通）
- ✅ 比直连 Vercel 快很多
- ✅ 相对稳定

**局限**：
- ⚠️ 速度不如国内 CDN（阿里云/腾讯云）
- ⚠️ 部分地区可能仍有波动

### 进一步优化

如果需要更好的中国访问体验，建议：

**双 CDN 策略**：
```
国内用户 → 腾讯云 Webify
国际用户 → Cloudflare + Vercel
```

使用 DNS 智能解析实现自动分流。

---

## 💰 成本分析

### Cloudflare Free 计划

- ✅ 无限流量
- ✅ 免费 SSL 证书
- ✅ 基础 DDoS 防护
- ✅ 全球 CDN
- ✅ 无需信用卡

**完全免费！**

### Cloudflare Workers

- ✅ 100,000 请求/天（免费）
- ✅ 超出后：$5/月 + $0.50/百万请求

对于小型项目，免费额度完全够用。

---

## 🔧 常见问题

### Q: 修改 NS 会影响邮箱吗？

**A:** 
- 不会！Cloudflare 会自动导入现有的 MX 记录
- 邮箱服务不受影响

### Q: Cloudflare 会拖慢网站吗？

**A:** 
- 不会！反而会加速
- Cloudflare 有全球 CDN 节点
- 静态资源会被缓存

### Q: 可以随时切换回原来的 DNS 吗？

**A:** 
- 可以！随时修改 NS 记录即可
- 无任何锁定

### Q: Cloudflare 在中国真的可用吗？

**A:** 
- 可用，但速度因地区而异
- 一线城市通常较快
- 建议配合腾讯云 Webify 双部署

---

## 📋 快速实施清单

- [ ] 注册 Cloudflare 账号
- [ ] 添加域名到 Cloudflare
- [ ] 修改域名 NS 记录
- [ ] 等待 NS 生效（2-24 小时）
- [ ] 在 Cloudflare 添加 CNAME 记录
- [ ] 在 Vercel 添加自定义域名
- [ ] 配置 SSL/TLS 为 Full
- [ ] 开启性能优化选项
- [ ] 测试访问

---

## 🎉 总结

使用 Cloudflare 的优势：

1. **完全免费** - 无需任何费用
2. **配置简单** - 30 分钟搞定
3. **性能提升** - 全球 CDN 加速
4. **安全防护** - DDoS 防护、SSL 加密
5. **中国可用** - 比直连 Vercel 稳定

**推荐指数**：⭐⭐⭐⭐⭐

需要我帮您配置 Cloudflare 吗？
