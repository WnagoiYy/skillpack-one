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
4. Evaluate on train and dev suites, then on untouched held-out and adversarial suites.
5. Reject the candidate if any protected safety metric regresses, provenance is incomplete, or the improvement is not reproducible.
6. Record approval, canary scope, release revision, and a tested rollback pointer.
7. Monitor the canary; promote or rollback from evidence. Preserve rejected outcomes as evidence and consolidate only recurring, generalizable findings into Evolution Knowledge.

Read `references/knowledge-policy.en.md` or `references/knowledge-policy.zh-CN.md` when creating, updating, superseding, or archiving an Evolution Knowledge pattern.

## Self-modification rule

Changes to this Skill follow exactly the same workflow. The same proposal must not weaken this gate, replace its held-out set, erase its audit record, or remove its rollback path.

## Deletion rule

Prefer deprecation and reversible archival. Physical deletion is a separate, explicitly authorized maintenance action after dependency and retention checks.

Read `references/evolution-policy.en.md` or `references/evolution-policy.zh-CN.md` for gate details.
