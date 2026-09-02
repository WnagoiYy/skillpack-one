# Harness 适配器

Skill 的表现同时取决于 Skill 本身和 Agent Harness。每次运行都记录 Harness 名称与版本，不把不同 Harness 的结果假装成可直接互换。

## Pi：默认真实适配器

仓库固定使用 `@earendil-works/pi-coding-agent` 0.84.4。适配器直接调用 Pi 导出的 `loadSkillsFromDir` 做真实 Skill 发现校验，而不是用项目自己的近似逻辑。模型路由和任务执行通过 Pi 非交互、无会话 CLI 运行，并显式加载生成的 `skills/` 投影。

```sh
npm run skillpack -- harness status
npm run skillpack -- harness discover --adapter pi
npm run skillpack -- harness tasks --adapter pi --provider <provider> --model <model>
npm run skillpack -- harness tasks --adapter pi --provider <provider> --model <model> --skills disabled > without-skill.json
npm run skillpack -- harness tasks --adapter pi --provider <provider> --model <model> --skills enabled > with-skill.json
npm run skillpack -- harness effect without-skill.json with-skill.json
```

凭据始终由 Pi 自己管理，本项目不会读取或输出凭据值。若没有可用 Provider，适配器返回结构化 `blocked`，绝不会用 Mock 分数冒充真实分数。

## Mock：确定性 CI 适配器

Mock 在无网络、无 API Key 条件下验证协议、数据集、路由指标、Rubric 和门禁。结果始终标记 `synthetic: true`，不能证明模型的真实任务能力。

## Codex 原生目录适配器

它检查 `.agents/skills` 与生成投影是否一致，并回放确定性路由轨迹；不会依赖未公开的 Codex UI 行为自动执行任务。未来可导入 Codex 导出的轨迹作为证据。

## DeepSeek Harness（DSH）：可选适配器

在显式固定兼容 CLI 版本前，DSH 保持禁用。命令缺失时只返回可操作的阻塞原因，不影响其余 CI。只有实现相同的发现、健康、路由和执行协议后，其分数才能进入发布门禁。

## 完成情况声明

路由门禁与任务完成门禁彼此独立。确定性路由通过，并不代表真实模型任务已经认证。公开报告必须保留阻塞、模型/Provider、Rubric 失败、成本和延迟，不能省略缺失证据。

Skill 效果还要求在相同数据集和 Harness 身份下，分别提供无候选 Skill 与启用候选 Skill 的成对运行。把两次任务结果保存为 JSON 后运行 `harness effect`；不匹配运行和 Synthetic 证据都会被拒绝认证。

## Runtime-state profile

能力包可以声明可移植 runtime-state profile，但适配器不会自动执行它。当前 `skillpack state` 只认证初始状态和补丁机制。未来若某适配器声明长任务收益，就必须实现相同 Schema/合并契约，把完整审计证据保留在活动状态之外，并成对报告对话历史模式与状态模式的完成率、token、延迟和恢复指标。在此之前，不能把论文中的效率收益归因于 Pi、Codex 或 DSH。
