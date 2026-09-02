# Governed evolution policy

Self-improvement means evidence-gated maintenance, not unrestricted self-rewriting.

Every new proposal declares a target, authorship mode, responsible author, generating model when applicable, base revision, candidate revision, rollback revision, observed failure, allowed files, actual changed files, generation datasets, evaluation datasets, permission envelopes, and approvals. Historical append-only records remain valid without retroactive mutation. Generated `skills/` and `.agents/skills/` projections may never be edited directly.

When a proposal is motivated by a recurring Evolution Knowledge pattern, it records the stable pattern ID. The pattern layer persists independently of whether the candidate is promoted or rejected, but it is never injected into ordinary task inference. See [persistent evolution knowledge](evolution-knowledge.md).

`npm run skillpack -- train propose --id <id> --target <skill-id> --observation <evidence> --author <identity> --authorship <human|model-assisted|model-generated> [--generator <model>]` scaffolds a proposal from the exact `HEAD^..HEAD` canonical Git diff. Evaluation requires `HEAD` to equal `candidateRevision`, requires the declared `changedFiles` to match that diff, and rejects tracked or unexpected untracked drift. Generated projections are reproducible artifacts and are excluded from the canonical diff.

## Hard invariants

- Test, adversarial, and task datasets cannot generate a proposal.
- A file outside the proposal boundary rejects the proposal.
- Any permission expansion requires a named, timestamped approval.
- A `meta-skill-governor` proposal cannot alter its own gate or evolution policy in the same proposal.
- Protected metrics may not regress.
- Test, adversarial, and task datasets, committed baselines, and `evals/gates.yaml` cannot change in the same candidate they certify.
- Promotion requires an append-only decision record and a distinct rollback revision.
- A human-only candidate cannot be promoted by its author; a model-assisted or model-generated candidate cannot be promoted by its generating model.
- Deletion requires a separate destructive-maintenance approval after dependency and retention checks.

Use small proposals. If taxonomy, permissions, behavior, and evaluation all change together, split the work so each causal claim remains testable.
