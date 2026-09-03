import { readdir, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse, stringify } from "yaml";
import { loadContracts, loadTaxonomy } from "../src/registry.js";
import type { SkillContract, TaxonomyNode } from "../src/types.js";

interface ProjectionReport {
  current: boolean;
  differences: string[];
}

interface Frontmatter {
  name: string;
  description: string;
}

async function listFiles(root: string, relative = ""): Promise<string[]> {
  const directory = path.join(root, relative);
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const files: string[] = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, child)));
    else if (entry.name !== ".gitkeep") files.push(child);
  }
  return files.sort();
}

function readFrontmatter(markdown: string): Frontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(markdown);
  if (!match?.[1]) throw new Error("SKILL.md is missing YAML frontmatter");
  const value = parse(match[1]) as Partial<Frontmatter>;
  if (!value.name || !value.description) throw new Error("SKILL.md frontmatter requires name and description");
  return { name: value.name, description: value.description };
}

function title(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderAgentMetadata(frontmatter: Frontmatter): string {
  const displayName = title(frontmatter.name);
  const shortDescription = `Route and apply ${displayName}`.slice(0, 64);
  return stringify({
    interface: {
      display_name: displayName,
      short_description: shortDescription,
      default_prompt: `Use $${frontmatter.name} to handle this request within its declared capability boundary.`
    },
    policy: { allow_implicit_invocation: true }
  });
}

function localized(contract: SkillContract, locale: string): { name: string; summary: string } {
  const base = locale.split("-")[0] ?? locale;
  return {
    name: contract.name[locale] ?? contract.name[base] ?? contract.name.en,
    summary: contract.summary[locale] ?? contract.summary[base] ?? contract.summary.en
  };
}

export function renderIndex(
  node: TaxonomyNode,
  nodes: TaxonomyNode[],
  contracts: SkillContract[],
  locale: "en" | "zh-CN"
): string {
  const heading = locale === "zh-CN" ? "原子 Skill" : "Atomic Skills";
  const description = node.description?.[locale] ?? node.description?.en ?? node.label[locale] ?? node.label.en;
  const lines = [
    `# ${node.label[locale] ?? node.label.en}: ${heading}`,
    "",
    description,
    ""
  ];
  const children = nodes.filter((candidate) => candidate.parent === node.id).sort((left, right) => left.id.localeCompare(right.id));
  if (children.length > 0) {
    lines.push(`## ${locale === "zh-CN" ? "子分类" : "Subcategories"}`, "");
    for (const child of children) {
      const childLabel = child.label[locale] ?? child.label.en;
      const childDescription = child.description?.[locale] ?? child.description?.en;
      lines.push(`- \`category-${child.id}\` — **${childLabel}**${childDescription ? `: ${childDescription}` : ""}`);
    }
    lines.push("");
  }
  lines.push(`## ${heading}`, "");
  const matching = contracts.filter(
    (contract) =>
      contract.kind === "atom" &&
      (contract.taxonomy.primaryCategory === node.id || contract.taxonomy.secondaryCategories?.includes(node.id))
  );
  if (matching.length === 0) {
    lines.push(locale === "zh-CN" ? "当前尚无已认证的原子 Skill。" : "No certified Atomic Skills yet.", "");
  } else {
    for (const contract of matching) {
      const text = localized(contract, locale);
      lines.push(`- \`${contract.id}\` — **${text.name}**: ${text.summary}`);
      lines.push(`  - ${locale === "zh-CN" ? "风险" : "Risk"}: \`${contract.taxonomy.risk}\``);
      lines.push(`  - ${locale === "zh-CN" ? "生命周期" : "Lifecycle"}: ${contract.taxonomy.lifecycle.join(", ")}`);
    }
    lines.push("");
  }
  const special = contracts.filter(
    (contract) =>
      contract.kind === "meta" &&
      (contract.taxonomy.primaryCategory === node.id || contract.taxonomy.secondaryCategories?.includes(node.id))
  );
  if (special.length > 0) {
    lines.push(`## ${locale === "zh-CN" ? "元 Skill" : "Meta Skills"}`, "");
    for (const contract of special) {
      const text = localized(contract, locale);
      lines.push(`- \`${contract.id}\` — **${text.name}**: ${text.summary}`);
      lines.push(`  - ${locale === "zh-CN" ? "风险" : "Risk"}: \`${contract.taxonomy.risk}\``);
      lines.push(`  - ${locale === "zh-CN" ? "生命周期" : "Lifecycle"}: ${contract.taxonomy.lifecycle.join(", ")}`);
    }
    lines.push("");
  }
  lines.push(
    special.length > 0
      ? locale === "zh-CN"
        ? "只读取最终选中的原子或元 Skill；若请求包含多个独立结果，请改用能力包。"
        : "Read only the selected Atomic or Meta Skill. Use a capability pack when the request has independently useful outcomes."
      : locale === "zh-CN"
        ? "只读取最终选中的原子 Skill；若请求包含多个独立结果，请改用能力包。"
        : "Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.",
    ""
  );
  return lines.join("\n");
}

async function expectedFiles(root: string): Promise<Map<string, string>> {
  const sourceRoot = path.join(root, "skill-src");
  const files = await listFiles(sourceRoot);
  const expected = new Map<string, string>();
  const [taxonomy, contracts] = await Promise.all([loadTaxonomy(root), loadContracts(root)]);

  for (const relative of files) {
    expected.set(relative, await readFile(path.join(sourceRoot, relative), "utf8"));
  }

  const skillDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const directory of skillDirectories) {
    const skill = expected.get(path.join(directory, "SKILL.md"));
    if (!skill) throw new Error(`${directory} is missing SKILL.md`);
    expected.set(path.join(directory, "agents", "openai.yaml"), renderAgentMetadata(readFrontmatter(skill)));

    if (directory.startsWith("category-")) {
      const nodeId = directory.slice("category-".length);
      const node = taxonomy.nodes.find((candidate) => candidate.id === nodeId);
      if (!node) throw new Error(`${directory} has no taxonomy node ${nodeId}`);
      const englishIndex = renderIndex(node, taxonomy.nodes, contracts, "en");
      expected.set(path.join(directory, "references", "index.md"), englishIndex);
      expected.set(path.join(directory, "references", "index.en.md"), englishIndex);
      const chineseIndex = renderIndex(node, taxonomy.nodes, contracts, "zh-CN");
      expected.set(path.join(directory, "references", "index.zh-CN.md"), chineseIndex);
      expected.set(path.join(directory, "references", "index.zh.md"), chineseIndex);
    }
  }
  return expected;
}

async function materialize(targetRoot: string, expected: Map<string, string>): Promise<void> {
  await rm(targetRoot, { recursive: true, force: true });
  for (const [relative, content] of expected) {
    const target = path.join(targetRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
}

async function compareProjection(targetRoot: string, expected: Map<string, string>): Promise<string[]> {
  const differences: string[] = [];
  const actualFiles = await listFiles(targetRoot);
  const expectedFiles = [...expected.keys()].sort();
  for (const relative of expectedFiles) {
    try {
      const actual = await readFile(path.join(targetRoot, relative), "utf8");
      if (actual !== expected.get(relative)) differences.push(`changed:${relative}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") differences.push(`missing:${relative}`);
      else throw error;
    }
  }
  for (const relative of actualFiles) {
    if (!expected.has(relative)) differences.push(`extra:${relative}`);
  }
  return differences.sort();
}

export async function generateSkillProjections(root: string): Promise<void> {
  const expected = await expectedFiles(root);
  await materialize(path.join(root, "skills"), expected);
  await materialize(path.join(root, ".agents", "skills"), expected);
}

export async function checkSkillProjections(root: string): Promise<ProjectionReport> {
  const expected = await expectedFiles(root);
  const pluginDifferences = (await compareProjection(path.join(root, "skills"), expected)).map(
    (difference) => `skills/${difference}`
  );
  const nativeDifferences = (await compareProjection(path.join(root, ".agents", "skills"), expected)).map(
    (difference) => `.agents/skills/${difference}`
  );
  const differences = [...pluginDifferences, ...nativeDifferences].sort();
  return { current: differences.length === 0, differences };
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  if (process.argv.includes("--check")) {
    const report = await checkSkillProjections(root);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!report.current) process.exitCode = 1;
  } else {
    await generateSkillProjections(root);
    process.stdout.write("Generated plugin and Codex Skill projections.\n");
  }
}
