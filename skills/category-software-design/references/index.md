# Software design: Atomic Skills

Design system structures and interface contracts before implementation.

## Atomic Skills

- `atom-design-api-contract` — **Design an API contract**: Specify one API surface with operations, schemas, errors, compatibility, authorization, idempotency, and examples without implementing it.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-design-software-architecture` — **Design software architecture**: Produce one system design with components, responsibilities, data flow, quality attributes, trade-offs, failure modes, and migration path.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
