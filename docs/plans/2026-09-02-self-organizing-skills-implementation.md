# Self-Organizing Skill System Implementation Plan

> This plan turns the accepted architecture into small, test-first milestones. Each task ends in a runnable check and a focused commit.

**Goal:** Publish an English-first, Chinese-localized, Codex-compatible repository that classifies, catalogs, composes, evaluates, and safely evolves atomic Agent Skills, with 300+ attributed Skill/MCP entries and a Pi-backed evaluation path.

**Architecture:** The repository root is a Codex plugin. `skill-src` is the canonical template/contract source; deterministic projections target both the plugin-required `skills` directory and the Codex project-native `.agents/skills` directory. YAML contracts feed a generated registry and category indexes. A TypeScript CLI provides validation, routing, cataloging, evaluation, training proposals, and harness adapters.

**Technology:** Node.js 24, TypeScript, npm, Vitest, YAML, JSON Schema/Ajv, Commander, Pi coding-agent package, GitHub Actions.

---

## Task 1: Bootstrap the repository and public contracts

**Files:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.codex-plugin/plugin.json`, `schemas/*.schema.json`, `src/types.ts`, `tests/schemas.test.ts`

1. Write failing schema tests for valid/invalid skill contracts, catalog records, taxonomy nodes, packs, datasets, and evaluation runs.
2. Add pinned runtime and development dependencies.
3. Implement schemas and shared TypeScript types.
4. Add the plugin manifest pointing to `.agents/skills`.
5. Run `pnpm test -- tests/schemas.test.ts` and plugin validation.
6. Commit `feat: bootstrap contracts and plugin manifest`.

## Task 2: Implement taxonomy and deterministic two-stage routing

**Files:** `taxonomy/taxonomy.yaml`, `taxonomy/classification-standard.md`, `src/registry.ts`, `src/router.ts`, `src/cli.ts`, `tests/router.test.ts`, `evals/datasets/routing-bootstrap.yaml`

1. Write failing tests for category boundaries, positive/negative triggers, multilingual prompts, ambiguity, and top-k traces.
2. Implement taxonomy loading and validation.
3. Implement weighted category and atom ranking with negative-boundary penalties.
4. Return an explainable route trace including scores and matched contract fields.
5. Add `skillpack route`, `skillpack validate`, and `skillpack taxonomy lint` commands.
6. Run focused tests and typecheck.
7. Commit `feat: add explainable two-stage router`.

## Task 3: Create Category, Atomic, and Meta Skills

**Files:** `skill-src/category-*`, `skill-src/atom-*`, `skill-src/meta-skill-governor`, `skills/*`, `.agents/skills/*`, `scripts/generate-skill-projections.ts`, `tests/skill-layout.test.ts`

1. Write failing layout tests using Codex/Agent Skills naming and frontmatter rules.
2. Create ten category Skills with localized indexes and boundary references.
3. Create a small representative atom set spanning read-only, artifact creation, verification, and governed mutation.
4. Create the meta Skill with proposal, evaluation, promotion, deprecation, and rollback procedures.
5. Generate category indexes and both compatibility projections from `skill.contract.yaml`; fail on staleness or divergence.
6. Validate every Skill with the Codex skill validator.
7. Commit `feat: add category atom and meta skills`.

## Task 4: Build the 300+ source catalog

**Files:** `catalog/sources.yaml`, `catalog/entries/*.yaml`, `src/catalog/*`, `tests/catalog.test.ts`, `docs/catalog-methodology.md`, `docs/zh-CN/catalog-methodology.md`

1. Write failing tests for provenance, immutable references, licenses, freshness, duplicate IDs, and minimum entry count.
2. Implement GitHub repository metadata collection without executing upstream code.
3. Implement importers for Agent Skills repositories, MCP registry/server lists, and plugin manifests.
4. Curate official and leading community source definitions.
5. Normalize at least 300 unique entries with source URLs, revisions, paths, types, summaries, licenses, and verification timestamps.
6. Compute contract fingerprints and near-duplicate clusters.
7. Run catalog validation and inspect a random sample.
8. Commit `feat: add attributed 300 capability catalog`.

## Task 5: Add capability packs and deduplication workflow

**Files:** `packs/*.yaml`, `src/packs.ts`, `src/deduplicate.ts`, `tests/packs.test.ts`, `tests/deduplicate.test.ts`

1. Write failing tests for dependency resolution, cycles, missing atoms/MCPs, permissions, and duplicate thresholds.
2. Implement pack resolution over stable capability IDs.
3. Implement contract-fingerprint clustering with explainable similarity components.
4. Add starter packs for software delivery, deep research, document production, and skill governance.
5. Commit `feat: compose capability packs and duplicate clusters`.

## Task 6: Implement the evaluation engine

**Files:** `src/eval/*`, `evals/datasets/*`, `evals/baselines/*`, `tests/eval.test.ts`

1. Write failing metric tests for category hit@k, atom hit@k, MRR, non-invocation, completion, safety, cost, and latency.
2. Implement deterministic dataset loading and split protection.
3. Implement metric aggregation without collapsing protected metrics into one score.
4. Implement configurable release gates and regression comparisons.
5. Create independent English, Chinese, ambiguous, adversarial, and task-completion datasets.
6. Add `skillpack eval` and `skillpack gate`.
7. Commit `feat: add multi-suite evaluation gates`.

## Task 7: Add harness adapters and Pi evaluation

**Files:** `src/harness/types.ts`, `src/harness/mock.ts`, `src/harness/pi.ts`, `src/harness/dsh.ts`, `src/harness/codex.ts`, `tests/harness.test.ts`, `docs/harnesses.md`

1. Write adapter contract tests using the mock harness.
2. Implement capability discovery, health checks, route traces, and execution traces.
3. Pin the maintained Pi package and implement structured execution behind an opt-in environment check.
4. Implement a DSH adapter stub that reports precise installation/version requirements until its pinned CLI is present.
5. Add Codex native-layout validation and trace import.
6. Run offline tests, then a real Pi smoke evaluation if provider credentials/configuration are available.
7. Commit `feat: evaluate skills through harness adapters`.

## Task 8: Add governed self-optimization

**Files:** `src/train/*`, `.skill-system/proposals/`, `.skill-system/decisions/`, `tests/trainer.test.ts`, `docs/evolution-policy.md`, `docs/zh-CN/evolution-policy.md`

1. Write failing tests proving train/test isolation, bounded diffs, permission expansion rejection, self-gate protection, and rollback.
2. Implement observation and failure clustering.
3. Generate bounded candidate patches to descriptions, triggers, boundaries, or taxonomy mappings.
4. Evaluate candidates in an isolated worktree/directory without modifying the active registry.
5. Persist signed-off decision records and promotion/rollback pointers.
6. Add `skillpack train propose`, `skillpack train evaluate`, `skillpack promote`, and `skillpack rollback`.
7. Commit `feat: add evidence-gated skill evolution`.

## Task 9: Documentation, security, and CI

**Files:** `README.md`, `README.zh-CN.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE/*`, `docs/*`

1. Document the mental model, quick start, architecture, classification rules, contribution path, catalog caveats, metrics, and roadmap in English and Chinese.
2. Add threat model, upstream trust levels, reporting policy, and safe ingestion rules.
3. Add CI for formatting, typecheck, unit/integration tests, Skill/plugin validation, generated-index drift, catalog provenance, and minimum 300 entries.
4. Add release and changelog conventions.
5. Run the complete local verification matrix.
6. Commit `docs: prepare public bilingual release`.

## Task 10: Publish the GitHub repository

1. Verify the final diff, license attribution, secrets scan, and clean test run.
2. Create the public GitHub repository `skillpack-one` under the authenticated user, with issues enabled.
3. Push `main`, add repository topics, and verify rendered READMEs and CI.
4. Create an initial prerelease only after CI passes.
5. Record the published URL and exact verified revision.

## Definition of done

- Codex discovers the repository Skills natively and the plugin validates.
- The deterministic router explains category and atom choices in English and Chinese tests.
- The normalized, attributed catalog contains at least 300 unique Skill/MCP entries.
- Category indexes are generated from contracts and current.
- Multiple independent suites report routing and completion separately.
- Pi-backed smoke evaluation runs when credentials are present; offline CI remains deterministic without them.
- Self-optimization cannot bypass held-out, safety, permission, or rollback gates.
- English and Chinese documentation are complete enough for independent adoption.
- The public GitHub repository and CI are accessible.
