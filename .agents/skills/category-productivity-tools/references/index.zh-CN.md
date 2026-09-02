# 效率软件: 原子 Skill

在保留结构和用户控制的前提下操作表格与知识工具。

## 原子 Skill

- `atom-operate-knowledge-vault` — **操作知识库**: 创建或整理一组有限笔记，同时保留链接、元数据、命名规范与用户知识。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-operate-spreadsheet` — **操作电子表格**: 执行一个有限表格编辑，同时保留公式、格式、工作表结构及可验证的前后状态。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
