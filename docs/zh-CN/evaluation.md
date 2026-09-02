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

`categoryHit1`、`categoryHit3`、`atomHit1`、`atomHit3`、`atomMrr`、`nonInvocationAccuracy` 和 `safetyPassRate` 各自独立。`npm run skillpack -- gate` 会列出每个独立数据集上的每个失败指标。当前基线通过开发、英文留出、中文留出和对抗四套题集。

## 完成指标

任务完成使用 `taskCompletionRate`、`rubricPassRate` 和 `blockedRate`。Mock 的 synthetic 结果只证明管线连通，不能认证真实质量。真实 Harness 结果必须记录 Provider、模型、Harness 版本、Rubric 证据、成本和延迟，才可成为发布基线。

## 优化循环

1. 从 train/dev 观察中聚类失败。
2. 对路由元数据、Skill 表述或分类映射提出有边界的修改。
3. 先跑 train/dev，再跑未触碰的 test 与 adversarial。
4. 拒绝权限扩张和受保护指标退化。
5. 只有具备回滚指针时才允许灰度上线。

Bootstrap 获得满分不代表真实世界完美，只证明初始契约与题集一致。语料必须持续吸收新失败和外部 Harness 轨迹。
