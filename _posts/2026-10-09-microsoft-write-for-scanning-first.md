---
title: 一份为跳读设计的风格指南：Microsoft 把界面写进了文体
date: 2026-10-09 15:00:00 +0800
categories: [思考, 写作与编辑]
tags: [style guide, writing, editing, microsoft, technical writing, documentation]
toc: false
---

Microsoft 的品牌声音页列了三条原则：Warm and relaxed、Crisp and clear、Ready to lend a hand。第二条底下跟着一句短话：

> “We write for scanning first, reading second.”

先为跳读而写，其次才是为阅读而写。这不是排版建议，是文章成立方式的改变。

## 读者不打算读完

讲可扫描内容的那一页开篇就把前提说透了：“The volume of content available to customers is overwhelming.” 内容多到压人。接着给写作者下定义：“Part of a writer's job is to help readers find what they need quickly, or recognize just as quickly when they're not where they need to be.”[Scannable content](https://learn.microsoft.com/en-us/style-guide/scannable-content/)

后半句值得停一下。写作者的任务也包括让人尽快发现自己走错了地方。按这个标准，一篇被跳过的文章不算失败，一次没被及时识别的误入才算。

它给出的办法是 “Organize text into discrete components to support scanning”——把文本组织成一个个离散组件，具体手段列了五项：标题、列表、引用块、侧栏和表格。

## 首屏、F 形和三到七行

规则写得很具体。首屏最可能被读到，“Many readers won't scroll further without a compelling reason”；从左到右的语言里读者按 F 形扫视，注意力集中在页面左上角；段落三到七行为宜，偶尔来一个单行段落也没问题；长内容至少要提供一种内部导航，比如带链接的目录或“回到顶部”；关键词要放在标题、表格项和段落的开头。

关于句子，它只给了三行编号：用简短常见的词，说到点上，然后停下。

其中 F 形扫视那句前面写着 “Numerous studies have shown”，页面没有给出研究名称、机构或链接。视线追踪的研究确实存在，但一份教人把话说清楚的指南，在这里用了一个不带出处的断言，而它要读者接受的排版结论正建立在这个断言上。

## 每一段都要能被单独命中

当文章默认被跳读，它就不再依赖“读完前面才能理解后面”。每一段都得自己站住，因为读者可能只落到那一段。

好处很实在：读者可以从任何一处进入，不必先接受一段铺垫。代价也很实在：条件、例外和不确定性最难被跳读承载。

列表能扫，但列表会把“取决于”压平成并列项。比如一项设置只在某个版本之后才有，写成列表就和其它项排在一起，视觉上一样重，读者扫过去不会知道它对自己不适用。表格能比较，但表格容易省略前提。结论放进首屏，结论的适用范围通常却在后面。

Microsoft 给这个冲突留了一个出口：“In general, keep web content short. When you have a great, customer-focused reason to create longer content, provide readers with at least one way to navigate within it.” 长内容需要理由，而且理由要以客户为中心。这是整份指南里最接近裁定标准的一句，但它没有说明当准确性和可扫描性冲突时该偏向哪一边。

## 用模式把碎片粘起来

指南自己意识到了碎片化的风险，给出的解法是模式：“Consistent writing, design, and formatting create patterns, which help readers comprehend more efficiently.” 相似的信息公开使用相同的句式，比较事物时用平行结构，标题和列表项也保持同一句式。

这个解法和跳读是配套的。文章不再靠论证把段落串起来，就改用重复的结构把它们并排摆好，读者扫到哪一段都能认出它是什么类型的内容。

但它也带来第二笔代价。模式要求相似的形式装相似的内容，一旦某一处需要额外的条件说明、一个例外或一句限定，它就会破坏平行结构。指南鼓励的做法是把它拆成另一段或另一个组件——而条件和例外恰恰是最不适合被拆出去单放的东西。

## 语气比 Google 松，结构比 Google 硬

同一页把 voice 和 tone 分开：“Though our voice is constant regardless of who we're talking to or what we're saying, we adapt our tone—from serious to empathetic to lighthearted—to fit the context and the customer's state of mind.” 声音恒定，语气随情境和读者状态调整。[Microsoft's brand voice](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human)

第一条原则下面写着 “Occasionally, we're fun.”，还补了一句括号：“We know when to celebrate.” 这比 Google 宽松——Google 判定大多数幽默过不了翻译那一关，Microsoft 允许偶尔有趣。

但在结构上它更硬。Google 谈的是措辞和可译性，Microsoft 直接规定段落长度、首屏位置和关键词落点。它的风格提示是“Get to the point fast. Start with the key takeaway. Put the most important thing in the most noticeable spot. Make choices and next steps obvious.”，最后五个词是 “Don't get in the way.”

## 反方

有人会说这些都是网页写作常识，首屏、F 形、短段落，通行说法而已，谈不上规范创新。

这个意见成立。真正值得注意的是这些话出现的位置。“We write for scanning first, reading second” 不在排版章节，在讲品牌声音的页面里，和 “Warm and relaxed” 并列。它把一个界面判断提升成了文体主张：Microsoft 的声音就是可以被扫读的。

同一页的结尾也朝着这个方向：“Remember that writing is a skill. If writing isn't a functional role your team has, consider bringing in expert help.” 一份风格指南的收束句是建议你招人。写作在这里是一项职能，不是人人都该具备的素养。

## 它回答哪一个

这份指南回答的问题是“读者能不能在几秒内判断自己来对了地方”。这个问题和“这句话是否准确”有时一致，有时冲突。冲突的时候，规范站在扫描那一边——除了那句“要有以客户为中心的理由”，它没有给出更多裁定标准。

> 本文所引页面检索于 2026 年 10 月 9 日。

## 主要资料

- [Microsoft's brand voice; above all, simple and human](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human)
- [Scannable content](https://learn.microsoft.com/en-us/style-guide/scannable-content/)
