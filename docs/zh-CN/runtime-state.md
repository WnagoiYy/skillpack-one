# 能力包运行状态

运行状态是长任务能力包的可选执行契约。它本身不会改变 Skill 发现、Atom 边界或 Agent Harness。

一个 profile 声明：

- 能力包专属 JSON Schema；
- 通过 Schema 校验的初始状态；
- 确定性的 JSON Merge Patch 语义；
- `external-audit-log`：活动上下文可以只使用当前状态，但完整运行证据要在外部独立保留。

`skillpack compose` 会随能力包计划返回 profile。state CLI 可以初始化、验证或应用补丁，但不会写入活动运行：

```sh
npm run skillpack -- state init safe-skill-evolution
npm run skillpack -- state validate safe-skill-evolution current.json
npm run skillpack -- state apply safe-skill-evolution current.json patch.json
```

返回候选前，当前状态和候选状态都必须通过验证。JSON Merge Patch 保留未声明字段，以 `null` 删除字段，整体替换数组，并拒绝原型污染键。失败补丁不会提交部分状态。

## 适用边界

只有当未来决策可以安全依赖一个有界、可审查的充分状态时，才使用 runtime-state profile。以下情况不能把它作为唯一上下文：

- 相关 Schema 需要在运行中动态发现；
- 某个早期观察可能在当时无法判断其未来价值；
- 用户要的产物就是历史轨迹，例如审计、调试、来源或解释；
- 多 Agent 并发写入尚无明确合并语义。

目前它是可移植契约和确定性验证器。Pi 与 Codex 适配器尚未执行端到端状态循环，因此本版本不宣称真实准确率、延迟或 token 节省。
