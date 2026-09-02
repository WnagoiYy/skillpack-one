import { createRequire } from "node:module";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ErrorObject, ValidateFunction } from "ajv";
import { loadContracts, loadTaxonomy } from "./registry.js";
import { loadPacks } from "./packs.js";
import {
  loadEvolutionPatternDocuments,
  renderEvolutionKnowledgeIndex,
  validateEvolutionKnowledgeGraph
} from "./train/knowledge.js";
import { validatePackRuntimeStateProfile } from "./runtime/state.js";
import type { Taxonomy } from "./types.js";

const require = createRequire(import.meta.url);
interface AjvLike {
  compile(schema: object): ValidateFunction;
}
const Ajv2020 = (require("ajv/dist/2020").default ?? require("ajv/dist/2020")) as new (
  options: object
) => AjvLike;
const addFormats = (require("ajv-formats").default ?? require("ajv-formats")) as (
  ajv: AjvLike
) => AjvLike;

export interface ValidationReport {
  checked: string[];
  errors: string[];
}

async function schemaValidator(root: string, schemaName: string): Promise<ValidateFunction> {
  const schema = JSON.parse(
    await readFile(path.join(root, "schemas", `${schemaName}.schema.json`), "utf8")
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

function formatSchemaErrors(label: string, errors: ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map(
    (error) => `${label}${error.instancePath || "/"}: ${error.message ?? error.keyword}`
  );
}

export function lintTaxonomy(taxonomy: Taxonomy): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const canonical = new Map<string, Taxonomy["nodes"][number]>();

  for (const node of taxonomy.nodes) {
    if (seen.has(node.id)) errors.push(`duplicate taxonomy node id: ${node.id}`);
    seen.add(node.id);
    if (!canonical.has(node.id)) canonical.set(node.id, node);
  }

  for (const node of taxonomy.nodes) {
    if (node.parent && !canonical.has(node.parent)) {
      errors.push(`taxonomy node ${node.id} references missing parent: ${node.parent}`);
    }
  }

  const completed = new Set<string>();
  for (const node of canonical.values()) {
    if (completed.has(node.id)) continue;
    const pathIds: string[] = [];
    const positions = new Map<string, number>();
    let current: Taxonomy["nodes"][number] | undefined = node;
    while (current && !completed.has(current.id)) {
      const previousPosition = positions.get(current.id);
      if (previousPosition !== undefined) {
        const cycle = [...pathIds.slice(previousPosition), current.id].join(" -> ");
        errors.push(`taxonomy cycle: ${cycle}`);
        break;
      }
      positions.set(current.id, pathIds.length);
      pathIds.push(current.id);
      current = current.parent ? canonical.get(current.parent) : undefined;
    }
    for (const id of pathIds) completed.add(id);
  }

  const maximumDepth = taxonomy.maxDepth ?? 3;
  for (const node of canonical.values()) {
    let depth = 1;
    let current = node;
    const visited = new Set([node.id]);
    while (current.parent) {
      const parent = canonical.get(current.parent);
      if (!parent || visited.has(parent.id)) break;
      visited.add(parent.id);
      depth += 1;
      current = parent;
    }
    if (depth > maximumDepth) {
      errors.push(`taxonomy node ${node.id} exceeds maximum category depth ${maximumDepth}: depth ${depth}`);
    }
  }

  return [...new Set(errors)].sort();
}

export async function validateRepository(root: string): Promise<ValidationReport> {
  const checked: string[] = [];
  const errors: string[] = [];

  const taxonomy = await loadTaxonomy(root);
  const taxonomyValidator = await schemaValidator(root, "taxonomy");
  checked.push("taxonomy/taxonomy.yaml");
  if (!taxonomyValidator(taxonomy)) {
    errors.push(...formatSchemaErrors("taxonomy/taxonomy.yaml", taxonomyValidator.errors));
  }
  errors.push(...lintTaxonomy(taxonomy));

  const contractValidator = await schemaValidator(root, "skill-contract");
  const contracts = await loadContracts(root);
  const sourceDirectories = (await readdir(path.join(root, "skill-src"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const sourceDirectorySet = new Set(sourceDirectories);
  const contractIds = new Set(contracts.map((contract) => contract.id));
  const taxonomyIds = new Set(taxonomy.nodes.map((node) => node.id));

  for (const directory of sourceDirectories) {
    if (!contractIds.has(directory)) {
      errors.push(`skill-src/${directory}/skill.contract.yaml: missing required shared contract`);
    }
  }

  for (const contract of contracts) {
    const label = `skill-src/${contract.id}/skill.contract.yaml`;
    checked.push(label);
    if (!contractValidator(contract)) {
      errors.push(...formatSchemaErrors(label, contractValidator.errors));
    }
    if (!sourceDirectorySet.has(contract.id)) {
      errors.push(`${label}: contract id has no matching Skill directory`);
    }
    if (!taxonomyIds.has(contract.taxonomy.primaryCategory)) {
      errors.push(`${label}: unknown primary category ${contract.taxonomy.primaryCategory}`);
    }
    for (const secondary of contract.taxonomy.secondaryCategories ?? []) {
      if (!taxonomyIds.has(secondary)) errors.push(`${label}: unknown secondary category ${secondary}`);
    }
    if (contract.kind === "category" && contract.id !== `category-${contract.taxonomy.primaryCategory}`) {
      errors.push(`${label}: category contract id must match its primary category`);
    }
  }

  for (const node of taxonomy.nodes) {
    if (!contractIds.has(`category-${node.id}`)) {
      errors.push(`taxonomy node ${node.id} has no matching Category Skill contract`);
    }
  }

  const [patternDocuments, packs] = await Promise.all([
    loadEvolutionPatternDocuments(root),
    loadPacks(root)
  ]);
  const patternValidator = await schemaValidator(root, "evolution-pattern");
  const validPatternDocuments: typeof patternDocuments = [];
  for (const document of patternDocuments) {
    checked.push(document.file);
    if (!patternValidator(document.pattern)) {
      errors.push(...formatSchemaErrors(document.file, patternValidator.errors));
    } else validPatternDocuments.push(document);
  }
  errors.push(...validateEvolutionKnowledgeGraph(
    validPatternDocuments,
    new Set(contracts.map((contract) => contract.id)),
    new Set(packs.map((pack) => pack.id))
  ));
  for (const pack of packs) {
    if (pack.runtimeState) {
      checked.push(pack.runtimeState.stateSchema, pack.runtimeState.initialState);
      errors.push(...await validatePackRuntimeStateProfile(root, pack));
    }
  }
  const knowledgeIndex = ".skill-system/knowledge/index.md";
  checked.push(knowledgeIndex);
  try {
    const actualIndex = await readFile(path.join(root, knowledgeIndex), "utf8");
    const expectedIndex = renderEvolutionKnowledgeIndex(validPatternDocuments.map((document) => document.pattern));
    if (actualIndex !== expectedIndex) errors.push(`${knowledgeIndex}: generated index is stale`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") errors.push(`${knowledgeIndex}: missing generated index`);
    else throw error;
  }

  return { checked, errors: [...new Set(errors)].sort() };
}
