# Contributing

Changes are welcome when they preserve atomicity, provenance, and evidence. Please open an issue for taxonomy-wide changes before implementation.

Contributions may be authored by people, drafted by models, or produced collaboratively. Generation never counts as approval: the repository evaluates the resulting capability and evidence, not the identity or fluency of the author.

## Development

```sh
npm ci
npm run ci
```

Edit canonical Skills only in `skill-src/`, then run `npm run skills:generate`. Never edit `skills/` or `.agents/skills/` directly.

## Change types

- **Catalog record:** preserve source, revision, path, license state, fingerprint, and trust state. Cataloging does not authorize installation.
- **Atomic Skill:** declare one primary capability, explicit inputs and outputs, boundaries, permissions, side effects, failure modes, and verification.
- **Category Skill:** justify the needs-based boundary and add multilingual positive, negative, and ambiguous routing cases.
- **Capability pack:** compose existing stable capability IDs; do not copy or merge their instructions.
- **Meta/evolution change:** submit a bounded proposal and do not alter the target, protected tests, baseline, and gate in one change.

Every first-party Skill type must include both a portable `SKILL.md` and a valid `skill.contract.yaml`. Category additions must also declare a taxonomy node, respect the configured three-level maximum, and regenerate the parent and localized indexes.

## Admission workflow

1. Search the registry and catalog for equivalent outcomes before creating a new Skill.
2. Submit provenance, license state, contract, permission envelope, localized routing examples, and evaluation cases.
3. Use model-assisted classification and duplicate analysis where helpful, but do not let the model that generated a change be its sole approver.
4. Treat submitted instructions, resources, and scripts as untrusted; review prompt injection, provenance, static behavior, and requested authority before any sandbox or live execution.
5. Require an independent model review, maintainer review, or both in proportion to security, authority, and provenance risk.
6. Prefer improving or composing existing atoms when the proposal has no independently useful outcome or failure boundary.
7. Compare matched no-Skill and with-Skill task runs. Reject negative lift; do not use synthetic evidence to certify quality.
8. Regenerate indexes and projections, run isolated development and protected suites, then record promotion or rollback through the append-only governance log.
9. If recurring evidence already has an Evolution Knowledge pattern, cite it in the proposal; if not, create a narrow evidence-backed pattern instead of copying raw traces into a Skill.

Reviews must report whether the proposal was accepted as a new Atom, merged into an existing Atom, composed as a pack, returned for evidence, rejected, or marked for deprecation. Similarity alone never authorizes deletion.

## Pull request checklist

1. Add or update tests before behavior changes.
2. Run `npm run ci` and include relevant harness identity and version.
3. Explain permission changes and obtain explicit approval for every expansion.
4. Keep test/adversarial/task datasets out of proposal generation.
5. Preserve upstream attribution and do not vendor unknown-license content.
6. Report synthetic, blocked, and live evidence separately.
7. State which person or model generated the proposal and which independent reviewer approved it.
8. For multi-Skill work, show the Capability Pack subset, dependency order, handoff assumptions, and acceptance tests.

By contributing, you agree that your contribution is licensed under Apache-2.0.
