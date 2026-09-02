import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadContracts } from "../src/registry.js";
import { loadPacks } from "../src/packs.js";
import {
  loadEvolutionPatternDocuments,
  renderEvolutionKnowledgeIndex,
  searchEvolutionPatterns,
  validateEvolutionKnowledgeGraph
} from "../src/train/knowledge.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("persistent evolution knowledge", () => {
  it("validates scoped pattern records and the generated compact index", async () => {
    const [documents, contracts, packs, index] = await Promise.all([
      loadEvolutionPatternDocuments(root),
      loadContracts(root),
      loadPacks(root),
      readFile(path.join(root, ".skill-system", "knowledge", "index.md"), "utf8")
    ]);
    expect(documents.length).toBeGreaterThan(0);
    expect(validateEvolutionKnowledgeGraph(
      documents,
      new Set(contracts.map((contract) => contract.id)),
      new Set(packs.map((pack) => pack.id))
    )).toEqual([]);
    expect(index).toBe(renderEvolutionKnowledgeIndex(documents.map((document) => document.pattern)));
  });

  it("retrieves active patterns without exposing raw traces as executable instructions", async () => {
    const documents = await loadEvolutionPatternDocuments(root);
    const matches = searchEvolutionPatterns("rejected skill changes repeat across iterations", documents.map((document) => document.pattern));
    expect(matches[0]?.id).toBe("experience-insights-fragment-across-iterations");
    expect(matches[0]?.score).toBeGreaterThan(0);
  });

  it("rejects unknown scopes and supersession cycles", async () => {
    const [document] = await loadEvolutionPatternDocuments(root);
    expect(document).toBeTruthy();
    if (!document) throw new Error("expected at least one evolution pattern");
    const invalid = {
      ...document.pattern,
      id: "invalid-pattern",
      scope: { skills: ["missing-skill"], packs: ["missing-pack"], harnesses: [] },
      supersedes: ["invalid-pattern"]
    };
    const errors = validateEvolutionKnowledgeGraph(
      [{ file: ".skill-system/knowledge/patterns/invalid-pattern.yaml", pattern: invalid }],
      new Set(),
      new Set()
    );
    expect(errors).toContain("invalid-pattern: unknown scoped Skill missing-skill");
    expect(errors).toContain("invalid-pattern: unknown scoped capability pack missing-pack");
    expect(errors).toContain("invalid-pattern: pattern cannot supersede itself");
  });
});
