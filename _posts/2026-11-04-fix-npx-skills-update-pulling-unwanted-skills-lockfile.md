---
title: 深入 .skill-lock.json 机制与清理实践
date: 2026-11-04 20:45:00 +0800
categories: [技术, Agent 架构]
tags: [skills, agent, llm, terminal, cli, nodejs]
description: 记录一次执行 npx skills update -g 时意外拉取并向多个 Agent 重新分发多个历史技能的排查过程，深入剖析 ~/.agents/.skill-lock.json 的追踪原理，并给出规范清理与更新的最佳实践。
---

在使用各类 AI 编码助手（如 Claude Code、Codex、Cursor、Gemini CLI 等）时，很多开发者会使用官方或社区提供的 [skills](https://skills.sh/) 工具来统一管理各个 Agent 的 Skill。

今天在维护本机的全局技能目录 `~/.agents/skills` 时，遇到了一起非常典型的“幽灵依赖复活”事件。

---

## 1. 故障现象：原本干净的目录突然多出 36 个技能

在执行更新之前，本机的全局技能目录 `~/.agents/skills` 是经过精简的，仅保留了几个日常必需的技能与本地软链接：

```text
drwxr-xr-x alex staff 192 B 2026-08-23 09:00:10  conventional-commits
lrwxr-xr-x alex staff  48 B 2026-09-16 06:09:08  pptx ⇒ /Users/github/anthropics/skills/skills/pptx
drwxr-xr-x alex staff 128 B 2026-10-19 17:14:59  playwright-use-chrome
drwxr-xr-x alex staff 736 B 2026-10-27 11:25:14  archify
```

为了保持这些技能处于最新版本，在终端执行了官方推荐的全局更新命令：

```bash
npx skills update -g
```

本以为它只会检查并拉取现有几个技能的更新，然而终端输出却令人始料未及：

```text
Checking for skill updates…

Fetching 6 sources…
Checking skills from source: google-gemini/gemini-cli
Checking skills from source: jimliu/baoyu-skills
Checking skills from source: anthropics/skills
Checking skills from source: microsoft/skills
Checking skills from source: hankunpeng/skills
Checking skills from source: tt-a1i/archify
Found 36 global update(s)

│
◇  Downloaded 36 sources
Updating code-reviewer…
  ✓ Updated code-reviewer
...（此处省略 30 余条更新日志）...
Updating podcast-generation…
  ✓ Updated podcast-generation

✓ Updated 36 skill(s)
```

不仅在终端里刷屏下载了 36 个技能，检查目录时更发现： **所有早前测试过、但早已手动删除的技能全部被重新下载，并分发链接到了系统里检测到的 50 多个 Agent 客户端目录中！**

---

## 2. 根因剖析：为什么手动删了还会被下载？

我原本是把 `~/.agents/skills` 当作一个普通的文件夹，直觉上认为：
> “我已经把不需要的技能目录 `rm -rf` 删除了，更新时工具自然应该只更新剩下的技能。”

但这种直觉违背了现代包管理器的核心逻辑。

在深入排查用户根目录下的配置文件后，在 `~/.agents/` 路径下发现了关键文件：

```bash
cat ~/.agents/.skill-lock.json
```

打开该文件，可以看到类似如下的结构：

```json
{
  "version": 3,
  "skills": {
    "code-reviewer": {
      "source": "google-gemini/gemini-cli",
      "sourceType": "github",
      "sourceUrl": "https://github.com/google-gemini/gemini-cli.git",
      "skillPath": ".gemini/skills/code-reviewer/SKILL.md",
      "skillFolderHash": "...",
      "installedAt": "2026-02-26T07:58:25.682Z",
      "updatedAt": "2026-11-04T12:31:41.987Z"
    },
    "baoyu-youtube-transcript": {
      "source": "jimliu/baoyu-skills",
      "sourceType": "github",
      "sourceUrl": "https://github.com/jimliu/baoyu-skills.git",
      "skillPath": "skills/baoyu-youtube-transcript/SKILL.md",
      "installedAt": "2026-03-23T04:58:33.023Z",
      "updatedAt": "2026-11-04T12:31:42.958Z"
    },
    ...
  }
}
```

真相水落石出：

1. **状态以 Lockfile 为准**：`skills` CLI 并不是通过扫描 `~/.agents/skills/` 里的现存子目录来判断“已安装了什么”，而是完全信任 `~/.agents/.skill-lock.json`。
2. **“物理删除”脱节**：之前在清理不需要的技能时，如果只是通过终端 `rm -rf` 或者访达直接丢进废纸篓，`.skill-lock.json` 中的技能元数据并不会被同步清除。
3. **`update` 视同声明式同步**：当执行 `npx skills update -g` 时，CLI 遍历锁文件里登记的全部 36 个条目。对于本地缺失的目录，CLI 判定为“需要更新/拉取”，于是重新向 GitHub 发起克隆，把它们悉数“复活”，并再次挂载到各个 Agent 目录下。

---

## 3. 正确解决方案：使用 CLI 事务卸载

既然知道状态是由 `.skill-lock.json` 维护的，就不能再使用粗暴的 `rm -rf`。必须使用 `skills` CLI 自带的卸载命令，让它同时完成物理文件清理、符号链接解绑以及锁文件注销。

查看官方卸载帮助：

```bash
npx skills remove --help
```

我们可以将所有不想要的技能一次性传入命令，并加上 `-g`（全局范围）与 `-y`（自动确认）：

```bash
npx skills remove -g \
  code-reviewer docs-writer pr-creator docs-changelog pr-address-comments pirate-skill \
  baoyu-youtube-transcript baoyu-article-illustrator baoyu-comic baoyu-compress-image baoyu-cover-image \
  baoyu-danger-gemini-web baoyu-danger-x-to-markdown baoyu-diagram baoyu-format-markdown baoyu-infographic \
  baoyu-markdown-to-html baoyu-post-to-wechat baoyu-post-to-weibo baoyu-slide-deck baoyu-xhs-images \
  release-skills baoyu-electron-extract pdf algorithmic-art brand-guidelines canvas-design \
  doc-coauthoring internal-comms skill-creator mcp-builder slack-gif-creator theme-factory \
  web-artifacts-builder webapp-testing podcast-generation -y
```

终端执行日志显示：

```text
│
●   antigravity  Agent detected — removing non-interactively
│
◇  Found 40 unique installed skill(s)
│
◒  Removing skills…
◇  Removal process complete
│
◆  Successfully removed 35 skill(s)
│
└  Done!
```

---

## 4. 验证与复盘

### 4.1 检查本地目录

再次检查 `~/.agents/skills`：

```bash
ls -la ~/.agents/skills
```

输出恢复为最纯净的原始状态：

```text
drwxr-xr-x@ 23 alex  staff   736 Oct 27 11:25 archify
drwxr-xr-x@  6 alex  staff   192 Aug 23 09:00 conventional-commits
drwxr-xr-x@  4 alex  staff   128 Oct 19 17:14 playwright-use-chrome
lrwxr-xr-x@  1 alex  staff    48 Sep 16 06:09 pptx -> /Users/alex/github/anthropics/skills/skills/pptx
```

### 4.2 检查 Lockfile 状态

通过 `npx skills list -g` 验证已注册的全局技能：

```text
Global Skills

archify               ~/.agents/skills/archify
  Agents: AiderDesk, Antigravity, Antigravity CLI, AstrBot...  Source: tt-a1i/archify
conventional-commits  ~/.agents/skills/conventional-commits
  Agents: Antigravity, Antigravity CLI, Claude Code, Codex...  Source: hankunpeng/skills
playwright-use-chrome ~/.agents/skills/playwright-use-chrome
  Agents: Antigravity, Antigravity CLI, Claude Code, Codex...  Source: hankunpeng/skills
pptx                  ~/.agents/skills/pptx
  Agents: Antigravity, Antigravity CLI, Codex, Cursor...       Source: untracked
```

### 4.3 再次运行全局更新

此时再次运行更新命令：

```bash
npx skills update -g
```

终端反馈：

```text
Checking for skill updates…

Fetching 2 sources…
Checking skills from source: hankunpeng/skills
Checking skills from source: tt-a1i/archify
✓ All global skills are up to date
```

不再有任何无关的远程源被查询，更新流程秒级完成，且未下载任何多余文件。

---

## 5. 经验总结

在现代 AI Agent 生态中，各类 CLI 工具正逐步走向类似 `npm` / `pnpm` / `cargo` 的声明式包管理机制：

1. **拒绝手动 `rm -rf`**：只要是由包管理工具（如 `skills` CLI）管理的目录，添加、删除都要使用配套命令（`skills add`、`skills remove`）。
2. **多客户端符号链接陷阱**：像 `skills` 这样的跨 Agent 工具会自动把技能挂载至数十个 Agent 配置目录中。手动删除主目录往往会遗留大量失效的孤儿软链接（Broken Symlinks），而 CLI 的卸载指令能够统一解绑。
3. **排查更新异常先看 Lockfile**：当执行更新或恢复操作产生预期外的行为时，优先去排查对应的锁文件（如项目中的 `skills-lock.json` 或全局的 `~/.agents/.skill-lock.json`），往往能一针见血地找到根因。
