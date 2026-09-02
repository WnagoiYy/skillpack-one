# 决策与评审: 原子 Skill

按标准比较方案，或依据明确量规评审产物。

## 原子 Skill

- `atom-compare-decisions` — **比较决策方案**: 根据明确的加权标准、不确定性、可逆性和决策敏感权衡比较有限方案。
  - 风险: `read-only`
  - 生命周期: analyze, verify
- `atom-critique-output` — **评审产物**: 依据明确量规评估一个产物，返回有证据定位和优先级的改进项，不直接重写。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
