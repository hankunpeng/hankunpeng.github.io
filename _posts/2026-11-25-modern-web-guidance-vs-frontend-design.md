---
title: Modern Web Guidance 与 Frontend Design 的异同：Web 平台规范与视觉设计分工
date: 2026-11-25 15:39:00 +0800
categories: [技术, 前端工程]
tags: [frontend, ai-agent, skills, chrome-extensions, ui-design, css]
description: 对照 Google Chrome 的 modern-web-guidance-plugin 与 Anthropic 的 frontend-design 技能，拆解二者在问题定位与加载机制上的差异，以及在风险边界、排版配色和界面文案上的配合方式。
---

让编程智能体编写前端界面时，产出往往在两件事上同时跑偏。第一件是平台实现过时。由于训练语料沉淀了大量陈旧代码，模型容易手写 JavaScript 去定位浮层，或者生成早已被废弃的 Chrome 扩展 Manifest V2 接口。第二件是视觉长相趋同。不管产品属于哪个行业，页面都会滑向类似的暖米色背景、全大写眉题与均匀排列的圆角卡片。

针对这两类问题，Google Chrome 团队与 Anthropic 分别给出了定位完全不同的智能体技能方案。Google Chrome 联合 Microsoft Edge、Mozilla Firefox 与 MDN 团队维护了 `modern-web-guidance-plugin`，专注解决现代 Web 平台 API 与扩展规范的落地准确度。Anthropic 在官方技能库里提供了 `frontend-design`，专门处理视觉识别与版面表达，剔除生成式界面的模板套路。两条路线在前端开发链路里一内一外，分工几乎正交。[Modern Web Guidance 文档](https://developer.chrome.com/docs/modern-web-guidance) · [Frontend Design 仓库](https://github.com/anthropics/skills/tree/main/skills/frontend-design)

## 全景对照：检索型插件与主创型提示词

从形态上看，这两套技能完全属于不同体量的工程产物。

| 对比维度 | `modern-web-guidance-plugin` | `frontend-design` |
| --- | --- | --- |
| 维护方 | Google Chrome（联合 Edge、Firefox 与 MDN 团队） | Anthropic 官方技能库 |
| 形态与体量 | 复合插件，含 **2 个** 子技能、**1 条** 执行策略与本地检索 CLI | 单文件纯提示词技能，正文仅 **71 行**，无外部脚本 |
| 核心目标 | 对抗训练语料过时，推行原生 Web 平台方案 | 对抗视觉审美趋同，确立贴合产品的视觉识别 |
| 覆盖范围 | 现代 Web 特性检索，以及存量代码现代化与 Chrome MV3 扩展开发 | 视觉主题锚定与首屏构建，覆盖排版配色、微文案及动效克制 |
| 加载机制 | 通过 `npx` 按需检索，只将命中指南拉进当前上下文 | 触发后整份 `SKILL.md` 常驻提示词上下文 |
| 新特性态度 | 依据 Baseline 划分兼容性，实验特性默认拦截 | 在符合需求简报的前提下鼓励审美冒险 |

知识组织思路的不同也拉开了体量差距。`frontend-design` 把设计工作室主创的工作习惯浓缩在几十行原则里，依赖模型本身的通用设计能力去发挥。`modern-web-guidance-plugin` 面对的是快速演进、细节琐碎的浏览器规范，无法靠几十行口诀覆盖上百个接口的边界条件，所以拆成了两个独立子技能，并在 `policies/modern-web-guidance.toml` 中为 `plan` 模式设置命令行执行确认策略，把庞杂的指南语料放进离线包里按需读取。

### `modern-web-guidance-plugin` 如何用检索控制精度

主技能 `modern-web-guidance` 规定智能体在编写任何 HTML、CSS 或客户端 JavaScript 之前，先用 **2 到 5 个** 英文动作词发起检索（例如 `"light dismiss dialog"`），再调用 `retrieve` 拉取对应指南并对照核验。整套检索依赖包内自带的本地嵌入模型和 BM25 检索引擎离线运行，既不消耗外部大模型接口，也不会把几百篇文档预先塞满上下文。[Modern Web Guidance 开源仓库](https://github.com/GoogleChrome/modern-web-guidance)

这套知识库目前收录了 **250 项** 现代 Web 特性与 **203 个** 真实开发场景。前者包含 **140 项** CSS 与布局特性，以及 **36 项** HTML 与 DOM 特性和 **74 项** JavaScript 接口。后者覆盖前端组件（如 `<dialog closedby>` 与 CSS Anchor Positioning）及 Popover API，也涵盖性能与安全规范（包括 `scheduler.yield` 任务调度与 Passkeys 认证）以及 Sanitizer API，同时收录了 `Temporal` 时区计算、端侧内置 AI（如 `LanguageModel`）、WebAssembly 和 WebMCP。每份指南不仅给出原生代码写法与浏览器降级方案，还专门写清了框架集成细节，例如在 React 中透传新增 HTML 属性或使用 `useId()` 隔离锚点名称。

为了验证这套提示机制是否真能提升代码质量，项目建立了两道校验门槛与自动化评测体系：

- **强制交付披露**：只要在当前轮次查阅并应用了指南，回复结尾必须附上 `### Modern Web Guidance` 小节，写明采用的指南 ID、规避的缺陷以及指南中的对应原文短句。
- **旧代码扫描与端到端评测**：面对全量项目现代化需求时，可以运行 `legacy-scan` 扫描其中约 **20%** 具备确定性特征的旧模式，再按 `keepWhen` 与 `dropWhen` 规则剔除误报。Google 团队用真实 Web 应用和 Playwright 浏览器断言跑了多轮端到端对比评测。11 月 8 日这批公开记录显示，开启指导后，Antigravity CLI 的任务通过率从 **58% 升至 94%**，Claude Code 从 **57% 升至 88%**，Codex CLI 从 **54% 升至 82%**。[Eval Dashboard 评测看板](https://googlechrome.github.io/modern-web-guidance-src/)

浏览器扩展生态由插件包内的 `chrome-extensions` 子技能负责，它硬性封杀了 Manifest V2 写法。它总结了扩展开发中最容易出故障的 **20 条** 强制规则，提醒智能体不要把状态存进随时会休眠回收的 Service Worker 全局变量而要改用 `chrome.storage`，调用 `chrome.permissions.request()` 前绝不能先插入 `await` 导致用户手势丢失，配置侧边栏打开行为时要使用 `openPanelOnActionClick` 而不是并不存在的 `openPanelOnActionIconClick`。同时，它还附带了 **23 份** 参考文档，细化了权限申报、离屏文档限制以及维护 `CHROMEWEBSTORE.md` 商店发布清单的完整标准。

### `frontend-design` 如何把模型拉出默认模板

`frontend-design` 不涉及具体接口语法，它要求模型先从产品所在行业、目标读者和真实物料里提炼视觉气质。比如面向 8 至 11 岁女孩的玩具网站与面向金融分析师的数据看板，在用色和材质上本来就该截然不同。

具体执行上，`frontend-design` 要求分两步推进：

1. **制定紧凑 Token 方案**：先写一版设计计划，包含 **4 到 6 个** 命名的十六进制色值与字体家族分工，并用单句说明搭配 ASCII 线框图交代布局和对齐关系，再附上页面独有的设计原则。
2. **反模板自审后再写代码**：对照需求简报检查第一版方案，如果换一个类似题目也会得出差不多的结果，就动手修改默认选项并写明改动理由，随后才开始写代码，并在实现后通过截图检查做减法。

为了让模型绕开最常见的「AI 生成味」，文档还直接标出了当前生成式网页最容易撞车的 **5 类** 默认套路：

- 暖米色底（接近 `#F4F1EA`）配高对比衬线标题，再用接近 `#D97757` 的陶土橙做点缀色，而这恰好是 Anthropic 自家 Claude 交互界面的常用色。
- 近黑背景配合单一刺眼的荧光绿或朱红色高亮。
- 零圆角、细分割线与密集分栏组成的报刊大版面风格。
- 把所有内容都切进统一圆角与统一浅灰投影（`rgba(0,0,0,.1)`）的 SaaS 卡片里，顺手铺上一层装饰性渐变。
- 跨行业反复出现的机械装饰，包括标题上方全大写拉开字距的眉题、用间隔号拼接的 `A · B · C` 元信息、`WORD — fragment` 形式的标签、用 `#0B0B0B` 替代纯黑、小字号一律套等宽字体，以及链接和按钮末尾附带的 `→` 箭头。

文档明确说明，只要用户简报点名要其中某一种风格，模型就该严格照办。只有在简报留出空白时，才不能顺手把自由度花在这些现成默认项上。

## 交集与共识：同一套质量底线，上下两半场衔接

虽然各自负责的层次不同，两套技能在前端基础质量红线上的看法却高度一致。`frontend-design` 明确把响应式适配与清晰的键盘焦点视为基本及格线，并要求尊重 `prefers-reduced-motion` 减弱动态效果偏好，同时守住文本对比度规范。`modern-web-guidance` 则把同一套及格线拆进了具体规则里，例如用 `:focus-visible` 呈现焦点轮廓，并在用户交互结束后再同步 `:user-invalid` 样式与 `aria-invalid` 提示。

具体到排版与色彩，以及动效和界面文案四个环节，两者的能力刚好拼成上下游：

- **排版与字体稳定性**：`frontend-design` 决定用 **1 到 2 套** 性格明确的字体，参照《字体排印风格要素》拉开字号比例，将每行正文控制在 **80 个** 字符以内，同时禁用「标题里只给单个词加斜体或换色」这种常见套路。`modern-web-guidance` 的 `typography` 与 `visually-stable-font-fallbacks` 指南接手实现层面，用 `text-wrap: balance` 均衡多行标题断行，并用 `font-size-adjust` 避免回退字体切换引起版面跳动。
- **色彩体系与暗色模式**：`frontend-design` 负责选定核心品牌色板与单一视觉焦点。`modern-web-guidance` 的 `color`、`dark-mode` 与 `browser-ui-theming` 指南负责使用 `oklch`、`color-mix()` 以及 `light-dark()` 派生色阶，并借助 `color-scheme` 让浏览器原生的滚动条和表单控件自动响应主题切换。
- **动效节制与渲染性能**：`frontend-design` 约束页面里非用户触发的自动动画，主张只保留一个经过编排的开场或揭示时刻，不要让每个区块和每张卡片都在滚动和悬停时整齐划一地弹跳。`modern-web-guidance` 的 `motion` 与 `animate-to-from-top-layer` 指南负责把必要的交互动画固定在合成器线程上，并用 `@starting-style` 和 View Transitions 补全顶层元素的进出场过渡。
- **用户视角界面文案**：`frontend-design` 要求用终端用户的语言给模块命名（写「通知设置」而非「Webhook 配置」），按钮使用主动动词且前后端用词一致（「发布」按钮对应「已发布」提示），错误和空状态直接写清发生了什么以及怎么恢复。`chrome-extensions` 在编写应用商店上架文案时提出了同一要求，明确禁止在商店介绍里出现 `MutationObserver` 或 `Shadow DOM` 等实现词汇，只写对用户直接可见的收益。

## 核心差异：视觉层鼓励出格，接口层严守边界

把两个技能摆在一起对比，最明显的分歧出现在风险策略上。

`frontend-design` 把「毫无记忆点的安全牌」视为失败，要求设计师把大胆的创意集中到一处亮点，周围元素保持安静克制。只要不破坏排版可读性与可访问性，视觉方案完全可以跳出常规。

`modern-web-guidance` 面向浏览器运行环境，新特性一旦缺乏支持就会直接让页面功能失效。插件为此内置了严谨的 **Baseline** 兼容门槛，只对已达到 **Baseline Widely available** 的接口免除降级代码，其余特性必须配合轻量降级方案（推荐控制在 **50 行** 以内或按需异步导入 Polyfill）。

针对 **Origin Trial** 实验特性，或是单个引擎刚刚发布不足 **3 个月** 的易变特性（Volatile Features），插件采取了「可检索但拦截读取」的设计。智能体在 `search` 时可以看到这些条目，但执行 `retrieve` 时会被拒绝，只有用户在仓库或个人目录的 `.mwgrc` 文件中显式启用 `allowOriginTrials` 或 `allowVolatileFeatures` 才允许读取。审美冒险可以靠设计评审拍板，浏览器接口采用则必须服从兼容性契约。

## 实战组合建议与本地配置避坑

实际研发中，两者的分工可以根据任务性质快速切开。

从零构建新产品落地页、重塑站点视觉或设计交互界面时，应当先跑 `frontend-design`，敲定产品专属的色板、字体与线框草图，再让 `modern-web-guidance` 介入具体组件编码，用原生弹窗、容器查询与现代色彩函数把草图落地。反过来，遇到 Core Web Vitals 性能排查或 Passkeys 安全改造，以及旧代码现代化扫描和 Chrome 扩展开发，直接启用 `modern-web-guidance-plugin` 即可。

在工具配置层面还有一处容易踩到的路径优先级问题。Antigravity 等支持多层级目录的智能体环境通常会按照优先级加载同名技能，工作区或用户 `.agents/skills/` 下的副本优先级高于全局插件目录 `~/.gemini/config/plugins/`。如果早期曾经把 `modern-web-guidance` 单独装在 `~/.agents/skills/modern-web-guidance`，之后又安装了完整插件 `modern-web-guidance-plugin`，旧副本就会一直遮蔽插件里随版本更新的技能定义。把冗余的 `~/.agents/skills/modern-web-guidance` 移除后，客户端会自动回退加载插件目录内的版本，此后 `modern-web-guidance` 与 `chrome-extensions` 就能随着插件统一升级。

## BTW

如果环境里装了同属前端设计赛道的 [Impeccable](https://impeccable.style)，也可以用它负责设计系统打磨。（我就在用😃）
