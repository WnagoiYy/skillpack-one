# Documents and communication: Atomic Skills

Create or transform human-readable documents, presentations, and messages.

## Atomic Skills

- `atom-create-presentation` — **Create a presentation**: Convert approved content into a coherent slide deck with one narrative, concise slide purposes, speaker context, and verifiable structure.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-draft-external-message` — **Draft an external message**: Draft one audience-specific email, announcement, or reply with a clear purpose and requested action without sending it.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-edit-prose` — **Edit prose**: Improve one bounded text for clarity, structure, tone, and correctness without changing its supported meaning or inventing facts.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-extract-document-data` — **Extract document data**: Extract requested fields, tables, entities, and passages from one document into a structured result with page or section provenance.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-summarize-document` — **Summarize a document**: Condense one supplied document into a faithful audience-specific summary while preserving decisions, qualifications, and unresolved points.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-translate-document` — **Translate a document**: Translate one document while preserving meaning and structure
  - Risk: `reversible-write`
  - Lifecycle: transform, verify
- `atom-write-structured-report` — **Write a structured report**: Turn verified inputs into one decision-ready report with traceable claims, clear sections, limitations, and actionable conclusions.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
