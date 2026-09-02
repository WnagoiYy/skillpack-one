# Agent Skill 论文：证据与取舍

日期：2026-09-02  
范围：Agent Skill 的结构、检索、组合、评测、安全和受治理进化。

本文记录 SkillPack One 本轮演进采用的证据。不同论文的场景、成熟度和 Harness 并不相同，因此不能把某一项实验结果直接当作普遍规律。

## 指定文章的论文来源

微信页面本身无法访问，但用户已明确文章讨论 [WikiSkill](https://arxiv.org/pdf/2608.27454) 与 [SKILL.state](https://arxiv.org/pdf/2608.26263)。本轮已完整阅读两份 arXiv 官方 PDF，并核对架构图、结果表、消融、附录、提示词与局限。详细映射见[WikiSkill 与 SKILL.state：对 SkillPack One 的启发](2026-09-02-wikiskill-skill-state.md)。

## 证据—启发—取舍

| 证据 | 启发 | SkillPack One 的取舍 |
| --- | --- | --- |
| [WikiSkill](https://arxiv.org/pdf/2608.27454) 将不可变轨迹、持久沉淀模式与影响日志、可回滚活动 Skill 分开；消融支持让 Proposer 访问 Wiki，但不让普通推理访问。 | 经验应跨迭代积累，但不能成为隐藏解题上下文，也不能直接激活生成 Skill。 | 增加不可执行 Evolution Knowledge，包含范围、证据、检索、取代和提案引用；被拒绝干预仍保留为证据，普通任务不读取该层。 |
| [SKILL.state](https://arxiv.org/pdf/2608.26263) 以不可变规范、有界当前状态和最新观察执行长流程，每步验证状态补丁，并把历史移出活动提示。 | 长任务需要显式当前状态契约；任意截断历史不是安全替代。 | 增加能力包可选的专属 runtime-state profile，使用 JSON Schema、经验证的 JSON Merge Patch 和独立审计日志；历史本身是目标或充分状态假设不成立时不强制启用。 |
| [SkillsBench](https://arxiv.org/abs/2602.12670) 对比无 Skill、精选 Skill 和模型自生成 Skill；首版结果显示精选 Skill 平均有效，但部分任务出现负增益，自生成 Skill 平均帮助很小，聚焦的小模块优于大而全说明。 | “存在、命中、生成流畅”都不能证明 Skill 有帮助。 | 新增 with-Skill/no-Skill 成对效果记录；Synthetic 只能验证管线，不能认证增益；继续保持 Atom 小而聚焦。 |
| [Skill-Inject](https://arxiv.org/abs/2602.20156) 把 Skill 文件视为 Agent 供应链攻击面，并在基准中观察到很高的攻击成功率。 | 社区文本和脚本即使看起来有用，也仍是不可信输入；简单过滤和更强模型不是授权边界。 | 上游目录继续保持不可执行；激活前检查来源、提示注入、脚本和权限包络；生成身份与批准身份分离。 |
| [Compositional Skill Routing](https://arxiv.org/abs/2606.18051) 将复杂请求形式化为“分解→检索→组合”，并指出任务分解粒度是大型技能库的主要瓶颈。 | 多步骤任务不能只做 Top-1 Skill 检索。 | 从多个 Atom/Meta 路由信号推荐已有能力包，并把声明的依赖编译成执行阶段；不自由生成巨型 Skill 或无约束执行图。 |
| [Generative Skill Composition](https://arxiv.org/abs/2606.32025) 把 Skill 子集、数量和顺序视为一个结构化决策。 | 组合不是简单返回 Top-k。 | 能力包计划明确记录稳定 ID、数量、偏序、阶段和验收测试；未来学习型组合器也必须输出同一受约束结构。 |
| [ToolScope](https://aclanthology.org/2026.acl-long.1573/) 说明重叠工具会干扰选择，合并与上下文过滤可以改善效果。 | 重复不仅浪费目录空间，也会降低命中。 | 重复簇继续作为审查队列；只有结果与失败边界审查后才能合并，不能因相似度自动删除。 |
| [PORTS](https://aclanthology.org/2025.emnlp-main.507/) 用下游工具使用表现对齐检索器，而不只看文档相似度。 | 检索目标应是任务有效性。 | 可解释词法路由保留为可移植基线；未来语义检索必须在保留集任务增益和安全指标上证明更好。 |
| [CoEvoSkills](https://arxiv.org/abs/2604.01687) 将迭代生成器与看不到真实测试内容的验证器分离。 | 生成者不能用自己优化过的证据给自己打分。 | 提案记录作者与生成器，晋级要求独立审核，留出集和对抗集保持在候选差异之外。 |
| [SkillX](https://arxiv.org/abs/2604.04804)、[AutoSkill](https://arxiv.org/abs/2603.01145) 与 [Voyager](https://arxiv.org/abs/2305.16291) 展示了轨迹蒸馏、经验复用、课程和执行反馈。 | 经验可以在不改模型权重的情况下形成能力，但也可能固化噪声与重复。 | 轨迹只形成有边界提案：战略计划映射为能力包，功能分组映射为分类，独立复用执行单元映射为 Atom；不得直接写入活动投影。 |

## 立即采纳

1. `skillpack compose <request>` 只推荐已审查能力包，并把依赖偏序编译成确定性阶段。
2. `skillpack harness effect <without.json> <with.json>` 在相同数据集和 Harness 下测量 Skill Lift；Synthetic 证据明确不可认证。
3. 新提案记录 `human`、`model-assisted` 或 `model-generated`。纯人工提案不能由作者本人批准；模型辅助或生成提案不能由生成模型批准。
4. 社区 Skill 的指令、资源和脚本在来源、注入、权限与执行审查通过前一律视为不可信数据。
5. Evolution Knowledge 分离原始运行、跨迭代模式和活动 Skill；提案可以引用模式 ID，但普通推理不能读取模式层。
6. 能力包可以按需声明通过验证的当前状态 profile，同时在活动上下文之外保留完整审计历史。

## 暂缓

- 语义或学习型检索：只有在留出路由、任务增益、成本、延迟和安全上优于确定性基线才采用。
- Skill-aware 迭代分解：先建设受保护的组合问题集，再进行优化。
- 轨迹自动生成 Skill：在具备独立验证器与真实任务基线前只能进入隔离提案。
- 模型权重强化学习：属于重要研究方向，但不进入可移植 Skill 包核心。
- 自治轨迹沉淀与提案生成、真实 Harness 状态循环、多 Agent 状态合并和约束解码：在具备受保护长任务套件与真实证据前暂缓。

## 明确不采纳

- 用某篇论文的本体替换 Category → Atom → Capability Pack → Meta 治理。
- 安装或执行整个上游目录。
- 把相似度当成能力等价或删除授权。
- 让生成 Skill、生成者或单一总分自行认证上线。
