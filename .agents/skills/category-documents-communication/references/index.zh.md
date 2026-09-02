# 文档与沟通: 原子 Skill

创建或转换供人阅读的文档、演示和消息。

## 原子 Skill

- `atom-create-presentation` — **创建演示文稿**: 将已批准内容转换为连贯演示文稿，形成统一叙事、简洁页面目的、讲者上下文和可验证结构。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-draft-external-message` — **起草对外消息**: 起草一封面向特定受众的邮件、公告或回复，明确目的与所需行动，但不发送。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-edit-prose` — **编辑文字**: 改进一段有限文本的清晰度、结构、语气和正确性，不改变其有依据的含义或编造事实。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-extract-document-data` — **提取文档数据**: 从一份文档中提取指定字段、表格、实体和段落，形成带页码或章节来源的结构化结果。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-summarize-document` — **总结文档**: 将一份给定文档压缩为忠实且面向特定读者的摘要，保留决策、限定条件和未决事项。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-translate-document` — **翻译文档**: 在保持含义与结构的前提下翻译一份文档
  - 风险: `reversible-write`
  - 生命周期: transform, verify
- `atom-write-structured-report` — **编写结构化报告**: 将已验证输入组织成一份可供决策的报告，包含可追溯论断、清晰章节、局限与可行动结论。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
