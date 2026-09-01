# 设计与媒体: 原子 Skill

设计界面或创建、转换图像、音频和视频媒体。

## 原子 Skill

- `atom-design-interface-spec` — **设计界面规格**: 定义可直接实施的界面与交互规格
  - 风险: `reversible-write`
  - 生命周期: plan, create

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
