# 文档与沟通: 原子 Skill

创建或转换供人阅读的文档、演示和消息。

## 原子 Skill

- `atom-translate-document` — **翻译文档**: 在保持含义与结构的前提下翻译一份文档
  - 风险: `reversible-write`
  - 生命周期: transform, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
