import { describe, expect, it } from "vitest";
import { buildSkillRelationGraph, validateSkillRelationGraph } from "../src/relations.js";
import type { CapabilityPack, SkillContract } from "../src/types.js";

function contract(id: string, confusableWith: string[] = []): SkillContract {
  return {
    schemaVersion: 1,
    id,
    kind: id.startsWith("meta-") ? "meta" : "atom",
    version: "0.1.0",
    name: { en: id },
    summary: { en: id },
    outcomes: ["result"],
    artifacts: ["artifact"],
    inputs: [], outputs: [], preconditions: [], failures: [], sideEffects: ["none"],
    permissions: { network: "none", filesystem: "none", shell: "none", secrets: "none", externalCommunication: "none" },
    taxonomy: { primaryCategory: "test", lifecycle: ["plan"], modalities: ["text"], dependencies: ["tool-agnostic"], risk: "read-only" },
    routing: { positiveTriggers: { en: [id] }, negativeTriggers: { en: ["not this"] }, confusableWith },
    provenance: { origin: "test", license: "Apache-2.0" },
    evaluations: ["routing-dev"]
  };
}

describe("reviewed Skill relation graph", () => {
  it("materializes contract and Capability Pack relations deterministically", () => {
    const contracts = [contract("atom-a", ["atom-b"]), contract("atom-b"), contract("meta-govern")];
    const packs: CapabilityPack[] = [{
      schemaVersion: 1,
      id: "test-pack",
      version: "0.1.0",
      name: { en: "Test pack" },
      atoms: ["atom-a", "atom-b"],
      specialSkills: ["meta-govern"],
      optionalMcps: [],
      ordering: [{ before: "atom-a", after: "meta-govern" }],
      acceptanceTests: ["test-pack-smoke"]
    }];
    const graph = buildSkillRelationGraph(contracts, packs);
    expect(graph.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "atom-a", to: "atom-b", type: "confusable-with" }),
      expect.objectContaining({ from: "atom-a", to: "test-pack", type: "packaged-in" }),
      expect.objectContaining({ from: "atom-a", to: "atom-b", type: "compose-with" }),
      expect.objectContaining({ from: "meta-govern", to: "atom-a", type: "depends-on" })
    ]));
    expect(validateSkillRelationGraph(graph)).toEqual([]);
  });

  it("rejects unknown endpoints and dependency cycles", () => {
    const graph = buildSkillRelationGraph([contract("atom-a"), contract("atom-b")], []);
    graph.edges.push({ from: "atom-a", to: "missing", type: "confusable-with", evidence: ["test"] });
    graph.edges.push({ from: "atom-a", to: "atom-b", type: "depends-on", evidence: ["test"] });
    graph.edges.push({ from: "atom-b", to: "atom-a", type: "depends-on", evidence: ["test"] });
    expect(validateSkillRelationGraph(graph)).toEqual(expect.arrayContaining([
      "relation atom-a confusable-with missing references unknown endpoint missing",
      "depends-on cycle: atom-a -> atom-b -> atom-a"
    ]));
  });

  it("rejects duplicate relation nodes", () => {
    const graph = buildSkillRelationGraph([contract("atom-a")], []);
    graph.nodes.push({ id: "atom-a", kind: "atom" });
    expect(validateSkillRelationGraph(graph)).toContain("duplicate relation node: atom-a");
  });
});
