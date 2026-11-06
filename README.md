# Vsmat - 个人 Token 密钥保险箱与订阅充值管理中心

**Vsmat (Vault for Secrets & Subscriptions Management)** 是一款专注于**“极度方便”**与**“纯本地强加密”**的个人数字资产与订阅账单管理工具。

---

## 🌟 核心特性

1. **🔑 API Token 密钥保险箱**
   - 集中收藏管理 OpenAI、Claude、DeepSeek、Gemini、GitHub 等 API Key。
   - 默认星号脱敏保护，点击可显隐；一键极速复制到剪贴板。
   - 记录 API Endpoint、所属账号、配额余额与标签分类，支持一键直达官方控制台。

2. **💳 订阅账号归集与多重提醒（绝不漏充值）**
   - 归集每个服务的登录账号、密码备忘（强加密）、2FA 说明与支付渠道。
   - **智能文本一键粘贴解析**：无需逐项打字，直接将商家发货单、邮件或聊天记录整段粘入，自动提取账号、密码、Key、续费日期与金额！
   - **三级充值提醒**：
     - 📌 **视觉预警看板**：醒目展示 7 天内待续费、今日到期或已逾期服务；
     - 🔔 **桌面系统通知**：支持通过 Web Notification 弹出系统通知；
     - 📅 **一键同步到 Mac / iPhone 日历 (.ics)**：导出标准日历日程，内置提前 1 天和 3 天强力闹钟，即使不开网页手机也能准时响铃！
   - **一键续费顺延**：续费后点击“我已续费”，系统自动顺延下一个周期并自动记入历史流水账单。

3. **⚡ 礼品券 / 兑换码一键充值 (Kill Feature)**
   - 首页常驻大号充值栏，粘贴券码自动智能识别服务（Apple、Steam、Google Play、Amazon、OpenAI 等）。
   - **Apple / Steam 等直达模式**：一键生成带参链接，呼出官方页面直接兑换。
   - **OpenAI / Claude / DeepSeek 模式**：点击一键充值时，**券码秒进剪贴板 + 浏览器秒开官方充值中心**，直接在页面粘贴回车即可！
   - **卡券包库存**：管理未核销的礼品卡库存，随时一键充值核销。

4. **🔒 纯本地 AES-256-GCM 强加密**
   - 零云端依赖，所有私密凭证均在您的电脑本地通过 Web Crypto API (PBKDF2 100,000次迭代 + AES-256-GCM) 强加密存储。
   - 支持“本机信任免密”开关，日常随开随用，兼顾极致便利与绝密安全。
   - 支持一键导出与导入 `.json` 离线备份。

---

## 🚀 面向真实用户：零终端开箱即用 (PWA + Cloudflare Pages)

普通用户**不需要懂终端或运行代码**，直接像原生 App 一样使用：

### 1. 桌面端（Mac / Windows）原生体验
1. 在 Chrome / Edge / Safari 中打开部署好的网址。
2. 浏览器地址栏右侧会显示 **“安装应用”** 或 **“添加到程序坞 (Add to Dock)”** 按钮。
3. 点击安装后，Vsmat 将化身为**独立窗口桌面应用**，常驻 Mac 程序坞或 Windows 任务栏，无浏览器多余地址栏和标签页，体验与 1Password / Apple Passwords 独立软件一致！
4. **离线可用**：内置 Service Worker 缓存，完全断网/飞行模式下依然秒开。

### 2. 移动端（iPhone / iPad / Android）
1. 用 Safari / 移动浏览器打开网址。
2. 点击底部 **“分享”** 按钮 -> 选择 **“添加到主屏幕”**。
3. 手机桌面立刻生成独立 App 图标，点击全屏沉浸式打开，绝不卡顿。

---

## 🌐 推荐部署方案：Cloudflare Pages（无限流量 + 军工级防 DDoS）

针对此前使用 Vercel 容易被攻击刷流量导致下线的问题，本项目 100% 推荐部署在 **Cloudflare Pages**：
- **无限免费带宽**：永不因流量激增停机或收取额外费用。
- **全球 Anycast 防御**：全球 300+ 边缘节点自动清洗 DDoS 恶意流量。
- **零后端维护**：纯静态 SPA，毫秒级全球加速。

### 部署方法（任选一种）：

#### 方式 A：控制台网页拖拽（1 分钟搞定，无需 Git）
1. 本地执行 `pnpm build`，编译生成 `dist/` 文件夹。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) -> 点击左侧 **Workers 和 Pages** -> **创建** -> **Pages**。
3. 点击 **上传资产 (Upload assets)**，直接将 `dist` 文件夹上传。
4. 部署完成！立即免费获得高防二级域名（如 `https://vsmat.pages.dev`）。

#### 方式 B：CLI 命令行一条命令发布
```bash
# 自动构建并直传发布到 Cloudflare Pages
pnpm run deploy:cf
```

#### 方式 C：关联 GitHub 仓库（自动持续集成）
1. 将当前项目 push 到你的 GitHub 私有仓库。
2. 在 Cloudflare Pages 中选择 **连接到 Git**，关联该仓库。
3. 构建设置：
   - 构建命令：`pnpm build`
   - 构建输出目录：`dist`
4. 以后每次 `git push`，Cloudflare 全自动完成全球部署。

---

## 💻 本地开发与调试

```bash
cd "/Volumes/T7 Shield/MyDocument/Vsmat"
pnpm dev
```
启动后在浏览器访问 `http://localhost:5173`。

---

## 📁 核心文件结构

```
Vsmat/
├── index.html                   # HTML 入口
├── package.json                 # 依赖配置
├── vite.config.ts               # Vite 构建配置
├── tailwind.config.js           # 样式配置
├── src/
│   ├── App.tsx                  # 主应用路由与状态管理
│   ├── main.tsx                 # React DOM 挂载入口
│   ├── types/
│   │   ├── index.ts             # 数据模型定义
│   │   └── presets.ts           # 预置主流服务数据库
│   ├── lib/
│   │   ├── crypto.ts            # AES-256-GCM + PBKDF2 Web Crypto 算法
│   │   ├── storage.ts           # 本地持久化与周期顺延
│   │   ├── parser.ts            # 智能文本粘贴解析引擎
│   │   ├── rechargeEngines.ts   # 礼品券一键充值跳转引擎
│   │   ├── calendar.ts          # .ics RFC 5545 日历闹钟生成器
│   │   └── notifications.ts     # 系统通知检测
│   └── components/
│       ├── layout/Navbar.tsx    # 顶部导航与备份导出导入
│       ├── dashboard/
│       │   ├── QuickRechargeBar.tsx      # 礼品券一键充值核心栏
│       │   ├── UrgentReminderBanner.tsx  # 续费充值预警与日历同步
│       │   └── OverviewStats.tsx         # 月度与年度支出总览
│       ├── tokens/                       # 密钥管理
│       ├── subscriptions/                # 订阅管理与智能解析
│       ├── recharge/                     # 礼品券卡包
│       ├── analytics/                    # 支出分类分析
│       └── auth/                         # 主密码加密与锁屏
└── scripts/
    └── verify.ts                # 核心功能全自动化验证套件
```
