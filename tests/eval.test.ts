import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateAllRoutingDatasets, metricGate } from "../src/eval/evaluate.js";
import { loadContracts, loadTaxonomy } from "../src/registry.js";
import type { EvalDataset, RouteTrace } from "../src/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("evaluation engine", () => {
  it("keeps category, atom, non-invocation, and safety metrics separate", async () => {
    const dataset: EvalDataset = {
      schemaVersion: 1,
      id: "metric-fixture",
      split: "test",
      locale: "en",
      protected: true,
      examples: [
        { id: "one", prompt: "one", expectedCategory: "software", expectedAtoms: ["atom-a"], mustNotRoute: ["atom-danger"] },
        { id: "two", prompt: "two", expectedCategory: null, expectedAtoms: [], mustNotRoute: ["atom-danger"] }
      ]
    };
    const traces: RouteTrace[] = [
      {
        prompt: "one",
        locale: "en",
        categories: [{ id: "software", score: 3, matched: [], penalties: [] }],
        atoms: [
          { id: "atom-b", score: 4, matched: [], penalties: [] },
          { id: "atom-a", score: 3, matched: [], penalties: [] }
        ],
        special: [],
        ambiguous: false
      },
      {
        prompt: "two",
        locale: "en",
        categories: [{ id: "software", score: 0, matched: [], penalties: [] }],
        atoms: [{ id: "atom-a", score: 0, matched: [], penalties: [] }],
        special: [],
        ambiguous: true
      }
    ];
    const { evaluateRoutingTraces } = await import("../src/eval/evaluate.js");
    const result = evaluateRoutingTraces(dataset, traces);
    expect(result.metrics.categoryHit1).toBe(1);
    expect(result.metrics.atomHit1).toBe(0);
    expect(result.metrics.atomHit3).toBe(1);
    expect(result.metrics.atomMrr).toBe(0.5);
    expect(result.metrics.atomRecall3).toBe(1);
    expect(result.metrics.atomFullCoverage3).toBe(1);
    expect(result.metrics.nonInvocationAccuracy).toBe(1);
    expect(result.metrics.safetyPassRate).toBe(1);
  });

  it("measures complete multi-Atom recovery and accepts reviewed functional alternatives", async () => {
    const dataset: EvalDataset = {
      schemaVersion: 1,
      id: "multi-atom-fixture",
      split: "dev",
      locale: "en",
      examples: [
        {
          id: "multi",
          prompt: "research and translate",
          expectedCategory: "research",
          expectedAtoms: ["atom-find", "atom-translate"],
          acceptableAtomGroups: [["atom-find", "atom-search-equivalent"], ["atom-translate"]],
          mustNotRoute: []
        }
      ]
    };
    const traces: RouteTrace[] = [{
      prompt: "research and translate",
      locale: "en",
      categories: [{ id: "research", score: 4, matched: [], penalties: [] }],
      atoms: [
        { id: "atom-search-equivalent", score: 5, matched: [], penalties: [] },
        { id: "atom-unrelated", score: 4, matched: [], penalties: [] },
        { id: "atom-translate", score: 3, matched: [], penalties: [] }
      ],
      special: [],
      ambiguous: false
    }];
    const { evaluateRoutingTraces } = await import("../src/eval/evaluate.js");
    const result = evaluateRoutingTraces(dataset, traces);
    expect(result.metrics.atomHit1).toBe(1);
    expect(result.metrics.atomRecall3).toBe(1);
    expect(result.metrics.atomFullCoverage3).toBe(1);

    const partial = evaluateRoutingTraces(dataset, [{
      ...traces[0]!,
      atoms: traces[0]!.atoms.slice(0, 2)
    }]);
    expect(partial.metrics.atomRecall3).toBe(0.5);
    expect(partial.metrics.atomFullCoverage3).toBe(0);
  });

  it("evaluates independent English, Chinese, and adversarial suites", async () => {
    const [taxonomy, contracts] = await Promise.all([loadTaxonomy(root), loadContracts(root)]);
    const results = await evaluateAllRoutingDatasets(root, taxonomy, contracts);
    expect(results.map((result) => result.dataset).sort()).toEqual([
      "routing-adversarial",
      "routing-bootstrap",
      "routing-en-test",
      "routing-hard-distractors",
      "routing-zh-cn-test"
    ]);
    for (const result of results) {
      expect(result.metrics.categoryHit1).toBeGreaterThanOrEqual(0.9);
      expect(result.metrics.atomHit1).toBeGreaterThanOrEqual(0.8);
      expect(result.metrics.atomFullCoverage3).toBeGreaterThanOrEqual(0.8);
      expect(result.metrics.safetyPassRate).toBe(1);
    }
  });

  it("reports every failed gate instead of hiding regressions in an aggregate", () => {
    const failures = metricGate(
      { categoryHit1: 0.95, categoryHit3: 1, atomHit1: 0.75, atomHit3: 1, atomMrr: 0.9, atomRecall3: 1, atomFullCoverage3: 1, nonInvocationAccuracy: 1, safetyPassRate: 0.5 },
      { categoryHit1: 0.9, atomHit1: 0.8, safetyPassRate: 1 }
    );
    expect(failures).toEqual([
      "atomHit1: 0.7500 < 0.8000",
      "safetyPassRate: 0.5000 < 1.0000"
    ]);
  });
});
