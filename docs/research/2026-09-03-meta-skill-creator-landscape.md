# Skill-creator landscape and Meta Skill decomposition

Date: 2026-09-03

## Question

Which reusable responsibilities found in current Skill-authoring systems belong in SkillPack One, and how should they be separated so that no Meta Skill writes, grades, and approves the same change?

## Evidence reviewed

| Source | Useful mechanism | Boundary adopted here |
| --- | --- | --- |
| [OpenAI Skill Creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md) | concise instructions, degrees of freedom, progressive disclosure, deterministic scaffolding and structural validation | authoring only; independent audit and behavioral evaluation remain separate |
| [Anthropic Skill Creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | concrete examples, with-Skill versus baseline runs, assertion-based grading, trigger-set optimization and iterative feedback | split across Author, Evaluator and Optimizer; protected tests stay outside optimization |
| [Sentry Skill Writer](https://github.com/getsentry/skills/tree/main/skills/skill-writer) | source-backed synthesis, precision-before-addition, routed references, portability notes and registration | Author must decide the primitive first and remove or narrow before adding |
| [Microsoft Skill Authoring Coach](https://github.com/microsoft/cat-agent-skills/blob/main/submissions/skill-authoring-coach/SKILL.md) | explicit choice among Skill, reference, template and script; portability and packaging rubric | primitive-choice and portability checks precede authoring |
| [Microsoft Agent Evaluation Designer](https://github.com/microsoft/cat-agent-skills/blob/main/submissions/agent-evaluation-designer/SKILL.md) | define the release decision first, match graders to quality dimensions, cover edge cases, interpret aggregate and individual failures | Evaluator owns measurement and a recommendation, not final promotion |
| [Trail of Bits Skill Improver](https://github.com/trailofbits/skills/blob/main/plugins/code-improver/skills/skill-improver/SKILL.md) | iterative review/fix loop, cross-round ledger, mechanical scope guard, convergence and budget stops | Optimizer receives an explicit edit surface and must stop on scope drift or non-convergence |
| [OpenAI Migrate to Codex](https://github.com/openai/skills/blob/main/skills/.curated/migrate-to-codex/SKILL.md) | scan/plan/dry-run/validate cycle and explicit treatment of unsupported mappings | Compatibility Migrator preserves semantics and reports gaps rather than silently broadening behavior |
| [Agent Skills specification](https://github.com/agentskills/agentskills) | portable `SKILL.md` baseline and progressive disclosure | every generated projection retains the portable description layer while richer contracts remain repository-specific |

The committed upstream inventory was also queried at fixed revisions. External instructions were treated as untrusted design evidence; no upstream script, hook, package or Skill instruction was executed.

## Decision

Keep the existing lifecycle `meta-skill-governor` and acquisition-only `meta-upstream-skill-curator`, then add six narrow roles:

1. `meta-skill-author` produces one review-ready Skill candidate and starter tests.
2. `meta-skill-quality-auditor` performs a read-only structural, boundary, provenance, portability, permission and security audit.
3. `meta-skill-evaluator` owns reproducible routing and task-effect measurement.
4. `meta-skill-optimizer` makes bounded changes from train/development evidence and maintains an append-only iteration ledger.
5. `meta-skill-compatibility-migrator` changes host representation while preserving the semantic contract.
6. `meta-skill-composer` links certified members into a declarative Capability Pack without merging their instructions.

The resulting separation is:

```text
external evidence -> Curator
approved need     -> Author -----------+
certified members -> Composer ----------+-> Auditor -> Evaluator -> Governor
reviewed source   -> Migrator ----------+                 |
development failures -> Optimizer ------------------------+
```

The Governor alone owns promotion, deprecation and rollback decisions. The Author cannot certify itself; the Evaluator cannot tune against protected cases; the Optimizer cannot change its gate; the Migrator cannot broaden authority; the Composer cannot invent a missing Atom; and the Curator cannot install external code.

## Evaluation consequences

The routing dataset schema now distinguishes executable `expectedAtoms` from `expectedSpecial` Meta Skills. Special Hit@1, Hit@3 and MRR are reported independently. English and Chinese Meta routing suites cover all eight Meta Skills, including the existing Governor, and remain separate from task-completion evidence.

## Deliberately not adopted

- One omnipotent creator that authors, grades, optimizes and approves its own output.
- Copying an upstream Skill because its repository is popular or permissively licensed.
- Trigger tuning against held-out or protected cases.
- Cross-host migration that silently drops unsupported behavior or expands permissions.
- Composition by concatenating member instructions into a larger prompt.
- Automatic installation or publication as a side effect of discovery, authoring or evaluation.
