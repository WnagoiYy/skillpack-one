import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import type { EvolutionPattern, EvolutionPatternMatch } from "./types.js";

export interface EvolutionPatternDocument {
  file: string;
  pattern: EvolutionPattern;
}

function knowledgeRoot(root: string): string {
  return path.join(root, ".skill-system", "knowledge");
}

export async function loadEvolutionPatternDocuments(root: string): Promise<EvolutionPatternDocument[]> {
  const patternsRoot = path.join(knowledgeRoot(root), "patterns");
  let files: string[];
  try {
    files = (await readdir(patternsRoot)).filter((file) => file.endsWith(".yaml")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return Promise.all(files.map(async (file) => ({
    file: path.posix.join(".skill-system", "knowledge", "patterns", file),
    pattern: parse(await readFile(path.join(patternsRoot, file), "utf8")) as EvolutionPattern
  })));
}

export async function loadEvolutionPatterns(root: string): Promise<EvolutionPattern[]> {
  return (await loadEvolutionPatternDocuments(root)).map((document) => document.pattern);
}

export function validateEvolutionKnowledgeGraph(
  documents: EvolutionPatternDocument[],
  knownSkills: ReadonlySet<string>,
  knownPacks: ReadonlySet<string>
): string[] {
  const errors: string[] = [];
  const byId = new Map<string, EvolutionPattern>();
  for (const { file, pattern } of documents) {
    const expectedFile = `${pattern.id}.yaml`;
    if (path.posix.basename(file) !== expectedFile) errors.push(`${file}: filename must be ${expectedFile}`);
    if (byId.has(pattern.id)) errors.push(`duplicate evolution pattern id: ${pattern.id}`);
    else byId.set(pattern.id, pattern);
    if (pattern.updatedAt < pattern.createdAt) errors.push(`${pattern.id}: updatedAt precedes createdAt`);
    if (pattern.supersedes.includes(pattern.id)) errors.push(`${pattern.id}: pattern cannot supersede itself`);
    for (const skill of pattern.scope.skills) {
      if (!knownSkills.has(skill)) errors.push(`${pattern.id}: unknown scoped Skill ${skill}`);
    }
    for (const pack of pattern.scope.packs) {
      if (!knownPacks.has(pack)) errors.push(`${pattern.id}: unknown scoped capability pack ${pack}`);
    }
  }
  for (const pattern of byId.values()) {
    for (const superseded of pattern.supersedes) {
      if (!byId.has(superseded)) errors.push(`${pattern.id}: supersedes unknown pattern ${superseded}`);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, stack: string[]): void => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      errors.push(`evolution pattern supersession cycle: ${[...stack.slice(Math.max(0, start)), id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of byId.get(id)?.supersedes ?? []) visit(target, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id, []);
  return [...new Set(errors)].sort();
}

function tokens(value: string): string[] {
  return [...new Set(value.normalize("NFKC").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])]
    .filter((token) => token.length > 1);
}

export function searchEvolutionPatterns(query: string, patterns: EvolutionPattern[]): EvolutionPatternMatch[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];
  return patterns
    .filter((pattern) => pattern.status === "active")
    .map((pattern): EvolutionPatternMatch | undefined => {
      const idTokens = new Set(tokens(pattern.id));
      const bodyTokens = new Set(tokens([
        pattern.summary,
        pattern.problem,
        pattern.rootCause,
        pattern.response,
        ...pattern.scope.skills,
        ...pattern.scope.packs,
        ...pattern.scope.harnesses
      ].join(" ")));
      const matched = queryTokens.filter((token) => idTokens.has(token) || bodyTokens.has(token));
      if (matched.length === 0) return undefined;
      const score = matched.reduce((sum, token) => sum + (idTokens.has(token) ? 2 : 1), 0) / queryTokens.length;
      return { id: pattern.id, score: Number(score.toFixed(4)), matched, summary: pattern.summary, confidence: pattern.confidence };
    })
    .filter((match): match is EvolutionPatternMatch => Boolean(match))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

export function renderEvolutionKnowledgeIndex(patterns: EvolutionPattern[]): string {
  const lines = [
    "# Evolution Knowledge",
    "",
    "Generated from versioned pattern records. This index is governance context, not task-execution instruction.",
    ""
  ];
  for (const pattern of [...patterns].sort((left, right) => left.id.localeCompare(right.id))) {
    const scope = [...pattern.scope.skills, ...pattern.scope.packs, ...pattern.scope.harnesses];
    lines.push(`- \`${pattern.id}\` — ${pattern.summary}`);
    lines.push(`  - Status: \`${pattern.status}\`; confidence: \`${pattern.confidence}\`; scope: ${scope.length ? scope.map((value) => `\`${value}\``).join(", ") : "global"}`);
  }
  lines.push("");
  return lines.join("\n");
}

export async function writeEvolutionKnowledgeIndex(root: string, patterns: EvolutionPattern[]): Promise<string> {
  const directory = knowledgeRoot(root);
  const output = path.join(directory, "index.md");
  await mkdir(directory, { recursive: true });
  await writeFile(output, renderEvolutionKnowledgeIndex(patterns), "utf8");
  return output;
}
