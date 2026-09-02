import { mkdtemp, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildSkillBrowserData, writeSkillBrowserData } from "../src/web/catalog.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Skill Browser catalog", () => {
  it("projects every canonical Skill into deterministic display data", async () => {
    const data = await buildSkillBrowserData(root);
    const canonicalSkillCount = (await readdir(path.join(root, "skill-src"), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).length;
    expect(data.stats.total).toBe(canonicalSkillCount);
    expect(data.stats.atom + data.stats.category + data.stats.meta).toBe(data.stats.total);
    expect(data.skills).toHaveLength(data.stats.total);
    expect(data.skills.find((skill) => skill.id === "atom-brainstorm-options")?.markdown).toContain("# Brainstorm options");
    expect(data.categories.length).toBeGreaterThanOrEqual(20);
  });

  it("writes external JSON with source content escaped from HTML parsing", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "skill-browser-test-"));
    const output = path.join(temporaryRoot, "data", "skills.json");
    const expected = await writeSkillBrowserData(root, output);
    const serialized = await readFile(output, "utf8");
    expect(JSON.parse(serialized)).toEqual(expected);
    expect(serialized).not.toContain("<script");
  });
});
