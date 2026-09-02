# 产品定义: 原子 Skill

在软件设计前定义用户问题、需求、验收标准与产品范围。

## 原子 Skill

- `atom-prioritize-product-roadmap` — **排定产品路线图**: 依据明确成果、证据、成本、风险、依赖与不确定性，对一组有限产品机会排序，不承诺交付日期。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-synthesize-user-research` — **综合用户研究**: 将一组有限访谈、观察或反馈综合为可追溯需求、模式、矛盾与产品启示，不虚构用户证据。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-write-product-requirements` — **编写产品需求**: 通过用户问题、范围、故事、约束、验收标准、指标与未决事项定义一个产品变更。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
