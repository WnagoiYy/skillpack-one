# WikiSkill and SKILL.state: implications for SkillPack One

Date: 2026-09-02  
Sources: [WikiSkill](https://arxiv.org/pdf/2608.27454) v1 and [SKILL.state](https://arxiv.org/pdf/2608.26263) v2, read from the official arXiv PDFs.  
Decision question: what should SkillPack One adopt without changing Category → Atom → Capability Pack → Meta?

## Direct answer

The papers address different time scales and are complementary:

| Paper | Time scale | Main state | Best placement in SkillPack One |
| --- | --- | --- | --- |
| WikiSkill | across optimization iterations | accumulated success/failure patterns and intervention outcomes | Meta-governed Evolution Knowledge |
| SKILL.state | within one long-running execution | current future-relevant world/workflow state | optional Capability Pack runtime-state profile |

Neither finding requires a new Skill kind. Categories still route needs, Atoms retain one capability boundary, Capability Packs compose them, and Meta Skills govern lifecycle changes.

## What the papers actually show

### WikiSkill

WikiSkill separates immutable raw traces, a persistent wiki of consolidated patterns and impact logs, and reversible active Skills. Its inference agent uses active Skills but is deliberately denied wiki access; the maintainer and proposer can inspect the wiki and selected traces. Each iteration proposes one atomic Skill change and accepts it only when validation improves, while wiki knowledge persists after both accepted and rejected proposals.

The paper evaluates five benchmarks and five models. Table 1 averages three independent evolution runs and uses paired bootstrap tests with 1,000 resamples. WikiSkill has the highest reported average for every model. The most decision-relevant ablation is Table 3: with wiki access disabled for the inference agent, adding wiki access for the proposer raises the reported four-benchmark average from 48.7% to 63.7%; exposing the wiki to the inference agent lowers the default configuration from 63.7% to 60.9%.

The transfer study is a warning as well as a positive result. Evolved procedures often transfer across model families, but Table 2 includes severe negative transfer: a Qwen-3.5-4B spreadsheet Skill reduces Gemini-3.5-Flash from 50.5% without a Skill to 18.1%. The authors attribute this to small-model workarounds and fragmented diagnostics constraining a stronger model.

Material limitations: the study injects full Skills and does not test retrieval; validation splits are small; the wiki has no automatic pruning; strict immediate-improvement gating can reject enabling changes; and the suite does not cover hundreds-of-action or multi-hour execution.

### SKILL.state

SKILL.state replaces append-only conversational execution with `(immutable procedure, current structured state, latest observation)`. The model may reason within a step, but only a validated state patch and action survive. Under the paper's bounded procedure/state/observation assumption, per-step context is O(1) in horizon and cumulative prompt tokens are O(T), rather than the O(T²) accumulation of replayed history.

The paper tests a controlled two-environment SkillExecBench over five seeds plus InterCode CTF and Sierra τ-Bench. On the 100-step warehouse task, Table 1 reports 65,408 total tokens and 0.94 accuracy for SKILL.state versus 1,062,387 tokens and 0.91 for the transcript-plus-state baseline. At 200 steps it reports 122,384 tokens and 0.94 versus 5,041,164 and 0.88. On public tasks, Table 4 reports the highest completion rate for SKILL.state on InterCode CTF, τ-Bench Retail, and τ-Bench Airline, with lower cumulative tokens than the compared runtimes.

The budget-matched control matters: shortening history alone performs badly, so the reported gain is not evidence for arbitrary truncation. It supports an explicit sufficient-state representation.

Material limitations: a fixed state is unsafe when the relevant schema must be discovered dynamically, when an earlier observation's future relevance was missed, or when history itself is the requested output (audit, debugging, provenance). Multi-agent writes need conflict resolution. Smaller models also produced premature deletion/overwrite, type coercion, and malformed JSON, so deterministic merge and validation are necessary but do not prove semantic correctness.

## Adopted

1. **Evolution Knowledge, not a fifth Skill type.** `.skill-system/knowledge/` stores non-executable, scoped patterns with evidence, confidence, supersession, and a generated index. Raw runs, learned patterns, and active Skills remain separate.
2. **Knowledge for Meta governance only.** Ordinary task execution cannot read the pattern layer. Proposals cite relevant pattern IDs; accepted and rejected outcomes remain evidence.
3. **Prunable semantics with preserved provenance.** Unlike WikiSkill's never-pruned wiki, patterns may be superseded or archived. Silent deletion is forbidden.
4. **Opt-in pack runtime state.** A Capability Pack may declare a JSON Schema, initial state, JSON Merge Patch semantics, and an external audit-log policy. The first profile is `safe-skill-evolution`.
5. **Validate before commit.** Current state and candidate patches are deterministically validated; a rejected patch leaves current state unchanged. Dangerous prototype keys are rejected.
6. **History remains out-of-band, not destroyed.** The runtime prompt may use only current state, but immutable audit evidence remains available for governance, provenance, debugging, and rollback.

## Adjusted or deferred

- Automatic trace sampling, Wiki Maintainer generation, and autonomous Skill proposal loops remain deferred until live, permission-bounded task traces and an independent verifier exist.
- Runtime-state profiles are optional and pack-specific. There is no universal state schema and no forced history deletion.
- Pi and Codex adapters do not yet execute long tasks through the state loop. The current release certifies schema, patch, and composition mechanics only; it does not claim the papers' token or accuracy gains.
- Neutral enabling changes still require explicit staged evidence. They are not automatically admitted merely because WikiSkill identifies strict gating as a limitation.
- Multi-agent merge semantics, constrained decoding, semantic state verification, state telemetry, and long-horizon benchmark certification remain future work.

## Rejected

- Replacing the four-layer SkillPack architecture with either paper's ontology.
- Giving ordinary task agents direct access to Evolution Knowledge.
- Automatically promoting generated Skills or trusting one validation score.
- Treating model-specific workarounds as universally transferable procedures.
- Discarding audit history for tasks whose purpose is explanation, debugging, compliance, or provenance.

## Confidence and stopping rule

Confidence is high that the two mechanisms fit distinct existing layers because this follows directly from their system boundaries and the repository's current contracts. Confidence is moderate that they will improve real SkillPack One executions: no live Pi provider run or long-horizon pack benchmark has yet measured lift. Research stopped after reading every page, checking the principal architecture figures, result tables, ablations, prompts, appendices, and stated limitations; further secondary commentary would not change the implementation decision.
