import { routeRequest } from "../router.js";
import type { SkillContract, Taxonomy } from "../types.js";
import type {
  HarnessAdapter,
  HarnessCapabilities,
  HarnessResult,
  HealthReport,
  TaskExample,
  TaskTrace
} from "./types.js";
import type { RouteTrace, RoutingExample } from "../types.js";

export class MockHarnessAdapter implements HarnessAdapter {
  constructor(private readonly taxonomy: Taxonomy, private readonly contracts: SkillContract[]) {}

  async discover(): Promise<HarnessCapabilities> {
    return {
      name: "mock",
      version: "0.1.0",
      structuredOutput: true,
      taskExecution: true,
      discoveredSkills: this.contracts.length
    };
  }

  async healthcheck(): Promise<HealthReport> {
    return { name: "mock", installed: true, ready: true, version: "0.1.0", blockers: [] };
  }

  async route(example: RoutingExample): Promise<HarnessResult<RouteTrace>> {
    const started = performance.now();
    return {
      status: "ok",
      value: routeRequest(example.prompt, this.taxonomy, this.contracts),
      durationMs: performance.now() - started
    };
  }

  async execute(task: TaskExample): Promise<HarnessResult<TaskTrace>> {
    const started = performance.now();
    const output = `Mock execution for ${task.id}: ${task.task}`;
    return {
      status: "ok",
      value: {
        output,
        rubric: task.rubric.map((criterion) => ({
          criterion,
          passed: true,
          evidence: "Deterministic protocol fixture; not a model-quality claim."
        }))
      },
      durationMs: performance.now() - started
    };
  }
}
