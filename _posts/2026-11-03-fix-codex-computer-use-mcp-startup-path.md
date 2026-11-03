---
title: 修复 Codex 的 computer-use MCP 启动失败：将相对路径改为绝对路径
date: 2026-11-03 14:30:00 +0800
categories: [技术, 环境配置]
tags: [codex, mcp, computer-use, macos, terminal]
description: 记录一次 Codex computer-use MCP 启动失败的修复：确认程序实际位置，备份 config.toml，将 command 和 cwd 改为绝对路径，并验证 MCP 初始化与工具发现。
---

在 macOS 上启动 Codex 时，遇到了下面两条提示：

```text
MCP client for `computer-use` failed to start: MCP startup failed: No such file or directory (os error 2)

MCP startup incomplete (failed: computer-use)
```

这次的原因是：**Computer Use 程序已经安装，但 MCP 配置使用了相对路径，启动时找不到对应的可执行文件。** 将 `command` 和 `cwd` 改成实际安装位置的绝对路径后，MCP 初始化和工具列表读取都通过了验证。

下面记录具体的修改方法。文中的程序路径来自本机安装情况；其他电脑应先确认自己的实际位置。

## 查看 computer-use 的启动配置

先在终端运行：

```sh
codex mcp get computer-use --json
```

本次在 `~/.codex/config.toml` 中找到的对应配置是：

```toml
[mcp_servers.computer-use]
command = "./Codex Computer Use.app/Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient"
args = ["mcp"]
cwd = "."
enabled = true
```

`command` 以 `./` 开头，`cwd` 也写成了 `.`。这样的配置依赖启动时的目录环境，而本次启动 Codex 的项目目录里并没有 `Codex Computer Use.app`。

实际程序在：

```text
~/.codex/computer-use/Codex Computer Use.app/
```

因此，问题出在启动路径。第二条 `MCP startup incomplete` 是对同一次启动失败的汇总，修复这条 MCP 的路径即可处理这两条提示。

## 确认程序的实际位置

本机可以用下面的命令检查客户端文件：

```sh
cua_root="$HOME/.codex/computer-use"
cua_client="$cua_root/Codex Computer Use.app/Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient"

ls -l "$cua_client"
test -x "$cua_client" && echo "可执行文件存在"
```

本次检查确认文件存在，并且具有执行权限。如果这里就提示找不到文件，应先核实当前安装的程序位置，再填写后面的配置。

路径中的 `Codex Computer Use.app` 带有空格，在 shell 命令中引用整个变量时要保留双引号。

接着输出后面需要填写的两项路径：

```sh
printf 'command = "%s"\ncwd = "%s"\n' "$cua_client" "$cua_root"
```

输出会把 `$HOME` 展开成当前用户的主目录，便于直接复制实际的绝对路径。

## 备份配置，改用绝对路径

修改前先备份：

```sh
cp -p "$HOME/.codex/config.toml" \
  "$HOME/.codex/config.toml.bak-computer-use-$(date +%Y%m%d-%H%M%S)"
```

编辑 `~/.codex/config.toml` 中已有的 `[mcp_servers.computer-use]` 段，只替换 `command` 和 `cwd`。下面保留本次修复使用的完整路径；在其他电脑上，请使用上一步命令输出的路径：

```toml
[mcp_servers.computer-use]
command = "/Users/alex/.codex/computer-use/Codex Computer Use.app/Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient"
args = ["mcp"]
cwd = "/Users/alex/.codex/computer-use"
enabled = true
```

`command` 指向客户端可执行文件，`cwd` 指向启动它时使用的工作目录。两者都使用绝对路径后，这条配置就不再依赖当前项目下是否存在同名应用。

保留 `args = ["mcp"]` 和 `enabled = true`，也保留文件中的其他配置。直接编辑已有段落即可，不要再追加一个同名表。

OpenAI 的[官方 MCP 文档](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)说明了 `command`、`args`、`cwd` 等配置字段，也区分了手动配置的 MCP 与插件提供的 MCP。本文修改的是本机这条手动声明的服务；如果你的服务来自插件，应先确认它的配置来源。

## 重新加载配置并验证

保存后，再执行一次：

```sh
codex mcp get computer-use --json
```

检查返回结果中，`command` 和 `cwd` 是否已经变成完整的绝对路径，服务是否仍为启用状态。

**这一步只确认 Codex 读到了新配置，并不代表 MCP 已成功启动。** 接下来需要退出并重新启动出现报错的 Codex 客户端，让它重新加载配置：

- 在终端使用 Codex CLI 时，退出后重新运行 `codex`。
- 在 IDE 扩展中遇到提示时，重启对应扩展。

重新进入 Codex CLI 后，可以通过 `/mcp` 查看活动 MCP 服务，确认 `computer-use` 的连接状态。

这次修复还做了直接的协议验证：按修改后的 `command`、`args` 和 `cwd` 启动进程，通过标准输入和标准输出发送 MCP 请求。初始化成功后，再发送工具列表请求，结果如下：

```text
initialize: OK
protocolVersion: 2024-11-05
tools/list: OK; tools: 10
```

返回的服务名是 `Computer Use`，工具列表包含 `list_apps`、`get_app_state`、`click`、`press_key` 等。这里的协议版本和工具数量是本次验证结果，其他版本可能不同。

这些结果确认了进程能启动、MCP 能完成初始化并返回工具列表。本次没有执行桌面点击或输入测试。
