# Lifecycle security reviews

A reusable capability crosses multiple trust boundaries before it creates an effect. SkillPack One reviews those boundaries independently instead of treating one scanner, signature, or model judgment as a universal safety decision.

| Stage | Trust assumption | Representative checks |
| --- | --- | --- |
| Authoring | The description, behavior, and requested authority agree. | hidden instructions, permission inflation, unsafe workflow construction |
| Storage | The admitted artifact remains authentic and current. | provenance, payload digest, version lineage, rollback, dependencies |
| Retrieval | Relevant candidates cannot win through manipulation alone. | keyword stuffing, semantic camouflage, Sybil duplicates, trigger poisoning |
| Selection | Planner-visible metadata faithfully represents behavior and permission. | fabricated endorsements, deceptive claims, prompt injection, permission mismatch |
| Execution | Every operation stays inside runtime authority and information-flow policy. | unauthorized tools, unsafe composition, sensitive sinks, privilege escalation |
| Evolution | An update preserves provenance, boundaries, and protected behavior. | permission escalation, instruction injection, dependency changes, publisher compromise |

Review artifacts conform to [`schemas/lifecycle-security-review.schema.json`](../schemas/lifecycle-security-review.schema.json). Validate one with:

```sh
npm run skillpack -- security check path/to/review.yaml
```

Every applicable stage must list the threats considered, traceable evidence, and residual risk. A `not-applicable` stage requires an explicit rationale. Updates re-enter the lifecycle instead of inheriting the previous version's trust.

A passing review is necessary but not sufficient. Semantic consistency checks do not authorize runtime operations, signatures do not prove benign behavior, retrieval filtering does not replace planner validation, and runtime guards may still miss implicit information flow through model transformations.

