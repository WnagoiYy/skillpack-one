import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ErrorObject, ValidateFunction } from "ajv";
import { loadContracts, loadTaxonomy } from "./registry.js";
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
  for (const contract of contracts) {
    const label = `skill-src/${contract.id}/skill.contract.yaml`;
    checked.push(label);
    if (!contractValidator(contract)) {
      errors.push(...formatSchemaErrors(label, contractValidator.errors));
    }
  }

  return { checked, errors: [...new Set(errors)].sort() };
}
