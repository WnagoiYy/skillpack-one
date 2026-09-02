# 持久化进化知识

SkillPack One 将证据、已沉淀模式和活动过程分离，使经验可以持续积累，但不会静默变成可执行指令。

| 层 | 位置 | 可变性 | 普通任务是否读取 |
| --- | --- | --- | --- |
| 原始运行证据 | `.skill-system/runs/` | 每次运行只写一次，默认不随发行包发布 | 否 |
| 进化知识 | `.skill-system/knowledge/` | 模式受版本控制；以取代或归档代替静默删除 | 否 |
| 活动 Skill | `skill-src/`，再生成到 `skills/` 与 `.agents/skills/` | 只能通过受治理提案可逆更新 | 路由命中后读取 |

这把 WikiSkill 中有价值的分层映射到既有的 Category → Atom → Capability Pack → Meta 架构。进化知识是元治理资源，不是第五种 Skill，也不是隐藏的任务解题上下文。

## 模式契约

`.skill-system/knowledge/patterns/` 下的每个 YAML 记录必须声明：

- 稳定 ID、生命周期状态、摘要、问题、根因和应对方式；
- 适用的 Skill、能力包和 Harness；
- `hypothesis`、`observed` 或 `replicated` 置信度；
- 可追溯证据，可附 SHA-256 摘要与定位信息；
- 明确的取代关系与时间戳。

生成的 `index.md` 只提供精简发现信息。元 Skill 先检索索引，只读取相关模式，再把模式 ID 绑定到提案。模式内容是待审查证据，不是执行其来源中指令的授权。

## 生命周期

1. 将边界明确的任务运行、用户纠正、论文、提案或决策保存为证据。
2. 只有重复出现或可独立复用的成功/失败机制，才能沉淀成窄模式。
3. 提案前检索已有模式；优先更新或取代，避免重复创建。
4. 将相关模式 ID 绑定到精确 Git 候选。
5. 独立评估候选；晋级或拒绝都成为新证据，但都不能改写原始历史。
6. 普通任务不读取进化知识；只有晋级后的 Skill 才通过正常路由进入执行。

WikiSkill 将 Wiki 长期保留，同时把缺少自动清理列为局限。SkillPack One 因而保留证据，同时允许经审查的模式进入 `superseded` 或 `archived`；物理删除仍需要单独授权和保留检查。

## 命令

```sh
npm run skillpack -- knowledge list
npm run skillpack -- knowledge search "反复出现的被拒绝 Skill 修改"
npm run skillpack -- knowledge build
npm run skillpack -- knowledge validate
npm run skillpack -- train propose ... --pattern experience-insights-fragment-across-iterations
```

`knowledge build` 是确定性生成。`skillpack validate` 会拒绝过期索引、无效范围、重复 ID、缺失的取代目标和取代环。
