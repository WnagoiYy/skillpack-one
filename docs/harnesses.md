# Harness adapters

Skill quality depends on both the Skill and the agent harness. This project records the harness identity and version on every run and does not compare results as if harness behavior were interchangeable.

## Pi — default live adapter

The repository pins `@earendil-works/pi-coding-agent` 0.84.4. The adapter uses Pi's exported `loadSkillsFromDir` implementation to validate real Skill discovery, not a project-specific approximation. Model-backed routing and task execution use the Pi CLI in non-interactive, no-session mode and load the generated `skills/` projection explicitly.

Run:

```sh
npm run skillpack -- harness status
npm run skillpack -- harness discover --adapter pi
npm run skillpack -- harness tasks --adapter pi --provider <provider> --model <model>
```

Pi credentials remain in Pi's own provider configuration. The project never reads or logs credential values. If no provider is ready, the adapter returns a typed `blocked` result; it does not replace the live score with a mock score.

## Mock — deterministic CI adapter

The Mock adapter verifies protocol wiring, dataset loading, routing metrics, rubric plumbing, and gate behavior with no network or API keys. Its result is always labeled `synthetic: true` and cannot certify model task quality.

## Codex native-layout adapter

This adapter checks `.agents/skills` discovery artifacts and projection drift. It replays deterministic route traces but intentionally does not automate private Codex UI behavior. Exported Codex traces can be added as a future evidence source.

## DeepSeek Harness (DSH) — optional adapter

The DSH adapter is disabled until a compatible CLI release is explicitly pinned. When the command is absent it reports an actionable blocker and leaves the rest of CI operational. It must implement the same discover, health, route, and execute contract before its scores can enter a release gate.

## Completion claims

Routing gates and task-completion gates are separate. A release may pass deterministic routing while remaining uncertified for live task completion. Public reports must show blocked runs, model/provider identity, rubric failures, cost, and latency rather than omitting unavailable evidence.
