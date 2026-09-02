# 构思与计划: 原子 Skill

生成差异化方案并将选定方向转化为可执行计划。

## 原子 Skill

- `atom-brainstorm-options` — **头脑风暴方案**: 针对一个已定义问题生成刻意多样的方案，不提前选择或实施。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-build-action-plan` — **制定行动计划**: 将一个选定方向转化为含顺序、负责人、依赖、检查点、风险和完成标准的行动计划。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
