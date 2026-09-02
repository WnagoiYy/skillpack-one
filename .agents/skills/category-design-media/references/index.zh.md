# 设计与媒体: 原子 Skill

设计界面或创建、转换图像、音频和视频媒体。

## 原子 Skill

- `atom-create-technical-diagram` — **创建技术图**: 依据已验证组件和关系创建一份准确可编辑技术图，明确视角、图例、范围与无障碍标签。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-design-interface-spec` — **设计界面规格**: 定义可直接实施的界面与交互规格
  - 风险: `reversible-write`
  - 生命周期: plan, create
- `atom-design-presentation-visuals` — **设计演示视觉**: 为已批准幻灯片内容定义并应用一套连贯视觉系统，包括层级、版式、字体、颜色、图像、图表与无障碍。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-edit-image` — **编辑图像**: 对一张给定图像执行有限变换，同时保留要求的主体身份、内容、尺寸、来源与未编辑区域。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-generate-image` — **生成图像**: 依据有限视觉简报生成一张原创位图，明确构图、风格、约束、权利感知参考与验收检查。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-plan-video-production` — **规划视频制作**: 规划一支视频，从受众和信息到脚本节拍、镜头、素材、制作约束、无障碍、审查与交付规格。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
