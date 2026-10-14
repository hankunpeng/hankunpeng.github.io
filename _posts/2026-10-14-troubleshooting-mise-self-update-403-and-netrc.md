---
title: 排查 mise self-update 报错 403 与 .netrc 权限警告
date: 2026-10-14 15:35:00 +0800
categories: [技术, 效率工具]
tags: [mise, cli, github-api, devops, troubleshooting]
description: 记录通过响应头定位 mise self-update 的 GitHub API 匿名限流问题、复用 gh CLI 凭证升级，以及修复 .netrc 文件权限警告的过程
---

在使用多运行时管理工具 `mise`（原 rtx）时，查看版本提示有更新可用。但按照终端指引执行自动升级时，却意外遭遇了网络 403 错误，并伴随一条关于安全权限的警告。

这两个问题需要分别处理：403 的原因要通过 HTTP 响应核实，`.netrc` 警告则需要检查本地文件权限。本文记录的是一次从 `2026.7.18` 升级到 `2026.10.9` 的排查过程，版本号和终端输出以当时的记录为准。

本文的 `self-update` 命令适用于支持自行更新的安装方式。如果通过 Homebrew、apt 等包管理器安装，应使用对应的包管理器升级，参见 [mise 更新说明](https://mise.jdx.dev/cli/self-update.html)。

---

## 现象复现

在终端中检查 `mise` 当前版本：

```console
$ mise --version
              _                                        __
   ____ ___  (_)_______        ___  ____        ____  / /___ _________
  / __ `__ \/ / ___/ _ \______/ _ \/ __ \______/ __ \/ / __ `/ ___/ _ \
 / / / / / / (__  )  __/_____/  __/ / / /_____/ /_/ / / /_/ / /__/  __/
/_/ /_/ /_/_/____/\___/      \___/_/ /_/     / .___/_/\__,_/\___/\___/
                                            /_/                 by @jdx
2026.7.18 macos-arm64 (2026-07-30)
mise WARN  netrc file /Users/alex/.netrc has insecure permissions (mode: 755). Should be 0600 or 0400
mise WARN  mise version 2026.10.9 available
mise WARN  To update, run mise self-update
```

终端给出了两个提示：

1. 警告 `~/.netrc` 文件的权限不安全（当前为 `755`，应为 `0600` 或 `0400`）。
2. 检测到有新版本 `2026.10.9` 可用，建议运行 `mise self-update`。

紧接着按照提示运行更新命令：

```console
$ mise self-update --verbose
DEBUG ARGS: /Users/alex/.local/bin/mise self-update --verbose
Error:
   0: NetworkError: api request failed with status: 403 - for: "https://api.github.com/repos/jdx/mise/releases/latest"

Location:
   src/cli/self_update.rs:169

Version:
   2026.7.18 macos-arm64 (2026-07-30)
DEBUG exiting with code: 1
```

更新命令以退出码 `1` 结束，请求 GitHub 最新 release 接口返回了 `403 Forbidden`。

---

## 一、定位 403：GitHub API 的匿名限流机制

请求公开仓库的 release 信息时，为什么会返回 HTTP 403？

从这次错误中的 URL 可以看出，旧版本的 `mise self-update` 正在调用 GitHub 的 REST API（`https://api.github.com/repos/jdx/mise/releases/latest`），以获取最新的 release 元数据与各架构资产包信息。

使用 `curl` 抓取该接口的 HTTP 响应头：

```bash
curl -q -sSI https://api.github.com/repos/jdx/mise/releases/latest \
  | grep -Ei '^(HTTP/|x-ratelimit-|retry-after:)'
```

这里的 `-q` 放在第一个参数位置，用来跳过默认的 curl 配置文件；命令未主动附带认证凭证。当时返回的关键限流头部如下：

```http
x-ratelimit-limit: 60
x-ratelimit-remaining: 0
```

### 限流规则与踩坑点

- **匿名请求按来源 IP 计数**：GitHub REST API 的未认证请求主要限额为每小时 60 次。
- **共享出口会共享匿名配额**：公司内网、公共 Wi-Fi 或 NAT 网关后的其他用户和工具，也可能消耗同一出口 IP 的配额。
- **耗尽主要配额时可能返回 403 或 429**：对应响应的 `x-ratelimit-remaining` 为 `0`，应等待 `x-ratelimit-reset` 指定的时间后再重试。

这次的 `limit: 60` 和 `remaining: 0` 支持匿名主要配额已耗尽的判断，但不能把所有 403 都归因于匿名限流。GitHub 的次级限流、权限问题等也可能导致 403；遇到不同情况时，应结合响应正文、`retry-after` 和限流头部继续排查。参见 [GitHub REST API 限流说明](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) 和 [mise 凭证排查说明](https://mise.jdx.dev/dev-tools/github-tokens.html#troubleshooting)。

---

## 二、复用 gh CLI 凭证完成升级

针对这次匿名配额耗尽的问题，可以**为请求加上认证身份**。普通用户使用 Personal Access Token（PAT）或 OAuth 用户令牌时，主要限额通常为每小时 **5000 次**，同一用户的多个工具会共享这份配额；认证请求仍受次级限流约束。GitHub Actions 内置令牌等场景另有规则，具体以 [GitHub 限流文档](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) 和实际响应头为准。

mise 支持读取环境变量中的 GitHub Token（如 `GITHUB_TOKEN` 或 `MISE_GITHUB_TOKEN`），参见 [mise GitHub Token 说明](https://mise.jdx.dev/dev-tools/github-tokens.html)。

如果本地已经安装 GitHub 官方命令行工具 `gh`，并登录了 `github.com` 上的有效账号，就可以复用现有凭证。这次使用的命令是：

```bash
GITHUB_TOKEN="$(gh auth token)" mise self-update -y
```

实际使用时，建议明确指定 GitHub 主机，并使用优先级更高的 `MISE_GITHUB_TOKEN`，避免已有的 mise Token 环境变量覆盖本次提供的 `GITHUB_TOKEN`：

```bash
MISE_GITHUB_TOKEN="$(gh auth token --hostname github.com)" mise self-update -y
```

- `$(gh auth token --hostname github.com)`：取得 `github.com` 当前活动账号的凭证，参见 [gh auth token 手册](https://cli.github.com/manual/gh_auth_token)。如果尚未登录，可先运行 `gh auth login --hostname github.com`；若读取凭证失败，应先处理登录问题。
- 命令前的变量赋值：只把 Token 传给这次命令及其子进程，无需把令牌明文写进 shell 配置文件。
- `-y`（或 `--yes`）：跳过交互确认，仍会显示更新输出，并不等于静默模式。参见 [mise self-update 参数说明](https://mise.jdx.dev/cli/self-update.html)。

执行后，终端顺利拉取 release 资产并完成替换：

```text
Checking target-arch... mise-v2026.10.9-macos-arm64.tar.gz
Looking for tag: v2026.10.9
Downloading...
Extracting archive... Done
Replacing binary file... Done
Updated mise to 2026.10.9
```

再次执行 `mise --version`，确认这次已升级至 `2026.10.9`：

```text
2026.10.9 macos-arm64 (2026-10-13)
```

---

## 三、修复 .netrc 文件权限警告

解决了升级问题，再回过头看最初的警告：

```text
mise WARN  netrc file /Users/alex/.netrc has insecure permissions (mode: 755). Should be 0600 or 0400
```

### 1. 什么是 .netrc？

`~/.netrc` 是一种登录凭据文件，通常按主机记录用户名和密码，也可以在服务支持时把 Token 放在密码字段中。工具是否读取它，取决于自身实现与配置。例如 curl 需要通过 `--netrc`、`--netrc-optional` 等选项启用；mise 也支持使用 `.netrc` 提供 HTTP Basic 认证凭据。参见 [curl 的 .netrc 说明](https://curl.se/docs/manpage.html#-n) 和 [mise 的 netrc 说明](https://mise.jdx.dev/dev-tools/github-tokens.html#netrc-credentials)。

### 2. 为什么 755 会被警告？

在 UNIX 权限系统中：

- `755` 对应 `rwxr-xr-x`，权限位允许同组用户和其他用户读取文件，也授予了凭据文件不需要的执行权限。
- `.netrc` 通常以明文存储凭据，应限制为仅所有者可读，避免向其他用户暴露内容。此次 mise 警告建议使用 `0600` 或 `0400`；但并非所有工具都会检查权限，curl 官方手册明确说明它不会因 `.netrc` 权限不当而告警。

### 3. 一行命令修复

按照规范，将文件权限收紧为**仅文件所有者可读写**（`600` 即 `-rw-------`）即可：

```bash
chmod 600 ~/.netrc
```

修复后再运行 `mise` 相关命令，该警告彻底消失。

`400` 也符合这次警告给出的要求，区别是所有者只能读取、不能直接写入文件。收紧权限只解决本地凭据文件的暴露问题，不会提高 GitHub API 配额，也不能代替前面的 403 排查。

---

## 四、后续使用建议

1. **按需传递凭证**：偶尔升级时，使用前面的单次命令即可。不必为此在 `~/.zshrc` 中全局导出 Token；全局导出的令牌会被后续启动的子进程继承。其他 CLI 是否读取同名变量，需要分别查阅其文档，认证也不保证永远不会遇到 403。
2. **按需启用自动更新**：`self_update.auto` 会在符合条件的命令执行前检查更新，并在有符合条件的新版本时实际安装，不只是发出更新提醒。如果接受这种行为，可在支持该设置的版本中运行：

   ```bash
   mise settings set self_update.auto true
   ```

   这会写入全局 mise 配置。自动更新默认关闭，默认检查间隔为 7 天；CI、非交互会话等情况会跳过自动更新，包管理器禁用自行更新的安装方式也不适用。参见 [self_update.auto 设置说明](https://mise.jdx.dev/configuration/settings.html) 和 [settings set 命令说明](https://mise.jdx.dev/cli/settings/set.html)。
3. **检查凭据文件权限**：对 `.netrc` 这类明文凭据文件，使用 `600` 或按需使用 `400`。其他文件应按用途设置权限，不能把同一权限值套用到所有 SSH 文件和目录。
