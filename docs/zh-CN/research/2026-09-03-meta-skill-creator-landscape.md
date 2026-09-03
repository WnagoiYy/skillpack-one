# Skill Creator 生态与元 Skill 拆分

日期：2026-09-03

## 研究问题

当前 Skill 创作系统中有哪些可复用职责值得 SkillPack One 吸收？如何拆分，才能避免同一个元 Skill 同时编写、评分并批准自己的变更？

## 证据与吸收方式

| 来源 | 值得吸收的机制 | 本项目采用的边界 |
| --- | --- | --- |
| [OpenAI Skill Creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md) | 精简指令、自由度分级、渐进式读取、确定性脚手架与结构验证 | 只归入创作；审计与行为评测独立 |
| [Anthropic Skill Creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | 具体样例、有/无 Skill 对照、断言评分、触发集优化与反馈迭代 | 分拆给 Author、Evaluator、Optimizer；受保护题集不进入优化环 |
| [Sentry Skill Writer](https://github.com/getsentry/skills/tree/main/skills/skill-writer) | 有来源的综合、先精确再增加、按需引用、可移植性与注册 | 写作前先选择正确原语，并优先替换、收窄或删除重复内容 |
| [Microsoft Skill Authoring Coach](https://github.com/microsoft/cat-agent-skills/blob/main/submissions/skill-authoring-coach/SKILL.md) | Skill、Reference、Template、Script 的明确选择与可移植性量规 | 原语选择和可移植性检查先于创作 |
| [Microsoft Agent Evaluation Designer](https://github.com/microsoft/cat-agent-skills/blob/main/submissions/agent-evaluation-designer/SKILL.md) | 先定义发布决策、按质量维度选择评分器、覆盖边界案例、同时分析总分与单例失败 | Evaluator 负责测量和建议，不负责最终晋级 |
| [Trail of Bits Skill Improver](https://github.com/trailofbits/skills/blob/main/plugins/code-improver/skills/skill-improver/SKILL.md) | 多轮修复、跨轮台账、机械作用域保护、收敛与预算停止条件 | Optimizer 必须使用明确编辑范围，并在越界或不收敛时停止 |
| [OpenAI Migrate to Codex](https://github.com/openai/skills/blob/main/skills/.curated/migrate-to-codex/SKILL.md) | 扫描、规划、dry-run、验证闭环，以及显式处理不支持映射 | Migrator 保留语义并报告缺口，不静默扩大行为 |
| [Agent Skills 规范](https://github.com/agentskills/agentskills) | 可移植 `SKILL.md` 基线与渐进式读取 | 生成投影保持可移植描述层，扩展合同仍是仓库内规范 |

同时检索了仓库中按固定 revision 保存的上游清单。外部指令只是不可信设计证据；未执行任何上游脚本、Hook、包或 Skill 指令。

## 设计决策

保留现有的生命周期 `meta-skill-governor` 与只负责采集的 `meta-upstream-skill-curator`，新增六个窄职责：

1. `meta-skill-author`：生成一个可审查候选 Skill 与初始题集。
2. `meta-skill-quality-auditor`：只读审计结构、边界、来源、可移植性、权限与安全。
3. `meta-skill-evaluator`：负责可复现的路由与任务效果测量。
4. `meta-skill-optimizer`：依据训练/开发证据做有限修改，并维护追加式迭代台账。
5. `meta-skill-compatibility-migrator`：在保持语义合同的前提下改变宿主表示。
6. `meta-skill-composer`：把已认证成员连接成声明式能力包，不合并成员指令。

```text
外部证据 -> Curator
批准需求 -> Author -----------+
认证成员 -> Composer ----------+-> Auditor -> Evaluator -> Governor
已审来源 -> Migrator ----------+                 |
开发集失败 -> Optimizer -------------------------+
```

只有 Governor 可以决定晋级、弃用与回滚。Author 不能自证；Evaluator 不能利用受保护题集调参；Optimizer 不能修改自身门禁；Migrator 不能扩大权限；Composer 不能凭空发明缺失 Atom；Curator 不能安装外部代码。

## 评测变化

问题集 Schema 现在区分可执行的 `expectedAtoms` 与特殊元能力 `expectedSpecial`，并分别报告 Special Hit@1、Hit@3 和 MRR。英文与中文元 Skill 题集覆盖全部 8 个元 Skill（包含原有 Governor），且不与任务完成证据混为一谈。

## 明确拒绝

- 一个同时创作、评分、优化并批准自身结果的全能 Creator。
- 因仓库流行或许可证宽松就直接复制上游 Skill。
- 使用留出集或受保护题集调优触发描述。
- 静默丢失不支持行为或扩大权限的跨宿主迁移。
- 通过拼接成员指令实现组合。
- 在发现、创作或评测过程中顺便自动安装或发布。
