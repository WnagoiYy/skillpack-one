# 受治理的进化策略

自优化指基于证据的维护，不是无限制自我改写。

每个新提案都必须声明目标、作者模式、责任作者、适用时的生成模型、基础 revision、候选 revision、回滚 revision、观察到的失败、允许文件、实际变更文件、生成数据集、评测数据集、前后权限包络和批准记录。历史追加式记录保持有效，不追溯改写。生成的 `skills/` 与 `.agents/skills/` 投影绝不能直接修改。

如果提案由重复出现的进化知识模式驱动，就必须记录稳定模式 ID。无论候选晋级还是被拒绝，模式层都独立保留，但绝不能注入普通任务推理。详见[持久化进化知识](evolution-knowledge.md)。

`npm run skillpack -- train propose --id <id> --target <skill-id> --observation <evidence> --author <identity> --authorship <human|model-assisted|model-generated> [--generator <model>]` 会依据精确的 `HEAD^..HEAD` 规范 Git 差异生成提案。评估要求 `HEAD` 等于 `candidateRevision`，要求 `changedFiles` 与 Git 差异一致，并拒绝已跟踪文件漂移或意外的未跟踪文件。生成投影是可复现产物，不计入规范差异。

## 硬性不变量

- test、adversarial 和 tasks 数据集不能参与生成提案。
- 任何超出提案边界的文件都会拒绝提案。
- 权限扩大必须有具名、带时间的批准。
- `meta-skill-governor` 不能在同一提案中修改自身和自身门禁/进化策略。
- 受保护指标不得退化。
- test、adversarial、tasks 数据集、已提交基线和 `evals/gates.yaml` 不能在认证同一候选时同时变更。
- 上线必须生成只追加的决策记录，并具备不同的回滚 revision。
- 纯人工候选不能由作者本人晋级；模型辅助或模型生成候选不能由生成模型晋级。
- 删除必须在依赖和保留检查后另行获得 destructive-maintenance 批准。

提案应尽量小。如果分类、权限、行为和评测同时变化，应拆开以保持因果可验证。
