# Catalog methodology

The catalog is evidence for classification and decomposition. It is not an installation list.

`catalog/decomposition-map.yaml` closes the loop from collection to local design. It maps every non-category local capability and every capability pack to representative catalog or downloaded-inventory IDs, records the contribution used during synthesis, and fixes the evidence to both snapshot digests. Every mapping is `design-evidence-only`: it does not copy, install, execute, or promote upstream content.

## Current snapshot

The 2026-09-02 snapshot contains 658 normalized records:

- 388 Agent Skills from ten official or established community repositories;
- 270 active latest-version MCP servers from the official MCP Registry;
- 307 records with a repository license detected from the fixed Git revision;
- 351 records whose license remains unknown and therefore cannot be vendored.

Exact counts, revisions, and the aggregate digest are recorded in `catalog/snapshots/manifest.yaml`.

The separate downloaded inventory contains 3,998 `SKILL.md` records from 41 declared repositories, of which 40 currently contain matching files. Content fingerprints identify 3,973 unique instruction bodies and 25 exact duplicates. The inventory is intentionally broader than the normalized catalog and is stored in `catalog/upstream-skill-inventory.yaml`.

## Collection rules

### Agent Skills

The collector makes a shallow, blob-filtered, no-checkout clone and lists tracked `SKILL.md` paths from `HEAD`. It records the exact commit, repository, path, author namespace, detected repository license, and freshness. It does not run hooks, package managers, scripts, or Skill instructions.

`catalog mirror-skills` maintains an ignored local Git-object cache, extracts only frontmatter metadata, computes exact-content fingerprints, marks duplicates, and applies an extensible first-pass classification. Problem solving, scientific research, software development, and software use are seed families rather than an exhaustive ontology; other families and a manual-review queue remain available.

### MCP servers

The collector consumes the unauthenticated read-only `GET /v0.1/servers` endpoint of the [official MCP Registry](https://registry.modelcontextprotocol.io/). The latest active server record is normalized and fingerprinted with SHA-256. Packages and remote endpoints are not contacted or executed.

The official registry documentation warns aggregators to persist their own snapshots and track deletion status because the preview service does not guarantee durability. This repository therefore commits a normalized snapshot and source manifest rather than depending on live availability during tests.

## Trust states

- `unreviewed`: path and provenance discovered; instructions not inspected.
- `metadata-reviewed`: registry metadata normalized; implementation not inspected.
- `statically-reviewed`: instructions and code examined without execution.
- `sandbox-tested`: isolated execution and behavior checks completed.
- `rejected`: known policy, provenance, or security failure.

Catalog presence never raises a trust state automatically. Installation requires a separate security review and explicit authority.

## License rules

Repository license detection is conservative. Apache-2.0, MIT, GPL-3.0-only, AGPL-3.0-only, and BSD-3-Clause are recognized from conventional license text. Unrecognized, missing, or conflicting licenses remain `unknown`. Unknown-license items may inform taxonomy and duplicate analysis, but their text, scripts, or assets must not be copied.

## Reproducibility

`npm run skillpack -- catalog collect` refreshes the normalized catalog. `npm run skillpack -- catalog mirror-skills --refresh` refreshes the broader downloaded inventory. The configured `verifiedAt` timestamp, fixed upstream revisions, per-entry fingerprints, and snapshot digests make changes reviewable. CI validates committed snapshots and does not require live network access.
