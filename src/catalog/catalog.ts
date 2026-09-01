import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { parse, stringify } from "yaml";
import type { CatalogEntry } from "../types.js";

interface McpRegistrySource {
  id: string;
  kind: "mcp-registry";
  endpoint: string;
  target: number;
  trust: string;
}

interface GitHubSkillsSource {
  id: string;
  kind: "github-skills";
  repository: string;
  trust: string;
}

type CatalogSource = McpRegistrySource | GitHubSkillsSource;

interface SourceDocument {
  schemaVersion: 1;
  verifiedAt: string;
  sources: CatalogSource[];
}

interface McpRegistryRecord {
  server: {
    name: string;
    title?: string;
    description?: string;
    version: string;
    repository?: { url?: string; source?: string };
    [key: string]: unknown;
  };
  _meta?: Record<string, Record<string, unknown>>;
}

const execFileAsync = promisify(execFile);

export interface CatalogStats {
  total: number;
  byType: Record<CatalogEntry["type"], number>;
  byLicenseStatus: Record<CatalogEntry["license"]["status"], number>;
}

export interface CollectionResult {
  entries: CatalogEntry[];
  sources: Array<{ id: string; count: number; revision?: string }>;
  verifiedAt: string;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function slug(value: string, maxLength = 120): string {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, maxLength)
    .replace(/-+$/u, "");
  return normalized || "capability";
}

function capabilityTerms(...values: Array<string | undefined>): string[] {
  const ignored = new Set(["and", "for", "from", "mcp", "server", "the", "with", "your", "this", "that"]);
  const terms = values
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.toLowerCase().match(/[a-z0-9]{3,}/gu) ?? [])
    .filter((term) => !ignored.has(term));
  return [...new Set(["mcp", ...terms])].slice(0, 8);
}

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "self-organizing-skills-catalog/0.1", Accept: "application/json", ...headers }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}: ${(await response.text()).slice(0, 500)}`);
  }
  return (await response.json()) as T;
}

function githubCoordinates(repository: string): { owner: string; repo: string } {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/#]+)\/?$/u.exec(repository);
  if (!match?.[1] || !match[2]) throw new Error(`Unsupported GitHub repository URL: ${repository}`);
  return { owner: match[1], repo: match[2].replace(/\.git$/u, "") };
}

function detectLicense(content: string | undefined): string | undefined {
  if (!content) return undefined;
  if (/Apache License\s+Version 2\.0/iu.test(content)) return "Apache-2.0";
  if (/MIT License/iu.test(content) || /Permission is hereby granted, free of charge/iu.test(content)) return "MIT";
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/iu.test(content)) return "AGPL-3.0-only";
  if (/GNU GENERAL PUBLIC LICENSE[\s\S]{0,100}Version 3/iu.test(content)) return "GPL-3.0-only";
  if (/BSD 3-Clause/iu.test(content)) return "BSD-3-Clause";
  return undefined;
}

async function git(args: string[], cwd?: string): Promise<string> {
  const result = await execFileAsync("git", args, {
    ...(cwd ? { cwd } : {}),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });
  return result.stdout.trim();
}

async function collectMcp(source: McpRegistrySource, verifiedAt: string): Promise<CatalogEntry[]> {
  const records: McpRegistryRecord[] = [];
  let cursor: string | undefined;
  while (records.length < source.target) {
    const url = new URL(source.endpoint);
    url.searchParams.set("limit", String(Math.min(100, source.target - records.length)));
    url.searchParams.set("version", "latest");
    if (cursor) url.searchParams.set("cursor", cursor);
    const page = await fetchJson<{ servers: McpRegistryRecord[]; metadata: { nextCursor?: string } }>(url.href);
    records.push(...page.servers);
    cursor = page.metadata.nextCursor;
    if (!cursor || page.servers.length === 0) break;
  }

  return records.slice(0, source.target).map((record) => {
    const server = record.server;
    const revision = digest(server);
    const repository =
      server.repository?.url?.startsWith("https://") === true
        ? server.repository.url
        : "https://github.com/modelcontextprotocol/registry";
    const author = repository.startsWith("https://github.com/")
      ? repository.split("/")[3] ?? server.name.split("/")[0] ?? "unknown"
      : server.name.split("/")[0] ?? "unknown";
    const detailUrl = `${source.endpoint}/${encodeURIComponent(server.name)}/versions/${encodeURIComponent(server.version)}`;
    return {
      schemaVersion: 1,
      id: `mcp-${slug(server.name)}-${revision.slice(0, 10)}`,
      type: "mcp-server",
      name: server.title || server.name,
      summary: server.description || `MCP server ${server.name}`,
      author,
      source: {
        repository,
        revision,
        path: `${server.name}@${server.version}`,
        url: detailUrl
      },
      license: { status: "unknown" },
      verifiedAt,
      capabilities: capabilityTerms(server.name, server.title, server.description),
      security: {
        status: "metadata-reviewed",
        executesUpstreamCode: false,
        notes: "Cataloged from the official MCP Registry; packages and remotes were not executed."
      },
      fingerprint: `sha256:${revision}`,
      freshness: "current"
    } satisfies CatalogEntry;
  });
}

async function collectGitHubSkills(
  source: GitHubSkillsSource,
  verifiedAt: string
): Promise<{ entries: CatalogEntry[]; revision: string }> {
  const { owner, repo } = githubCoordinates(source.repository);
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "sos-catalog-git-"));
  const checkout = path.join(temporaryRoot, "repository");
  try {
    await git(["clone", "--depth", "1", "--filter=blob:none", "--no-checkout", source.repository, checkout]);
    const revision = await git(["rev-parse", "HEAD"], checkout);
    const treePaths = (await git(["ls-tree", "-r", "--name-only", "HEAD"], checkout)).split(/\r?\n/u);
    const skillPaths = treePaths
      .filter(
        (entry) =>
          /(^|\/)SKILL\.md$/u.test(entry) &&
          !/(^|\/)(node_modules|\.venv|fixtures?|testdata)(\/|$)/u.test(entry)
      )
      .sort();
    const licensePath = treePaths.find((entry) => /(^|\/)(LICENSE|LICENSE\.md|LICENSE\.txt)$/iu.test(entry));
    let licenseContent: string | undefined;
    if (licensePath) {
      try {
        licenseContent = await git(["show", `HEAD:${licensePath}`], checkout);
      } catch {
        licenseContent = undefined;
      }
    }
    const licenseId = detectLicense(licenseContent);
    const fullName = `${owner}/${repo}`;
    const entries = skillPaths.map((skillPath) => {
      const skillDirectory = path.posix.dirname(skillPath);
      const name = path.posix.basename(skillDirectory);
      const entryDigest = digest({ repository: fullName, revision, path: skillDirectory });
      return {
        schemaVersion: 1,
        id: `skill-${slug(owner, 30)}-${slug(repo, 40)}-${slug(name, 50)}-${entryDigest.slice(0, 8)}`,
        type: "skill",
        name,
        summary: `Agent Skill ${name} from ${fullName}.`,
        author: owner,
        source: {
          repository: source.repository,
          revision,
          path: skillDirectory,
          url: `${source.repository}/tree/${revision}/${skillDirectory}`
        },
        license: licenseId ? { status: "detected", spdx: licenseId } : { status: "unknown" },
        verifiedAt,
        capabilities: [...new Set(name.split(/[-_]+/u).filter(Boolean))],
        security: {
          status: "unreviewed",
          executesUpstreamCode: false,
          notes: "Discovered from a shallow, no-checkout Git tree; Skill instructions and scripts were not executed."
        },
        fingerprint: `sha256:${entryDigest}`,
        freshness: "current"
      } satisfies CatalogEntry;
    });
    return { entries, revision };
  } finally {
    const resolvedTemporary = path.resolve(temporaryRoot);
    if (!resolvedTemporary.startsWith(path.resolve(os.tmpdir()) + path.sep)) {
      throw new Error("Refusing to remove catalog temporary directory outside the system temp root");
    }
    await rm(resolvedTemporary, { recursive: true, force: true });
  }
}

export function catalogStats(entries: CatalogEntry[]): CatalogStats {
  const byType: CatalogStats["byType"] = { skill: 0, "mcp-server": 0, plugin: 0, harness: 0 };
  const byLicenseStatus: CatalogStats["byLicenseStatus"] = {
    declared: 0,
    detected: 0,
    unknown: 0,
    conflicting: 0
  };
  for (const entry of entries) {
    byType[entry.type] += 1;
    byLicenseStatus[entry.license.status] += 1;
  }
  return { total: entries.length, byType, byLicenseStatus };
}

export async function loadCatalog(root: string): Promise<CatalogEntry[]> {
  const entriesRoot = path.join(root, "catalog", "entries");
  const files = (await readdir(entriesRoot)).filter((file) => file.endsWith(".yaml")).sort();
  return Promise.all(
    files.map(async (file) => parse(await readFile(path.join(entriesRoot, file), "utf8")) as CatalogEntry)
  );
}

export async function collectCatalog(root: string): Promise<CollectionResult> {
  const sourcePath = path.join(root, "catalog", "sources.yaml");
  const document = parse(await readFile(sourcePath, "utf8")) as SourceDocument;
  const entries: CatalogEntry[] = [];
  const sourceResults: CollectionResult["sources"] = [];

  for (const source of document.sources) {
    if (source.kind === "mcp-registry") {
      const collected = await collectMcp(source, document.verifiedAt);
      entries.push(...collected);
      sourceResults.push({ id: source.id, count: collected.length });
    } else {
      const collected = await collectGitHubSkills(source, document.verifiedAt);
      entries.push(...collected.entries);
      sourceResults.push({ id: source.id, count: collected.entries.length, revision: collected.revision });
    }
  }

  const unique = new Map(entries.map((entry) => [entry.id, entry]));
  const normalized = [...unique.values()].sort((left, right) => left.id.localeCompare(right.id));
  const entriesRoot = path.resolve(root, "catalog", "entries");
  const catalogRoot = path.resolve(root, "catalog");
  if (path.dirname(entriesRoot) !== catalogRoot) throw new Error("Refusing to write catalog outside catalog root");
  await rm(entriesRoot, { recursive: true, force: true });
  await mkdir(entriesRoot, { recursive: true });
  for (const entry of normalized) {
    await writeFile(path.join(entriesRoot, `${entry.id}.yaml`), stringify(entry), "utf8");
  }

  const snapshotRoot = path.join(catalogRoot, "snapshots");
  await mkdir(snapshotRoot, { recursive: true });
  await writeFile(
    path.join(snapshotRoot, "manifest.yaml"),
    stringify({
      schemaVersion: 1,
      verifiedAt: document.verifiedAt,
      entryCount: normalized.length,
      digest: `sha256:${digest(normalized)}`,
      sources: sourceResults
    }),
    "utf8"
  );

  return { entries: normalized, sources: sourceResults, verifiedAt: document.verifiedAt };
}
