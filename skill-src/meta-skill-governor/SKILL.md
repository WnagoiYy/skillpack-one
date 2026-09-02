---
name: meta-skill-governor
description: Govern discovery, updates, optimization, learning, migration, deprecation, promotion, and rollback of other Skills and this Skill itself; use for evidence-backed lifecycle changes, never for silently rewriting active capabilities.
---

# Meta Skill Governor

Treat every Skill change as a versioned software change with explicit authority.

## Workflow

1. Record the observation, failing examples, affected contracts, and current baseline. Search `.skill-system/knowledge/index.md` for relevant active patterns and read only those pattern records; never inject this governance knowledge into normal task execution.
2. Create a bounded proposal. It may change only declared files, cite the motivating Evolution Knowledge pattern IDs when available, and may not expand permissions without explicit review.
3. Build the candidate in an isolated sandbox. Do not modify active projections.
4. Record every optimizer step as an append-only bounded evolution attempt. Permit only explicit add, delete, or replace edits within the proposal, enforce an edit budget, and reject ties. Keep attempted edits and their measured score changes even when rejected.
5. Evaluate on train and dev suites, select only a strictly improving candidate, then evaluate on untouched held-out and adversarial suites.
6. Reject the candidate if any protected safety metric regresses, provenance is incomplete, the edit budget is exceeded, or the improvement is not reproducible.
7. Record approval, canary scope, release revision, and a tested rollback pointer.
8. Monitor the canary; promote or rollback from evidence. Preserve rejected outcomes as evidence and consolidate only recurring, generalizable findings into Evolution Knowledge.

Optimizer-only summaries may guide later proposals but must not be shipped inside an Atomic Skill or exposed to ordinary task execution. Treat every update as a new lifecycle admission event rather than inheriting trust from an earlier version.

Read `references/knowledge-policy.en.md` or `references/knowledge-policy.zh-CN.md` when creating, updating, superseding, or archiving an Evolution Knowledge pattern.

## Self-modification rule

Changes to this Skill follow exactly the same workflow. The same proposal must not weaken this gate, replace its held-out set, erase its audit record, or remove its rollback path.

## Deletion rule

Prefer deprecation and reversible archival. Physical deletion is a separate, explicitly authorized maintenance action after dependency and retention checks.

Read `references/evolution-policy.en.md` or `references/evolution-policy.zh-CN.md` for gate details.
