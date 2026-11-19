---
title: CommonMark、GFM 和 OFM 的区别与联系
date: 2026-11-19 13:49:00 +0800
categories: [技术, 前端规范]
tags: [markdown, commonmark, gfm, github, obsidian]
description: 用同一份发布清单对照 CommonMark、GitHub Flavored Markdown 和 Obsidian Flavored Markdown，解释基础语法、规范扩展和应用功能的区别，以及怎样在笔记和仓库之间保留可用的链接。
---

一份发布清单从 Obsidian 复制到 GitHub 的 `README.md` 后，表格和复选框还能照常显示，`[[发布手册]]` 却成了带方括号的文字。同一份 `.md` 文件，为什么有些写法能带过去，有些会失效？

**CommonMark 规定 Markdown 的基础语法，GitHub Flavored Markdown（GFM）在这套规则上定义扩展，Obsidian Flavored Markdown（OFM）则是 Obsidian 支持的一组写法，兼用基础语法和常见扩展，还加入了连接笔记库的功能。**

## CommonMark 统一基础语法的解析规则

早期 Markdown 的语法说明留有一些实现空间。例如，一个列表项里的第二段文字该缩进多少，才会留在列表里？遇到同一段源文，不同工具可能得出不同的结构。CommonMark 用明确的规则和输入输出示例描述这些情况，让解析器有共同的判断依据。[CommonMark 规范及示例](https://spec.commonmark.org/0.31.2/)

平常写的 `## 标题`、`**重点**`、`[手册](guide.md)`、项目列表、引用和围栏代码块，都在这套基础规则里。即使解析器只实现 CommonMark，你也可以用这些写法组织文档。比如 `[手册](guide.md)` 会被解析为链接，至于 `guide.md` 能否打开，还取决于文件的位置和目标平台的路径规则。

## GFM 扩展 CommonMark，GitHub 网页又多做了一步

GFM 公开规范标为 `0.29-gfm`，其中的「严格超集」以它采用的 CommonMark 版本为基线。CommonMark 规范页目前列出的最新版本是 `0.31.2`。需要复现具体解析结果时，规范版本也要对齐。[GFM 规范](https://github.github.com/gfm/) · [CommonMark 版本列表](https://spec.commonmark.org/)

GFM 规范明确列出五项扩展。

- **表格**使用竖线分列，并用一行连字符分隔表头和表体。
- **任务列表**把 `- [ ] 校对` 和 `- [x] 校对` 解析为未完成和已完成的任务项。复选框能否点击，由具体应用决定。
- **删除线**可以用 `~~过时文字~~` 表示。
- **扩展自动链接**会识别符合规则的裸网址，例如 `https://example.com`。在纯 CommonMark 中，可以写成 `<https://example.com>` 或普通的 Markdown 链接。
- **原始 HTML 标签过滤**会转义一组指定标签开头的 `<`，例如 `<script>` 的左尖括号。GitHub 网页还会对生成的 HTML 做进一步处理和清理。[GFM 规范](https://github.github.com/gfm/) · [CommonMark 自动链接规则](https://spec.commonmark.org/0.31.2/#autolinks)

GitHub 的仓库文件预览还支持提示框 `> [!NOTE]` 和脚注 `[^1]`，两项都属于 GitHub 文档描述的额外功能。GitHub 的脚注支持范围也因页面而异，Wiki 除外。因此，工具标注「支持 GFM」时，提示框和脚注仍要查它自己的文档。[GitHub 提示框与脚注](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes)

## Obsidian 用 Markdown 连接笔记

Obsidian 的官方说明列出了 CommonMark、GFM 和 LaTeX 支持。日常写作中，标题、加粗和普通链接沿用基础语法，表格、任务列表和删除线也能继续使用。涉及其他笔记或附件时，Obsidian 还会在笔记库里查找目标。[Obsidian Flavored Markdown 文档](https://obsidian.md/help/obsidian-flavored-markdown) · [表格与公式文档](https://obsidian.md/help/advanced-syntax)

- `[[发布手册]]` 是 Wikilink，指向库里的笔记。`![[发布手册]]` 则把那篇笔记的内容显示在当前位置。
- 想链接到具体段落，可以在目标段落末尾加一个空格和块标识 `^checklist`，再用 `[[发布手册#^checklist]]` 链接过去，或用 `![[发布手册#^checklist]]` 把该段嵌入当前笔记。[Obsidian 内部链接](https://obsidian.md/help/links) · [嵌入文件](https://obsidian.md/help/embeds)
- `==待确认==` 会高亮文字，`%%记录修改原因%%` 会在阅读视图中隐藏。注释仍保存在源文件中。[Obsidian 基础格式文档](https://obsidian.md/help/syntax)

有些语法外观相近，支持的细节也有区别。GitHub 和 Obsidian 都能识别基本的 `> [!NOTE]` 提示框。Obsidian 还允许用 `> [!NOTE]- 发布前核对` 写一个默认折叠、带自定义标题的提示框。GitHub 的公开写法是在类型标记下一行写正文。[GitHub 提示框](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) · [Obsidian 提示框](https://obsidian.md/help/callouts)

## 同一份发布清单会怎样显示

下面的示例假设 Obsidian 笔记库已有 `发布手册.md`。可以把它分别放进 CommonMark 的在线试验页、GitHub 仓库的 Markdown 文件和 Obsidian 的阅读视图里预览。[CommonMark 在线试验页](https://spec.commonmark.org/dingus/)

```markdown
## 发布检查

- [x] 写完草稿
- [ ] 校对链接

| 项目 | 状态 |
| --- | --- |
| 截图 | ~~待更新~~ 已更新 |

参见 [[发布手册]]。
```

| 写法 | 纯 CommonMark | GFM 规范 | GitHub 文件预览 | Obsidian 内置 |
| --- | --- | --- | --- | --- |
| `- [x] 写完草稿` | 带 `[x]` 的列表项 | 已完成的任务项 | 已完成的任务项 | 已完成的任务项 |
| 竖线表格 | 普通段落 | 表格 | 表格 | 表格 |
| `~~待更新~~` | 普通文本 | 删除线 | 删除线 | 删除线 |
| `[[发布手册]]` | 普通文本 | 普通文本 | 普通文本 | 笔记链接 |
| `> [!NOTE]` 加正文 | 普通引用 | 普通引用 | 提示框 | 提示框 |
| `[^1]` 加脚注定义 | 无脚注语义 | 无脚注语义 | 脚注 | 脚注 |

脚注展示了另一种差异。把 `正文[^1]` 和 `[^1]: guide.md` 分成两段，CommonMark 会把第二段当成链接定义，并把正文里的 `[^1]` 解析为指向 `guide.md` 的链接。支持脚注的工具会生成脚注编号，并把 `guide.md` 放到注释里。[CommonMark 链接定义规则](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 在 Obsidian 和 GitHub 之间保留链接

假设同一份 `README.md` 既在 Obsidian 笔记库根目录，也在 GitHub 仓库根目录，手册是 `docs/guide.md`，截图是 `assets/setup.png`。下面两行使用普通 Markdown 写法，在两个地方都能按相对路径找到目标。

```markdown
参见 [发布手册](docs/guide.md)。

![安装界面](assets/setup.png)
```

这两行分别对应 Obsidian 里的 `[[docs/guide|发布手册]]` 和 `![[assets/setup.png]]`。如果原文用 `![[docs/guide]]` 嵌入了整篇笔记，改成普通链接以后，读者需要点进去才能看到正文。希望保留就地阅读的效果，可以把所需段落写进当前文档，再附上原文链接。[Obsidian 内部链接](https://obsidian.md/help/links) · [GitHub 相对链接](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#relative-links)

经常在这两处共用文件，可以在 Obsidian 的「文件与链接」设置中关闭 `Use Wikilinks`，把 `New link format` 设成 `Relative path to file`。新插入的链接会采用相对路径的 Markdown 写法，已有的 Wikilink 需要单独转换。[Obsidian 链接设置](https://obsidian.md/help/settings)

如果链接还要指到手册里的某一节，在目标页面上查看这一节实际生成的锚点。比如 GitHub 会把标题 `Release Checklist` 的锚点写成 `#release-checklist`。链接可以写成 `[发布检查](docs/guide.md#release-checklist)`，在发布页预览时点一下，确认它跳到的是目标章节。[GitHub 章节链接](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#section-links)
