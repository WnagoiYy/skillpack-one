# WikiSkill and SKILL.state integration design

## Preserved architecture

- Categories route needs.
- Atomic Skills own one bounded outcome.
- Capability Packs compose stable Skill IDs and may optionally declare execution mechanics.
- Meta Skills govern evidence, proposals, promotion, deprecation, and rollback.

## Change A: persistent Evolution Knowledge

Create a non-executable pattern registry between immutable run evidence and active Skills. Patterns are scoped, evidence-backed, searchable, and supersedable. Proposals may cite pattern IDs. Ordinary inference cannot read this layer.

## Change B: bounded current execution state

Allow a Capability Pack to opt into a pack-specific JSON Schema, initial state, JSON Merge Patch, and external audit-log policy. Validate current and candidate state before returning a transition. Start with `safe-skill-evolution` rather than making an untested global runtime change.

## Rejected shortcuts

- No fifth Skill kind, universal state schema, global transcript deletion, automatic Skill activation, or model-authored self-approval.
- No claim of live token savings until a pinned harness/model runs matched long-horizon tests.

## Verification

- Schema and graph tests for knowledge records and proposal references.
- State initialization, merge preservation, invalid-patch rejection, and prototype-pollution tests.
- Capability Pack compilation includes the optional state profile.
- Full routing, projection, plugin, packaging, security, and governance gates remain green.
