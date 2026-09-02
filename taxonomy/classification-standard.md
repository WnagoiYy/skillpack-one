# Capability Classification Standard

Classify by the user's requested outcome, never by the repository name, author, or currently available tool.

## Decision order

1. Identify the durable artifact or state change.
2. Choose the domain responsible for the correctness of that artifact.
3. Record lifecycle, modality, dependency, and risk as secondary axes.
4. Test the candidate category against its exclusions and boundary examples.
5. Rank atoms inside the leading categories by positive triggers, contract fields, and negative boundaries.
6. If leading categories remain close, preserve the ambiguity and return candidates instead of forcing certainty.

## Boundary rules

- A domain can use atoms indexed by another domain without taking ownership of them.
- Product names are dependencies or tags, not top-level categories.
- A workflow with independently useful outcomes is a capability pack, not an atom.
- Security and trust properties take primary responsibility when they define success.
- Governance work on Skills, agents, MCPs, or harnesses belongs to `skill-agent-governance`; normal use stays in the task domain.
- Reclassification changes indexes, not stable capability IDs.

## Shared description profile

- Every first-party Category, Atomic, and Meta Skill follows the same portable `SKILL.md` shape and the same machine-readable `skill.contract.yaml` schema.
- `SKILL.md` controls host discovery and progressive instructions. The contract controls capability identity, inputs, outputs, permissions, provenance, routing boundaries, and evaluation obligations.
- Localized indexes may adapt terminology and examples, but they must resolve to the same stable capability IDs and authority boundaries.

## Hierarchy and indexes

- Keep Category trees outcome-driven and no deeper than `taxonomy.maxDepth`; this implementation fixes the maximum at three Category levels. Atomic Skills are leaves and do not count toward Category depth.
- Every taxonomy node owns a Category Skill. Its generated `references/index.md` is the English fallback, with `index.en.md`, `index.zh-CN.md`, and `index.zh.md` as localized variants.
- A parent index lists direct child Categories before local Atoms. Route downward one index at a time; do not load an entire subtree into context.
- A physical nested directory tree is optional. This implementation uses flat executable Skill directories for Codex discovery and stores logical hierarchy in taxonomy parents and generated indexes.

## Atomicity test

An atom has one primary outcome, one dominant artifact/state transition, one permission envelope, one focused rubric, and an independent failure boundary. Split only when the resulting pieces remain independently useful.

## Taxonomy evolution

A category may split or merge only when versioned evaluation data shows persistent routing confusion, overload, or a new correctness boundary. Every change requires migration notes, regenerated indexes, held-out routing tests, and a rollback pointer.

Meta Skills may govern the entire registry, one Category subtree, or one Skill. Scope changes authority, not the evaluation and rollback requirements.
