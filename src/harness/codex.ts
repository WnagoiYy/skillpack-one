import { readdir } from "node:fs/promises";
import path from "node:path";
import { checkSkillProjections } from "../../scripts/generate-skill-projections.js";
import { loadContracts, loadTaxonomy } from "../registry.js";
import { routeRequest } from "../router.js";
import type { RouteTrace, RoutingExample } from "../types.js";
import type {
  HarnessAdapter,
  HarnessCapabilities,
  HarnessResult,
  HealthReport,
  TaskExample,
  TaskTrace
} from "./types.js";

export class CodexHarnessAdapter implements HarnessAdapter {
  constructor(private readonly root: string) {}

  async discover(): Promise<HarnessCapabilities> {
    const entries = await readdir(path.join(this.root, ".agents", "skills"), { withFileTypes: true });
    return {
      name: "codex-native-layout",
      version: "project",
      structuredOutput: true,
      taskExecution: false,
      discoveredSkills: entries.filter((entry) => entry.isDirectory()).length
    };
  }

  async healthcheck(): Promise<HealthReport> {
    const report = await checkSkillProjections(this.root);
    return {
      name: "codex-native-layout",
      installed: true,
      ready: report.current,
      version: "project",
      blockers: report.current ? [] : report.differences
    };
  }

  async route(example: RoutingExample): Promise<HarnessResult<RouteTrace>> {
    const started = performance.now();
    const [taxonomy, contracts] = await Promise.all([loadTaxonomy(this.root), loadContracts(this.root)]);
    return {
      status: "ok",
      value: routeRequest(example.prompt, taxonomy, contracts),
      durationMs: performance.now() - started
    };
  }

  async execute(_task: TaskExample): Promise<HarnessResult<TaskTrace>> {
    return {
      status: "blocked",
      reason: "Codex UI execution is intentionally not automated through private behavior; import an exported trace instead",
      durationMs: 0
    };
  }
}
