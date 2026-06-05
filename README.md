# Spotlight Demo

Spotlight AI Marketplace 的前端产品原型。

该项目用于展示 Spotlight 的核心产品体验、页面结构与基础交互逻辑，帮助产品、设计与开发团队在统一代码仓库中继续迭代。

## Live Demo

https://spotlight-demo-rosy.vercel.app

## Repository

https://github.com/frank-TD/spotlight-demo

---

## 1. Product Overview

Spotlight 是一个面向 AI 短片创作者与 Backer 的内容融资与发行 Marketplace。

平台希望将 AI 短片从创意提出到商业发行的过程标准化：

```txt
Creator creates a project and AI trailer
→ Project enters the marketplace
→ Backer discovers and exclusively backs the project
→ Production progresses through milestones
→ Creator delivers the final content
→ Backer controls distribution
```

当前版本主要用于验证：

* Landing Page 与品牌视觉方向
* Creator 与 Backer 的双边 Marketplace 体验
* 项目浏览、发现与管理流程
* Spotlight Agents 的基础产品概念
* 登录、注册与身份相关页面
* 移动端导航与基础响应式体验

> 当前 Repo 为 Demo / Prototype，不代表最终生产版本。部分数据、交互和业务逻辑仍为展示用途，尚未接入正式后端服务。

---

## 2. Core Product Concepts

### 2.1 Creator

Creator 可以在 Spotlight 中：

* 创建 AI 短片项目
* 上传或生成 Trailer
* 完善故事、预算与项目资料
* 提交项目并进入 Marketplace
* 获得 Backer 的独家支持
* 根据 Milestone 推进制作与交付

### 2.2 Backer

Backer 可以在 Spotlight 中：

* 浏览 AI 短片项目
* 使用 Discovery 页面发现潜在项目
* 查看项目资料与 Trailer
* 关注项目、推进沟通与交易
* 跟踪已支持项目的交付进度
* 管理订单、钱包与项目状态

### 2.3 Spotlight Agents

Spotlight Agents 是平台中的 AI 代理系统。

#### Marlow

面向 Backer 的 AI Agent。

主要职责：

* 学习 Backer 的项目偏好
* 筛选值得关注的项目
* 提供项目推荐理由与风险提示
* 协助整理潜在交易条件
* 跟踪项目状态与关键节点

#### Wren

面向 Creator 的 AI Agent。

主要职责：

* 协助 Creator 完善项目资料
* 管理项目条款与偏好
* 辅助沟通与交易推进
* 跟踪制作 Milestone 与交付状态

---

## 3. Tech Stack

当前项目使用：

* [Next.js](https://nextjs.org/) `16.2.6`
* [React](https://react.dev/) `19.2.4`
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/) `4.x`
* [Zustand](https://zustand-demo.pmnd.rs/) `5.x`
* [shadcn](https://ui.shadcn.com/)
* [Lucide React](https://lucide.dev/)
* [Base UI](https://base-ui.com/)
* [Sonner](https://sonner.emilkowal.ski/)
* ESLint
* Vercel

---

## 4. Getting Started

### 4.1 Requirements

建议使用：

```bash
Node.js >= 18
npm >= 9
```

项目已包含 `package-lock.json`，团队协作时建议优先使用 npm，避免不同包管理工具生成额外 lock 文件。

### 4.2 Clone Repository

```bash
git clone https://github.com/frank-TD/spotlight-demo.git
cd spotlight-demo
```

### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Run Development Server

```bash
npm run dev
```

打开浏览器访问：

```txt
http://localhost:3000
```

### 4.5 Build Production Version

```bash
npm run build
```

### 4.6 Start Production Version Locally

```bash
npm run start
```

### 4.7 Lint

```bash
npm run lint
```

---

## 5. Available Scripts

| Command         | Description  |
| --------------- | ------------ |
| `npm run dev`   | 启动本地开发环境     |
| `npm run build` | 构建生产版本       |
| `npm run start` | 启动生产版本       |
| `npm run lint`  | 执行 ESLint 检查 |

---

## 6. Project Structure

```txt
spotlight-demo/
├── .claude/                 # Claude Code 相关配置
├── public/                  # 公共静态资源
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── account/
│   │   │   └── profile/     # 账户资料页面
│   │   ├── assets/          # 页面使用的资源
│   │   ├── discovery/       # 项目发现页面
│   │   ├── login/           # 登录页面
│   │   ├── market/          # Marketplace 页面
│   │   ├── messages/        # 消息页面
│   │   ├── orders/
│   │   │   └── [id]/        # 订单详情动态路由
│   │   ├── projects/        # 项目相关页面
│   │   ├── register/        # 注册页面
│   │   ├── studio/          # Studio 页面
│   │   ├── wallet/          # 钱包页面
│   │   ├── favicon.ico
│   │   ├── globals.css      # 全局样式
│   │   ├── layout.tsx       # 全局布局
│   │   └── page.tsx         # 首页 / Landing Page
│   │
│   ├── components/          # 可复用 UI 组件
│   ├── hooks/               # 自定义 React Hooks
│   └── lib/                 # 通用方法与工具函数
│
├── .gitignore
├── AGENTS.md                # Agent 协作说明
├── CLAUDE.md                # Claude Code 项目说明
├── README.md
├── components.json          # UI 组件相关配置
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 7. Main Routes

| Route              | Description  |
| ------------------ | ------------ |
| `/`                | Landing Page |
| `/login`           | 登录           |
| `/register`        | 注册           |
| `/market`          | Marketplace  |
| `/discovery`       | 项目发现         |
| `/projects`        | 项目列表与管理      |
| `/messages`        | 消息           |
| `/orders/[id]`     | 订单详情         |
| `/studio`          | 创作与项目工作台     |
| `/wallet`          | 钱包           |
| `/account/profile` | 账户资料         |

> 页面路由仍在持续迭代。请以 `src/app/` 下的实际目录为准。

---

## 8. Current Demo Scope

### Included

* Landing Page
* Marketplace 页面结构
* Discovery 页面
* Projects 页面
* 登录与注册页面
* 账户资料页面
* Messages 页面
* Orders 页面
* Studio 页面
* Wallet 页面
* 移动端导航
* 基础响应式适配
* 基础视觉与交互效果

### Not Yet Production-Ready

* 正式后端 API
* 数据库接入
* 用户身份验证
* 权限控制
* Creator / Backer 的完整业务状态流转
* 正式支付与 Escrow
* 正式 Wallet 逻辑
* Agent 对话与自动化能力
* 埋点与数据分析
* 完整错误处理
* 完整 Loading / Empty / Error 状态
* 正式 SEO 配置
* 性能优化与安全审查

---

## 9. Environment Variables

当前 Demo 如果尚未使用环境变量，可以暂时跳过本节。

后续接入正式 API、数据库或第三方服务时，请在项目根目录创建：

```txt
.env.local
```

同时新增：

```txt
.env.example
```

用于向团队说明需要配置哪些变量，但不要填写真实密钥。

示例：

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_SITE_URL=
```

注意事项：

* 不要将 `.env.local` 上传至 GitHub
* 不要提交 API Key、数据库密码或 Token
* 不要在前端暴露服务端密钥
* 只有允许公开的变量才能使用 `NEXT_PUBLIC_` 前缀

---

## 10. Development Workflow

推荐使用以下分支策略。

### Main Branch

```txt
main
```

用于保存稳定、可演示的版本。

### Development Branch

```txt
dev
```

用于日常开发与联调。

### Feature Branch

```txt
feature/<feature-name>
```

示例：

```txt
feature/hero-animation
feature/mobile-navigation
feature/creator-onboarding
feature/backer-discovery
```

推荐工作流：

```txt
feature branch
→ Pull Request
→ Code Review
→ Merge into dev
→ Verify
→ Merge into main
```

---

## 11. Commit Convention

建议使用语义清晰的 Commit Message。

示例：

```bash
git commit -m "feat: add discovery project cards"
```

```bash
git commit -m "fix: improve mobile hamburger navigation"
```

```bash
git commit -m "docs: update README"
```

```bash
git commit -m "refactor: split market page into reusable components"
```

常用前缀：

| Prefix     | Description |
| ---------- | ----------- |
| `feat`     | 新功能         |
| `fix`      | 修复问题        |
| `docs`     | 文档修改        |
| `style`    | 样式调整        |
| `refactor` | 代码重构        |
| `perf`     | 性能优化        |
| `chore`    | 工程配置或杂项     |

---

## 12. Pre-Commit Checklist

提交代码前建议执行：

```bash
npm run lint
npm run build
```

同时确认：

* 本地可以正常启动
* 页面没有明显报错
* 构建成功
* 没有误提交 `.env.local`
* 没有误提交真实 API Key
* 没有误提交 `node_modules`
* 新增页面在移动端可以正常访问
* 路由没有死链
* 关键交互具备基础状态反馈

---

## 13. Deployment

项目已接入 Vercel。

当前 Demo：

https://spotlight-demo-rosy.vercel.app

后续建议：

* `main` 分支对应 Production
* Feature Branch 与 Pull Request 使用 Preview Deployment
* 合并前通过 Preview URL 检查页面表现
* 正式环境变量统一配置在 Vercel Project Settings 中

---

## 14. Handoff Notes for Development Team

当前源码主要用于：

* 产品概念验证
* 页面结构同步
* UI 与交互方向展示
* 开发团队接手与继续迭代

开发团队接手后，建议优先完成：

1. 梳理现有页面与组件结构
2. 识别 Demo 数据与 Mock 数据来源
3. 确认 Creator 与 Backer 的核心用户路径
4. 明确 Sign Up、身份选择与 Onboarding 流程
5. 定义正式 API Contract
6. 补充 Loading、Empty、Error 状态
7. 完善响应式适配
8. 检查资源体积与页面性能
9. 补充埋点需求
10. 规划后端、数据库与权限体系接入方式

---

## 15. Collaboration

产品、设计与开发相关修改建议通过以下方式记录：

* GitHub Issue
* Pull Request
* 项目协作群
* 产品文档

避免只在聊天记录中确认关键需求。

---

## 16. License

This project is intended for internal Spotlight team collaboration only.

Unauthorized redistribution, commercial use, or external publication is not permitted.
