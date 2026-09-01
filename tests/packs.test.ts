import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContracts } from "../src/registry.js";
import { loadPacks, validatePack } from "../src/packs.js";
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
});
