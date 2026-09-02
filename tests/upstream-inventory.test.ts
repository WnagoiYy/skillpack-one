import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ValidateFunction } from "ajv";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import type { UpstreamInventory } from "../src/catalog/upstream.js";
import { upstreamInventoryStats } from "../src/catalog/upstream.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
interface AjvLike { compile(schema: object): ValidateFunction }
const Ajv2020 = (require("ajv/dist/2020").default ?? require("ajv/dist/2020")) as new (options: object) => AjvLike;
const addFormats = (require("ajv-formats").default ?? require("ajv-formats")) as (ajv: AjvLike) => AjvLike;

describe("downloaded upstream Skill inventory", () => {
  it("contains at least 100 distinct Skill contents from multiple sources", async () => {
    const inventory = parse(await readFile(path.join(root, "catalog", "upstream-skill-inventory.yaml"), "utf8")) as UpstreamInventory;
    const schema = JSON.parse(await readFile(path.join(root, "schemas", "upstream-skill-inventory.schema.json"), "utf8")) as object;
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    expect(validate(inventory), JSON.stringify(validate.errors)).toBe(true);
    expect(inventory.recordCount).toBe(inventory.records.length);
    expect(inventory.uniqueContentCount).toBeGreaterThanOrEqual(100);
    expect(new Set(inventory.records.map((record) => record.source)).size).toBeGreaterThanOrEqual(10);
    expect(inventory.records.every((record) => record.repository.startsWith("https://github.com/"))).toBe(true);
  });

  it("classifies the inventory and explicitly identifies duplicate contents", async () => {
    const inventory = parse(await readFile(path.join(root, "catalog", "upstream-skill-inventory.yaml"), "utf8")) as UpstreamInventory;
    const stats = upstreamInventoryStats(inventory);
    expect(stats.byFamily["scientific-research"]).toBeGreaterThan(100);
    expect(stats.byFamily["software-engineering"]).toBeGreaterThan(20);
    expect(stats.duplicates).toBe(inventory.records.filter((record) => record.duplicateOf).length);
  });
});
