# 科学研究: 原子 Skill

综述学术证据、设计研究、分析实验结果并形成可追溯论文。

## 原子 Skill

- `atom-analyze-experimental-results` — **分析实验结果**: 按既定方案分析一个实验数据集，提供可复现计算、不确定性、诊断与有限结论。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-design-research-study` — **设计研究方案**: 生成含假设、变量、抽样、对照、分析计划、伦理与效度威胁的研究方案。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-manage-research-citations` — **管理研究引用**: 规范化、验证、去重并将学术参考文献映射到论断，不编造标识符或书目信息。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-peer-review-manuscript` — **同行评审论文**: 评审一篇学术论文的论断依据、方法、分析、创新背景、可复现性、伦理与报告质量，不代写或替编辑决策。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-review-literature` — **科学文献综述**: 将有限的学术证据综合为主题、共识、冲突、空白与可追溯结论。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-write-scientific-manuscript` — **撰写科学论文**: 将已验证研究证据写成结构化学术论文，并保持论断到来源、结果到分析的可追溯性。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
