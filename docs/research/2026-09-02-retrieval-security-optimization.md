# Retrieval, lifecycle security, and bounded optimization

Date: 2026-09-02  
Status: evidence review for a candidate implementation; most cited work is a 2026 preprint.

## Research question

Which mechanisms from recent Agent Skill research improve SkillPack One without replacing its portable Category -> Atom -> Capability Pack -> Meta architecture or making a learned model mandatory?

## Sources inspected

- [SkillRet](https://arxiv.org/pdf/2605.05726): benchmark construction, functional-equivalence audit, taxonomy, retrieval metrics, end-to-end study, appendices, and limitations.
- [How Well Do Agentic Skills Work in the Wild](https://arxiv.org/pdf/2604.04323): collection/search design, progressive settings, refinement experiments, prompts, and conclusion.
- [Agent Skill Security](https://arxiv.org/pdf/2607.13987): threat taxonomy, trust boundaries, experimental configurations, results, and limitations.
- [SkillNet](https://arxiv.org/pdf/2603.04448): ontology, curation, five-dimensional evaluation, relation graph, composition study, failure analysis, and limitations.
- [SkillRouter](https://arxiv.org/pdf/2603.22455): body-access controls, benchmark construction, hard negatives, false-negative filtering, listwise reranking, downstream results, and limitations.
- [SkillOpt](https://arxiv.org/pdf/2605.23904): problem formulation, bounded optimizer, validation gate, rejected buffer, slow/meta update, transfer study, ablations, and conclusion.

## Evidence-to-mechanism map

| Observed gap | Evidence | Candidate mechanism | Non-claim |
| --- | --- | --- | --- |
| Multi-Atom evaluation rewards finding any one expected Atom. | SkillRet and SkillRouter distinguish Recall from strict full-set coverage and audit functional substitutes. | Equivalence-aware Atom Recall@3 and Full Coverage@3, plus same-domain hard distractors. | These deterministic metrics do not prove task success. |
| Progressive disclosure can become metadata-only retrieval. | SkillRouter and the in-the-wild study report additional signal from full Skill content. | Optional offline body-aware index/reranker that emits the existing explainable trace format. | Do not inject the whole catalog into the live prompt or require a model backend. |
| Security is described mainly at intake and execution. | Agent Skill Security identifies independent lifecycle trust boundaries and residual failures after every defense. | Six-stage review artifact with per-stage evidence and residual risk; every update re-enters admission. | A passed semantic review is not runtime authorization or information-flow proof. |
| Skill relationships are implicit across contracts and packs. | SkillNet separates taxonomy, typed relations, and packages. | Deterministically materialize reviewed `confusable-with`, `compose-with`, `depends-on`, and `packaged-in` edges. | Inferred similarity never authorizes deletion, execution, or promotion. |
| Proposal scope is bounded, but optimizer steps are not first-class evidence. | SkillOpt's strongest controls are strict validation, bounded edits, rejected feedback, and optimizer-only meta state. | Append-only evolution attempts with edit budget, strict improvement, protected regression checks, and rejected evidence. | This is a control protocol, not a reproduced SkillOpt model experiment. |
| Idealized Skill tests hide selection and adaptation failures. | The in-the-wild study separates forced load, autonomous selection, distractors, retrieval, adaptation, and no-Skill. | Future live runs record a realism profile and stage-specific availability/selection/loading/use signals. | The current Mock Harness cannot certify these stages. |

## Adoption boundary

The candidate implements deterministic schemas, gates, metrics, and typed artifacts. It does not ship a learned retriever, execute downloaded Skills, create model-generated labels for protected tests, or report the cited papers' benchmark gains as SkillPack One results. Promotion still requires independent review and live paired Skill-effect evidence where a claim concerns task utility.

## Evaluation requirements

1. Existing protected multilingual and adversarial metrics cannot regress.
2. New compositional metrics remain separate; no aggregate may hide partial coverage.
3. Lifecycle security stages fail closed when applicable evidence is missing.
4. Evolution ties are rejected and rejected attempts remain immutable evidence.
5. A learned retrieval backend must later report catalog scale, Recall/Full Coverage, downstream paired effect, latency, cost, and attack robustness against the deterministic baseline.

