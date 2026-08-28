---
title: 五份风格指南，五种读者
date: 2026-08-28 14:00:00 +0800
categories: [思考, 写作与编辑]
tags: [style guide, writing, editing, technical writing, documentation]
toc: false
---

Google 的开发者文档风格指南有一段很像程序依赖说明的文字。遇到写作问题，先查项目自己的规范，再查 Google 指南；两处都没有答案，才轮到外部资料。非技术写作去找《芝加哥格式手册》，技术写作参考 Microsoft，Apple 也列在补充资源里。连写作规则都有调用顺序。

这份顺序里还留着一个小小的版本岔口。Google 当前页面指定《芝加哥格式手册》第 17 版，而 Chicago 官网如今以 2024 年出版的第 18 版为准。Google 是有意停在旧版，还是那一行尚未更新，页面没有解释。风格指南可以要求术语一致，却不能保证自己依赖的另一份风格指南自动升级。[Google developer documentation style guide](https://developers.google.com/style/)；[The Chicago Manual of Style](https://www.chicagomanualofstyle.org/home/)

把 Chicago、Oxford、Google、Microsoft 和 Apple 放在一起，人很容易先去找牛津逗号、标题大小写和数字写法的差异。这些差异当然有用，但它们只在纸面上最显眼。五份指南真正分开的地方，是各自设想了怎样的读者，以及一句话抵达读者以后要完成什么工作。

Chicago 面对的世界最宽。第 18 版目录从图书与期刊、稿件编辑、插图和版权，一直排到语法、标点、引文和索引。一份手稿怎样进入出版流程，资料怎样留下可追查的路径，都在它的管辖范围里。它面对的不只是正在写一句话的人，也包括之后接手的编辑、校对者、设计者和研究者。文字在这里是一件要经过多人处理、并且可能存放很久的东西。[Chicago 第 18 版目录](https://www.chicagomanualofstyle.org/book/ed18/frontmatter/toc.html)

这并不意味着 Chicago 把规则刻在石头上。第 18 版前言明确回顾了它从第一版起就不把规则视作永恒命令；新版加入数字出版的无障碍问题，调整包容性语言，也照顾独立出版者。它所追求的稳定，更接近一套可解释、可交接的编辑秩序。读者未必看见这套秩序，但他应当能够顺利读完，也能沿着引文找到原始资料。[Chicago 第 18 版前言](https://www.chicagomanualofstyle.org/book/ed18/frontmatter/pref.html)

Oxford 的指南窄得多，也坦率得多。它供牛津大学员工代表学校写作时使用，服务正式文件、网页和印刷传播的一致性。官网还特地说明，这不是 Oxford University Press 的专业写作指南，也不负责告诉作者怎样写、该用哪些词，更不提供完整的语气教程。它关心缩写、姓名与头衔、标点、拼写、无障碍和包容性表达，因为这些地方最容易让同一所大学在不同页面上显得像几家相邻机构。[University of Oxford Style Guide](https://www.ox.ac.uk/about/the-university/brand/style-guide)

Oxford 想象的读者，面对的是一个机构。读者可能在网页、书面材料或印刷传播中遇见它，通常没有兴趣分辨这段文字究竟出自哪个办公室。风格在这里承担的是机构连续性。它不必让每位作者拥有同一种个性，只需要让名称、格式和基本表达别各自宣布独立。

Google 想象的读者更忙，而且可能正在用第二语言读英语。他来查一份开发者文档，多半是为了让某个程序运行起来，不是为了欣赏作者怎样铺陈。Google 因此要求语气友好、自然、尊重，同时避开俚语、流行文化和过分活泼的表达。它提醒作者，读者来自不同文化，英语程度也不同；面向全球受众时，成语、地域经验和幽默都可能增加理解与翻译的成本。[Google Voice and tone](https://developers.google.com/style/tone)；[Write for a global audience](https://developers.google.com/style/translation)

这位读者需要的是一位懂行的朋友，但这位朋友最好别讲太多笑话，也不要先说“这很简单”。对已经卡在接口或配置里的人来说，“简单”通常只说明文档作者那边一切正常。Google 的项目规范优先原则也由此变得合理。技术名词和操作方式先服从当前产品，通用风格只能在空白处接手。

Microsoft 的读者同样有任务在身，不过指南把“扫描”说得更直接。重要信息要放在前面，标题、短段落、列表和表格帮助人迅速判断自己是否来对了地方。它为品牌声音设定的方向是温和、放松、清楚，并且愿意帮忙；句子应该让选择与下一步行动容易看见。[Microsoft brand voice](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human)；[Scannable content](https://learn.microsoft.com/en-us/style-guide/scannable-content/)

在这样的页面上，读者甚至未必打算从头读到尾。风格指南接受这件事，并围绕它工作。文章作者常把“没有读完”看作失败，产品文档作者却得先保证用户跳读以后仍能完成任务。短句和小标题在这里不是审美偏好，而是界面的一部分。

Apple 的指南把这种关系推进到产品表面。它适用于教学材料、技术文档、参考资料、培训和用户界面，使用者包括作者、编辑和开发者。指南既管理一般英语，也管理 Apple 产品术语、代码写法、单位、日期、货币和国际化表达；发生冲突时，它说明怎样在 Chicago、词典和 Apple 自身规则之间取舍。一个词可能同时出现在按钮、支持页面和培训材料里，风格的一致也就成了操作的一致。[About the Apple Style Guide](https://support.apple.com/guide/applestyleguide/about-the-guide-apsg1eef9171/web)

Apple 还公开列出每版增加、修改和删除的词条。2026 年版加入新产品与功能名称，也删去一批已经退出当下产品语境的硬件和技术词。它设想的读者生活在持续更新的产品系统里，指南也得跟着产品一起更新。[Apple Style Guide 变更记录](https://support.apple.com/guide/applestyleguide/changes-to-the-guide-apdaf2bc3367/web)

于是，五份指南背后出现了五种读者。Chicago 的读者进入一件经过编辑、能够长期保存的作品；Oxford 的读者希望同一所大学在不同渠道仍像同一所大学；Google 的读者带着技术问题而来，时间有限，语言背景各异；Microsoft 的读者在屏幕上扫描，很快决定下一步；Apple 的读者穿行于界面、说明和产品名称之间，希望同一个词不要沿途改名。

这些读者不能靠一套规则同时照顾。把 Microsoft 的扫描原则原样搬进一部学术专著，文字可能只剩下醒目的路标；把 Chicago 的完整编辑体系塞进一个按钮，按钮大概会先失去容身之处。比较风格指南时，最有用的一栏往往不是“谁怎样处理逗号”，而是“谁会读这句话，他读完要做什么”。

Google 把项目规范排在自己前面，看上去只是参考层级里的第一项。读完另外四份指南以后，那一项显得更像一句诚实的提醒。任何风格指南在规定句子以前，都得先知道这是谁的文字，最后要交到谁手里。

> 本文所引指南及版本信息检索于 2026 年 8 月 28 日。

## 主要资料

- [The Chicago Manual of Style，第 18 版](https://www.chicagomanualofstyle.org/home/)
- [University of Oxford Style Guide，2026](https://www.ox.ac.uk/about/the-university/brand/style-guide)
- [Google developer documentation style guide](https://developers.google.com/style/)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human)
- [Apple Style Guide，2026](https://support.apple.com/guide/applestyleguide/welcome/web)
