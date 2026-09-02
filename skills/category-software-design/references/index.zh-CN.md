# 软件设计: 原子 Skill

在实现前设计系统结构与接口契约。

## 原子 Skill

- `atom-design-api-contract` — **设计API契约**: 定义一个API的操作、模式、错误、兼容性、授权、幂等性与示例，不实施代码。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-database-schema` — **设计数据库模式**: 设计一个有限数据模型，包含实体、键、约束、索引、生命周期规则与权衡，不迁移线上数据。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-software-architecture` — **设计软件架构**: 生成含组件、职责、数据流、质量属性、权衡、故障模式与迁移路径的系统设计。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-plan-database-migration` — **规划数据库迁移**: 为一次模式或数据变更制定可回退迁移计划，包含兼容、回填、验证、切换和回滚阶段。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
