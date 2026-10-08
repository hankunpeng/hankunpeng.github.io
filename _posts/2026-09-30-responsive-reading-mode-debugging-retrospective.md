---
title: 博客沉浸阅读模式的排错、重构与反思
date: 2026-09-30 23:30:00 +0800
categories:
  - 技术
  - 前端工程
tags:
  - jekyll
  - css
  - JavaScript
  - layout
  - debugging
  - responsive-design
---

今天为博客上线「自适应沉浸阅读模式」时，发生了颇为有趣的曲折经历。

本地构建一切通过，自动化测量数据完备，代码顺利推送到了远程仓库。然而，在接下来访问线上页面时，发现哪哪都不对，之前做的各种交互完全瘫痪。😓

从看似简单的一个交互需求，到生产环境翻车、排查定位，再到最终重构上线，这次调试过程沉淀了几个工程与设计教训。记录下来复盘，给以后的静态站点交互开发作避坑参考。

---

在内容消费型产品中，文字本身就是界面的核心。留白、行高、文字与边界的呼吸感等等都很重要。

博客原本采用经典的三栏布局（左侧导航栏、中间文章正文、右侧目录与推荐）。在阅读长篇文章时，我想把左右侧栏收起，让正文向两侧自适应展开，进入沉浸式的专注阅读状态。

---

## Jekyll `layout: compress` 与单行注释的隐式死锁

这是本次线上故障最致命、也最隐蔽的技术根因。

在本地开发调试阶段，中间栏的自适应缩放与快捷键呼出一切正常。但推送到 GitHub Pages 线上构建后，按快捷键没有任何反应，点击顶部的折叠按钮也毫无动静。

打开远程页面的 DevTools 控制台，赫然印着一行致命的报错：

```text
Uncaught SyntaxError: Unexpected end of input
```

为什么同一份 JavaScript 逻辑，在本地测试正常，上线后却会在第一行直接解析崩溃？

排查的关键在于 Jekyll 的模板配置。在博客的全局布局文件 `_layouts/default.html` 中，开启了静态资源压缩插件：

```yaml
---
layout: compress
---
```

`layout: compress` 的核心逻辑是在编译阶段剔除 HTML 中所有多余的空白符与换行符，将整个几千行的 HTML 压缩为单一的一行代码，以减少网络传输体积。

然而在 `_includes/reading-mode.html` 中编写控制器时，为了便于维护，顺手写了这样的内联 JavaScript 注释：

```html
<script>
  function initReadingMode() {
    // 1. Initial State: 当从主页进入文章时，默认收起两侧栏
    if (isPost) {
      body.setAttribute('data-sidebar', 'closed');
      ...
    }
  }
</script>
```

当这段内联脚本经过 `layout: compress` 处理后，灾难发生了：
所有的换行符被全部抹平，代码被无缝拼接成了一条极长的单行字符串。而在 JavaScript 语法中，双斜杠 `//` 代表**直到行尾的所有内容全部属于注释**。

结果就是：从 `// 1. Initial State:` 这一行起，其后整整 200 多行核心逻辑（包括状态初始化、抽屉控制器、快捷键监听器、闭合花括号 `}` 以及 `</script>` 标签）全部被直接当成了注释内容！

浏览器解析 HTML 遇到 `<script>` 并在里面寻找语句结尾时，由于整段代码已被注释吞噬，找不到合法的闭合括号，只能抛出 `Unexpected end of input` 并立即终止执行。

带来的工程启示：

1. **绝对不要在内联脚本中使用单行注释 `//`**：如果必须内联，务必使用块级注释 `/* ... */`，或者完全杜绝内联，将业务逻辑抽离为独立的 `.js` 静态文件。
2. **职责分离**：HTML 模板只负责结构骨架，行为逻辑必须交由专门的静态资源（如 `assets/js/reading-mode.js`）去管理。静态 `.js` 文件不仅不会被 HTML 模板压缩器破坏，还能充分享受浏览器的长效缓存机制。

---

## 把初始状态前置到编译期，告别 FOUC

在早期的设计中，我们习惯于让 JavaScript 去控制视图状态：

```javascript
// 页面加载完成后再通过 JS 判断页面类型并设置属性
if (isPost) {
  document.body.setAttribute('data-sidebar', 'closed');
  document.body.setAttribute('data-panel', 'closed');
}
```

这种做法会导致一个前端极为常见的体验缺陷：**无样式内容闪烁（Flash of Unstyled Content, FOUC）**。

当读者从主页点击进入一篇博文时，浏览器首先会下载并渲染出原始的三栏 HTML 结构；大约 100 毫秒后，外部 JavaScript 脚本加载完成并执行，才将 `data-sidebar` 置为 `closed`。这在视觉上会呈现出一种非常难受的「先闪现一下完整三栏，随后猛然向内缩拢收起」的晃动感。

现代静态站点生成器（如 Jekyll、Hugo、Next.js SSG）的最大优势就在于**编译期预计算**。既然我们在构建阶段就已经通过 Liquid 变量明确知道当前渲染的是 `post` 还是 `home`，为什么要把这个判断延后到客户端去执行？

直接在 `_layouts/default.html` 的服务端模板中写入初始属性：

```liquid
<body
  class="layout-{{ page.layout | default: layout.layout }}"
  data-layout="{{ page.layout | default: layout.layout }}"
  data-sidebar="{% if page.layout == 'post' %}closed{% else %}open{% endif %}"
  data-panel="{% if page.layout == 'post' %}closed{% else %}open{% endif %}"
>
```

当浏览器解析到第一行 `<body>` 标签的那一瞬间，CSS 样式规则立即匹配生效。正文内容从首帧渲染开始就天然居中舒展，无需等待任何客户端脚本运行，真正达成了零延迟的「静态直出」。

---

## 留白占屏幕总宽度的百分比

布局排版的一个核心命题是留白。

我想让文章正文两侧的留白占屏幕「总宽度」的 5%。注意是百分比，不是具体的 px 数值。

这里隐藏着一个关于 CSS 盒模型的经典陷阱：**如果直接在样式表里写 `padding: 5%`，会发生什么？**

根据 W3C 规范，内边距（`padding`）的百分比是相对于**直接包含块（containing block）的当前宽度**计算的。
- 当左右两栏全部收起时，包含块的宽度等于全屏宽度，`5%` 对应的值较大。
- 当用户展开左侧栏（占据 `260px`）或右侧栏（占据 `280px`）时，包含块的宽度被压缩变窄，`5%` 计算出来的像素值也会跟着缩小。

如果用 `padding: 5%`，每一次展开或收起侧栏，正文边缘与屏幕边界的距离都会跟着跳动，无法保持稳定的呼吸节奏。

在现代 CSS 中，表示视口总宽度 5% 的标准单位是 `5vw`（Viewport Width）。
通过定义全局 CSS 变量：

```scss
:root {
  /* 留白占屏幕总宽度的百分比 5% */
  --card-gutter: 5vw;
}
```

无论侧边栏如何切换，两端边界以及两栏之间的过渡间距永远严格等于 `5vw`，视觉比例在各种分辨率下都能保持和谐对称。

## 搜索栏与正文的垂直基准线对齐

另一个细节是对齐。在三栏全开状态下，顶部导航栏的搜索框原本会自然靠在整个屏幕的最右侧（即右侧栏正上方）。但从视觉层级上看，搜索框在逻辑上属于文章阅读的主控制区。

为了让顶部的搜索框与文章正文形成严整的视觉闭环：
- 在左侧：顶部栏的抽屉按钮与文章正文第一行文字的左边缘在同一条垂直垂线上。
- 在右侧：将 `#topbar` 的内容宽度与右侧 `padding` 设置为与 `main.col-12` 完全一致。在抽屉展开或收起时，搜索栏的最右侧外边框与文章正文的最右边缘始终严格重合。

这种贯穿上下的垂线对齐，赋予了整个页面一种秩序井然的建筑美感。

---

## 物理键码与字符语义的双重守护

在快捷键设计上，我们支持了三组操作：
- 按 `[` 键：呼出或关闭左侧栏抽屉。
- 按 `]` 键：呼出或关闭右侧栏抽屉。
- 按 `\` 键：呼出或关闭浮层文章目录（TOC Modal）。

在实际键盘交互中，很容易遇到一个尴尬场景：读者在使用中文输入法浏览网页时，键盘敲击产生的字符并不是半角英文字符 `[`、`]`、`\`，而是中文标点 `【`、`】`、`、`。

如果在 `keydown` 事件中仅仅判断 `e.key === '['`，那么所有使用中文输入法的读者都会发现快捷键失效了。

因此，健壮的键盘监听必须同时兼顾**字符语义**与**物理硬件键码（`e.code`）**：

```javascript
document.addEventListener('keydown', function (e) {
  // 当用户在搜索框或评论区输入内容时，禁用快捷键
  var activeTag = document.activeElement ? document.activeElement.tagName : '';
  if (['INPUT', 'TEXTAREA'].indexOf(activeTag) !== -1) return;
  if (document.activeElement && document.activeElement.isContentEditable) return;

  if (e.key === '[' || e.key === '【' || e.code === 'BracketLeft') {
    e.preventDefault();
    toggleLeft();
  } else if (e.key === ']' || e.key === '】' || e.code === 'BracketRight') {
    e.preventDefault();
    toggleRight();
  } else if (e.key === '\\' || e.key === '、' || e.key === '|' || e.code === 'Backslash') {
    if (isPost) {
      e.preventDefault();
      toggleTocModal();
    }
  } else if (e.key === 'Escape' || e.code === 'Escape') {
    if (popup && popup.open) {
      popup.close();
    }
  }
});
```

配合原生的 HTML5 `<dialog>` 元素及其 `::backdrop` 毛玻璃模糊滤镜，不仅实现了轻盈优美的浮层目录呼出体验，还能天然支持按 `Esc` 键以及点击外部遮罩随时关闭。

---

## 代码块行号的三重陷阱：漂移、粘连与钉选

在搭建阅读模式与重塑主题色彩时，代码块作为长文的核心载体，暴露出了一组极具代表性的排版缺陷：两三行的短代码框看似正常，但随着后续代码行数增加、出现中文注释与长语句时，行号开始逐渐脱离代码行、双位数被挤压遮挡，甚至在横向滚动时被直接裁切，呈现出「行号显示不全」的混乱状态。

排查后发现，这不是单一的样式冲突，而是排版基准、表格盒模型与滚动机制三重叠加的结果。

### 1. 行高微差引发的累积垂直漂移（Vertical Drift）

这是长代码块行号错位最隐蔽的根因。

在自定义字体排版时，我们为代码正文（`td.rouge-code pre`）定义了等宽字体与行高（`font-size: 0.88rem`，`line-height: 1.62`）；然而行号列（`td.rouge-gutter pre`, `.lineno`）却遗漏了同步声明，仍沿用主题默认的 `1.4rem` 行高。

- 在 1 ~ 3 行的短代码中，每一行的微小高度差累积不足 1 px，肉眼几乎无法察觉；
- 当行数来到 9 行、甚至 20+ 行时，每行 0.4 px ~ 0.8 px 的误差被逐级放大，累积错位高达 10 px。行号整体向上漂移脱节，到底部时甚至出现多行代码悬空而无对应行号的假象。

### 2. 隐式盒模型造成的字符粘连与截断

Jekyll 的语法高亮引擎 Rouge 会将代码生成为双列结构的 `<table class="rouge-table">`：左列 `td.rouge-gutter` 放置行号，右列 `td.rouge-code` 放置代码。

在默认的流式布局中，行号列没有声明基准最小宽度。当某一行代码首字符是非缩进的标点或字母（如 `<script>`、`:root`、`});`）时，行号与代码字符会直接粘连甚至碰撞；在紧凑视口下，双位数（如 `10`、`23`）的十位数字更是紧贴甚至被外层圆角边界切掉半边。

### 3. 横向滚动时的视口脱节

对于包含长路径、内联注释或链式调用的代码，正文会超出容器宽度并触发水平滚动。在原生表格结构中，如果行号列没有粘性定位（Sticky Positioning），读者在向右滑动查看代码尾部时，行号就会随着整个表格整体左移，直接被滚出屏幕可见区。

---

### 一体化工程解法

在 `assets/css/jekyll-theme-chirpy.scss` 中，我们通过三组规则重构了代码块的盒模型与排版契约：

```scss
/* 1. 统一代码正文与行号的字体度量基准，彻底消除垂直漂移 */
.highlight code,
.highlight .lineno,
td.rouge-code pre,
td.rouge-gutter pre {
  font-family: 'IBM Plex Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 0.88rem !important;
  line-height: 1.62 !important;
  white-space: pre !important;
  box-sizing: border-box !important;
}

/* 2. 重构行号列：设立固定安全宽、双向内边距与横向滚动钉选 */
td.rouge-gutter {
  display: table-cell !important;
  width: auto !important;
  min-width: 2.8rem !important;
  padding: 0.75rem 0.8rem 0.75rem 1.1rem !important;
  margin: 0 !important;
  text-align: right !important;
  vertical-align: top !important;
  position: sticky !important;
  left: 0 !important;
  background-color: var(--highlight-bg-color) !important;
  z-index: 2 !important;
  user-select: none !important;
  -webkit-user-select: none !important;

  .lineno {
    display: block !important;
    text-align: right !important;
    color: var(--highlight-lineno-color) !important;
    width: 100% !important;
  }
}

/* 3. 规范代码正文列内边距 */
td.rouge-code {
  display: table-cell !important;
  padding: 0.75rem 1.5rem 0.75rem 0.5rem !important;
  margin: 0 !important;
  vertical-align: top !important;

  pre {
    margin: 0 !important;
    padding: 0 !important;
    color: var(--code-color) !important;
  }
}
```

这组重构达成了三个核心收益：
1. **绝对基线对齐**：行号与代码行高像素级 1:1 严格对齐，彻底告别随行数递增的垂直漂移；
2. **充裕呼吸感**：`2.8rem` 最小宽度与 `1.1rem` 左侧边距为单/双位数留出充足空间，不再有任何边缘截断；
3. **横向滚动钉选**：通过 `position: sticky; left: 0` 与主题背景色覆盖，长代码向右滑动时行号始终固定在左侧，保持清晰可辨。

---

## 结语：端到端验证的敬畏之心

这次从排错到上线的过程，给我最大的震撼在于：**本地运行良好并不代表线上交付成功，代码语法正确也不代表交互真正可用**。

很多隐蔽的问题（如编译期模板压缩、特定环境的资源路径、输入法字符拦截、首屏渲染时序），只有在真实网络环境、完整生产流水线以及多端视口下进行全链路操作，才会显现出真实的全貌。

**时刻对线上真实环境保持敬畏，善用自动化端到端测试工具去闭环验证每一次细微的修改，才能真正做出经得起细细推敲的作品。**
