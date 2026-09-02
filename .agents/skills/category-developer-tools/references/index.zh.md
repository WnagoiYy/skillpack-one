# 开发工具: 原子 Skill

安全操作版本控制、终端、浏览器与开发者控制台。

## 原子 Skill

- `atom-operate-browser-workflow` — **操作浏览器工作流**: 从已观察页面状态完成一个有限浏览器流程，并在重要提交或通信前明确确认。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-operate-git-workflow` — **操作Git工作流**: 检查仓库状态后执行一个获授权的版本控制操作，保留无关工作并验证结果历史。
  - 风险: `reversible-write`
  - 生命周期: analyze, transform
- `atom-operate-terminal-cli` — **操作终端CLI**: 以明确工作目录、参数、副作用审查、输出捕获和验证运行一个有限命令行流程。
  - 风险: `read-only`
  - 生命周期: analyze, verify

只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。
