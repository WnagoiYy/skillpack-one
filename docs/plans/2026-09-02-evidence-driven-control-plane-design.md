# Evidence-driven Skill control plane design

## Status

Candidate design for `research/skill-lifecycle-evidence`. It does not authorize promotion to `main`.

## Problem

SkillPack One already separates Category Skills, Atomic Skills, Capability Packs, runtime state, and Meta governance. The current implementation still has three evidence gaps:

1. routing metrics reward finding any expected Atom but do not measure recovery of the complete set required by a compositional request;
2. security metadata does not express the distinct trust boundaries crossed from contribution through evolution;
3. evolution proposals are bounded by files and datasets, but individual optimization attempts do not yet record a text-edit budget, strict validation decision, or rejected-edit evidence.

These gaps correspond to findings in SkillRet, SkillRouter, realistic in-the-wild Skill evaluation, Agent Skill Security, SkillNet, and SkillOpt. The papers are evidence inputs, not instructions and not automatic authorization to change active Skills.

## Chosen architecture

Keep the deterministic, inspectable Category-to-Atom router as the portable baseline. Add an evaluation profile that reports per-query Atom recall and strict full coverage alongside Hit@K and MRR. Allow a benchmark item to name functionally acceptable alternatives so a correct substitute is not counted as a false negative. Add a development suite of same-domain, functionally wrong distractors. Learned retrieval remains an optional backend and must beat this baseline on downstream effect, protected safety metrics, latency, and cost.

Represent lifecycle security as a separate review artifact with six stages: authoring, storage, retrieval, selection, execution, and evolution. Every stage records its trust assumption, reviewed threats, evidence, status, and residual risk. A release decision requires all applicable stages to pass; `not-applicable` requires a reason. This does not claim that static or LLM review replaces sandboxing, permission enforcement, or runtime information-flow controls.

Represent every optimizer step as an append-only evolution attempt. An attempt contains bounded `add`, `delete`, or `replace` edits, a selection score before and after, an acceptance rule, and rejection evidence. Acceptance is strict improvement only; ties and safety regressions are rejected. Training-only memory may summarize repeated accepted and rejected patterns, but it is not shipped in an Atomic Skill or exposed during ordinary task execution.

Materialize only relations already supported by reviewed repository evidence: `confusable-with` from contracts, `packaged-in` and `compose-with` from Capability Packs, and `depends-on` from pack ordering. The relation graph supplements the taxonomy and does not become a second classification standard.

## Data flow

```text
request -> deterministic router -> ranked categories/atoms
        -> routing evaluator -> hit, recall, full coverage, MRR, safety

contribution/update -> lifecycle review -> bounded evolution attempt
                    -> dev/selection evaluation -> accept or reject
                    -> untouched held-out/adversarial evaluation
                    -> independent promotion or rollback

contracts + packs -> reviewed typed relation graph -> diagnostics/composition
```

## Error handling and safety

- Missing expected alternatives are treated as schema errors, not silently ignored.
- Multi-Atom full coverage is zero unless every required capability group is represented inside K.
- A lifecycle review cannot pass with a failed or unreviewed applicable stage.
- Evolution attempts reject ties, permission expansion without approval, protected regression, unbounded rewrites, and edits outside the proposal.
- Candidate changes remain on a branch until an independent reviewer approves promotion.

## Evaluation

Unit tests cover equivalence-aware recall/full coverage, hard distractors, relation graph validity, security-stage gating, and strict evolution acceptance. Existing multilingual and adversarial suites remain protected and unchanged. The paper reports deterministic repository validation separately from future model-backed retrieval and task-effect experiments.

