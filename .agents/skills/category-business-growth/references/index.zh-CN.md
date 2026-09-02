# 商业与增长: 原子 Skill

改善市场、销售、营销、财务和商业决策。

## 原子 Skill

- `atom-analyze-customer-segments` — **分析客户细分**: 使用可追溯的行为、需求或经济证据细分一个明确客户市场，并说明各细分边界。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-analyze-market` — **分析市场**: 为一个商业市场问题产出有证据的分析
  - 风险: `read-only`
  - 生命周期: discover, analyze
- `atom-audit-seo` — **审计搜索优化**: 审计一个有限网站或内容集的技术、页面、信息架构与有依据的搜索机会，不修改网站。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-pricing-strategy` — **设计定价策略**: 基于价值、支付意愿、成本、替代方案、约束与可检验假设设计一套定价和包装建议。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-model-business-financials` — **建模业务财务**: 构建一个透明业务财务模型，明确驱动因素、情景、单位经济、现金影响与敏感性检查。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-plan-content-strategy` — **规划内容策略**: 依据受众需求、业务成果、主题、渠道、节奏、治理与可衡量学习闭环规划一套连贯内容计划。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-plan-product-launch` — **规划产品发布**: 创建一份跨职能产品上市计划，包含受众、定位、渠道、就绪门槛、指标、负责人和回退措施。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-write-marketing-copy` — **撰写营销文案**: 为明确受众、产品、渠道和行动撰写一份有依据的营销素材，不虚构论断或直接发布。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
