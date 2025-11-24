# 自定义域名配置指南

## 📋 前提条件

1. 拥有一个已备案的域名（如果在中国大陆使用）
2. 域名可以在任何域名服务商购买（阿里云、腾讯云、GoDaddy 等）
3. 有域名的 DNS 管理权限

---

## 🚀 腾讯云 Webify 配置自定义域名

### 步骤 1：在腾讯云控制台添加域名

1. 登录 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择您的环境（`cloud1-1gzz80mo90ab9dd1`）
3. 点击左侧菜单 **静态网站托管**
4. 点击顶部 **设置** 标签
5. 在 **域名管理** 区域，点击 **添加域名**
6. 输入您的域名，例如：
   - `snapsell.yourdomain.com`（推荐使用子域名）
   - 或 `www.yourdomain.com`

### 步骤 2：获取 CNAME 记录值

添加域名后，腾讯云会给您一个 CNAME 记录值，类似：

```
cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com
```

**记录下这个值**，下一步需要用到。

### 步骤 3：配置 DNS 解析

根据您的域名服务商，配置方式略有不同：

#### 方式 A：阿里云域名

1. 登录 [阿里云控制台](https://dns.console.aliyun.com/)
2. 进入 **域名解析**
3. 找到您的域名，点击 **解析设置**
4. 点击 **添加记录**
5. 填写以下信息：
   - **记录类型**：CNAME
   - **主机记录**：`snapsell`（如果域名是 `snapsell.yourdomain.com`）
   - **记录值**：`cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com`
   - **TTL**：10 分钟（默认）
6. 点击 **确定**

#### 方式 B：腾讯云域名

1. 登录 [腾讯云 DNSPod 控制台](https://console.dnspod.cn/)
2. 找到您的域名，点击 **解析**
3. 点击 **添加记录**
4. 填写以下信息：
   - **主机记录**：`snapsell`
   - **记录类型**：CNAME
   - **记录值**：`cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com`
   - **TTL**：600（默认）
5. 点击 **保存**

#### 方式 C：其他域名服务商

通用步骤：
1. 登录您的域名管理后台
2. 找到 DNS 设置 / 域名解析
3. 添加 CNAME 记录：
   - **Name/Host**: `snapsell`
   - **Type**: CNAME
   - **Value/Target**: `cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com`

### 步骤 4：等待 DNS 生效

- DNS 解析通常需要 **10 分钟到 24 小时** 生效
- 国内域名一般 10-30 分钟即可生效
- 可以使用以下命令检查是否生效：

```bash
# Mac/Linux
nslookup snapsell.yourdomain.com

# 或
dig snapsell.yourdomain.com
```

如果返回的 CNAME 指向腾讯云地址，说明已生效。

### 步骤 5：在腾讯云验证域名

1. 返回腾讯云控制台的 **域名管理** 页面
2. 找到您添加的域名
3. 点击 **验证**
4. 如果 DNS 已生效，验证会通过
5. 状态变为 **已启用**

### 步骤 6：配置 HTTPS（可选但推荐）

1. 在域名管理页面，点击您的域名
2. 点击 **SSL 证书**
3. 选择以下方式之一：
   - **自动申请**：腾讯云免费提供 SSL 证书（推荐）
   - **上传证书**：如果您已有证书

4. 等待证书签发（通常 5-10 分钟）
5. 启用 **强制 HTTPS**（推荐）

---

## 🌐 访问您的应用

配置完成后，您可以通过以下地址访问：

```
https://snapsell.yourdomain.com
```

---

## 🔧 常见问题

### Q: DNS 解析不生效怎么办？

**A:** 
1. 检查 CNAME 记录是否正确填写
2. 确认主机记录没有多余的空格
3. 等待更长时间（最多 24 小时）
4. 清除本地 DNS 缓存：
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```

### Q: 提示"域名未备案"怎么办？

**A:** 
- 如果您的服务器在中国大陆，域名必须备案
- 在域名服务商处申请 ICP 备案
- 备案通过后才能绑定

### Q: 可以绑定多个域名吗？

**A:** 
- 可以！重复上述步骤添加多个域名
- 例如同时绑定：
  - `snapsell.yourdomain.com`
  - `www.snapsell.yourdomain.com`

### Q: 如何设置根域名（不带 www）？

**A:** 
- 某些服务商不支持根域名的 CNAME 记录
- 推荐使用子域名（如 `www` 或 `snapsell`）
- 或使用 A 记录（需要腾讯云提供 IP 地址）

### Q: SSL 证书申请失败？

**A:** 
1. 确认域名解析已生效
2. 检查域名是否已在其他地方申请过证书
3. 尝试手动上传证书（可从 Let's Encrypt 免费获取）

---

## 📝 域名配置示例

假设您的域名是 `example.com`，以下是推荐的配置：

| 子域名 | 记录类型 | 记录值 | 用途 |
|--------|---------|--------|------|
| `snapsell` | CNAME | `cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com` | 主应用 |
| `www.snapsell` | CNAME | `cloud1-1gzz80mo90ab9dd1-1312184534.tcloudbaseapp.com` | 备用域名 |

访问地址：
- `https://snapsell.example.com`
- `https://www.snapsell.example.com`

---

## 🎯 推荐配置

1. ✅ 使用子域名（如 `snapsell.yourdomain.com`）
2. ✅ 启用 HTTPS 和强制 HTTPS
3. ✅ 配置多个域名（带 www 和不带 www）
4. ✅ 设置合理的 TTL（600 秒）

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看腾讯云文档：https://cloud.tencent.com/document/product/876/46900
2. 联系腾讯云客服
3. 检查域名服务商的 DNS 配置文档
