import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Taxonomy } from "../src/types.js";
import { lintTaxonomy, validateRepository } from "../src/validation.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("taxonomy validation", () => {
  it("validates the repository taxonomy against the public schema", async () => {
    const report = await validateRepository(root);
    expect(report.errors).toEqual([]);
    expect(report.checked).toContain("taxonomy/taxonomy.yaml");
  });

  it("detects duplicate IDs, missing parents, and cycles", () => {
    const taxonomy: Taxonomy = {
      schemaVersion: 1,
      version: "0.1.0",
      nodes: [
        { id: "alpha", parent: "beta", label: { en: "Alpha" }, includes: ["a"], excludes: ["b"] },
        { id: "beta", parent: "alpha", label: { en: "Beta" }, includes: ["b"], excludes: ["a"] },
        { id: "alpha", parent: "missing", label: { en: "Duplicate" }, includes: ["x"], excludes: ["y"] }
      ]
    };

    const errors = lintTaxonomy(taxonomy);
    expect(errors).toContain("duplicate taxonomy node id: alpha");
    expect(errors).toContain("taxonomy node alpha references missing parent: missing");
    expect(errors.some((error) => error.startsWith("taxonomy cycle:"))).toBe(true);
  });
});
