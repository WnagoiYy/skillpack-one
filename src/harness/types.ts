import type { RouteTrace, RoutingExample } from "../types.js";

export interface HarnessCapabilities {
  name: string;
  version: string;
  structuredOutput: boolean;
  taskExecution: boolean;
  discoveredSkills: number;
}

export interface HealthReport {
  name: string;
  installed: boolean;
  ready: boolean;
  version?: string;
  blockers: string[];
}

export type HarnessResult<T> =
  | { status: "ok"; value: T; durationMs: number }
  | { status: "blocked"; reason: string; durationMs: number }
  | { status: "failed"; reason: string; durationMs: number };

export interface TaskExample extends RoutingExample {
  task: string;
  rubric: string[];
}

export interface TaskTrace {
  output: string;
  rubric: Array<{ criterion: string; passed: boolean; evidence: string }>;
  costUsd?: number;
}

export interface ExecutionOptions {
  skills: "enabled" | "disabled";
}

export interface HarnessAdapter {
  discover(): Promise<HarnessCapabilities>;
  healthcheck(): Promise<HealthReport>;
  route(example: RoutingExample): Promise<HarnessResult<RouteTrace>>;
  execute(task: TaskExample, options?: ExecutionOptions): Promise<HarnessResult<TaskTrace>>;
}
