# Self-Organizing Skill System: Architecture Design

**Status:** Accepted design baseline  
**Date:** 2026-09-02  
**Primary language:** English, with a maintained Chinese companion document

## 1. Vision

Build an open, Codex-compatible system that turns a large and overlapping ecosystem of Agent Skills and MCP servers into a small set of composable atomic capabilities. The collection must organize itself, explain its classifications, evaluate routing and task completion separately, evolve through evidence, and roll back safely.

The project is not another indiscriminate skill bundle. It is a skill operating system with five layers:

1. **Category skills** narrow a request to a capability domain.
2. **Atomic skills** perform one bounded capability under a declared contract.
3. **Recipes/capability packs** compose atoms and MCP dependencies into useful workflows.
4. **Meta skills** govern discovery, classification, change, evaluation, promotion, deprecation, and rollback.
5. **The trainer** measures routing, compliance, completion, regression, safety, cost, and latency before any change is promoted.

## 2. Requirements and non-goals

### Required

- Preserve native Codex Skill discovery through `.agents/skills/<skill-name>/SKILL.md`.
- Package the same source as a Codex plugin through `.codex-plugin/plugin.json`.
- Route in two conceptual stages: category, then atom.
- Define category boundaries from real user outcomes rather than repository authors or tool brands.
- Maintain an attributed catalog of at least 300 current Skills and MCP servers without blindly installing them.
- Detect duplicates and extract reusable atomic capability candidates.
- Support English-first ecosystem compatibility and Chinese localized references such as `index.zh-CN.md`; accept `*.zh.md` as a fallback alias.
- Test with question sets and at least one real agent harness. Pi is the initial default; DSH and Codex use adapters.
- Permit self-improvement only through bounded, reviewable proposals and held-out evaluation gates.

### Non-goals for the first release

- Training model weights.
- Automatically executing or installing untrusted third-party code.
- Claiming perfect taxonomy coverage.
- Forcing Codex itself to implement a hard-coded two-pass router. Category skills provide progressive disclosure, while the trainer and registry enforce and evaluate the logical two-stage model.
- Deleting historical versions. Deprecation and reversible archival are preferred.

## 3. Alternatives considered

### A. Physically nested category directories

Place atoms inside category directories and depend on the agent to discover them recursively.

**Benefit:** visually matches the category-then-atom idea.  
**Problem:** Agent Skills discovery is convention-based and nested discovery is not reliably portable across Codex and other harnesses. Moving an atom between categories also changes its identity and import path.

### B. Hybrid native projection plus registry — selected

Keep every callable Skill as a direct child of `.agents/skills`. Category Skills are ordinary Skills whose localized indexes point to atomic capabilities. Machine-readable contracts and a registry implement two-stage routing, deduplication, evaluation, and composition.

**Why selected:** native Codex compatibility, stable atom identities, plugin packaging, deterministic testing, and room for richer future routing without rewriting every Skill.

### C. Database-only dynamic router

Store all capabilities in a database and expose one universal router Skill.

**Benefit:** flexible and easy to update.  
**Problem:** weak progressive disclosure, a single routing bottleneck, reduced portability, and poor visibility in current Codex Skill UIs.

## 4. Repository layout

```text
.codex-plugin/plugin.json           Codex plugin manifest
skill-src/                           Canonical Skill templates and contracts
skills/                              Generated plugin Skill projection
.agents/skills/                      Generated native Codex project projection
catalog/
  sources.yaml                      Upstream source definitions
  entries/                          Normalized Skill/MCP metadata
  snapshots/                        Reproducible source snapshots
taxonomy/
  taxonomy.yaml                     Classification nodes and boundaries
  classification-standard.md        Human-readable decision standard
packs/                              Plugin-like recipes/capability packs
evals/
  datasets/                         Train/dev/test and adversarial question sets
  baselines/                        Versioned expected scores
src/                                Registry, router, trainer, adapters, CLI
schemas/                            JSON Schemas for contracts and catalogs
tests/                              Unit, integration, and golden tests
docs/                               English documentation
docs/zh-CN/                         Chinese documentation
```

The repository root is itself a plugin. Current plugin validation requires the plugin projection at `skills/`, while Codex project discovery uses `.agents/skills/`. A deterministic generator renders both from `skill-src/`; CI rejects projection drift. Contracts and templates are the single source of truth, while generated copies are compatibility artifacts. This is more portable than symlinks on Windows and honest about both discovery contracts.

## 5. Capability model

### 5.1 Stable identity

Every capability receives a stable, lowercase, hyphenated ID. Moving between categories does not change the ID. Category membership is metadata, not ownership.

### 5.2 Atomicity test

A Skill is atomic when all answers below are singular and independently testable:

- **Outcome:** one primary user-visible result.
- **Artifact:** one dominant artifact or state transition.
- **Authority:** one bounded permission/side-effect envelope.
- **Evaluation:** one focused completion rubric.
- **Failure boundary:** failure can be reported or retried without rerunning unrelated work.

If a Skill contains several independently useful outcomes, it becomes a recipe or is split. If splitting creates meaningless fragments that always change together, it stays atomic.

### 5.3 Contract fingerprint

Each atom has a machine-readable `skill.contract.yaml` containing:

- intent verbs and user outcomes;
- inputs, outputs, preconditions, and failure modes;
- artifacts and side effects;
- tools/MCP dependencies and permissions;
- domain, lifecycle stage, modality, risk, and locale metadata;
- positive triggers, negative boundaries, and confusable capabilities;
- provenance, license, version, and evaluation references.

Deduplication compares contract fingerprints before comparing prose. Two Skills are duplicates only when outcome, artifact, authority, and evaluation boundaries substantially coincide. Shared keywords alone are not enough.

## 6. Classification standard

Classification is multi-axial, but routing has a single primary decision rule:

1. **Primary axis: user outcome and artifact.** What durable result is requested?
2. **Domain:** software, research, knowledge, data, media, business, operations, personal productivity, or system governance.
3. **Lifecycle stage:** discover, plan, create, transform, analyze, verify, publish, operate, or govern.
4. **Modality:** code, text, document, table, slide, image, audio, video, browser state, structured data, or physical-world proxy.
5. **Dependency:** tool-agnostic, product-specific, MCP-backed, CLI-backed, or API-backed.
6. **Risk:** read-only, reversible write, external communication, financial/legal/security-sensitive, destructive, or privileged.

Category Skills describe inclusion rules, exclusions, border cases, and their atoms. An atom may appear in multiple category indexes but has one canonical contract.

The initial top-level categories are deliberately broad and outcome-oriented:

- software engineering;
- research and knowledge;
- data and analytics;
- documents and communication;
- design and media;
- business and growth;
- automation and operations;
- personal productivity;
- security and trust;
- skill and agent governance.

The taxonomy is versioned and may split or merge only when evaluation evidence shows persistent confusion or an overloaded category.

## 7. Routing and progressive disclosure

The logical flow is:

```text
request -> category candidates -> atom candidates -> recipe/dependencies -> execution
               |                      |
          category hit@k          atom hit@k/MRR
                                      |
                               completion/compliance
```

Native Codex may directly select an atom based on its description. That is valid execution but is still replayed through the logical classifier during evaluation. Category Skills exist to make broad requests discoverable and to disclose only the relevant atom index.

The deterministic baseline router uses declared triggers, negative boundaries, taxonomy terms, and contract fields. Harness adapters can add model-based routing. Both produce the same trace schema so results are comparable.

## 8. Category Skills

A Category Skill is a first-class Skill, not a folder label. It contains:

- a discriminating `SKILL.md` description;
- `references/index.en.md` and `references/index.zh-CN.md`;
- explicit inclusion/exclusion and boundary examples;
- a generated atom table with stable IDs and concise capabilities;
- instructions to read only the selected atom or recipe;
- version and taxonomy-node metadata.

Indexes are generated from contracts and checked for staleness in CI.

## 9. Meta Skill governance

`meta-skill-governor` may scan, learn, propose, evaluate, promote, deprecate, migrate, or roll back Skills—including itself—but it is not allowed to silently rewrite production Skills.

Every evolution follows:

```text
observation -> bounded proposal -> sandbox build -> train/dev evaluation
    -> held-out + adversarial gate -> human/policy approval -> canary -> promote
    -> monitor -> retain or rollback
```

Rules:

- Changes are patches with rationale and affected contracts.
- Training examples may inform a change but never count as held-out proof.
- Promotion requires no protected-metric regression and passes safety checks.
- Self-modification uses the same gate and cannot weaken its own gate in the same proposal.
- Deletion is represented as deprecation plus retention; physical removal is a separate explicit maintenance action.
- All operations produce an append-only decision record.

## 10. Plugin-oriented composition

The project borrows four plugin ideas:

- **Manifest:** explicit identity, version, entry points, dependencies, and compatibility.
- **Isolation:** atom contracts declare tools, permissions, and side effects.
- **Composition:** capability packs reference stable atom IDs rather than copying instructions.
- **Lifecycle:** install, validate, enable, update, deprecate, roll back.

A capability pack is a declarative recipe, not a new monolithic Skill. It specifies atoms, optional MCP dependencies, ordering constraints, handoff artifacts, locale, and acceptance tests. Frequently used packs may expose a thin orchestration Skill while retaining atoms as the source of truth.

## 11. Catalog of 300+ upstream capabilities

The catalog stores metadata and provenance by default, not third-party executable code. Collectors normalize:

- repository and immutable revision;
- item type (`skill`, `mcp-server`, `plugin`, `harness`);
- upstream path and author;
- summary, triggers, tools, permissions, and artifacts;
- license and security review status;
- freshness and last verification;
- extracted contract fingerprint and duplicate cluster.

The first milestone requires at least 300 unique normalized entries from current official, community, and research sources. CI rejects unattributed entries, mutable-only references, duplicate IDs, or missing licenses. Unknown licenses remain catalog-only and cannot be vendored.

## 12. Evaluation and training

Question sets are versioned and split by purpose:

- `train`: visible cases used to improve descriptions and rules;
- `dev`: frequent regression checks;
- `test`: held-out release gate;
- `adversarial`: ambiguous, multilingual, malicious, and negative-boundary cases;
- `tasks`: executable task-completion scenarios.

Metrics are intentionally separate:

- category hit@1/hit@3;
- atom hit@1/hit@3 and mean reciprocal rank;
- correct non-invocation and ambiguity calibration;
- procedural compliance;
- task completion and artifact quality;
- safety-policy adherence;
- regression delta;
- cost and latency.

Default release gates are configurable. The bootstrap target is category hit@1 >= 0.90, atom hit@1 >= 0.80, completion >= 0.80, protected safety cases = 1.00, and no protected-suite regression. A release is not certified until it passes multiple independent datasets.

The trainer optimizes declarative routing metadata and Skill wording through small candidate patches. It never treats a single aggregate score as sufficient and keeps every run reproducible.

## 13. Harness architecture

All harnesses implement one adapter contract:

```ts
interface HarnessAdapter {
  discover(): Promise<HarnessCapabilities>;
  route(example: RoutingExample): Promise<RouteTrace>;
  execute(task: TaskExample): Promise<TaskTrace>;
  healthcheck(): Promise<HealthReport>;
}
```

- **Pi adapter:** first executable integration because the maintained Node package supports programmatic and structured modes on the current host.
- **DSH adapter:** optional plugin-oriented backend; initial support targets its CLI/plugin interfaces once a stable release or pinned RC is selected.
- **Codex adapter:** validates native discovery and can replay exported traces; automated use must not depend on private UI behavior.
- **Mock adapter:** deterministic CI baseline with no API key.

Harness identity and version are part of every evaluation record because harness behavior affects routing and compliance.

## 14. Localization

English remains the canonical `SKILL.md` routing surface for maximum ecosystem compatibility. Localized detail uses adjacent files:

- `references/index.en.md`
- `references/index.zh-CN.md`
- optionally `references/index.zh.md` as a generic Chinese fallback

The locale resolver follows exact locale, base language, English, then canonical default. Localizations may adapt phrasing and examples but may not change capability boundaries, safety rules, or permissions. CI compares contract references and required headings across locales.

## 15. Security and trust

- Cataloging is not installation.
- Third-party instructions are untrusted data during ingestion.
- Collectors do not execute repository scripts.
- Network, filesystem, shell, secrets, and external messaging permissions are explicit contract fields.
- Security checks look for prompt injection, hidden downloads, credential access, destructive commands, and authority escalation.
- Provenance, license, checksum, and review status are visible before composition.
- Meta evolution cannot expand permissions without an explicit review event.

## 16. Error handling and recovery

- Ambiguous routing returns ranked candidates and an explanation rather than inventing certainty.
- Missing dependencies produce a typed blocked result with installation guidance.
- Catalog fetch failures retain the last verified snapshot and report staleness.
- Failed evolution candidates remain isolated and do not alter the active registry.
- Every promoted registry and Skill revision has a rollback pointer.
- Evaluation records distinguish infrastructure failure from capability failure.

## 17. Delivery phases

1. **Foundation:** schemas, taxonomy, registry, CLI, plugin manifest, initial category/meta/atom Skills.
2. **Evidence:** 300+ attributed catalog entries, duplicate clusters, generated category indexes.
3. **Evaluation:** bilingual routing sets, executable task suites, deterministic and Pi adapters.
4. **Evolution:** bounded proposal/training loop, gates, decision log, rollback.
5. **Ecosystem:** capability packs, DSH adapter, contribution workflow, public GitHub releases.

This design deliberately separates a grand long-term vision from verifiable increments. Each phase must leave a usable, testable system.
