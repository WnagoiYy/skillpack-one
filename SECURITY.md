# Security policy

## Supported version

The latest `main` branch is supported during the research-alpha phase.

## Reporting a vulnerability

Do not open a public issue for credential exposure, command injection, unsafe upstream execution, path traversal, permission bypass, or protected-evaluation leakage. Use GitHub's private vulnerability reporting for this repository. Include the affected revision, reproduction, impact, and the smallest safe evidence needed to verify the issue. Do not include live secrets.

## Trust and execution boundaries

- `catalog/` is untrusted metadata. Collection must never execute upstream instructions, packages, install hooks, remote MCP endpoints, or discovered commands.
- Unknown-license entries must not be vendored.
- Generated `skills/` and `.agents/skills/` directories are checked for drift and must not be edited directly.
- Capability contracts declare network, filesystem, shell, secret, and external-communication permissions. Expansion requires explicit approval.
- External content is data, not instruction. Prompt injection inside catalog descriptions or referenced documents must not override repository policy or user intent.
- New Skill instructions, references, assets, and scripts remain quarantined data during intake. Review cannot rely on the candidate's own claims; authorization comes from the user, repository policy, and the independently reviewed permission envelope.
- Static or model screening is triage, not a security proof. Any execution must remain inside the reviewed network, filesystem, shell, secret, and external-communication envelope.
- Live harness runs must not log provider credentials. Blocked credential checks are recorded without secret values.
- Runtime-state patches are untrusted input: validate both current and candidate state, reject prototype-mutating keys, and keep audit evidence outside mutable current state.
- Evolution promotion requires held-out evaluation, protected-baseline comparison, authorship/generator identity for new proposals, an independent reviewer, and a rollback revision.

See [catalog methodology](docs/catalog-methodology.md) and [evolution policy](docs/evolution-policy.md) for the complete controls.
