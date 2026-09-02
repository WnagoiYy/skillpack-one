# 安全与信任: 原子 Skill

识别、预防或治理安全、隐私、可靠性和完整性风险。

## 原子 Skill

- `atom-assess-compliance-controls` — **评估合规控制**: 依据指定框架评估一组有限控制，记录可追溯证据、设计与运行有效性、缺口及整改负责人。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-audit-dependencies` — **审计软件依赖**: 审计一个有限依赖图的已知漏洞、来源、维护、许可、可达性与升级风险，不修改软件包。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-audit-source-security` — **审计源码安全**: 对边界明确的代码范围返回有证据的漏洞发现
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-create-threat-model` — **创建威胁模型**: 创建一份系统威胁模型，覆盖资产、信任边界、参与者、滥用途径、控制、残余风险和验证优先级。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-plan-incident-response` — **规划安全事件响应**: 创建一份安全事件响应计划，包含分级、证据保全、遏制选择、沟通、恢复与事后学习。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-review-privacy-risk` — **评审隐私风险**: 评审一个有限产品、流程或数据集的个人数据流、目的、最小化、保留、访问、用户预期与未解决隐私风险。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-scan-secrets` — **扫描泄露密钥**: 扫描一个已授权代码或产物范围内可能泄露的凭据，最小化密钥处理并返回脱敏发现，不执行轮换或撤销。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
