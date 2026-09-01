import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { routeRequest } from "../router.js";
import type {
  EvalDataset,
  RouteTrace,
  RoutingEvaluationResult,
  RoutingMetrics,
  SkillContract,
  Taxonomy
} from "../types.js";

const ATOM_INVOCATION_THRESHOLD = 2;

function average(values: number[]): number {
  return values.length === 0 ? 1 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

function rank(ids: string[], expected: string[]): number | undefined {
  const ranks = expected
    .map((id) => ids.indexOf(id))
    .filter((index) => index >= 0)
    .map((index) => index + 1);
  return ranks.length > 0 ? Math.min(...ranks) : undefined;
}

export function evaluateRoutingTraces(dataset: EvalDataset, traces: RouteTrace[]): RoutingEvaluationResult {
  if (dataset.examples.length !== traces.length) {
    throw new Error(`Dataset ${dataset.id} has ${dataset.examples.length} examples but ${traces.length} traces`);
  }
  const categoryRanks: number[] = [];
  const atomRanks: number[] = [];
  const nonInvocation: number[] = [];
  const safety: number[] = [];
  const failures: RoutingEvaluationResult["failures"] = [];

  dataset.examples.forEach((example, index) => {
    const trace = traces[index]!;
    const categoryIds = trace.categories.map((candidate) => candidate.id);
    const atomIds = trace.atoms.map((candidate) => candidate.id);

    if (example.expectedCategory) {
      const categoryRank = categoryIds.indexOf(example.expectedCategory) + 1;
      categoryRanks.push(categoryRank > 0 ? categoryRank : Number.POSITIVE_INFINITY);
      if (categoryRank !== 1) failures.push({ exampleId: example.id, reason: `category rank ${categoryRank || "missing"}` });
    } else {
      const abstained = (trace.categories[0]?.score ?? 0) <= 0;
      nonInvocation.push(abstained ? 1 : 0);
      if (!abstained) failures.push({ exampleId: example.id, reason: "category should abstain" });
    }

    if (example.expectedAtoms.length > 0) {
      const atomRank = rank(atomIds, example.expectedAtoms);
      atomRanks.push(atomRank ?? Number.POSITIVE_INFINITY);
      if (atomRank !== 1) failures.push({ exampleId: example.id, reason: `atom rank ${atomRank ?? "missing"}` });
    } else {
      const highest = Math.max(trace.atoms[0]?.score ?? 0, trace.special[0]?.score ?? 0);
      const abstained = highest < ATOM_INVOCATION_THRESHOLD;
      nonInvocation.push(abstained ? 1 : 0);
      if (!abstained) failures.push({ exampleId: example.id, reason: "capability should abstain" });
    }

    const selected = [
      (trace.categories[0]?.score ?? 0) > 0 ? trace.categories[0]?.id : undefined,
      (trace.atoms[0]?.score ?? 0) >= ATOM_INVOCATION_THRESHOLD ? trace.atoms[0]?.id : undefined,
      (trace.special[0]?.score ?? 0) >= ATOM_INVOCATION_THRESHOLD ? trace.special[0]?.id : undefined
    ].filter((id): id is string => Boolean(id));
    const forbidden = selected.filter((id) => example.mustNotRoute.includes(id));
    safety.push(forbidden.length === 0 ? 1 : 0);
    if (forbidden.length > 0) failures.push({ exampleId: example.id, reason: `forbidden route: ${forbidden.join(", ")}` });
  });

  const metrics: RoutingMetrics = {
    categoryHit1: round(average(categoryRanks.map((value) => (value === 1 ? 1 : 0)))),
    categoryHit3: round(average(categoryRanks.map((value) => (value <= 3 ? 1 : 0)))),
    atomHit1: round(average(atomRanks.map((value) => (value === 1 ? 1 : 0)))),
    atomHit3: round(average(atomRanks.map((value) => (value <= 3 ? 1 : 0)))),
    atomMrr: round(average(atomRanks.map((value) => (Number.isFinite(value) ? 1 / value : 0)))),
    nonInvocationAccuracy: round(average(nonInvocation)),
    safetyPassRate: round(average(safety))
  };
  return {
    dataset: dataset.id,
    split: dataset.split,
    locale: dataset.locale,
    protected: dataset.protected ?? false,
    examples: dataset.examples.length,
    metrics,
    failures
  };
}

export async function loadEvalDatasets(root: string): Promise<EvalDataset[]> {
  const datasetRoot = path.join(root, "evals", "datasets");
  const files = (await readdir(datasetRoot)).filter((file) => file.endsWith(".yaml")).sort();
  return Promise.all(
    files.map(async (file) => parse(await readFile(path.join(datasetRoot, file), "utf8")) as EvalDataset)
  );
}

export async function evaluateAllRoutingDatasets(
  root: string,
  taxonomy: Taxonomy,
  contracts: SkillContract[]
): Promise<RoutingEvaluationResult[]> {
  const datasets = (await loadEvalDatasets(root)).filter((dataset) => dataset.split !== "tasks");
  return datasets.map((dataset) => {
    const traces = dataset.examples.map((example) =>
      routeRequest(example.prompt, taxonomy, contracts, { locale: dataset.locale })
    );
    return evaluateRoutingTraces(dataset, traces);
  });
}

export function metricGate(metrics: RoutingMetrics, minimum: Partial<RoutingMetrics>): string[] {
  const failures: string[] = [];
  for (const [name, threshold] of Object.entries(minimum) as Array<[keyof RoutingMetrics, number]>) {
    if (metrics[name] < threshold) failures.push(`${name}: ${metrics[name].toFixed(4)} < ${threshold.toFixed(4)}`);
  }
  return failures.sort();
}

export function datasetDigest(dataset: EvalDataset): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(dataset)).digest("hex")}`;
}
