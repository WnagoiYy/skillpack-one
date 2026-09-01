# Capability Classification Standard

Classify by the user's requested outcome, never by the repository name, author, or currently available tool.

## Decision order

1. Identify the durable artifact or state change.
2. Choose the domain responsible for the correctness of that artifact.
3. Record lifecycle, modality, dependency, and risk as secondary axes.
4. Test the candidate category against its exclusions and boundary examples.
5. Rank atoms inside the leading categories by positive triggers, contract fields, and negative boundaries.
6. If leading categories remain close, preserve the ambiguity and return candidates instead of forcing certainty.

## Boundary rules

- A domain can use atoms indexed by another domain without taking ownership of them.
- Product names are dependencies or tags, not top-level categories.
- A workflow with independently useful outcomes is a capability pack, not an atom.
- Security and trust properties take primary responsibility when they define success.
- Governance work on Skills, agents, MCPs, or harnesses belongs to `skill-agent-governance`; normal use stays in the task domain.
- Reclassification changes indexes, not stable capability IDs.

## Atomicity test

An atom has one primary outcome, one dominant artifact/state transition, one permission envelope, one focused rubric, and an independent failure boundary. Split only when the resulting pieces remain independently useful.

## Taxonomy evolution

A category may split or merge only when versioned evaluation data shows persistent routing confusion, overload, or a new correctness boundary. Every change requires migration notes, regenerated indexes, held-out routing tests, and a rollback pointer.
