# Security and trust: Atomic Skills

Identify, prevent, or govern security, privacy, safety, and integrity risks.

## Atomic Skills

- `atom-assess-compliance-controls` — **Assess compliance controls**: Assess one bounded control set against a named framework using traceable evidence, design and operating effectiveness, gaps, and remediation ownership.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-audit-dependencies` — **Audit software dependencies**: Audit one bounded dependency graph for known vulnerabilities, provenance, maintenance, licensing, reachability, and upgrade risk without changing packages.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-audit-source-security` — **Audit source security**: Return evidence-backed vulnerability findings for a bounded code surface
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-create-threat-model` — **Create a threat model**: Create one system threat model covering assets, trust boundaries, actors, abuse paths, controls, residual risk, and verification priorities.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-plan-incident-response` — **Plan security incident response**: Create one security incident response plan with classification, evidence preservation, containment choices, communications, recovery, and post-incident learning.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-review-privacy-risk` — **Review privacy risk**: Review one bounded product, workflow, or dataset for personal-data flows, purpose, minimization, retention, access, user expectations, and unresolved privacy risk.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-scan-secrets` — **Scan for exposed secrets**: Scan one authorized code or artifact scope for likely exposed credentials, minimize secret handling, and return redacted findings without rotating or revoking anything.
  - Risk: `read-only`
  - Lifecycle: analyze, verify

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
