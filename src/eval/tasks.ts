import type { ExecutionOptions, HarnessAdapter, TaskExample } from "../harness/types.js";
import type { EvalDataset, TaskEvaluationResult } from "../types.js";
import { loadEvalDatasets } from "./evaluate.js";

function round(value: number): number {
  return Number(value.toFixed(4));
}

export async function evaluateTaskDataset(
  dataset: EvalDataset,
  adapter: HarnessAdapter,
  synthetic = false,
  executionOptions: ExecutionOptions = { skills: "enabled" }
): Promise<TaskEvaluationResult> {
  if (dataset.split !== "tasks") throw new Error(`${dataset.id} is not a task dataset`);
  const capabilities = await adapter.discover();
  const failures: TaskEvaluationResult["failures"] = [];
  let completed = 0;
  let blocked = 0;
  let rubricPassed = 0;
  let rubricTotal = 0;
  let totalDurationMs = 0;
  const costs: number[] = [];

  for (const example of dataset.examples) {
    if (!example.task || !example.rubric) throw new Error(`${dataset.id}/${example.id} lacks task or rubric`);
    const result = await adapter.execute(example as TaskExample, executionOptions);
    totalDurationMs += result.durationMs;
    if (result.status === "blocked") {
      blocked += 1;
      failures.push({ exampleId: example.id, reason: result.reason });
      continue;
    }
    if (result.status === "failed") {
      failures.push({ exampleId: example.id, reason: result.reason });
      continue;
    }
    const passed = result.value.rubric.every((criterion) => criterion.passed);
    if (result.value.costUsd !== undefined) costs.push(result.value.costUsd);
    if (passed) completed += 1;
    else failures.push({ exampleId: example.id, reason: "one or more rubric criteria failed or require grading" });
    rubricPassed += result.value.rubric.filter((criterion) => criterion.passed).length;
    rubricTotal += result.value.rubric.length;
  }

  const count = dataset.examples.length;
  return {
    dataset: dataset.id,
    harness: { name: capabilities.name, version: capabilities.version },
    skillMode: executionOptions.skills,
    synthetic,
    examples: count,
    metrics: {
      taskCompletionRate: round(count === 0 ? 1 : completed / count),
      rubricPassRate: round(rubricTotal === 0 ? 0 : rubricPassed / rubricTotal),
      blockedRate: round(count === 0 ? 0 : blocked / count),
      averageLatencyMs: round(count === 0 ? 0 : totalDurationMs / count),
      ...(costs.length === count && count > 0 ? { averageCostUsd: round(costs.reduce((sum, cost) => sum + cost, 0) / count) } : {})
    },
    failures
  };
}

export async function loadTaskDataset(root: string): Promise<EvalDataset> {
  const datasets = await loadEvalDatasets(root);
  const task = datasets.find((dataset) => dataset.split === "tasks");
  if (!task) throw new Error("No task-completion dataset found");
  return task;
}
