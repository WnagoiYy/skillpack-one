import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContracts } from "../src/registry.js";
import { compilePackPlan, loadPacks, recommendPacks, validatePack } from "../src/packs.js";
import { loadTaxonomy } from "../src/registry.js";
import { routeRequest } from "../src/router.js";
import type { CapabilityPack } from "../src/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("capability packs", () => {
  it("resolves every atom and special Skill without ordering cycles", async () => {
    const [packs, contracts] = await Promise.all([loadPacks(root), loadContracts(root)]);
    expect(packs.length).toBeGreaterThanOrEqual(4);
    for (const pack of packs) expect(validatePack(pack, contracts)).toEqual([]);
  });

  it("rejects missing capabilities and dependency cycles", async () => {
    const contracts = await loadContracts(root);
    const invalid: CapabilityPack = {
      schemaVersion: 1,
      id: "invalid-pack",
      version: "0.1.0",
      name: { en: "Invalid" },
      atoms: ["atom-plan-code-change", "atom-missing"],
      optionalMcps: [],
      ordering: [
        { before: "atom-plan-code-change", after: "atom-missing" },
        { before: "atom-missing", after: "atom-plan-code-change" }
      ],
      acceptanceTests: ["invalid-pack-test"]
    };
    const errors = validatePack(invalid, contracts);
    expect(errors).toContain("unknown atom: atom-missing");
    expect(errors.some((error) => error.startsWith("ordering cycle:"))).toBe(true);
  });

  it("compiles stable dependency stages without merging atomic Skills", async () => {
    const [packs, contracts] = await Promise.all([loadPacks(root), loadContracts(root)]);
    const software = packs.find((pack) => pack.id === "software-delivery");
    expect(software).toBeTruthy();
    const plan = compilePackPlan(software!, contracts);
    expect(plan.stages).toEqual([
      ["atom-plan-code-change"],
      ["atom-implement-code-change"],
      ["atom-audit-source-security"]
    ]);
  });

  it("exposes an opt-in runtime-state contract without turning it into a Skill", async () => {
    const [packs, contracts] = await Promise.all([loadPacks(root), loadContracts(root)]);
    const safeEvolution = packs.find((pack) => pack.id === "safe-skill-evolution");
    expect(safeEvolution).toBeTruthy();
    const plan = compilePackPlan(safeEvolution!, contracts);
    expect(plan.runtimeState).toEqual({
      stateSchema: "runtime/schemas/safe-skill-evolution.state.schema.json",
      initialState: "runtime/initial/safe-skill-evolution.state.json",
      patchSemantics: "json-merge-patch",
      historyPolicy: "external-audit-log"
    });
  });

  it("recommends a governed pack from multi-Skill route evidence", async () => {
    const [packs, contracts, taxonomy] = await Promise.all([loadPacks(root), loadContracts(root), loadTaxonomy(root)]);
    const trace = routeRequest("Plan, implement, and security-review a bounded code change", taxonomy, contracts);
    const recommendations = recommendPacks(trace, packs, contracts);
    expect(recommendations[0]?.pack).toBe("software-delivery");
    expect(recommendations[0]?.matchedSkills).toEqual([
      "atom-plan-code-change",
      "atom-implement-code-change",
      "atom-audit-source-security"
    ]);
  });
});
