# Software design: Atomic Skills

Design system structures and interface contracts before implementation.

## Atomic Skills

- `atom-design-api-contract` — **Design an API contract**: Specify one API surface with operations, schemas, errors, compatibility, authorization, idempotency, and examples without implementing it.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-design-database-schema` — **Design a database schema**: Design one bounded data model with entities, keys, constraints, indexes, lifecycle rules, and trade-offs without migrating live data.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-design-software-architecture` — **Design software architecture**: Produce one system design with components, responsibilities, data flow, quality attributes, trade-offs, failure modes, and migration path.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-plan-database-migration` — **Plan a database migration**: Create a reversible migration plan for one schema or data change with compatibility, backfill, validation, cutover, and rollback stages.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
