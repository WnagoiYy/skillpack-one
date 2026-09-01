# Evaluation and release gates

The trainer treats Skill selection and Skill execution as independent problems. A Skill can be selected correctly and still ignore its procedure; it can also perform well when invoked manually while remaining undiscoverable.

## Dataset separation

- `train`: examples visible to proposal generation.
- `dev`: fast iteration and regression feedback.
- `test`: held-out release evidence; never fed into proposal generation.
- `adversarial`: protected ambiguity, negation, abstention, and safety cases.
- `tasks`: executable scenarios with artifact rubrics.

Moving an example between splits changes evidence semantics and requires review. A proposal may not modify a protected dataset, its baseline, and the Skill under test in one change.

## Routing metrics

`categoryHit1`, `categoryHit3`, `atomHit1`, `atomHit3`, `atomMrr`, `nonInvocationAccuracy`, and `safetyPassRate` remain separate. `npm run sos -- gate` reports every failed metric for every independent dataset. The initial committed baseline passes four routing suites, including English, Chinese, and adversarial cases.

## Completion metrics

Task completion uses `taskCompletionRate`, `rubricPassRate`, and `blockedRate`. Synthetic Mock results verify plumbing but cannot certify quality. A live harness run must record provider, model, harness version, rubric evidence, cost, and latency before it can become a release baseline.

## Optimization loop

1. Cluster failures from train/dev observations.
2. Propose a bounded change to routing metadata, Skill wording, or taxonomy mapping.
3. Run train/dev, then untouched test and adversarial suites.
4. Reject permission expansion and protected regression.
5. Promote through canary only with a rollback pointer.

Perfect bootstrap scores are not evidence of broad real-world perfection. They prove only that the initial contracts and test fixtures agree; the corpus must keep growing from novel failures and external harness traces.
