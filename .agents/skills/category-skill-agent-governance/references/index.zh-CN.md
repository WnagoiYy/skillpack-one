# Skill 与 Agent 治理: 原子 Skill

分类、组合、评测、发布和进化 Agent 能力与 Harness。

## 原子 Skill

- `atom-classify-capability` — **分类能力**: 为一个能力产出带边界的分类与契约提案
  - 风险: `read-only`
  - 生命周期: analyze, govern

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
