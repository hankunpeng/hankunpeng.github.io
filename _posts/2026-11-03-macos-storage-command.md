---
title: 在 macOS 终端里用一条命令查看磁盘可用空间
date: 2026-11-03 14:10:00 +0800
categories: [技术, 效率工具]
tags: [macos, shell, zsh, terminal, storage]
description: 用 macOS 自带的 df 和 awk 编写 storage 命令，输出磁盘可用空间与总容量，按十进制 GB 保留两位小数，并说明与系统界面统计口径的区别。
---

有时候只是想知道 Mac 还剩多少磁盘空间，不想专门打开系统设置。希望在终端输入：

```sh
storage
```

就能得到这样一行结果：

```text
31.11 GB available of 245.11 GB
```

前面的数字是可用空间，后面的数字是总容量。这两个数会根据实际磁盘状态读取，示例中的数值仅用于展示输出格式。

可以用 macOS 自带的 `df` 和 `awk` 写一个小脚本，再把它放进终端能够找到的目录。下面的步骤适用于使用 Zsh 的 macOS 终端，无需安装额外工具。

## 创建 storage 脚本

把脚本放在 `~/.local/bin/storage`，方便作为当前用户的日常命令使用。在终端执行：

```sh
mkdir -p "$HOME/.local/bin"

cat > "$HOME/.local/bin/storage" <<'EOF'
#!/bin/sh
# Show the startup disk's free and total space in decimal GB.
LC_ALL=C /bin/df -kP / | LC_ALL=C /usr/bin/awk '
    NR == 2 {
        printf "%.2f GB available of %.2f GB\n", $4 * 1024 / 1000000000, $2 * 1024 / 1000000000
    }
    END { if (NR < 2) exit 1 }
'
EOF

chmod +x "$HOME/.local/bin/storage"
```

这里的 `<<'EOF'` 给结束标记加了引号，写入时会原样保留 `$4`、`$2` 等内容，交给脚本运行时的 `awk` 处理。

创建后，可以先通过完整路径运行：

```sh
"$HOME/.local/bin/storage"
```

这一步不依赖 `PATH`，可以直接确认脚本能否正常输出。

## 让终端找到这个命令

`PATH` 是终端搜索可执行文件的目录列表。只有 `~/.local/bin` 在这个列表中，才能直接输入 `storage`。

先检查：

```sh
command -v storage
```

如果输出的是刚创建的 `~/.local/bin/storage` 的完整路径，就已经配置好了，可以跳到下一节。

如果没有输出，编辑或创建 `~/.zshenv`，加入下面两行；如果已有相同作用的配置，沿用原来的一处即可：

```zsh
path=("$HOME/.local/bin" ${path:#"$HOME/.local/bin"})
export PATH
```

Zsh 的 `path` 数组与 `PATH` 对应。这种写法会先移除数组中已有的同一路径，再把它放到最前面，避免反复加载时重复添加。

保存后，在当前终端执行：

```zsh
source ~/.zshenv
rehash
```

也可以重新打开终端，让新终端读取配置。

## 验证命令入口和输出

运行：

```sh
command -v storage
storage
```

第一行应指向刚创建的脚本，第二行应输出磁盘容量，例如：

```text
/Users/yourname/.local/bin/storage
31.11 GB available of 245.11 GB
```

之后在任意工作目录中输入 `storage`，都会查询启动磁盘上 `/` 所在文件系统的空间。

## 脚本怎样计算容量

先单独运行脚本中的数据来源命令：

```sh
LC_ALL=C /bin/df -kP /
```

`/` 指定要查询的文件系统；`-k` 让容量以 **1024 字节为一个单位**输出。第一行是表头，第二行是数据，其中第 2 列是总容量，第 4 列是可用空间。

因此，`awk` 用 `NR == 2` 选中数据行，再把 `$4` 和 `$2` 换算成十进制 GB：

```text
GB = df 输出的数值 × 1024 ÷ 1,000,000,000
```

这里采用 `1 GB = 1,000,000,000` 字节。`df -h` 使用基于 1024 的单位，在 GB 这一量级对应 GiB，所以它的数值可能与这里不同。可以在终端运行 `man df` 查看本机的选项说明。

格式字符串中的 `%.2f` 保留两位小数；`LC_ALL=C` 固定命令的区域设置，让格式化输出使用小数点。脚本还使用了 `df` 和 `awk` 的绝对路径，明确调用 macOS 自带的工具。

## 为什么可能与系统界面的数字不同

这个脚本把 `df` 的 `Available` 列显示为 `available`，含义是文件系统当前报告的空闲空间。

macOS 界面中的“可用空间”可能采用不同的口径。[Apple 的“磁盘工具”使用手册](https://support.apple.com/zh-cn/guide/disk-utility/dskutl1005/mac)说明，可用空间可能同时包含空闲空间和“可清除空间”，后者是系统在需要时能够释放的空间。因此，这个命令与系统界面的数字可能不同，输出格式相似并不代表统计口径完全一致。

另外，APFS 的多个卷可以共享同一个容器的空间，`df` 列出的多个卷可能具有相同的总容量和可用空间，不能把它们逐行相加。这个脚本只读取 `/` 的一条记录，适合在终端快速查看启动磁盘的剩余空间。
