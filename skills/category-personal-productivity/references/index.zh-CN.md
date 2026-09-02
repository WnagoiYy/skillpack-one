# 个人效率: 原子 Skill

管理个人任务、笔记、日历、记忆和注意力。

## 原子 Skill

- `atom-capture-structured-notes` — **捕获结构化笔记**: 将一组有限给定信息转换为结构化笔记，保留来源、上下文、决策、行动、链接与未决问题。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-organize-personal-tasks` — **整理个人任务**: 把零散承诺整理成有优先级的个人任务清单
  - 风险: `read-only`
  - 生命周期: plan
- `atom-plan-learning-path` — **规划学习路径**: 依据学习目标、基础、约束、资源、练习顺序、评估与复盘节奏创建一条自适应学习路径。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-schedule-personal-calendar` — **安排个人日历**: 将个人已批准事项转为避冲突日历计划，仅在明确授权并确认关键细节后创建事件。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
