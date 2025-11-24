# SnapSell - 闲置好物生成器

<div align="center">

**快速生成精美的闲置商品图片，方便社群分享**

[在线演示](#) | [部署指南](./DEPLOYMENT.md)

</div>

## ✨ 功能特性

- 📸 **商品图片生成** - 上传图片，填写信息，一键生成分享图
- 🎨 **精美设计** - 深色主题，紫/靛蓝渐变配色
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 💰 **广告系统** - 内置广告位,支持二维码优惠券
- ⚡ **实时预览** - 输入即时更新预览效果

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/land007/SnapSell.git
cd SnapSell

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 部署到云端

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

推荐平台：
- **Vercel** - 最简单，5分钟部署
- **腾讯云 Webify** - 国内访问最快

## 📸 使用方法

1. **上传商品图片** - 点击上传区域选择图片
2. **填写商品信息** - 输入名称、价格、描述
3. **实时预览** - 右侧查看生成效果
4. **生成图片** - 点击"生成并保存图片"按钮
5. **分享到群** - 长按保存图片，发送到微信群

## 🛠️ 技术栈

- **框架**: Next.js 14.2.3
- **样式**: Tailwind CSS 3.3.2
- **语言**: TypeScript
- **图片生成**: html-to-image
- **二维码**: qrcode.react

## 📁 项目结构

```
SnapSell/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── layout.tsx        # 布局
│   │   └── globals.css       # 全局样式
│   └── components/
│       ├── ProductForm.tsx   # 商品表单
│       ├── ProductCard.tsx   # 商品卡片
│       └── AdSlot.tsx        # 广告位
├── DEPLOYMENT.md             # 部署指南
└── README.md
```

## 🎯 广告系统

应用内置广告位系统，支持：
- 广告位招租展示
- 点击弹出二维码优惠券
- 可配置广告内容

修改 `src/components/AdSlot.tsx` 中的 `isActive` 和 `adData` 来配置广告。

## 📝 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">
Made with ❤️ for 闲置之家社区
</div>
