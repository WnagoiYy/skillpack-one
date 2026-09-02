# 目录采集方法

这个目录为分类、拆分和组合提供证据，不是安装清单。

`catalog/decomposition-map.yaml` 补齐“采集到本地设计”的闭环：每个非分类本地能力和每个能力包都映射到代表性的通用目录或下载清单条目 ID，记录综合时采用的设计贡献，并绑定两类快照摘要。所有映射均为 `design-evidence-only`，不会复制、安装、执行或晋级上游内容。

## 当前快照

2026-09-02 快照包含 658 条规范化记录：

- 来自 10 个官方或成熟社区仓库的 388 个 Agent Skill；
- 来自官方 MCP Registry 的 270 个最新活动 MCP Server；
- 307 条从固定 Git revision 检测到仓库许可证；
- 351 条许可证仍未知，因此不能复制进本仓库或能力包。

精确数量、revision 与聚合摘要记录在 `catalog/snapshots/manifest.yaml`。

独立的下载清单包含来自 22 个已声明仓库的 1,061 条 `SKILL.md` 记录，其中 21 个仓库当前含有匹配文件。内容指纹识别出 1,055 份独立指令正文与 6 个完全重复项。该清单有意比规范化通用目录更广，保存在 `catalog/upstream-skill-inventory.yaml`。

## 采集规则

### Agent Skill

采集器使用浅层、blob 过滤且不 checkout 的只读 Git 克隆，只列出 `HEAD` 中受版本控制的 `SKILL.md` 路径。它记录固定 commit、仓库、路径、作者命名空间、检测到的仓库许可证和新鲜度；不会运行 hook、包管理器、脚本或 Skill 指令。

`catalog mirror-skills` 维护一个被 Git 忽略的本地对象缓存，只提取 frontmatter 元数据，计算精确内容指纹、标记重复项，并执行可扩展的第一轮分类。问题研究、科学研究、软件开发和软件使用只是种子分类，不是穷尽本体；系统同时保留其他类别与人工审查队列。

### MCP Server

采集器读取[官方 MCP Registry](https://registry.modelcontextprotocol.io/)无需认证的只读 `GET /v0.1/servers` 接口，规范化每个最新活动版本，并以 SHA-256 固定其元数据。不会连接或执行其中声明的包和远程端点。

官方文档提醒聚合器自行保存快照并跟踪删除状态，因为预览服务不保证持久性。因此离线测试使用仓库中提交的规范化快照，而不依赖实时服务。

## 信任状态

- `unreviewed`：只发现路径与来源，未检查指令。
- `metadata-reviewed`：已规范化注册表元数据，未检查实现。
- `statically-reviewed`：静态检查过指令和代码，未执行。
- `sandbox-tested`：已在隔离环境执行并检查行为。
- `rejected`：存在策略、来源或安全问题。

被收录不会自动提升信任等级。安装必须经过独立安全审查和显式授权。

## 许可证规则

许可证检测保持保守，只从常规许可证文本识别 Apache-2.0、MIT、GPL-3.0-only、AGPL-3.0-only 与 BSD-3-Clause。无法识别、缺失或冲突时一律标记 `unknown`。未知许可证项目可以参与分类和重复分析，但不得复制其文本、脚本或资源。

## 可复现性

运行 `npm run skillpack -- catalog collect` 刷新规范化通用目录；运行 `npm run skillpack -- catalog mirror-skills --refresh` 刷新更广的下载清单。配置的 `verifiedAt`、固定 revision、逐项指纹和快照摘要使变更可审查。CI 只校验已提交快照，不需要实时联网。
