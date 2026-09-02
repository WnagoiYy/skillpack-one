# 软件设计: 原子 Skill

在实现前设计系统结构与接口契约。

## 原子 Skill

- `atom-design-api-contract` — **设计API契约**: 定义一个API的操作、模式、错误、兼容性、授权、幂等性与示例，不实施代码。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-software-architecture` — **设计软件架构**: 生成含组件、职责、数据流、质量属性、权衡、故障模式与迁移路径的系统设计。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
