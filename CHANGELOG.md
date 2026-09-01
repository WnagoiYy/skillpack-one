# Changelog

All notable changes are recorded here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [0.1.0-alpha.5] - 2026-09-02

### Fixed

- `train propose` now inherits the target Skill's declared permission envelope instead of using a lower placeholder baseline; targets without a contract still receive the least-authority default.

## [0.1.0-alpha.4] - 2026-09-02

### Added

- Ten needs-driven Category Skills, eleven Atomic Skills, and a self-governing Meta Skill.
- Codex project-native and plugin-compatible generated projections with English, `zh-CN`, and generic `zh` indexes.
- A 658-record attributed Skill/MCP catalog, duplicate candidates, and a machine-validated upstream decomposition map.
- Four composable capability packs and an explainable two-stage multilingual router.
- Separate routing and task-completion evaluation, Pi 0.84.4 and Codex discovery adapters, and an optional DSH adapter contract.
- Revision-bound `train propose`, protected evaluation gates, append-only promotion decisions, and rollback records.

### Security

- Upstream collection never executes discovered code or endpoints.
- GitHub Actions use immutable Node 24 action commits.
- Unknown-license content remains metadata-only.

[0.1.0-alpha.4]: https://github.com/WnagoiYy/self-organizing-skills/releases/tag/v0.1.0-alpha.4
[0.1.0-alpha.5]: https://github.com/WnagoiYy/self-organizing-skills/releases/tag/v0.1.0-alpha.5
