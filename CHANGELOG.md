# Changelog

All notable changes are recorded here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [Unreleased]

### Added

- Research-backed Skill composition planning with deterministic DAG stages through `skillpack compose`.
- Paired without-Skill/with-Skill effect gates that reject synthetic certification and negative task lift.
- Authorship and generator provenance for new evolution proposals with independent-review enforcement.
- English and Chinese evidence-to-decision reviews of recent Agent Skill research.
- Evaluation assets and governance documentation in the npm package allow installed CLI gates to run outside a source checkout.

### Changed

- Community admission now treats submitted Skill instructions and scripts as quarantined data until injection, provenance, permission, and execution review pass.

## [0.1.0-alpha.7] - 2026-09-02

### Added

- A portable design-philosophy section and community/model admission workflow in both READMEs.
- Shared capability contracts for all ten Category Skills.
- Generated `index.md` fallbacks and parent-to-child Category indexing support.

### Changed

- Taxonomy validation now enforces a configurable maximum of three Category levels and requires one Category Skill contract for every taxonomy node.

## [0.1.0-alpha.6] - 2026-09-02

### Changed

- Renamed the product to **SkillPack One**, the repository and npm package to `skillpack-one`, and the CLI to `skillpack`.
- Retained **Self-Organizing Skill System** as the internal technical architecture name.
- Reframed the public promise as: "Install one pack. Let it find, combine, and improve the skills you need."

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

[0.1.0-alpha.4]: https://github.com/WnagoiYy/skillpack-one/releases/tag/v0.1.0-alpha.4
[0.1.0-alpha.5]: https://github.com/WnagoiYy/skillpack-one/releases/tag/v0.1.0-alpha.5
[0.1.0-alpha.6]: https://github.com/WnagoiYy/skillpack-one/releases/tag/v0.1.0-alpha.6
[0.1.0-alpha.7]: https://github.com/WnagoiYy/skillpack-one/releases/tag/v0.1.0-alpha.7
