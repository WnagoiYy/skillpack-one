# Evidence-driven Skill Control Plane Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add evidence-backed multi-Skill retrieval metrics, lifecycle security review, bounded evolution attempts, a minimal typed relation graph, and a publication-style system paper without weakening existing gates.

**Architecture:** Preserve the deterministic Category-to-Atom router as the portable baseline and add orthogonal, machine-readable control-plane artifacts. New mechanisms remain optional until independently promoted, while existing protected datasets and release gates stay unchanged.

**Tech Stack:** TypeScript 7, Node.js 24, Vitest, JSON Schema 2020-12, YAML, Markdown, BibTeX

---

### Task 1: Record research evidence and design boundaries

**Files:**
- Create: `docs/research/2026-09-02-retrieval-security-optimization.md`
- Create: `docs/zh-CN/research/2026-09-02-retrieval-security-optimization.md`
- Modify: `docs/research/2026-09-02-agent-skill-literature.md`
- Modify: `docs/zh-CN/research/2026-09-02-agent-skill-literature.md`

**Step 1:** Add an evidence-to-decision matrix for SkillRet, realistic in-the-wild Skill evaluation, Agent Skill Security, SkillNet, SkillRouter, and SkillOpt.

**Step 2:** Record adopted, deferred, and rejected interpretations, including each paper's stated limitations.

**Step 3:** Verify every claim against the official paper and keep direct source URLs.

### Task 2: Add equivalence-aware compositional routing metrics

**Files:**
- Modify: `src/types.ts`
- Modify: `src/eval/evaluate.ts`
- Modify: `schemas/eval-dataset.schema.json`
- Modify: `tests/eval.test.ts`
- Create: `evals/datasets/routing-hard-distractors.yaml`

**Step 1:** Write failing tests for Atom Recall@3, Full Coverage@3, and acceptable functional alternatives.

**Step 2:** Run `npm test -- tests/eval.test.ts` and confirm the new expectations fail.

**Step 3:** Add `acceptableAtomGroups` to routing examples and implement group-aware ranking, recall, and full coverage.

**Step 4:** Add a same-domain hard-distractor development suite without modifying protected datasets.

**Step 5:** Run `npm test -- tests/eval.test.ts` and confirm it passes.

### Task 3: Add lifecycle security review artifacts

**Files:**
- Create: `schemas/lifecycle-security-review.schema.json`
- Create: `src/security/lifecycle.ts`
- Create: `tests/security-lifecycle.test.ts`
- Create: `docs/security-lifecycle.md`
- Create: `docs/zh-CN/security-lifecycle.md`

**Step 1:** Write failing tests for missing stages, failed stages, unjustified `not-applicable`, and a fully passing review.

**Step 2:** Run `npm test -- tests/security-lifecycle.test.ts` and confirm failure.

**Step 3:** Implement six-stage review types and deterministic gate evaluation.

**Step 4:** Add the public JSON Schema and document that semantic review is not a runtime security boundary.

**Step 5:** Run the focused tests and schema tests.

### Task 4: Add bounded evolution attempts

**Files:**
- Create: `schemas/evolution-attempt.schema.json`
- Create: `src/train/attempts.ts`
- Modify: `src/train/types.ts`
- Modify: `skill-src/meta-skill-governor/SKILL.md`
- Create: `tests/evolution-attempts.test.ts`

**Step 1:** Write failing tests for strict improvement, tied scores, exceeded edit budgets, invalid operations, and protected regressions.

**Step 2:** Run `npm test -- tests/evolution-attempts.test.ts` and confirm failure.

**Step 3:** Implement bounded add/delete/replace attempt validation and acceptance decisions.

**Step 4:** Update the canonical Meta Skill to require rejected-attempt evidence and keep optimizer memory out of deployed Skills.

**Step 5:** Regenerate Skill projections with `npm run skills:generate` and run focused tests.

### Task 5: Materialize reviewed Skill relations

**Files:**
- Create: `schemas/skill-relation-graph.schema.json`
- Create: `src/relations.ts`
- Create: `tests/relations.test.ts`

**Step 1:** Write failing tests for `confusable-with`, `packaged-in`, `compose-with`, and ordered `depends-on` edges.

**Step 2:** Implement deterministic graph construction from contracts and Capability Packs.

**Step 3:** Reject unknown endpoints, self-relations where invalid, and contradictory dependency edges.

**Step 4:** Run focused tests.

### Task 6: Write the system paper

**Files:**
- Create: `paper/skillpack-one.md`
- Create: `paper/skillpack-one.zh-CN.md`
- Create: `paper/references.bib`
- Modify: `README.md`
- Modify: `README.zh-CN.md`

**Step 1:** Write the methodology and architecture before the abstract.

**Step 2:** Position the contribution against retrieval, composition, evolution, state, and security work.

**Step 3:** Separate implemented deterministic evidence from proposed model-backed experiments.

**Step 4:** Add limitations, threats to validity, and a reproducible evaluation protocol.

**Step 5:** Link the paper artifacts from both READMEs.

### Task 7: Validate the candidate

**Files:**
- Modify only files required by failures found above.

**Step 1:** Run `npm run skills:check`.

**Step 2:** Run `npm run typecheck`.

**Step 3:** Run `npm test`.

**Step 4:** Run `npm run build`.

**Step 5:** Run `npm run skillpack -- gate` and verify existing protected metrics do not regress.

**Step 6:** Review `git diff --check`, the candidate diff, provenance links, and rollback base.

**Step 7:** Commit the candidate on `research/skill-lifecycle-evidence`; do not promote it to `main` without independent review.

