import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";
import { loadCatalog } from "./catalog/catalog.js";
import type { CatalogEntry } from "./types.js";

export interface SimilarityComparison {
  name: number;
  capabilities: number;
  summary: number;
  total: number;
  evidence: string[];
}

export interface DuplicateCluster {
  id: string;
  entries: string[];
  minimumSimilarity: number;
  reason: string;
}

const STOP_WORDS = new Set([
  "agent",
  "and",
  "for",
  "from",
  "mcp",
  "server",
  "skill",
  "skills",
  "the",
  "this",
  "with"
]);

function terms(value: string): Set<string> {
  return new Set(
    (value.toLowerCase().match(/[a-z0-9]+/gu) ?? []).filter((term) => term.length > 1 && !STOP_WORDS.has(term))
  );
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1;
  const intersection = [...left].filter((value) => right.has(value)).length;
  return intersection / new Set([...left, ...right]).size;
}

export function compareCatalogEntries(left: CatalogEntry, right: CatalogEntry): SimilarityComparison {
  const leftName = terms(left.name);
  const rightName = terms(right.name);
  const name = jaccard(leftName, rightName);
  const capabilities = jaccard(new Set(left.capabilities), new Set(right.capabilities));
  const summary = jaccard(terms(left.summary), terms(right.summary));
  const total = left.type === right.type ? 0.55 * name + 0.3 * capabilities + 0.15 * summary : 0;
  const evidence: string[] = [];
  if (name === 1) evidence.push("same-normalized-name");
  if (capabilities === 1) evidence.push("same-capability-terms");
  if (summary >= 0.6) evidence.push("similar-summary");
  return {
    name: Number(name.toFixed(4)),
    capabilities: Number(capabilities.toFixed(4)),
    summary: Number(summary.toFixed(4)),
    total: Number(total.toFixed(4)),
    evidence
  };
}

export function clusterDuplicates(entries: CatalogEntry[], threshold = 0.82): DuplicateCluster[] {
  const parent = new Map(entries.map((entry) => [entry.id, entry.id]));
  const find = (id: string): string => {
    const candidate = parent.get(id) ?? id;
    if (candidate === id) return id;
    const root = find(candidate);
    parent.set(id, root);
    return root;
  };
  const union = (left: string, right: string): void => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot < rightRoot ? leftRoot : rightRoot);
  };

  const buckets = new Map<string, CatalogEntry[]>();
  for (const entry of entries) {
    const key = `${entry.type}:${[...terms(entry.name)].sort().join("-")}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(entry);
    buckets.set(key, bucket);
  }
  const pairScores = new Map<string, number>();
  for (const bucket of buckets.values()) {
    for (let leftIndex = 0; leftIndex < bucket.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < bucket.length; rightIndex += 1) {
        const left = bucket[leftIndex]!;
        const right = bucket[rightIndex]!;
        const comparison = compareCatalogEntries(left, right);
        if (comparison.total >= threshold) {
          union(left.id, right.id);
          pairScores.set([left.id, right.id].sort().join("|"), comparison.total);
        }
      }
    }
  }

  const groups = new Map<string, string[]>();
  for (const entry of entries) {
    const root = find(entry.id);
    const group = groups.get(root) ?? [];
    group.push(entry.id);
    groups.set(root, group);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const sorted = group.sort();
      const scores: number[] = [];
      for (let leftIndex = 0; leftIndex < sorted.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < sorted.length; rightIndex += 1) {
          const score = pairScores.get([sorted[leftIndex]!, sorted[rightIndex]!].sort().join("|"));
          if (score !== undefined) scores.push(score);
        }
      }
      const hash = createHash("sha256").update(sorted.join("\n")).digest("hex").slice(0, 10);
      return {
        id: `duplicate-${hash}`,
        entries: sorted,
        minimumSimilarity: Math.min(...scores),
        reason: "Candidate duplicate based on normalized name, capability terms, and summary; human contract review required."
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function writeDuplicateClusters(root: string, threshold = 0.82): Promise<DuplicateCluster[]> {
  const entries = await loadCatalog(root);
  const clusters = clusterDuplicates(entries, threshold);
  await writeFile(
    path.join(root, "catalog", "duplicate-clusters.yaml"),
    stringify({ schemaVersion: 1, threshold, clusterCount: clusters.length, clusters }),
    "utf8"
  );
  return clusters;
}
