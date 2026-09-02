# 设计软件: 原子 Skill

根据明确的产物规格操作设计应用。

## 原子 Skill

- `atom-operate-design-tool` — **操作设计工具**: 在指定设计应用中应用已批准视觉规范，并保留组件、约束、无障碍与可编辑性。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
