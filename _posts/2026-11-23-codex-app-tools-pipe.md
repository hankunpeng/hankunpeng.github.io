---
title: 为什么 Codex CLI 会提示缺少 CODEX_APP_TOOLS_PIPE_PATH？
date: 2026-11-23 15:29:00 +0800
categories: [技术, 环境配置]
tags: [codex, mcp, macos, terminal]
description: 从一次桌面端读取会话成功、终端却报警的实测，解释 codex_app 的启动方式、管道地址从哪里来，以及怎样恢复按运行环境启用的配置。
---

进入 Codex CLI，右下角却出现了一条警告：

```text
MCP client for `codex_app` failed to start: MCP startup failed: Mcp error: -32603:
Codex did not provide CODEX_APP_TOOLS_PIPE_PATH to the app tools MCP.

MCP startup incomplete (failed: codex_app (environment local))
```

经过几轮 Chat，知道原因在用户配置里。此前我把一个原本由桌面应用按运行条件启用的工具服务设成了**全局启用**。Codex CLI 读到了这个设置，也启动了该服务，却没有桌面应用提供的通信地址，所以告警。

在这台 Mac 上，合适的配置是保留插件本身，删除强制启用其服务的全局覆盖。要理解为什么，得先看清谁在调用谁。

## 读一次桌面会话，经过哪几个程序

用户看到的是聊天窗口。真正处理会话、执行工具调用的后台程序叫 **Codex App Server**。ChatGPT 桌面应用初始化本地功能时，会启动随应用安装的这个程序。一个后台进程可以处理多条消息，也可以服务多个会话。[Codex App Server 官方说明](https://learn.chatgpt.com/docs/app-server)

**MCP 工具服务**也是一个运行中的程序。MCP 规定了调用双方怎样列出工具、传入参数、取回结果。这次涉及的插件叫 `codex-app-tools`，它提供的 MCP 服务叫 `codex_app`，读取会话的工具叫 `read_thread`。当 Codex App Server 为会话加载这项服务时，插件的启动脚本会用 Node.js 运行 `server.mjs`。

一次读取请求会经过两段连接。

```text
Codex App Server
  │  通过标准输入和标准输出，调用 read_thread
  ▼
codex_app（运行 server.mjs 的 Node.js 进程）
  │  通过本机的 Unix 域套接字，请求会话信息
  ▼
ChatGPT 桌面应用
```

第二段连接就是报错里说的「管道」。在 macOS 上，操作系统用一个路径标识这个通信入口。**管道地址是一段路径字符串，`CODEX_APP_TOOLS_PIPE_PATH` 是存放这段字符串的环境变量名。** 桌面应用创建入口，把地址传给自己启动的 Codex App Server。后台启动 `codex_app` 时再把地址传下去，`server.mjs` 就能据此连接桌面应用。读取到的会话信息沿原路返回。

## 为什么 Codex CLI 也会启动它

在这台 Mac 上，两个界面使用了不同的 Codex App Server 进程。桌面应用和 Codex CLI 同时打开时，我分别检查了两个后台进程的环境，只核对变量是否存在。

| 从哪里使用 | 这次连接的后台 | 后台是否收到管道地址 |
| --- | --- | --- |
| ChatGPT 桌面应用里的 Codex 功能 | 桌面应用启动的 Codex App Server | 是 |
| Codex CLI | Codex CLI 使用的本机共享后台 | 否 |

这里「本机」说的是进程运行在哪里，「共享」说的是哪些客户端可以连接它。在终端运行 `codex` 时，多个 Codex CLI 会话可以复用一个后台进程。这个进程有自己的环境变量。即使两个客户端读取同一份 `~/.codex/config.toml`，桌面应用传给自己子进程的管道地址也只在那条启动链上生效。[Codex CLI 后台模式说明](https://learn.chatgpt.com/docs/environments/network-file-systems#2-stop-codex-on-every-host)

这也解释了为什么界面上会写「启动失败」。从缺少管道地址的环境启动插件程序，实际发了两次 MCP 请求：

| 请求 | 本机结果 | 已经验证了什么 |
| --- | --- | --- |
| `initialize` | 成功 | Node.js 进程已启动，能通过标准输入和标准输出回应协议请求 |
| `tools/list` | 返回 `-32603` 和缺少管道地址的错误 | 服务列举工具时需要联系桌面应用，在这一步中断 |

因此，第二行 `MCP startup incomplete` 汇总的是整套工具准备过程的结果。先前我还遇到过可执行文件相对路径错误，那次连程序都启动不了。这次则可以直接从第二段连接查起。[另一例 MCP 启动路径排查]({% post_url 2026-11-03-fix-codex-computer-use-mcp-startup-path %})

## 检查哪一层启用了服务

以下命令适用于此次排查的 macOS 安装，Codex CLI 版本为 `0.171.0`。先在终端查看 **Codex CLI 实际读到的配置**。

```sh
codex --version
codex mcp get codex_app --json
```

出现警告时，结果中的 `enabled` 为 `true`。`transport.env_vars` 数组里还列着 `CODEX_APP_TOOLS_PIPE_PATH`。这个数组列的是**允许转发的变量名**。后台需要先收到变量值，才能把它传给 MCP 服务。[官方 MCP 配置说明](https://learn.chatgpt.com/docs/extend/mcp#stdio-servers)

再看随桌面应用安装的插件清单。下面的命令只读取文件。

```sh
plugin_dir='/Applications/ChatGPT.app/Contents/Resources/plugins/openai-bundled/plugins/codex-app-tools'
python3 -m json.tool "$plugin_dir/.mcp.json"
```

在本机随附的清单里，`mcpServers.codex_app.enabled` 是 `false`。桌面应用的本地启动代码另外检查管道变量、插件清单和 Node.js 运行条件，并据此向自己启动的后台传入启用或停用的设置。这就解释了为什么插件默认关闭，而「ChatGPT 桌面应用里的 Codex 功能」仍然可以用它。

故障现场的 `~/.codex/config.toml` 有两个层级。第一段启用整个插件，第二段强制启用其中一个 MCP 服务。

```toml
[plugins."codex-app-tools@openai-bundled"]
enabled = true

[plugins."codex-app-tools@openai-bundled".mcp_servers.codex_app]
enabled = true
```

**如果你的配置和这段相同，保留第一段，删除第二段的表头和 `enabled = true`。** 这样独立运行的 Codex CLI 使用插件随附的默认值，桌面应用则在准备好管道时为自己的后台启用服务。如果这个表里还有你自行设置的工具审批规则，只移除 `enabled = true`，保留表头和其他设置。[插件级 MCP 配置说明](https://developers.openai.com/plugins/build/plugins#configure-installed-server-policy)

## 怎样才算验证成功

**在 Codex CLI 里检查配置是否恢复默认。** 新开 Codex CLI 会话，查看启动提示，再运行 `codex mcp get codex_app --json` 核对启用状态。写本文时，我复查了本机配置，父插件依然启用，用户配置中已没有针对 `codex_app` 的启用覆盖，命令返回 `"enabled": false`。

**在 ChatGPT 桌面应用里的 Codex 功能里检查工具能否办事。** 在本地会话输入 `/mcp` 查看工具，再发一条明确的请求，例如“请用 `codex_app` 的 `read_thread` 工具读取当前会话，设置 `includeTurns=false`，并报告返回的会话 ID 和 `hostId`”。能从调用记录看到工具执行成功，且返回的是当前会话，这才验证了整条连接。[查看已连接的 MCP 服务](https://learn.chatgpt.com/docs/extend/mcp)

恢复默认配置后，我在 ChatGPT 桌面应用里的 Codex 功能里复测了本地会话读取。`codex_app.read_thread` 使用 `includeTurns=false` 成功返回了会话元数据，`hostId` 为 `local`。桌面读取通过复测，Codex CLI 查到的有效配置也符合预期。

如果要用**同一条对话**对照两个客户端，macOS 上可以在 Codex CLI 输入 `/app`。我实测时，桌面应用成功打开了对话，第一次恢复却报 `already has an active writer`，因为终端会话仍持有写入权限。遇到这条提示，可以等当前回复结束，在 Codex CLI 输入 `/quit`，稍后回到桌面端重新打开对话。最后一个客户端离开后，后台默认等待约 60 秒卸载空闲会话。[在桌面端继续当前会话](https://learn.chatgpt.com/docs/developer-commands#continue-in-the-desktop-app-with-app) · [会话释放机制](https://learn.chatgpt.com/docs/app-server#unsubscribe-from-a-loaded-thread)

如果目标是**让独立运行的 Codex CLI 本身调用桌面工具**，验收就必须在 Codex CLI 里完成一次成功的 `codex_app.read_thread` 调用。此次排查只在桌面端完成了这项调用。我查阅了该版本的公开文档，尚未找到把桌面管道交给独立运行的 Codex CLI 的受支持连接方式，也许再过几个版本厂商就把多方打通了。
