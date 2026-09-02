import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { parse, stringify } from "yaml";

const execFileAsync = promisify(execFile);

interface GitHubSource {
  id: string;
  kind: "github-skills";
  repository: string;
  trust: string;
}

interface SourceDocument {
  schemaVersion: 1;
  verifiedAt: string;
  sources: Array<GitHubSource | { kind: string }>;
}

export interface UpstreamSkillRecord {
  id: string;
  source: string;
  repository: string;
  revision: string;
  path: string;
  name: string;
  description: string;
  family: string;
  specialty: string;
  trust: string;
  license: { status: "detected" | "unknown"; spdx?: string };
  contentFingerprint: string;
  duplicateOf?: string;
}

export interface UpstreamInventory {
  schemaVersion: 1;
  generatedAt: string;
  policy: string;
  sourceCount: number;
  recordCount: number;
  uniqueContentCount: number;
  digest: string;
  records: UpstreamSkillRecord[];
}

export interface UpstreamCollectionOptions {
  refresh?: boolean;
  generatedAt?: string;
}

const LICENSES: Array<[RegExp, string]> = [
  [/Apache License\s+Version 2\.0/iu, "Apache-2.0"],
  [/MIT License|Permission is hereby granted, free of charge/iu, "MIT"],
  [/Creative Commons Attribution-ShareAlike 4\.0/iu, "CC-BY-SA-4.0"],
  [/GNU AFFERO GENERAL PUBLIC LICENSE/iu, "AGPL-3.0-only"],
  [/GNU GENERAL PUBLIC LICENSE[\s\S]{0,100}Version 3/iu, "GPL-3.0-only"]
];

const FAMILY_RULES: Array<{ family: string; specialty: string; terms: RegExp }> = [
  { family: "skill-agent-governance", specialty: "skill-lifecycle", terms: /\b(skill creator|skill manager|skill improver|skill lifecycle|agent governance|prompt manager|evaluation architect|eval architect|harness|context engineering|agent memory)\b/iu },
  { family: "scientific-research", specialty: "scholarly-research", terms: /\b(scientific|science|research|paper|citation|literature|experiment|laboratory|bioinformatics|clinical|chemistry|genomics|proteomics|statistics)\b/iu },
  { family: "security-trust", specialty: "security-review", terms: /\b(security|vulnerab|threat|audit|owasp|hardening|access review|smart contract|malware|privacy)\b/iu },
  { family: "problem-solving", specialty: "planning-decision-review", terms: /\b(brainstorm|ideat|planning|plan |decision|critique|review|problem|requirements|interview|retrospective)\b/iu },
  { family: "software-use", specialty: "tool-operation", terms: /\b(cli|command line|browser|devtools|figma|obsidian|spreadsheet|excel|github|git |terminal|canvas|n8n|cloudflare|firebase|supabase|hugging face|vercel)\b/iu },
  { family: "software-engineering", specialty: "software-development", terms: /\b(code|coding|software|api|frontend|react|rust|python|typescript|debug|test|architecture|deploy|database|performance|migration)\b/iu },
  { family: "business-growth", specialty: "marketing-growth", terms: /\b(marketing|seo|sales|campaign|customer|conversion|pricing|brand|content strategy|launch)\b/iu },
  { family: "design-media", specialty: "design-content", terms: /\b(design|image|video|audio|diagram|illustrat|animation|slides|visual|infographic)\b/iu },
  { family: "data-analytics", specialty: "data-analysis", terms: /\b(data|analytics|analysis|dataset|sql|chart|visualization|modeling)\b/iu },
  { family: "documents-communication", specialty: "documents-writing", terms: /\b(document|docx|pdf|writing|translation|markdown|presentation|communication|email|blog)\b/iu },
  { family: "automation-operations", specialty: "workflow-operations", terms: /\b(automation|workflow|operations|monitoring|ci\/cd|infrastructure|hosting)\b/iu }
];

function safeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 160);
}

function hash(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function parseFrontmatter(content: string, fallbackName: string): { name: string; description: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(content);
  if (!match?.[1]) return { name: fallbackName, description: `Agent Skill ${fallbackName}.` };
  try {
    const metadata = parse(match[1]) as { name?: unknown; description?: unknown };
    return {
      name: typeof metadata.name === "string" && metadata.name.trim() ? metadata.name.trim() : fallbackName,
      description:
        typeof metadata.description === "string" && metadata.description.trim()
          ? metadata.description.trim().replace(/\s+/gu, " ").slice(0, 1000)
          : `Agent Skill ${fallbackName}.`
    };
  } catch {
    return { name: fallbackName, description: `Agent Skill ${fallbackName}.` };
  }
}

function classify(name: string, description: string, source: string): { family: string; specialty: string } {
  const text = `${name} ${description} ${source}`;
  if (source === "scientific-skills") return { family: "scientific-research", specialty: "scholarly-research" };
  if (source === "trailofbits-skills") return { family: "security-trust", specialty: "security-review" };
  if (source === "marketing-skills") return { family: "business-growth", specialty: "marketing-growth" };
  for (const rule of FAMILY_RULES) if (rule.terms.test(text)) return { family: rule.family, specialty: rule.specialty };
  return { family: "uncategorized", specialty: "manual-review" };
}

async function git(args: string[], cwd?: string): Promise<string> {
  const result = await execFileAsync("git", args, {
    ...(cwd ? { cwd } : {}),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });
  return result.stdout.trim();
}

function licenseFrom(content: string): { status: "detected" | "unknown"; spdx?: string } {
  for (const [pattern, spdx] of LICENSES) if (pattern.test(content)) return { status: "detected", spdx };
  return { status: "unknown" };
}

async function collectSource(root: string, source: GitHubSource, refresh: boolean): Promise<UpstreamSkillRecord[]> {
  const cacheRoot = path.resolve(root, ".skill-system", "upstream-cache");
  const checkout = path.resolve(cacheRoot, source.id);
  if (path.dirname(checkout) !== cacheRoot) throw new Error(`Unsafe upstream cache path: ${checkout}`);
  await mkdir(cacheRoot, { recursive: true });
  try {
    await git(["rev-parse", "--git-dir"], checkout);
  } catch {
    await git(["clone", "--depth", "1", "--filter=blob:none", source.repository, checkout]);
  }
  let revisionRef = "HEAD";
  if (refresh) {
    await git(["fetch", "--depth", "1", "origin"], checkout);
    revisionRef = "FETCH_HEAD";
  }
  const revision = await git(["rev-parse", revisionRef], checkout);
  const treePaths = (await git(["ls-tree", "-r", "--name-only", revision], checkout)).split(/\r?\n/u);
  const skillPaths = treePaths.filter((entry) => /(^|\/)SKILL\.md$/u.test(entry) && !/(^|\/)(node_modules|\.venv|fixtures?|testdata)(\/|$)/u.test(entry)).sort();
  const licensePath = treePaths.find((entry) => /(^|\/)(LICENSE|LICENSE\.md|LICENSE\.txt)$/iu.test(entry));
  const license = licensePath ? licenseFrom(await git(["show", `${revision}:${licensePath}`], checkout)) : { status: "unknown" as const };
  const records: UpstreamSkillRecord[] = [];
  for (const skillPath of skillPaths) {
    const content = await git(["show", `${revision}:${skillPath}`], checkout);
    const fallbackName = path.posix.basename(path.posix.dirname(skillPath));
    const metadata = parseFrontmatter(content, fallbackName);
    const category = classify(metadata.name, metadata.description, source.id);
    const storedDescription = license.status === "detected"
      ? metadata.description
      : `Description withheld for metadata-only Skill ${metadata.name} because no repository license was detected.`;
    records.push({
      id: `upstream-${safeId(source.id)}-${safeId(skillPath)}-${hash(content).slice(7, 15)}`,
      source: source.id,
      repository: source.repository,
      revision,
      path: skillPath,
      name: metadata.name,
      description: storedDescription,
      family: category.family,
      specialty: category.specialty,
      trust: source.trust,
      license: { ...license },
      contentFingerprint: hash(content)
    });
  }
  return records;
}

export async function collectUpstreamInventory(root: string, options: UpstreamCollectionOptions = {}): Promise<UpstreamInventory> {
  const document = parse(await readFile(path.join(root, "catalog", "sources.yaml"), "utf8")) as SourceDocument;
  const sources = document.sources.filter((source): source is GitHubSource => source.kind === "github-skills");
  const records = (await Promise.all(sources.map((source) => collectSource(root, source, options.refresh ?? false)))).flat()
    .sort((left, right) => left.id.localeCompare(right.id));
  const firstByFingerprint = new Map<string, string>();
  for (const record of records) {
    const first = firstByFingerprint.get(record.contentFingerprint);
    if (first) record.duplicateOf = first;
    else firstByFingerprint.set(record.contentFingerprint, record.id);
  }
  const inventory: UpstreamInventory = {
    schemaVersion: 1,
    generatedAt: options.generatedAt ?? document.verifiedAt,
    policy: "Metadata and content fingerprints only. Upstream instructions, scripts, packages, and assets are never executed or republished by this inventory.",
    sourceCount: sources.length,
    recordCount: records.length,
    uniqueContentCount: firstByFingerprint.size,
    digest: hash(JSON.stringify(records)),
    records
  };
  await writeFile(path.join(root, "catalog", "upstream-skill-inventory.yaml"), stringify(inventory), "utf8");
  return inventory;
}

export function upstreamInventoryStats(inventory: UpstreamInventory): {
  records: number;
  uniqueContent: number;
  duplicates: number;
  byFamily: Record<string, number>;
  bySource: Record<string, number>;
} {
  const byFamily: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  for (const record of inventory.records) {
    byFamily[record.family] = (byFamily[record.family] ?? 0) + 1;
    bySource[record.source] = (bySource[record.source] ?? 0) + 1;
  }
  return {
    records: inventory.recordCount,
    uniqueContent: inventory.uniqueContentCount,
    duplicates: inventory.recordCount - inventory.uniqueContentCount,
    byFamily: Object.fromEntries(Object.entries(byFamily).sort()),
    bySource: Object.fromEntries(Object.entries(bySource).sort())
  };
}
