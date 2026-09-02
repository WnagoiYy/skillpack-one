# Developer tools: Atomic Skills

Operate version control, terminals, browsers, and developer consoles safely.

## Atomic Skills

- `atom-operate-browser-workflow` — **Operate a browser workflow**: Complete one bounded browser procedure from observed page state with explicit confirmation before consequential submission or communication.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-operate-git-workflow` — **Operate a Git workflow**: Execute one authorized version-control operation after inspecting repository state, preserving unrelated work, and verifying the resulting history.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-operate-terminal-cli` — **Operate a terminal CLI**: Run one bounded command-line workflow with explicit working directory, arguments, side-effect review, captured output, and verification.
  - Risk: `read-only`
  - Lifecycle: analyze, verify

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
