# 代码质量与交付: 原子 Skill

通过明确证据调试、测试、评审、优化并发布软件。

## 原子 Skill

- `atom-debug-software` — **调试软件**: 复现、隔离、解释并验证一个软件缺陷，再提出最小合理修正。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-optimize-code-performance` — **优化代码性能**: 在明确性能预算下改进一个已测量的软件瓶颈，保持行为并验证前后结果。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-plan-software-release` — **规划软件发布**: 制定含版本、兼容性、迁移、分阶段上线、可观测性、回滚与沟通检查点的软件发布计划。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-review-code-quality` — **评审代码质量**: 对有限代码变更进行正确性、可维护性、测试与回归评审，给出定位和优先级，不修改代码。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-write-automated-tests` — **编写自动化测试**: 添加一个有界自动测试面，证明指定行为并能针对目标缺陷失败，不改变产品行为。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
