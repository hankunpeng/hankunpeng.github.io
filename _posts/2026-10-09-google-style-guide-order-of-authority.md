---
title: 一份把自己排在第二位的风格指南：Google 的三层调用顺序
date: 2026-10-09 14:00:00 +0800
categories: [思考, 写作与编辑]
tags: [style guide, writing, editing, google, technical writing, documentation]
toc: false
---

Google 的开发者文档风格指南开篇给的不是一条规则，是一段顺序：

> “Use the following references, including this guide, in this order.”

第一项是项目自己的规范：技术名词和操作方式服从当前项目或产品。第二项才是这份指南本身，前提是项目规范没有明确规定。第三项是外部参考，前两项都没答案时才查。

一份风格指南把自己排在第二位。

## 第三层里站着竞争对手

外部参考那一栏写着 “Follow The Chicago Manual of Style, 17th edition (subscription required)”。同一份清单里还列着 Merriam-Webster.com、Microsoft Writing Style Guide、Apple Style Guide、Red Hat 的文档补充指南，以及 Google Ngram Viewer。[Google developer documentation style guide](https://developers.google.com/style/)

它把两家竞争对手的指南列为自己的补充资源，还顺手告诉读者第三层是付费的。

这个安排不是客套。它说明 Google 认为自己只在中间那一层有权威：产品术语往下让给项目，通用书面语往外让给 Chicago，自己留下的是语气、结构和可译性。

## 留下的是语气和可译性

语气那一页的要求是 “aim for a voice and tone that's conversational, friendly, and respectful”——像对话、友好、尊重。[Voice and tone](https://developers.google.com/style/tone)

可译性那一页说得更硬。它指出这些文档 “read by developers for whom English is not their primary language”，因此要求 “Avoid colloquialisms, idioms, or slang”，不要提到特定节日、文化习俗或运动项目，除非确定全世界都认识，因为 “Most humor is difficult to translate, and much humor is culturally specific”。措辞不一致还会 “increase translation costs”。[Write for a global audience](https://developers.google.com/style/translation)

它进一步要求避免含混的代词、依赖方向的表述、主观形容词、过多的修饰语和不必要的词。

这里有一处真实的张力。友好、自然、尊重，同时不许用俚语、成语、文化典故和大多数幽默——两组要求会打架。Google 的裁定偏向后者：可译性和明确性优先，友好主要落在不用命令口吻、不用行话堆砌上。它没有把幽默完全禁掉，只是判定大多数幽默过不了翻译这一关。

## 权威来自适用，不来自发布方

把项目规范放在第一位，意味着这份指南承认自己在最具体的那一层没有权威。一个按钮叫什么、一个命令怎么写，由产品决定，不由写作传统决定。

这在风格指南里是少见的自我限制。多数指南的效力来自发布它的机构，Google 这份把效力挂在“是否适用于当前任务”上。它甚至列了一个语料库工具（Google Ngram Viewer），让作者自己去查一个说法在英语里有多常见——权威被外包给了数据。

## 一个没跟上的版本号

清单里 Chicago 那一行写的是第 17 版。Chicago 官网如今以 2024 年的第 18 版为准，第 18 版重排了引文章节、改动了索引排序偏好、加入 AI 生成内容的引用规则。[What's New in the 18th Edition](https://www.chicagomanualofstyle.org/help-tools/what-s-new.html)

Google 是有意停在旧版，还是那一行尚未更新，页面没有解释。两种情况都说明同一件事：一份指南可以要求术语一致，却不能保证自己依赖的另一份指南跟着升级。三层结构把责任分得很清楚，却没有给依赖关系装版本锁。

## 反方

有人会说，分层是文档工程的常识，任何大厂都会这么安排，不值得单独讲。

这个意见有道理，多数团队确实这样分工。真正值得注意的是分层被写成了公开文本。把“项目规范优先”放在指南第一行，等于承认这份文件可以被覆盖；把竞争对手列进第三层，等于承认自己不完备。多数指南不公开自己的层级，因为它们把层级当作权威的一部分。

会改变判断的证据是那一行版本号。如果 Chicago 的引用某天更新到第 18 版，说明这套依赖确实在维护，第三层是活的；如果长期停在旧版，它更接近一次性引用。

## 它回答哪一个

这份指南回答的问题是“这句话会不会让一个非母语读者多花时间”，不是“这句话写得好不好”。前一个问题它给出了可执行的清单，后一个问题它交给你项目的规范和 Chicago。

> 本文所引页面检索于 2026 年 10 月 9 日。

## 主要资料

- [Google developer documentation style guide](https://developers.google.com/style/)
- [Voice and tone](https://developers.google.com/style/tone)
- [Write for a global audience](https://developers.google.com/style/translation)
- [What's New in the 18th Edition，Chicago Manual of Style](https://www.chicagomanualofstyle.org/help-tools/what-s-new.html)
