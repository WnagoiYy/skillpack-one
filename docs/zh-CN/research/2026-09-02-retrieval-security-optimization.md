# Skill 检索、生命周期安全与有界优化

日期：2026-09-02  
状态：候选实现的证据综述；所引多数工作是 2026 年预印本。

## 研究问题

如何吸收近期 Agent Skill 研究，同时不替换 SkillPack One 的 Category -> Atom -> Capability Pack -> Meta 架构，也不把学习模型变成安装前置条件？

## 精读来源

- [SkillRet](https://arxiv.org/pdf/2605.05726)：基准构造、功能等价审计、分类、检索指标、端到端实验、附录与局限。
- [How Well Do Agentic Skills Work in the Wild](https://arxiv.org/pdf/2604.04323)：Skill 收集与检索、逐级现实条件、改写实验、提示与结论。
- [Agent Skill Security](https://arxiv.org/pdf/2607.13987)：威胁分类、信任边界、实验配置、结果与局限。
- [SkillNet](https://arxiv.org/pdf/2603.04448)：本体、治理、五维评估、关系图、组合实验、失败分析与局限。
- [SkillRouter](https://arxiv.org/pdf/2603.22455)：正文信号对照、硬负样本、假负样本过滤、listwise 重排、下游实验与局限。
- [SkillOpt](https://arxiv.org/pdf/2605.23904)：问题定义、有界优化器、验证闸门、失败缓存、慢速/元更新、迁移与消融。

## 证据到机制

| 当前缺口 | 论文证据 | 候选机制 | 不做出的结论 |
| --- | --- | --- | --- |
| 多 Atom 请求只要命中任意一个就得分。 | SkillRet、SkillRouter 区分 Recall 与严格完整覆盖，并审计功能替代项。 | 增加等价感知 Atom Recall@3、Full Coverage@3 和同领域硬干扰项。 | 确定性路由指标不能证明任务成功。 |
| 渐进披露容易被误解为检索只能看元数据。 | SkillRouter 与真实环境研究都发现正文提供额外信号。 | 允许可选离线正文感知索引/重排，但继续输出统一、可解释 RouteTrace。 | 不把全库正文注入实时提示，也不强制安装模型后端。 |
| 安全主要集中在准入或执行。 | Agent Skill Security 给出相互独立的生命周期信任边界，并显示任何单一防护都有残余失败。 | 六阶段安全审查；每阶段记录证据和残余风险；更新重新准入。 | 语义审查通过不是运行时授权或信息流安全证明。 |
| Skill 关系分散在契约和能力包中。 | SkillNet 分离分类、类型化关系和发布包。 | 只从已审查数据物化 `confusable-with`、`compose-with`、`depends-on`、`packaged-in`。 | 推断相似不能授权删除、执行或晋级。 |
| 提案文件范围受控，但优化器单步不是一等证据。 | SkillOpt 的关键控制是严格验证、有界编辑、失败反馈和仅优化器可见的元状态。 | 只追加 evolution attempt，记录编辑预算、严格提升、受保护回退和拒绝证据。 | 这是控制协议，不是假称复现了 SkillOpt 模型实验。 |
| 理想化测试掩盖选择与适配失败。 | 真实环境研究区分强制加载、自主选择、干扰、检索、适配和无 Skill。 | 未来真实运行记录现实度 profile 及可用/选择/加载/使用信号。 | Mock Harness 不能认证这些阶段。 |

## 采用边界

候选版本只实现确定性的 Schema、闸门、指标和类型化产物；不提供学习型检索器，不执行下载 Skill，不用模型生成受保护测试标签，也不把论文结果冒充本项目结果。涉及任务效用的结论仍需独立审核和真实 with-Skill/no-Skill 成对证据。

