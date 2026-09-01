# Contributing

Changes are welcome when they preserve atomicity, provenance, and evidence. Please open an issue for taxonomy-wide changes before implementation.

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

## Pull request checklist

1. Add or update tests before behavior changes.
2. Run `npm run ci` and include relevant harness identity and version.
3. Explain permission changes and obtain explicit approval for every expansion.
4. Keep test/adversarial/task datasets out of proposal generation.
5. Preserve upstream attribution and do not vendor unknown-license content.
6. Report synthetic, blocked, and live evidence separately.

By contributing, you agree that your contribution is licensed under Apache-2.0.
