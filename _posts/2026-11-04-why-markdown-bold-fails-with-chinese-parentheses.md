---
title: 小议 CommonMark 分词边界规范
date: 2026-11-04 20:00:00 +0800
categories: [技术, 前端规范]
tags: [markdown, commonmark, github, gfm, typography]
description: 深入剖析 GitHub Flavored Markdown 中加粗双星号紧贴中文括号与汉字时无法渲染为粗体的底层根源，详解 CommonMark 的左右侧定界符判定机制与 Unicode 字符分类冲突，并给出中英混排最佳实践。
---

在维护开源项目 [Cobble](https://github.com/hankunpeng/cobble) 的 `README.md` 时，遇到了一处非常耐人寻味的 Markdown 渲染问题。

我们在文档的第一章写下了这样一段描述：

```markdown
Cobble 是一种受自然界**河流鹅卵石拼嵌（Cobblestone Pavement）**启发的信息可视化图表。
```

语法看起来挑不出任何毛病——成对的双星号 `**` 包裹着需要强调的中英文内容。然而，当把代码推送到 GitHub 并在网页端浏览时，文本并没有被渲染成预期的粗体 `<strong>`，而是原封不动地将四个星号直接打印了出来：

> Cobble 是一种受自然界\*\*河流鹅卵石拼嵌（Cobblestone Pavement）\*\*启发的信息可视化图表。

更让人困惑的是，同篇文档里的其他加粗写法却完全正常：
* `**界面留白避让**：` 能正常加粗；
* `**力导向堆积（Force-directed Simulation）**：` 带有括号，也能正常加粗；
* 哪怕只写 `**河流鹅卵石拼嵌**启发`，没有英文括号时，也能正常加粗。

唯独当**加粗内容以括号结尾，且后面紧跟着中文字符**时，渲染就会彻底失效。

这并不是 GitHub 的临时 Bug，而是严格遵循现代 Markdown 规范（CommonMark 与 GitHub Flavored Markdown，GFM）所导致的必然结果。

---

## 1. 认知偏差：Markdown 不是简单的正则表达式

很多开发者对 Markdown 强调语法的理解停留在类似这样的正则认知：

```javascript
text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
```

如果 Markdown 解析器真的只是用正则做贪婪或非贪婪匹配，那么上面那句话绝不可能失败。

然而在现代标准中，Markdown 早已告别了早期 Perl 脚本时代的松散正则匹配。GitHub 以及绝大多数现代平台使用的都是 **CommonMark** 规范。CommonMark 定义了一套极为严密的抽象语法树（AST）状态机，其强调语法的词法分析规则长达数千字，核心机制被称为 **定界符序列判定（Delimiter Runs）**。

在 CommonMark 中，一个 `**` 能否作为“左边界（开启加粗）”或“右边界（闭合加粗）”，有着严格的形式化定义。

---

## 2. 深入 CommonMark 规范：定界符的左右判定

根据 [CommonMark Specification (Section 6.2: Emphasis and strong emphasis)](https://spec.commonmark.org/current/#emphasis-and-strong-emphasis)，成对出现的强调符号必须满足特定的边界条件。

我们聚焦于引起本次故障的核心：**右侧定界符序列（Right-flanking delimiter run）**。

规范中明确规定，一段定界符序列（如 `**`）要被判定为合法的**右定界符**，必须满足以下两个条件：

1. **它不能紧跟在空白字符之后**（Not preceded by Unicode whitespace）；
2. **它必须满足以下两项之一**：
   * **(a)** 其前驱字符**不是**标点符号（Not preceded by a punctuation character）；
   * **(b)** 其前驱字符**是**标点符号，**且其后继字符必须是空白字符或标点符号**（Preceded by a punctuation character and followed by Unicode whitespace or a punctuation character）。

只有被确认为 Right-flanking 的序列，解析器才允许将它作为前面某个左定界符的闭合端。

---

## 3. Unicode 字符分类与中文排版的隐形冲突

关键就出在条件 2 的判定逻辑上，而这里的“标点符号”和“字符”完全由 Unicode 官方属性决定。

在 Unicode 字符数据库（UCD）中：
* 中文字符（如 `启`、`界`、`河` 等汉字）归属于 **`Lo`（Letter, other）**，在 CommonMark 中被归为 **非标点、非空白字符（Letters）**；
* 全角闭括号 `）`（U+FF09）与半角闭括号 `)`（U+0029）归属于 **`Pe`（Punctuation, close）**，在 CommonMark 中被归为 **标点符号（Punctuation）**。

现在，我们把出现问题的片段逐字符拆解，对照 CommonMark 状态机的判定流程：

```text
受自然界 ** 河流鹅卵石拼嵌（Cobblestone Pavement） ** 启发
        ^                                      ^
    前定界符                                 后定界符
```

### 第一步：检查前定界符（开启加粗）
* 前驱字符是 `界`（Unicode 类别 `Lo`，字符）；
* 后继字符是 `河`（Unicode 类别 `Lo`，字符）；
* 根据规范，它是一个合法的 **Left-flanking delimiter run**，解析器在这里压入一个等待匹配的加粗节点。

### 第二步：检查后定界符（闭合加粗）
* **检查前驱字符**：紧贴在 `**` 前面的是 `）`（Unicode 标点符号）；
* **评估条件 2(a)**：因为前驱字符是标点符号，**条件 2(a) 不满足**；
* **评估条件 2(b)**：规范要求如果前驱是标点，**后继必须也是标点符号或空白符**。但紧贴在 `**` 后面的是中文字符 `启`（Unicode 字符，既非标点也非空白）！
* 因此，**条件 2(b) 同样不满足！**

**最终结论**：
CommonMark 解析器断定，这里的后侧 `**` **不是一个合法的 Right-flanking delimiter run**！

因为解析器拒绝承认它是右边界，它就无法闭合前方的左定界符。状态机最终只能放弃构建 `<strong>` 语法节点，将这几个星号当作没有任何语义的纯文本符号原样吐出。

---

## 4. 为什么其他场景能“碰巧”成功？

理解了上述规则，就能清楚解释为什么其他看似相近的写法却能正常工作：

### 场景 A：纯中文加粗后跟汉字
```markdown
受自然界**河流鹅卵石拼嵌**启发
```
* 后定界符前驱是汉字 `嵌`（字符，非标点）；
* 完美命中 **条件 2(a)**，直接确认为合法右定界符，渲染成功。

### 场景 B：带括号加粗，但后跟冒号或逗号
```markdown
**力导向堆积（Force-directed Simulation）**：
**App 屏幕使用时间（Screen Time）**，
```
* 后定界符前驱是括号 `）`（标点）；
* 虽然条件 2(a) 失败，但后继字符是冒号 `：` 或逗号 `，`（同样属于 Unicode 标点）；
* 完美命中 **条件 2(b)**（前驱是标点，且后继也是标点），渲染成功。

### 场景 C：只有「括号 + 紧贴汉字」必死无疑
```markdown
**河流鹅卵石拼嵌（Cobblestone Pavement）**启发
```
* 前驱是标点 `）`，后继是汉字 `启`；
* 条件 2(a) 与 2(b) 双双破灭，精准踩进 CommonMark 的规则死角。

西文排版天然以空格（Whitespace）分词，词与词之间必然存在空格。CommonMark 最初设计该规则的目的，是为了防止英文日常写作中的带缩写或数学符号被误识别为强调（例如 `*p*-value` 或 `don't *touch* it`）。

但对于 CJK（中日韩）语系，语素直接连写成句，字与字之间不依赖空格分隔。直接照搬西文这套基于「标点 vs 空白」的二分法规则，便不可避免地在中文与外文括号混排时引发误伤。

---

## 5. 三种解决方案与最佳实践

### 方案一（推荐）：遵循中文排版规范，添加中西文间隙

根据 W3C《中文排版需求》（Requirements for Chinese Text Layout）以及中文互联网广泛采用的“盘古之白”（Pangu Spacing）规范，行内出现西文字符、外文专有名词或特定强调块时，建议与前后的中文字符保留一个空格的微间距：

```markdown
Cobble 是一种受自然界 **河流鹅卵石拼嵌（Cobblestone Pavement）** 启发的信息可视化图表。
```

在前后加入半角空格后：
* 后定界符的后继字符变成了空格（Whitespace）；
* 顺利满足条件 2(b)；
* 既符合通用排版美学，又能确保在任何遵循 CommonMark / GFM 规范的平台（GitHub、GitLab、Notion、Obsidian 等）上 100% 稳定渲染。

### 方案二：将注释括号移出加粗范围

如果需要强调的核心本体仅仅是中文概念，而括号内的英文只是附带解释，可以直接将括号置于星号外部：

```markdown
Cobble 是一种受自然界**河流鹅卵石拼嵌**（Cobblestone Pavement）启发的信息可视化图表。
```

此时星号直接包裹汉字 `嵌`，不受任何标点干扰。

### 方案三：原生 HTML `<strong>` 标签兜底

如果在特定版式或高密度排版场景下，出于视觉要求坚决不希望出现额外的空格，可以直接使用 HTML 原生标签：

```markdown
Cobble 是一种受自然界<strong>河流鹅卵石拼嵌（Cobblestone Pavement）</strong>启发的信息可视化图表。
```

由于 HTML 标签在 CommonMark 解析流程中拥有优先穿透权，它完全绕开了复杂的定界符状态机，无论前后字符是标点还是中文，都能稳定渲染为粗体。

---

## 6. 工具化：如何在提交前批量扫描未闭合的 Markdown 标记

这类问题如果在长篇文档中出现，人工肉眼极难逐行核对。借助 GitHub CLI（`gh`）提供的 `/markdown` 渲染接口，我们可以编写一段简短的脚本，在 CI/CD 或本地 pre-commit 中自动检测：

```python
import subprocess
import sys

def check_markdown_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    has_issue = False
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        # 跳过代码块与空行
        if not stripped or stripped.startswith("```") or "**" not in stripped:
            continue

        # 调用 GitHub 官方 GFM 渲染接口
        res = subprocess.run(
            ["gh", "api", "-X", "POST", "/markdown", "-f", f"text={stripped}"],
            capture_output=True,
            text=True
        )

        # 若渲染出来的 HTML 仍包含未被消化的原始双星号，则说明定界符解析失败
        if "**" in res.stdout:
            print(f"[Line {line_num}] 未正确渲染的加粗语法: {stripped}")
            has_issue = True

    return not has_issue

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "README.md"
    ok = check_markdown_file(target)
    sys.exit(0 if ok else 1)
```

在本地运行该脚本，即可秒级精准定位类似 `**...（...）**紧跟汉字` 的排版死角。

---

## 总结

软件工程中的诸多“诡异灵异现象”，往往不是底层平台坏了，而是我们在凭经验和直觉对抗严谨的形式化规范。

从简单的几个星号，到 CommonMark 抽象语法树中的 Delimiter Run，再到 Unicode 标准下的字符属性分类——每一次深入底层的探究，都会让我们在面对看似细枝末节的排版与代码时，多一份笃定与掌控感。
