# 数据与分析: 原子 Skill

转换、查询、建模、计算或可视化结构化数据。

## 原子 Skill

- `atom-analyze-tabular-data` — **分析表格数据**: 用可复现计算回答一个结构化数据问题
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-clean-tabular-data` — **清洗表格数据**: 依据明确规则规范化一份结构化数据，同时保留原始值、血缘、异常与可复现转换。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-validate-data-pipeline` — **验证数据管道**: 评估一条数据管道的血缘、模式契约、时效、完整性、正确性与可复现性，不改变生产状态。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-visualize-data` — **可视化数据**: 依据问题、数据类型、单位、不确定性与无障碍需求创建一个真实准确的图表或紧凑分析视图。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-write-sql-query` — **编写SQL查询**: 基于已知模式生成一条可审查SQL查询，明确语义、安全参数、边界情况与验证说明，但不执行。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
