# Code quality and delivery: Atomic Skills

Debug, test, review, optimize, and release software with explicit evidence.

## Atomic Skills

- `atom-debug-software` — **Debug software**: Reproduce, isolate, explain, and verify one software defect before proposing the smallest justified correction.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-optimize-code-performance` — **Optimize code performance**: Improve one measured software bottleneck under an explicit performance budget while preserving behavior and verifying before-and-after results.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-plan-software-release` — **Plan a software release**: Produce a release plan with versioning, compatibility, migration, staged rollout, observability, rollback, and communication checkpoints.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-review-code-quality` — **Review code quality**: Review a bounded code change for correctness, maintainability, tests, and regressions with line-located prioritized findings and no edits.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-write-automated-tests` — **Write automated tests**: Add one bounded automated test surface that proves specified behavior and fails for the intended defect without changing product behavior.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
