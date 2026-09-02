import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { ValidateFunction } from "ajv";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "../src/types.js";
import { catalogStats } from "../src/catalog/catalog.js";
import { loadContracts } from "../src/registry.js";
import { loadPacks } from "../src/packs.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
interface AjvLike { compile(schema: object): ValidateFunction }
const Ajv2020 = (require("ajv/dist/2020").default ?? require("ajv/dist/2020")) as new (options: object) => AjvLike;
const addFormats = (require("ajv-formats").default ?? require("ajv-formats")) as (ajv: AjvLike) => AjvLike;

async function entries(): Promise<CatalogEntry[]> {
  const directory = path.join(root, "catalog", "entries");
  const files = (await readdir(directory)).filter((file) => file.endsWith(".yaml")).sort();
  return Promise.all(files.map(async (file) => parse(await readFile(path.join(directory, file), "utf8")) as CatalogEntry));
}

describe("upstream capability catalog", () => {
  it("contains at least 300 unique, attributed Skill and MCP records", async () => {
    const records = await entries();
    const ids = new Set(records.map((entry) => entry.id));
    const stats = catalogStats(records);

    expect(records.length).toBeGreaterThanOrEqual(300);
    expect(ids.size).toBe(records.length);
    expect(stats.byType.skill).toBeGreaterThanOrEqual(30);
    expect(stats.byType["mcp-server"]).toBeGreaterThanOrEqual(250);
  });

  it("validates every record and never treats cataloging as code execution", async () => {
    const schema = JSON.parse(await readFile(path.join(root, "schemas", "catalog-entry.schema.json"), "utf8")) as object;
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    for (const entry of await entries()) {
      expect(validate(entry), `${entry.id}: ${JSON.stringify(validate.errors)}`).toBe(true);
      expect(entry.security.executesUpstreamCode).toBe(false);
      expect(entry.source.revision).toMatch(/^[0-9a-f]{40,64}$/u);
    }
  });

  it("maps every local Atom, Meta Skill, and pack to non-executed upstream design evidence", async () => {
    const [records, contracts, packs, mapText, manifestText, inventoryText, schemaText] = await Promise.all([
      entries(),
      loadContracts(root),
      loadPacks(root),
      readFile(path.join(root, "catalog", "decomposition-map.yaml"), "utf8"),
      readFile(path.join(root, "catalog", "snapshots", "manifest.yaml"), "utf8"),
      readFile(path.join(root, "catalog", "upstream-skill-inventory.yaml"), "utf8"),
      readFile(path.join(root, "schemas", "decomposition-map.schema.json"), "utf8")
    ]);
    const map = parse(mapText) as {
      snapshotDigest: string;
      inventoryDigest: string;
      capabilityMappings: Array<{ capability: string; evidence: Array<{ catalogEntry?: string; inventoryEntry?: string; usage: string }> }>;
      packMappings: Array<{ pack: string; evidence: string[] }>;
    };
    const manifest = parse(manifestText) as { digest: string };
    const inventory = parse(inventoryText, { maxAliasCount: -1 }) as { digest: string; records: Array<{ id: string; duplicateOf?: string }> };
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validate = ajv.compile(JSON.parse(schemaText) as object);
    expect(validate(map), JSON.stringify(validate.errors)).toBe(true);
    expect(map.snapshotDigest).toBe(manifest.digest);
    expect(map.inventoryDigest).toBe(inventory.digest);

    const recordsById = new Map(records.map((record) => [record.id, record]));
    const inventoryById = new Map(inventory.records.map((record) => [record.id, record]));
    const expectedCapabilities = contracts.filter((contract) => contract.kind !== "category").map((contract) => contract.id).sort();
    expect(map.capabilityMappings.map((mapping) => mapping.capability).sort()).toEqual(expectedCapabilities);
    expect(map.packMappings.map((mapping) => mapping.pack).sort()).toEqual(packs.map((pack) => pack.id).sort());

    for (const mapping of map.capabilityMappings) {
      expect(mapping.evidence.length).toBeGreaterThanOrEqual(2);
      for (const evidence of mapping.evidence) {
        const record = evidence.catalogEntry ? recordsById.get(evidence.catalogEntry) : undefined;
        const inventoryRecord = evidence.inventoryEntry ? inventoryById.get(evidence.inventoryEntry) : undefined;
        expect(record ?? inventoryRecord, `${mapping.capability}: ${evidence.catalogEntry ?? evidence.inventoryEntry}`).toBeDefined();
        if (record) expect(record.security.executesUpstreamCode).toBe(false);
        if (inventoryRecord) expect(inventoryRecord.duplicateOf).toBeUndefined();
        expect(evidence.usage).toBe("design-evidence-only");
      }
    }
    for (const mapping of map.packMappings) {
      expect(mapping.evidence.length).toBeGreaterThanOrEqual(2);
      for (const entry of mapping.evidence) expect(recordsById.has(entry), `${mapping.pack}: ${entry}`).toBe(true);
    }
  });
});
