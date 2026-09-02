# 软件工程: 原子 Skill

创建、修改、验证、发布或运行可执行的软件产物。

## 子分类

- `category-code-quality-delivery` — **代码质量与交付**: 通过明确证据调试、测试、评审、优化并发布软件。
- `category-product-definition` — **产品定义**: 在软件设计前定义用户问题、需求、验收标准与产品范围。
- `category-software-design` — **软件设计**: 在实现前设计系统结构与接口契约。

## 原子 Skill

- `atom-audit-source-security` — **审计源码安全**: 对边界明确的代码范围返回有证据的漏洞发现
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-implement-code-change` — **实现代码修改**: 编辑并验证一个边界清晰的软件行为
  - 风险: `reversible-write`
  - 生命周期: create, verify
- `atom-plan-code-change` — **规划代码修改**: 在不修改源码的前提下产出可实施计划
  - 风险: `read-only`
  - 生命周期: plan

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
