# 自动化与运营: 原子 Skill

连接系统、调度工作、部署服务并运行可重复流程。

## 原子 Skill

- `atom-create-ci-pipeline` — **创建持续集成管道**: 创建一条仓库范围持续集成管道，包含可复现检查、最小权限、缓存、产物、失败诊断与验证。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-automation-workflow` — **设计自动化工作流**: 规定一个安全、可观测的可重复工作流
  - 风险: `reversible-write`
  - 生命周期: plan
- `atom-design-observability` — **设计可观测性**: 设计一份系统可观测性计划，包含服务目标、信号、遥测、仪表板、告警、所有权、成本与诊断流程。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-plan-cloud-deployment` — **规划云部署**: 规划一次云部署，涵盖环境、基础设施边界、身份、网络、数据、发布、可观测性、成本与回滚，但不创建资源。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-triage-production-incident` — **分诊生产故障**: 使用有限只读证据分诊一个正在发生的生产故障，确定影响、时间线、假设、遏制选项与下一项获授权行动。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-write-operational-runbook` — **编写运维手册**: 编写一份可执行运维手册，包含触发条件、前置条件、诊断、安全操作、停止条件、升级、回滚与验证。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
