---
name: category-skill-agent-governance
description: Route creation, classification, deduplication, composition, evaluation, release, and evolution of Skills, MCPs, plugins, agents, and harnesses; use when the capability system itself is the object being changed or assessed.
---

# Skill and Agent Governance Router

1. Identify whether the request concerns classification, creation, evaluation, packaging, or governed evolution.
2. Read the localized Atomic Skill index in `references/`.
3. Use `meta-skill-governor` for lifecycle changes that can alter active capabilities.
4. Keep normal use of a domain Skill in that domain rather than routing everything about agents here.

No governance operation may bypass provenance, held-out evaluation, permission review, or rollback.
