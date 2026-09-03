# Skill 与 Agent 治理: 原子 Skill

分类、组合、评测、发布和进化 Agent 能力与 Harness。

## 原子 Skill

- `atom-classify-capability` — **分类能力**: 为一个能力产出带边界的分类与契约提案
  - 风险: `read-only`
  - 生命周期: analyze, govern

## 元 Skill

- `meta-skill-author` — **Skill 创作器**: 将一个已批准的可复用能力需求及其证据转化为最小候选 Skill 合同、说明、资源和初始评测。
  - 风险: `reversible-write`
  - 生命周期: plan, create, verify
- `meta-skill-compatibility-migrator` — **Skill 兼容迁移器**: 在受支持的 Agent 宿主之间迁移一个已审查 Skill，同时保留其语义合同、权限、来源、资源与评测意图。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform, verify
- `meta-skill-composer` — **Skill 组合器**: 将现有已认证原子与特殊 Skill 组合为声明式能力包，明确依赖、产物流、权限、状态与验收测试。
  - 风险: `reversible-write`
  - 生命周期: plan, create, verify
- `meta-skill-evaluator` — **Skill 评测器**: 为一个 Skill 或能力包设计并运行可复现的路由、不命中、对抗、任务效果、成本与延迟评测。
  - 风险: `reversible-write`
  - 生命周期: analyze, verify, govern
- `meta-skill-governor` — **元 Skill 治理器**: 提议、评测、发布、弃用和回滚受治理的 Skill 变更。
  - 风险: `reversible-write`
  - 生命周期: govern
- `meta-skill-optimizer` — **Skill 优化器**: 依据明确的训练或开发证据，在编辑、权限、收敛与回滚限制内迭代改进一个现有 Skill。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform, verify
- `meta-skill-quality-auditor` — **Skill 质量审计器**: 对一个候选或已安装 Skill 执行只读的结构、边界、来源、可移植性、权限与安全审查。
  - 风险: `read-only`
  - 生命周期: analyze, verify, govern
- `meta-upstream-skill-curator` — **上游 Skill 策展器**: 将外部 Skill 作为不可信设计证据进行发现、镜像、指纹、许可证检查、分类与去重。
  - 风险: `reversible-write`
  - 生命周期: discover, analyze, govern

只读取最终选中的原子或元 Skill；若请求包含多个独立结果，请改用能力包。
