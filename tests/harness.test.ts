import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContracts, loadTaxonomy } from "../src/registry.js";
import { MockHarnessAdapter } from "../src/harness/mock.js";
import { PiHarnessAdapter } from "../src/harness/pi.js";
import { DshHarnessAdapter } from "../src/harness/dsh.js";
import { CodexHarnessAdapter } from "../src/harness/codex.js";
import { evaluateTaskDataset, loadTaskDataset } from "../src/eval/tasks.js";
import { buildProgram } from "../src/cli.js";
import { compareSkillEffect } from "../src/eval/effect.js";
import type { TaskEvaluationResult } from "../src/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("harness adapters", () => {
  it("exposes capability discovery as a first-class CLI command", () => {
    const program = buildProgram();
    const harness = program.commands.find((command) => command.name() === "harness");
    expect(harness?.commands.map((command) => command.name())).toContain("discover");
  });

  it("runs deterministic offline routing and task protocol checks", async () => {
    const [taxonomy, contracts] = await Promise.all([loadTaxonomy(root), loadContracts(root)]);
    const adapter = new MockHarnessAdapter(taxonomy, contracts);
    expect((await adapter.healthcheck()).ready).toBe(true);
    const route = await adapter.route({
      id: "mock-route",
      prompt: "Translate this document",
      expectedCategory: "documents-communication",
      expectedAtoms: ["atom-translate-document"],
      mustNotRoute: []
    });
    expect(route.status).toBe("ok");
    if (route.status === "ok") expect(route.value.atoms[0]?.id).toBe("atom-translate-document");

    const task = await adapter.execute({
      id: "mock-task",
      prompt: "Plan a code change",
      expectedCategory: "software-engineering",
      expectedAtoms: ["atom-plan-code-change"],
      mustNotRoute: [],
      task: "Produce a plan",
      rubric: ["Names the file", "Includes tests"]
    });
    expect(task.status).toBe("ok");
    if (task.status === "ok") expect(task.value.rubric.every((item) => item.passed)).toBe(true);
    const taskEvaluation = await evaluateTaskDataset(await loadTaskDataset(root), adapter, true);
    expect(taskEvaluation.synthetic).toBe(true);
    expect(taskEvaluation.metrics.taskCompletionRate).toBe(1);
  });

  it("discovers the pinned Pi CLI and reports missing model authority precisely", async () => {
    const adapter = new PiHarnessAdapter(root);
    const capabilities = await adapter.discover();
    const health = await adapter.healthcheck();
    expect(capabilities.version).toBe("0.84.4");
    expect(capabilities.discoveredSkills).toBeGreaterThanOrEqual(22);
    expect(health.installed).toBe(true);
    expect(health.ready).toBe(false);
    expect(health.blockers).toContain("Pi provider credentials are not configured");
  });

  it("reports the optional DSH backend as unavailable without breaking CI", async () => {
    const health = await new DshHarnessAdapter().healthcheck();
    expect(health.installed).toBe(false);
    expect(health.blockers[0]).toContain("DeepSeek Harness CLI");
  });

  it("validates native Codex discovery independently of plugin discovery", async () => {
    const adapter = new CodexHarnessAdapter(root);
    const capabilities = await adapter.discover();
    expect(capabilities.discoveredSkills).toBeGreaterThanOrEqual(22);
    expect((await adapter.healthcheck()).ready).toBe(true);
  });

  it("separates positive live Skill lift from synthetic protocol evidence", () => {
    const baseline: TaskEvaluationResult = {
      dataset: "task-effect",
      harness: { name: "live", version: "1.0.0" },
      skillMode: "disabled",
      synthetic: false,
      examples: 10,
      metrics: { taskCompletionRate: 0.5, rubricPassRate: 0.6, blockedRate: 0, averageLatencyMs: 1000 },
      failures: []
    };
    const candidate: TaskEvaluationResult = {
      ...baseline,
      skillMode: "enabled",
      metrics: { taskCompletionRate: 0.7, rubricPassRate: 0.75, blockedRate: 0, averageLatencyMs: 900 }
    };
    const gate = {
      minimumTaskCompletionLift: 0,
      minimumRubricPassLift: 0,
      maximumBlockedRateIncrease: 0,
      requirePositiveLift: true
    };
    const effect = compareSkillEffect(baseline, candidate, gate);
    expect(effect.passed).toBe(true);
    expect(effect.metrics.taskCompletionLift).toBe(0.2);
    expect(effect.metrics.averageLatencyMsChange).toBe(-100);
    expect(compareSkillEffect({ ...baseline, synthetic: true }, { ...candidate, synthetic: true }, gate).certifiable).toBe(false);
  });
});
