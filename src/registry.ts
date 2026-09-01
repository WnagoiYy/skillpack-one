import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import type { SkillContract, Taxonomy } from "./types.js";

export async function readYaml<T>(filePath: string): Promise<T> {
  return parse(await readFile(filePath, "utf8")) as T;
}

export async function loadTaxonomy(root: string): Promise<Taxonomy> {
  return readYaml<Taxonomy>(path.join(root, "taxonomy", "taxonomy.yaml"));
}

export async function loadContracts(root: string): Promise<SkillContract[]> {
  const sourceRoot = path.join(root, "skill-src");
  let entries;
  try {
    entries = await readdir(sourceRoot, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const contracts = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => readYaml<SkillContract>(path.join(sourceRoot, entry.name, "skill.contract.yaml")))
  );
  return contracts.sort((left, right) => left.id.localeCompare(right.id));
}
