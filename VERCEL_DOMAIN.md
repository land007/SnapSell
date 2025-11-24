# Vercel 自定义域名配置指南

## 🌐 当前部署信息

**默认域名：** `https://snapsell-indol.vercel.app`

---

## 📋 配置步骤

### 步骤 1：在 Vercel 添加域名

您现在已经在域名配置页面了！接下来：

1. **输入您的域名**
   - 在输入框中输入您的域名，例如：
     - `snapsell.yourdomain.com`（推荐使用子域名）
     - 或 `www.yourdomain.com`
   
2. **点击 "Add" 按钮**
   - Vercel 会自动检测您的域名

3. **查看 DNS 配置要求**
   - Vercel 会显示需要添加的 DNS 记录

---

### 步骤 2：配置 DNS 记录

根据 Vercel 的提示，您需要在域名服务商添加以下记录之一：

#### 选项 A：CNAME 记录（推荐用于子域名）

如果您使用的是子域名（如 `snapsell.yourdomain.com`）：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | `snapsell` | `cname.vercel-dns.com` |

**阿里云配置示例：**
1. 登录 [阿里云控制台](https://dns.console.aliyun.com/)
2. 进入域名解析
3. 添加记录：
   - 记录类型：CNAME
   - 主机记录：`snapsell`
   - 记录值：`cname.vercel-dns.com`
   - TTL：10 分钟

**腾讯云配置示例：**
1. 登录 [DNSPod 控制台](https://console.dnspod.cn/)
2. 添加记录：
   - 主机记录：`snapsell`
   - 记录类型：CNAME
   - 记录值：`cname.vercel-dns.com`
   - TTL：600

#### 选项 B：A 记录（用于根域名）

如果您想使用根域名（如 `yourdomain.com`）：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | `@` | `76.76.21.21` |

---

### 步骤 3：等待 DNS 生效

- **生效时间**：通常 10-30 分钟，最长可能需要 24 小时
- **检查方法**：
  ```bash
  # Mac/Linux
  nslookup snapsell.yourdomain.com
  
  # 或
  dig snapsell.yourdomain.com
  ```

---

### 步骤 4：验证域名

1. 返回 Vercel 域名配置页面
2. 等待 Vercel 自动验证（通常几分钟内完成）
3. 验证成功后，状态会变为 **"Valid Configuration"**

---

### 步骤 5：配置 HTTPS（自动）

Vercel 会自动：
- ✅ 为您的域名申请免费 SSL 证书
- ✅ 启用 HTTPS
- ✅ 强制 HTTPS 重定向
- ✅ 自动续期证书

无需任何手动操作！

---

## 🎯 推荐域名配置

### 单个子域名（最简单）
```
snapsell.yourdomain.com → CNAME → cname.vercel-dns.com
```

### 多个域名（推荐）
同时配置多个域名，让用户可以通过不同方式访问：

```
snapsell.yourdomain.com → CNAME → cname.vercel-dns.com
www.snapsell.yourdomain.com → CNAME → cname.vercel-dns.com
```

在 Vercel 中分别添加这两个域名即可。

---

## 🔧 常见问题

### Q: 提示 "Invalid Configuration"？

**A:** 
1. 检查 DNS 记录是否正确添加
2. 等待更长时间（最多 24 小时）
3. 清除本地 DNS 缓存：
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```

### Q: 可以使用根域名吗（不带 www）？

**A:** 
- 可以！使用 A 记录指向 `76.76.21.21`
- 但推荐使用子域名（如 `www` 或 `snapsell`）
- 因为 CNAME 记录更灵活，Vercel 可以自动优化路由

### Q: 如何设置主域名？

**A:** 
1. 在 Vercel 域名列表中，找到您想设为主域名的那个
2. 点击旁边的 "..." 菜单
3. 选择 "Set as Primary Domain"
4. 其他域名会自动重定向到主域名

### Q: SSL 证书申请失败？

**A:** 
1. 确认 DNS 已生效
2. 等待几分钟后刷新页面
3. Vercel 会自动重试
4. 如果持续失败，检查域名是否在其他地方也申请了证书

### Q: 域名配置后多久可以访问？

**A:** 
- DNS 生效：10-30 分钟
- SSL 证书签发：5-10 分钟
- 总计：通常 15-40 分钟内可以正常访问

---

## 📝 配置示例

假设您的域名是 `example.com`：

### 配置 1：单个子域名
```
域名：snapsell.example.com
DNS：CNAME → cname.vercel-dns.com
访问：https://snapsell.example.com
```

### 配置 2：多个域名
```
域名 1：snapsell.example.com (主域名)
域名 2：www.snapsell.example.com (重定向到主域名)
DNS：都是 CNAME → cname.vercel-dns.com
访问：https://snapsell.example.com
```

### 配置 3：根域名
```
域名：example.com
DNS：A → 76.76.21.21
访问：https://example.com
```

---

## ✅ 配置完成后

访问您的自定义域名：
```
https://snapsell.yourdomain.com
```

自动享受：
- ✅ 免费 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动证书续期
- ✅ HTTP/2 和 HTTP/3 支持

---

## 🚀 下一步

1. 分享您的自定义域名给用户
2. 在微信群中推广
3. 监控访问统计（Vercel Analytics）
4. 根据用户反馈持续优化

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs/concepts/projects/domains
- DNS 配置帮助：查看您的域名服务商文档
- Vercel 支持：https://vercel.com/support
