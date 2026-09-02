import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadContracts, loadTaxonomy } from "../registry.js";
import type { SkillContract, SkillKind } from "../types.js";

export interface SkillBrowserRecord {
  id: string;
  kind: SkillKind;
  version: string;
  name: SkillContract["name"];
  summary: SkillContract["summary"];
  outcomes: string[];
  artifacts: string[];
  inputs: SkillContract["inputs"];
  outputs: SkillContract["outputs"];
  preconditions: string[];
  failures: string[];
  sideEffects: string[];
  permissions: SkillContract["permissions"];
  taxonomy: SkillContract["taxonomy"];
  routing: SkillContract["routing"];
  provenance: SkillContract["provenance"];
  evaluations: string[];
  markdown: string;
  sourcePath: string;
  sourceUrl: string;
}

export interface SkillBrowserData {
  schemaVersion: 1;
  packageVersion: string;
  taxonomyVersion: string;
  maxTaxonomyDepth: number | null;
  repository: string;
  stats: {
    total: number;
    atom: number;
    category: number;
    meta: number;
    taxonomyNodes: number;
  };
  categories: Array<{
    id: string;
    parent?: string;
    label: Record<string, string>;
    description?: Record<string, string>;
  }>;
  skills: SkillBrowserRecord[];
}

interface PackageMetadata {
  version?: string;
  repository?: string | { url?: string };
}

function repositoryWebUrl(repository: PackageMetadata["repository"]): string {
  const value = typeof repository === "string" ? repository : repository?.url;
  return (value ?? "https://github.com/WnagoiYy/skillpack-one")
    .replace(/^git\+/u, "")
    .replace(/\.git$/u, "");
}

export async function buildSkillBrowserData(root: string): Promise<SkillBrowserData> {
  const [contracts, taxonomy, packageMetadata] = await Promise.all([
    loadContracts(root),
    loadTaxonomy(root),
    readFile(path.join(root, "package.json"), "utf8").then((text) => JSON.parse(text) as PackageMetadata)
  ]);
  const repository = repositoryWebUrl(packageMetadata.repository);
  const skills = await Promise.all(contracts.map(async (contract): Promise<SkillBrowserRecord> => {
    const sourcePath = `skill-src/${contract.id}/SKILL.md`;
    return {
      ...contract,
      markdown: await readFile(path.join(root, sourcePath), "utf8"),
      sourcePath,
      sourceUrl: `${repository}/blob/main/${sourcePath}`
    };
  }));
  const count = (kind: SkillKind): number => skills.filter((skill) => skill.kind === kind).length;

  return {
    schemaVersion: 1,
    packageVersion: packageMetadata.version ?? "unknown",
    taxonomyVersion: taxonomy.version,
    maxTaxonomyDepth: taxonomy.maxDepth ?? null,
    repository,
    stats: {
      total: skills.length,
      atom: count("atom"),
      category: count("category"),
      meta: count("meta"),
      taxonomyNodes: taxonomy.nodes.length
    },
    categories: taxonomy.nodes.map((node) => ({
      id: node.id,
      ...(node.parent ? { parent: node.parent } : {}),
      label: node.label,
      ...(node.description ? { description: node.description } : {})
    })),
    skills
  };
}

export async function writeSkillBrowserData(root: string, output: string): Promise<SkillBrowserData> {
  const data = await buildSkillBrowserData(root);
  await mkdir(path.dirname(output), { recursive: true });
  const json = `${JSON.stringify(data, null, 2).replaceAll("<", "\\u003c")}\n`;
  await writeFile(output, json, "utf8");
  return data;
}
