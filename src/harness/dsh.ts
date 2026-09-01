import type { RouteTrace, RoutingExample } from "../types.js";
import type {
  HarnessAdapter,
  HarnessCapabilities,
  HarnessResult,
  HealthReport,
  TaskExample,
  TaskTrace
} from "./types.js";
import { runProcess } from "./process.js";

export class DshHarnessAdapter implements HarnessAdapter {
  async healthcheck(): Promise<HealthReport> {
    const result = await runProcess("dsh", ["--version"]);
    if (result.error?.code === "ENOENT" || result.exitCode === null) {
      return {
        name: "dsh",
        installed: false,
        ready: false,
        blockers: ["DeepSeek Harness CLI is not installed; pin a compatible DSH release before enabling this adapter"]
      };
    }
    return {
      name: "dsh",
      installed: true,
      ready: result.exitCode === 0,
      version: result.stdout.trim() || result.stderr.trim(),
      blockers: result.exitCode === 0 ? [] : ["DeepSeek Harness CLI health check failed"]
    };
  }

  async discover(): Promise<HarnessCapabilities> {
    const health = await this.healthcheck();
    return {
      name: "dsh",
      version: health.version ?? "unavailable",
      structuredOutput: true,
      taskExecution: true,
      discoveredSkills: 0
    };
  }

  async route(_example: RoutingExample): Promise<HarnessResult<RouteTrace>> {
    return { status: "blocked", reason: "DSH adapter requires an installed, pinned CLI", durationMs: 0 };
  }

  async execute(_task: TaskExample): Promise<HarnessResult<TaskTrace>> {
    return { status: "blocked", reason: "DSH adapter requires an installed, pinned CLI", durationMs: 0 };
  }
}
