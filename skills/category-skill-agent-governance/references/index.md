# Skill and agent governance: Atomic Skills

Classify, compose, evaluate, release, and evolve agent capabilities and harnesses.

## Atomic Skills

- `atom-classify-capability` — **Classify a capability**: Produce a boundary-aware taxonomy and contract proposal for one capability
  - Risk: `read-only`
  - Lifecycle: analyze, govern

## Meta Skills

- `meta-skill-author` — **Skill Author**: Turn one approved reusable capability need and its evidence into a minimal candidate Skill contract, instructions, resources, and starter evaluations.
  - Risk: `reversible-write`
  - Lifecycle: plan, create, verify
- `meta-skill-compatibility-migrator` — **Skill Compatibility Migrator**: Translate one reviewed Skill between supported agent hosts while preserving its semantic contract, authority, provenance, resources, and evaluation intent.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform, verify
- `meta-skill-composer` — **Skill Composer**: Compose existing certified Atomic and special Skills into a declarative capability pack with explicit dependencies, artifact flow, authority, state, and acceptance tests.
  - Risk: `reversible-write`
  - Lifecycle: plan, create, verify
- `meta-skill-evaluator` — **Skill Evaluator**: Design and run reproducible routing, non-invocation, adversarial, task-effect, cost, and latency evaluations for one Skill or capability pack.
  - Risk: `reversible-write`
  - Lifecycle: analyze, verify, govern
- `meta-skill-governor` — **Meta Skill Governor**: Propose, evaluate, release, deprecate, and roll back governed Skill changes.
  - Risk: `reversible-write`
  - Lifecycle: govern
- `meta-skill-optimizer` — **Skill Optimizer**: Iteratively improve one existing Skill from explicit train or development evidence under edit, permission, convergence, and rollback limits.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform, verify
- `meta-skill-quality-auditor` — **Skill Quality Auditor**: Perform a read-only structural, boundary, provenance, portability, permission, and security review of one Skill candidate or installed Skill.
  - Risk: `read-only`
  - Lifecycle: analyze, verify, govern
- `meta-upstream-skill-curator` — **Upstream Skill Curator**: Discover, mirror, fingerprint, license-check, classify, and deduplicate external Skills as untrusted design evidence.
  - Risk: `reversible-write`
  - Lifecycle: discover, analyze, govern

Read only the selected Atomic or Meta Skill. Use a capability pack when the request has independently useful outcomes.
