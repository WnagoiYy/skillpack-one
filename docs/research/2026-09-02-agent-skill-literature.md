# Agent Skill literature: evidence and decisions

Date: 2026-09-02  
Scope: Agent Skill structure, retrieval, composition, evaluation, security, and governed evolution.

This note records evidence used to evolve SkillPack One. It is not a claim that every cited method generalizes to every agent harness. Peer-reviewed work, accepted papers, preprints, and project results are identified by their source rather than blended into one confidence level.

## Source limitation

The requested [WeChat article](https://mp.weixin.qq.com/s/nV1RC5LmEo0Ubmi9alWVfQ) could not be read by the available web extractor, search index, or permitted browser path. No article-specific claim is inferred from its URL. Once the article text or an exported PDF is available, its claims should be appended to the matrix below and checked against the same invariants.

## Evidence-to-decision matrix

| Evidence | What it supports | SkillPack One decision |
| --- | --- | --- |
| [SkillsBench](https://arxiv.org/abs/2602.12670) evaluates tasks with no Skills, curated Skills, and self-generated Skills. Its first release reports strong average lift from curated Skills, negative deltas on some tasks, negligible average benefit from self-generated Skills, and better results from focused packages than comprehensive documentation. | Existence, routing accuracy, or fluent generation does not prove that a Skill helps. | Add paired without-Skill/with-Skill effect results. Synthetic runs may test the protocol but cannot certify lift. Preserve small Atomic Skills and require a positive completion or rubric lift for admission evidence. |
| [Skill-Inject](https://arxiv.org/abs/2602.20156) treats Skill files as an agent supply-chain attack surface and reports high attack success in its benchmark. | Community text and scripts are untrusted even when a package appears useful. Simple filtering or stronger models are not an authorization boundary. | Keep catalog entries non-executable; review prompt injection, provenance, scripts, and permission envelopes before activation; separate the generating identity from the approver. |
| [Compositional Skill Routing](https://arxiv.org/abs/2606.18051) frames complex requests as decompose → retrieve → compose and finds decomposition granularity to be a major bottleneck over a large MCP-derived library. | Top-1 Skill retrieval is insufficient for multi-step tasks. Decomposition must know the available atomic boundaries. | Compile existing Capability Packs into dependency-aware stages and recommend them from multiple routed Atom/Meta signals. Do not invent a new monolithic Skill or free-form execution graph. |
| [Generative Skill Composition](https://arxiv.org/abs/2606.32025) treats subset, count, and execution order as one structured decision. | Composition is more than returning top-k independent Skills. | A pack plan explicitly records the selected stable IDs, count, partial order, stages, and acceptance tests. A future learned composer must emit the same constrained plan shape. |
| [ToolScope](https://aclanthology.org/2026.acl-long.1573/) reports that overlapping tools hurt selection and that merging/filtering can improve tool selection. | Redundancy consumes context and creates ambiguity. | Keep duplicate clustering as a review queue; merge contracts only after outcome and failure-boundary review. Similarity never authorizes deletion. |
| [PORTS](https://aclanthology.org/2025.emnlp-main.507/) aligns tool retrieval with downstream tool-use performance rather than documentation similarity alone. | A retriever should optimize usefulness, not lexical resemblance. | Retain explainable lexical routing as the portable baseline, but evaluate any future semantic retriever against downstream Skill effect and protected safety metrics. |
| [CoEvoSkills](https://arxiv.org/abs/2604.01687) separates an iterative Skill generator from a verifier that does not see ground-truth test content. | A generator must not grade itself on the evidence it optimized against. | Record authorship/generator identity, require independent promotion review, and preserve held-out/adversarial data outside the candidate diff. |
| [SkillX](https://arxiv.org/abs/2604.04804), [AutoSkill](https://arxiv.org/abs/2603.01145), and [Voyager](https://arxiv.org/abs/2305.16291) show different ways to distill trajectories, retain reusable experience, use curriculum, and refine skills from execution feedback. | Experience can seed reusable capabilities without changing model weights, but automatic accumulation can also preserve noise and duplicate behavior. | Treat traces as observations for bounded proposals. Map strategic plans to Capability Packs, functional groupings to Categories, and reusable execution units to Atoms. Never let a trace write directly into active projections. |

## Adopt now

1. `skillpack compose <request>` recommends only reviewed Capability Packs and compiles their declared ordering into deterministic stages.
2. `skillpack harness effect <without.json> <with.json>` measures paired Skill lift under the same dataset and harness identity. Synthetic evidence is explicitly non-certifying.
3. New evolution proposals record `human`, `model-assisted`, or `model-generated` authorship. Human-only proposals require a reviewer other than the author; model-assisted/generated proposals cannot be approved by the generating model.
4. Community intake explicitly treats all upstream instructions, resources, and scripts as untrusted data until provenance, injection, permission, and execution review pass.

## Defer behind evidence

- Semantic or learned retrieval: adopt only after it beats the deterministic baseline on held-out routing, paired task effect, cost, and latency without a safety regression.
- Iterative skill-aware decomposition: add after a protected compositional dataset exists; do not optimize against its test split.
- Automatic trace-to-Skill generation: keep proposals quarantined until an independent verifier and live task baselines exist.
- Model-weight reinforcement learning: useful in research such as skill-augmented RL, but outside the portable package core.

## Reject as a change of project identity

- Replacing Category → Atom → Capability Pack → Meta governance with a paper-specific ontology.
- Installing or executing the full upstream catalog.
- Treating a high similarity score as proof of equivalence or authorization to delete.
- Letting a generated Skill, its generator, or one aggregate score certify promotion.

The stopping rule for this review was evidence convergence: additional papers repeated the same themes—focused procedural modules, constrained retrieval/composition, downstream evaluation, independent verification, and supply-chain authorization—without changing the selected incremental design.
