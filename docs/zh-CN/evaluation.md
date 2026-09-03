# 评测与发布门禁

训练器把 Skill 命中与 Skill 执行视为两个独立问题。Skill 可能命中正确却不遵守流程，也可能手工调用时表现很好但始终无法被发现。

## 数据集隔离

- `train`：提案生成可以看到。
- `dev`：快速迭代与回归反馈。
- `test`：发布留出证据，不能输入提案生成。
- `adversarial`：受保护的歧义、否定、不调用与安全案例。
- `tasks`：带产物 Rubric 的可执行场景。

在 split 之间移动样例会改变证据含义，必须审查。同一提案不能同时修改受保护数据集、其基线和被测 Skill。

## 路由指标

`categoryHit1`、`categoryHit3`、`atomHit1`、`atomHit3`、`atomMrr`、`atomRecall3`、`atomFullCoverage3`、`specialHit1`、`specialHit3`、`specialMrr`、`nonInvocationAccuracy` 和 `safetyPassRate` 各自独立。`expectedAtoms` 与 `expectedSpecial` 也保持分离，避免把元 Skill 路由误当成可执行原子工作。`npm run skillpack -- gate` 会列出每个独立数据集上的每个失败指标。当前基线通过十套、共 202 条路由样例，覆盖开发、英文留出、中文留出、元 Skill、受保护、对抗和同领域硬干扰题集。

## 完成指标

任务完成使用 `taskCompletionRate`、`rubricPassRate` 和 `blockedRate`。Mock 的 synthetic 结果只证明管线连通，不能认证真实质量。真实 Harness 结果必须记录 Provider、模型、Harness 版本、Rubric 证据、成本和延迟，才可成为发布基线。

## 成对 Skill 效果

新 Skill 准入和重要修改必须在相同数据集、样例、Harness 与版本上分别运行 `without-skill` 和 `with-skill`。`skillpack harness effect <without.json> <with.json>` 会报告任务完成率增益、Rubric 增益、阻塞率变化，以及可用时的成本和延迟变化。默认门禁拒绝负增益、阻塞增加、没有任何正质量增益、运行身份不一致，以及所有 Synthetic 认证请求。

成对设计避免把基础模型自身能力误算为 Skill 功劳。路由改善仍单独报告，不能抵消负任务效果。

## 优化循环

1. 从 train/dev 观察中聚类失败。
2. 对路由元数据、Skill 表述或分类映射提出有边界的修改。
3. 先跑 train/dev，再跑未触碰的 test 与 adversarial。
4. 拒绝权限扩张和受保护指标退化。
5. 在匹配的真实任务运行上，把候选与无 Skill 或当前 Skill 基线比较。
6. 只有具备回滚指针时才允许灰度上线。

Bootstrap 获得满分不代表真实世界完美，只证明初始契约与题集一致。语料必须持续吸收新失败和外部 Harness 轨迹。
