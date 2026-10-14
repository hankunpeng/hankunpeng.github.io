---
title: 在 macOS 上通过 PATH 为 ESP-IDF EIM 配置 Python 3.14
date: 2026-10-14 18:35:00 +0800
categories: [技术, 环境配置]
tags: [esp-idf, python, pip, macos, homebrew, embedded]
description: 将 Homebrew Python 3.14 的 libexec/bin 放在 PATH 最前面，统一 python3 与 pip3 的命令入口，并从同一终端启动 ESP-IDF 安装管理器
---

我电脑上原本用 Python 3.15，但 ESP-IDF 安装管理器 **EIM（ESP-IDF Installation Manager）** 官网文档写支持到 Python 3.14，并要求 Python 配有 pip、能够创建虚拟环境和处理 SSL 请求，因此需要调整一下 Python 版本。

## 配置 Python 3.14

如果尚未安装 Python 3.14，先运行：`brew install python@3.14`，已经安装的可以跳过这一步。

最早是想用 `brew unlink python@3.15`、`brew link --overwrite python@3.14`、`ln -sf /opt/homebrew/bin/python3.14 /opt/homebrew/bin/python3` 和 `ln -sf /opt/homebrew/bin/pip3.14 /opt/homebrew/bin/pip3` 来做，后来了解到 [Homebrew 的 python@3.14 配方](https://formulae.brew.sh/formula/python@3.14) 在 **`/opt/homebrew/opt/python@3.14/libexec/bin`** 目录提供 `python3`、`pip3`、`python` 和 `pip` 等入口，那么把 `/opt/homebrew/opt/python@3.14/libexec/bin` 配置在 PATH 最前面就是更优雅的解法。

macOS 默认使用 Zsh。编辑 `~/.zshrc`，在最后一行加入：

```bash
export PATH="/opt/homebrew/opt/python@3.14/libexec/bin:$PATH"
```

保存后重新打开终端。

如果只需在当前终端使用，也可以直接执行上面的 `export` 命令，然后清除 shell 缓存的命令位置：

```bash
hash -r
```

`PATH` 按从前到后的顺序搜索命令。这个目录排在前面时，终端会优先找到其中的 `python3` 和 `pip3`，两者会共同使用 Python 3.14。

以上路径适用于 Homebrew 前缀为 `/opt/homebrew` 的环境。其他安装位置可以使用以下等效配置：

```bash
export PATH="$(brew --prefix python@3.14)/libexec/bin:$PATH"
```

两种写法选择一种即可。

## 验证 Python 与 pip 的实际入口

如果修改了 `~/.zshrc`，在重新打开的终端中验证；如果临时执行了 `export`，则在执行该命令的同一个终端中验证：

```bash
command -v python3
command -v pip3
python3 --version
pip3 --version
python3 -m pip --version
```

使用上述固定路径配置时，前两条命令应分别输出：

```text
/opt/homebrew/opt/python@3.14/libexec/bin/python3
/opt/homebrew/opt/python@3.14/libexec/bin/pip3
```

`python3 --version` 应显示 Python 3.14，后两条命令的输出都应标明使用 Python 3.14。如果实际入口不符，可以检查是否有 alias、shell 函数或其他版本管理器覆盖了命令：

```bash
type -a python3 pip3
```

需要明确使用当前解释器对应的 pip 时，优先使用 `python3 -m pip`。参见 [Homebrew 的 Python 使用说明](https://docs.brew.sh/Language-Runtimes-and-Packages)。

## 启动 EIM

如果已经安装 Homebrew 版 EIM，在验证通过的同一个终端中运行：

```bash
eim gui
```

也可以使用 `eim install` 进入命令行安装流程。

从终端启动的 EIM 会继承当前的 `PATH`。通过 Finder 打开的 GUI 不会读取 `~/.zshrc`，因此可能找到另一套 Python；终端配置完成后，应使用上述方式启动 EIM，并确认安装器报告的 Python 版本符合预期。参见 [EIM 关于 macOS Python 检测的 FAQ](https://docs.espressif.com/projects/idf-im-ui/en/latest/faq.html)。

随后继续完成 EIM 的虚拟环境、SSL/HTTPS 及其他先决条件检查。命令入口对齐只完成了 Python 选择这一步。

对于已经安装的 ESP-IDF 环境，EIM 生成的激活脚本会记录安装时选定的 Python 路径；修改终端的 `PATH` 不会迁移这些已有环境，日常使用仍应按对应的激活方式进入。
