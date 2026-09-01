import { readdir } from "node:fs/promises";
import path from "node:path";
import { readYaml } from "./registry.js";
import type { CapabilityPack, SkillContract } from "./types.js";

export async function loadPacks(root: string): Promise<CapabilityPack[]> {
  const packRoot = path.join(root, "packs");
  const files = (await readdir(packRoot)).filter((file) => file.endsWith(".yaml")).sort();
  return Promise.all(files.map((file) => readYaml<CapabilityPack>(path.join(packRoot, file))));
}

export function validatePack(pack: CapabilityPack, contracts: SkillContract[]): string[] {
  const errors: string[] = [];
  const byId = new Map(contracts.map((contract) => [contract.id, contract]));
  const members = new Set([...pack.atoms, ...(pack.specialSkills ?? [])]);

  for (const id of pack.atoms) {
    const contract = byId.get(id);
    if (!contract) errors.push(`unknown atom: ${id}`);
    else if (contract.kind !== "atom") errors.push(`pack atom ${id} has kind ${contract.kind}`);
  }
  for (const id of pack.specialSkills ?? []) {
    const contract = byId.get(id);
    if (!contract) errors.push(`unknown special Skill: ${id}`);
    else if (contract.kind === "atom") errors.push(`special Skill ${id} must not be an atom`);
  }

  const outgoing = new Map<string, string[]>();
  for (const edge of pack.ordering ?? []) {
    if (!members.has(edge.before)) errors.push(`ordering references non-member: ${edge.before}`);
    if (!members.has(edge.after)) errors.push(`ordering references non-member: ${edge.after}`);
    const targets = outgoing.get(edge.before) ?? [];
    targets.push(edge.after);
    outgoing.set(edge.before, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, stack: string[]): void => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      errors.push(`ordering cycle: ${[...stack.slice(Math.max(0, start)), id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of outgoing.get(id) ?? []) visit(target, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of members) visit(id, []);

  return [...new Set(errors)].sort();
}
