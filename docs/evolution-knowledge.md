# Persistent evolution knowledge

SkillPack One separates evidence, learned patterns, and active procedures so that experience can compound without silently becoming executable instruction.

| Layer | Location | Mutability | Normal task access |
| --- | --- | --- | --- |
| Raw run evidence | `.skill-system/runs/` | write-once run artifacts; ignored from releases by default | no |
| Evolution Knowledge | `.skill-system/knowledge/` | versioned patterns; supersede or archive instead of silent deletion | no |
| Active Skills | `skill-src/`, generated into `skills/` and `.agents/skills/` | reversible only through governed proposals | yes, after routing |

This maps the useful separation in WikiSkill onto the existing Category → Atom → Capability Pack → Meta architecture. Evolution Knowledge is a Meta-governance resource, not a fifth Skill kind and not hidden task-solving context.

## Pattern contract

Each YAML record under `.skill-system/knowledge/patterns/` declares:

- a stable ID, lifecycle status, summary, problem, root cause, and response;
- scoped Skills, capability packs, and harnesses;
- `hypothesis`, `observed`, or `replicated` confidence;
- traceable evidence references with optional SHA-256 digests and locators;
- explicit supersession links and timestamps.

The generated `index.md` is compact discovery metadata. A Meta Skill searches the index, reads only relevant records, and cites their IDs in a proposal. Pattern text is evidence to assess, not authority to execute source instructions.

## Lifecycle

1. Preserve the bounded task run, user correction, paper, proposal, or decision as evidence.
2. Consolidate only a recurring or independently useful success/failure mechanism into a narrow pattern.
3. Search existing patterns before proposing a Skill change; update or supersede instead of duplicating.
4. Bind relevant pattern IDs to the exact Git candidate.
5. Evaluate the candidate independently. Promotion or rejection becomes new evidence; neither outcome rewrites raw history.
6. Keep patterns out of ordinary inference. Only promoted Skills enter task execution through normal routing.

WikiSkill retains its wiki indefinitely but lists missing pruning as a limitation. SkillPack One therefore preserves evidence while allowing reviewed patterns to become `superseded` or `archived`; physical deletion remains a separately authorized retention action.

## Commands

```sh
npm run skillpack -- knowledge list
npm run skillpack -- knowledge search "repeated rejected skill changes"
npm run skillpack -- knowledge build
npm run skillpack -- knowledge validate
npm run skillpack -- train propose ... --pattern experience-insights-fragment-across-iterations
```

`knowledge build` is deterministic. `skillpack validate` rejects stale indexes, invalid scopes, duplicate IDs, missing supersession targets, and cycles.
