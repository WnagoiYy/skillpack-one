import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { loadContracts } from "../src/registry.js";
import type { UpstreamInventory, UpstreamSkillRecord } from "../src/catalog/upstream.js";

interface Evidence {
  catalogEntry?: string;
  inventoryEntry?: string;
  contribution: string;
  usage: "design-evidence-only";
}

interface DecompositionMap {
  schemaVersion: 1;
  snapshotDigest: string;
  inventoryDigest: string;
  policy: string;
  capabilityMappings: Array<{ capability: string; synthesis: string; evidence: Evidence[] }>;
  packMappings: unknown[];
}

const STOP = new Set(["atom", "meta", "skill", "one", "with", "from", "into", "this", "that", "the", "and", "for", "without", "use", "using"]);

const PREFERRED_EVIDENCE: Record<string, string[]> = {
  "meta-upstream-skill-curator": [
    "upstream-google-skills-skills-cloud-agent-platform-skill-registry-skill-md-98b7657f",
    "upstream-hypergiant-agent-skills-skills-accelint-skill-manager-skill-md-ca7e0845"
  ],
  "meta-skill-author": [
    "upstream-openai-skills-skills-system-skill-creator-skill-md-4505f516",
    "upstream-sentry-skills-skills-skill-writer-skill-md-6e3f3296"
  ],
  "meta-skill-quality-auditor": [
    "upstream-alirezarezvani-claude-skills-engineering-skills-skill-security-auditor-skill-md-e0bd2e04",
    "upstream-microsoft-cat-agent-skills-submissions-skill-authoring-coach-skill-md-72167435"
  ],
  "meta-skill-evaluator": [
    "upstream-microsoft-cat-agent-skills-submissions-agent-evaluation-designer-skill-md-5ac29c6e",
    "upstream-context-engineering-skills-skills-evaluation-skill-md-b187fe25"
  ],
  "meta-skill-optimizer": [
    "upstream-trailofbits-skills-plugins-code-improver-skills-skill-improver-skill-md-1d2d8d1b",
    "upstream-anthropic-skills-skills-skill-creator-skill-md-c08c99c4"
  ],
  "meta-skill-compatibility-migrator": [
    "upstream-openai-skills-skills-curated-migrate-to-codex-skill-md-a60f3e9a",
    "upstream-sentry-skills-skills-skill-writer-skill-md-6e3f3296"
  ],
  "meta-skill-composer": [
    "upstream-alirezarezvani-claude-skills-engineering-workflow-builder-skills-workflow-builder-skill-md-5b977a62",
    "upstream-wshobson-agent-skills-plugins-agent-teams-skills-team-composition-patterns-skill-md-5112e480"
  ]
};

function terms(value: string): Set<string> {
  return new Set((value.toLowerCase().match(/[a-z0-9]{3,}/gu) ?? []).filter((term) => !STOP.has(term)));
}

function score(record: UpstreamSkillRecord, wanted: Set<string>): number {
  const actual = terms(`${record.name} ${record.description} ${record.family} ${record.specialty}`);
  let overlap = 0;
  for (const term of wanted) if (actual.has(term)) overlap += term.length >= 8 ? 3 : 1;
  if (record.duplicateOf) overlap -= 20;
  if (record.license.status === "detected") overlap += 1;
  return overlap;
}

export async function generateDecompositionMap(root: string): Promise<void> {
  const mapPath = path.join(root, "catalog", "decomposition-map.yaml");
  const [document, inventory, contracts] = await Promise.all([
    readFile(mapPath, "utf8").then((text) => parse(text) as DecompositionMap),
    readFile(path.join(root, "catalog", "upstream-skill-inventory.yaml"), "utf8").then((text) => parse(text, { maxAliasCount: -1 }) as UpstreamInventory),
    loadContracts(root)
  ]);
  document.inventoryDigest = inventory.digest;
  const existing = new Map(document.capabilityMappings.map((mapping) => [mapping.capability, mapping]));
  for (const contract of contracts.filter((candidate) => candidate.kind !== "category")) {
    const preferred = PREFERRED_EVIDENCE[contract.id];
    if (existing.has(contract.id) && !preferred) continue;
    const wanted = terms(`${contract.id} ${contract.name.en} ${contract.summary.en} ${contract.routing.positiveTriggers.en.join(" ")}`);
    const selected = preferred
      ? preferred.map((id) => {
          const record = inventory.records.find((candidate) => candidate.id === id);
          if (!record) throw new Error(`Preferred evidence ${id} for ${contract.id} is missing from the inventory`);
          return record;
        })
      : inventory.records
        .filter((record) => !record.duplicateOf)
        .map((record) => ({ record, score: score(record, wanted) }))
        .sort((left, right) => right.score - left.score || left.record.id.localeCompare(right.record.id))
        .slice(0, 2)
        .map(({ record }) => record);
    existing.set(contract.id, {
      capability: contract.id,
      synthesis: `${contract.summary.en} The local contract narrows multiple upstream patterns to one outcome and keeps their instruction bodies out of the package.`,
      evidence: selected.map((record) => ({
        inventoryEntry: record.id,
        contribution: `${record.name} contributes independently fingerprinted boundary and workflow design evidence.`,
        usage: "design-evidence-only" as const
      }))
    });
  }
  document.capabilityMappings = [...existing.values()].sort((left, right) => left.capability.localeCompare(right.capability));
  await writeFile(mapPath, stringify(document), "utf8");
}

const entry = process.argv[1];
if (entry && import.meta.url === new URL(`file:///${entry.replace(/\\/gu, "/")}`).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  await generateDecompositionMap(root);
  process.stdout.write("Generated decomposition evidence mappings.\n");
}
