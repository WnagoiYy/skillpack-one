import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { checkSkillProjections } from "../scripts/generate-skill-projections.js";
import type { SkillContract } from "../src/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skill-src");

function frontmatter(markdown: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(markdown);
  if (!match?.[1]) throw new Error("SKILL.md has no YAML frontmatter");
  return parse(match[1]) as Record<string, unknown>;
}

describe("Skill source and projections", () => {
  it("contains ten category Skills, representative atoms, and one meta Skill", async () => {
    const directories = (await readdir(sourceRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(directories.filter((name) => name.startsWith("category-"))).toHaveLength(10);
    expect(directories.filter((name) => name.startsWith("atom-")).length).toBeGreaterThanOrEqual(10);
    expect(directories.filter((name) => name === "meta-skill-governor")).toHaveLength(1);
  });

  it("uses valid discriminating frontmatter and atomic contracts", async () => {
    const directories = (await readdir(sourceRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
    for (const directory of directories) {
      const markdown = await readFile(path.join(sourceRoot, directory.name, "SKILL.md"), "utf8");
      const metadata = frontmatter(markdown);
      expect(metadata.name).toBe(directory.name);
      expect(String(metadata.description).length).toBeGreaterThan(40);
      expect(String(metadata.description).length).toBeLessThanOrEqual(1024);

      if (directory.name.startsWith("atom-") || directory.name === "meta-skill-governor") {
        const contract = parse(
          await readFile(path.join(sourceRoot, directory.name, "skill.contract.yaml"), "utf8")
        ) as SkillContract;
        expect(contract.id).toBe(directory.name);
        if (contract.kind === "atom") expect(contract.outcomes).toHaveLength(1);
      }
    }
  });

  it("keeps plugin and native Codex projections current", async () => {
    const report = await checkSkillProjections(root);
    expect(report).toEqual({ current: true, differences: [] });
  });

  it("gives every category bilingual indexes and every projection UI metadata", async () => {
    for (const projection of ["skills", path.join(".agents", "skills")]) {
      const projectionRoot = path.join(root, projection);
      const directories = (await readdir(projectionRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
      for (const directory of directories) {
        const agentMetadata = parse(
          await readFile(path.join(projectionRoot, directory.name, "agents", "openai.yaml"), "utf8")
        ) as { interface?: { display_name?: string; default_prompt?: string } };
        expect(agentMetadata.interface?.display_name).toBeTruthy();
        expect(agentMetadata.interface?.default_prompt).toContain(`$${directory.name}`);

        if (directory.name.startsWith("category-")) {
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.en.md"), "utf8")).resolves.toContain("Atomic Skills");
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.zh-CN.md"), "utf8")).resolves.toContain("原子 Skill");
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.zh.md"), "utf8")).resolves.toContain("原子 Skill");
        }
      }
    }
  });

  it("prevents the meta Skill from bypassing its own gate", async () => {
    const markdown = await readFile(path.join(sourceRoot, "meta-skill-governor", "SKILL.md"), "utf8");
    expect(markdown).toContain("held-out");
    expect(markdown).toContain("rollback");
    expect(markdown).toContain("The same proposal must not weaken this gate");
  });
});
