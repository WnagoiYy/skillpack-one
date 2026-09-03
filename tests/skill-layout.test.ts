import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { checkSkillProjections, renderIndex } from "../scripts/generate-skill-projections.js";
import type { SkillContract } from "../src/types.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skill-src");

function frontmatter(markdown: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(markdown);
  if (!match?.[1]) throw new Error("SKILL.md has no YAML frontmatter");
  return parse(match[1]) as Record<string, unknown>;
}

describe("Skill source and projections", () => {
  it("contains a hierarchical category library, representative atoms, and lifecycle meta Skills", async () => {
    const directories = (await readdir(sourceRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(directories.filter((name) => name.startsWith("category-")).length).toBeGreaterThanOrEqual(20);
    expect(directories.filter((name) => name.startsWith("atom-")).length).toBeGreaterThanOrEqual(30);
    expect(directories.filter((name) => name.startsWith("meta-"))).toHaveLength(8);
    expect(directories).toEqual(expect.arrayContaining([
      "meta-skill-governor",
      "meta-upstream-skill-curator",
      "meta-skill-author",
      "meta-skill-quality-auditor",
      "meta-skill-evaluator",
      "meta-skill-optimizer",
      "meta-skill-compatibility-migrator",
      "meta-skill-composer"
    ]));
  });

  it("uses valid discriminating frontmatter and shared contracts for every Skill", async () => {
    const directories = (await readdir(sourceRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
    for (const directory of directories) {
      const markdown = await readFile(path.join(sourceRoot, directory.name, "SKILL.md"), "utf8");
      const metadata = frontmatter(markdown);
      expect(metadata.name).toBe(directory.name);
      expect(String(metadata.description).length).toBeGreaterThan(40);
      expect(String(metadata.description).length).toBeLessThanOrEqual(1024);

      const contract = parse(
        await readFile(path.join(sourceRoot, directory.name, "skill.contract.yaml"), "utf8")
      ) as SkillContract;
      expect(contract.id).toBe(directory.name);
      if (directory.name.startsWith("category-")) expect(contract.kind).toBe("category");
      else if (directory.name.startsWith("atom-")) expect(contract.kind).toBe("atom");
      else expect(contract.kind).toBe("meta");
      if (contract.kind === "atom") expect(contract.outcomes).toHaveLength(1);
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
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.md"), "utf8")).resolves.toContain("Atomic Skills");
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.en.md"), "utf8")).resolves.toContain("Atomic Skills");
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.zh-CN.md"), "utf8")).resolves.toContain("原子 Skill");
          await expect(readFile(path.join(projectionRoot, directory.name, "references", "index.zh.md"), "utf8")).resolves.toContain("原子 Skill");
        }
      }
    }
  });

  it("routes parent indexes through direct child Categories before Atoms", () => {
    const parent = {
      id: "industry",
      label: { en: "Industry", "zh-CN": "行业" },
      description: { en: "Broad industry requests.", "zh-CN": "行业大类请求。" },
      includes: ["industry work"],
      excludes: ["other work"]
    };
    const child = {
      id: "industry-specialty",
      parent: "industry",
      label: { en: "Specialty", "zh-CN": "细分类" },
      description: { en: "Specific industry work.", "zh-CN": "具体行业工作。" },
      includes: ["specialty work"],
      excludes: ["other work"]
    };

    const index = renderIndex(parent, [parent, child], [], "en");
    expect(index).toContain("## Subcategories");
    expect(index).toContain("`category-industry-specialty`");
    expect(index.indexOf("## Subcategories")).toBeLessThan(index.indexOf("## Atomic Skills"));
  });

  it("prevents the meta Skill from bypassing its own gate", async () => {
    const markdown = await readFile(path.join(sourceRoot, "meta-skill-governor", "SKILL.md"), "utf8");
    expect(markdown).toContain("held-out");
    expect(markdown).toContain("rollback");
    expect(markdown).toContain("The same proposal must not weaken this gate");
  });
});
