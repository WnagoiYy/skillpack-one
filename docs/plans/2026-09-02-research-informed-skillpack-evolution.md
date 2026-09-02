# Research-informed SkillPack evolution design

## Goal

Apply convergent findings from Agent Skill research without changing SkillPack One's defining architecture: one install and governance entry point, progressive Category discovery, bounded Atomic Skills, declarative Capability Packs, and Meta Skill lifecycle control.

## Preserved invariants

- `SKILL.md` remains the portable executable discovery unit.
- Category, Atom, and Meta remain the only Skill kinds.
- Capability Packs compose stable IDs; they never absorb Atomic instructions.
- Upstream catalog content stays non-executable until separately reviewed.
- A candidate cannot change the protected evidence that certifies it.
- Generated projections remain reproducible outputs of `skill-src/`.

## Selected changes

### 1. Constrained composition

`compose <request>` reuses the existing two-stage router. It collects Atom and Meta scores, requires at least two members of a reviewed pack to cross a minimum relevance threshold, ranks matching packs, and compiles each declared partial order with a stable topological sort. The output contains selected IDs, count, missing members, execution stages, and acceptance tests. No arbitrary graph or new Skill is generated.

### 2. Paired Skill effect

`harness effect` consumes two task-result artifacts produced with the same dataset, example count, harness name, and harness version. It computes completion lift, rubric lift, blocked-rate change, and optional cost/latency change. A synthetic result can exercise the protocol but always fails certification. The initial admission gate requires non-regression plus a positive completion or rubric lift.

### 3. Independent authorship review

New proposals record authorship mode, responsible author, and—when applicable—the generating model. A human-only proposal requires a reviewer other than its author. A model-assisted or model-generated proposal rejects the generating model as reviewer. Historical append-only records are grandfathered and remain byte-stable.

## Failure handling

- Invalid or cyclic packs fail before a plan is returned.
- Requests with fewer than two relevant members return no pack recommendation and leave the normal Atom route visible.
- Mismatched task datasets, harnesses, or example counts fail effect certification.
- Missing generator identity rejects new model-assisted/generated proposals.
- Live evidence that is blocked remains blocked; Mock output is never promoted to a quality claim.

## Verification

- Unit tests cover DAG staging, request-to-pack recommendation, positive/uncertified effect comparison, schema validation, and reviewer separation.
- Existing routing, projection, schema, catalog, plugin, harness, and governance tests must remain green.
- The change follows the repository's own proposal → evaluate → independent promote workflow and retains a rollback revision.

## Deferred work

Learned retrieval, skill-aware iterative decomposition, automatic trace distillation, trust-tier enforcement, and model-weight training require larger protected datasets and live harness evidence. They are research lanes, not implicit promises in this change.
