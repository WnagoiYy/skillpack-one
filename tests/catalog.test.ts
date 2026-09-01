import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { ValidateFunction } from "ajv";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "../src/types.js";
import { catalogStats } from "../src/catalog/catalog.js";

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
});
