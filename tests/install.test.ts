import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { installSkillPack } from "../src/install.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary: string[] = [];
afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe("one-pack Codex installation", () => {
  it("installs every packaged Skill, is idempotent, and refuses silent conflict replacement", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "skillpack-install-"));
    temporary.push(directory);
    const target = path.join(directory, ".agents", "skills");
    const first = await installSkillPack(root, target);
    expect(first.installed.length).toBeGreaterThanOrEqual(50);
    expect(first.conflicts).toEqual([]);
    await expect(readFile(path.join(target, "meta-upstream-skill-curator", "SKILL.md"), "utf8")).resolves.toContain("Upstream Skill Curator");

    const second = await installSkillPack(root, target);
    expect(second.installed).toEqual([]);
    expect(second.skipped).toHaveLength(first.installed.length);

    await writeFile(path.join(target, "atom-frame-problem", "SKILL.md"), "user-owned change", "utf8");
    const conflict = await installSkillPack(root, target);
    expect(conflict.conflicts).toContain("atom-frame-problem");
    await expect(readFile(path.join(target, "atom-frame-problem", "SKILL.md"), "utf8")).resolves.toBe("user-owned change");
  });
});
