# Capability Pack runtime state

Runtime state is an optional execution contract for long-running Capability Packs. It does not change Skill discovery, Atom boundaries, or the agent harness by itself.

A profile declares:

- a pack-specific JSON Schema;
- a schema-valid initial state;
- deterministic JSON Merge Patch semantics;
- `external-audit-log`, meaning active context may use current state while full run evidence remains separately retained.

`skillpack compose` exposes the profile with the pack plan. The state CLI initializes, validates, or applies a patch without writing an active run:

```sh
npm run skillpack -- state init safe-skill-evolution
npm run skillpack -- state validate safe-skill-evolution current.json
npm run skillpack -- state apply safe-skill-evolution current.json patch.json
```

Both current and candidate states are validated before the candidate is returned. JSON Merge Patch preserves unspecified fields, uses `null` for deletion, replaces arrays, and rejects prototype-mutating keys. A failed patch never commits partial state.

## Applicability boundary

Use a runtime-state profile only when future decisions can safely depend on a bounded, reviewable sufficient state. Do not use it as the sole context when:

- the relevant schema must be discovered dynamically;
- an early observation may become important before its relevance can be recognized;
- the requested output is the historical trajectory itself, such as audit, debugging, provenance, or explanation;
- concurrent agents need unresolved merge semantics.

The profile is currently a portable contract and deterministic validator. Pi and Codex adapters do not yet run an end-to-end state loop, so this release makes no live accuracy, latency, or token-saving claim.
