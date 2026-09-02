# Data and analytics: Atomic Skills

Transform, query, model, calculate, or visualize structured data.

## Atomic Skills

- `atom-analyze-tabular-data` — **Analyze tabular data**: Answer one structured-data question with reproducible calculations
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-clean-tabular-data` — **Clean tabular data**: Normalize one structured dataset under explicit rules while preserving raw values, lineage, exceptions, and reproducible transformations.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-validate-data-pipeline` — **Validate a data pipeline**: Assess one data pipeline for lineage, schema contracts, freshness, completeness, correctness, and reproducibility without changing production state.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-visualize-data` — **Visualize data**: Create one truthful chart or compact analytical view matched to the question, data types, units, uncertainty, and accessibility needs.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-write-sql-query` — **Write a SQL query**: Produce one reviewable SQL query from a known schema with explicit semantics, safe parameters, edge cases, and validation notes without executing it.
  - Risk: `read-only`
  - Lifecycle: analyze, verify

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
