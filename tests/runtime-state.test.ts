import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildProgram } from "../src/cli.js";
import { loadPacks } from "../src/packs.js";
import {
  applyValidatedPackStatePatch,
  initializePackState,
  validatePackRuntimeStateProfile,
  validatePackState
} from "../src/runtime/state.js";
import type { JsonObject } from "../src/runtime/state.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function safeEvolutionPack() {
  const pack = (await loadPacks(root)).find((candidate) => candidate.id === "safe-skill-evolution");
  if (!pack) throw new Error("safe-skill-evolution pack not found");
  return pack;
}

describe("capability-pack runtime state", () => {
  it("exposes init, validate, and apply as first-class CLI operations", () => {
    const state = buildProgram().commands.find((command) => command.name() === "state");
    expect(state?.commands.map((command) => command.name())).toEqual(["init", "validate", "apply"]);
  });

  it("loads a schema-valid bounded initial state", async () => {
    const pack = await safeEvolutionPack();
    expect(await validatePackRuntimeStateProfile(root, pack)).toEqual([]);
    const initial = await initializePackState(root, pack);
    expect(initial).toMatchObject({ pack: "safe-skill-evolution", phase: "classify", status: "pending" });
    expect(await validatePackState(root, pack, initial)).toEqual([]);
  });

  it("applies a validated merge patch while retaining untouched current facts", async () => {
    const pack = await safeEvolutionPack();
    const initial = await initializePackState(root, pack);
    const next = await applyValidatedPackStatePatch(root, pack, initial, {
      phase: "evaluate",
      status: "running",
      targetSkill: "meta-skill-governor",
      evidenceRefs: ["experience-insights-fragment-across-iterations"],
      checks: { provenance: "passed", permissions: "passed" }
    });
    expect(next.phase).toBe("evaluate");
    expect(next.checks).toEqual({
      provenance: "passed",
      permissions: "passed",
      protectedMetrics: "pending",
      independentReview: "pending"
    });
    expect(initial).not.toHaveProperty("targetSkill");
  });

  it("rejects invalid or prototype-mutating patches before committing state", async () => {
    const pack = await safeEvolutionPack();
    const initial = await initializePackState(root, pack);
    await expect(applyValidatedPackStatePatch(root, pack, initial, { status: "unknown" } as JsonObject))
      .rejects.toThrow("Runtime state patch rejected");
    const malicious = JSON.parse('{"__proto__":{"polluted":true}}') as JsonObject;
    await expect(applyValidatedPackStatePatch(root, pack, initial, malicious))
      .rejects.toThrow("Forbidden runtime state patch key");
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
