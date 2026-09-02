import { readdir } from "node:fs/promises";
import path from "node:path";
import { readYaml } from "./registry.js";
import type {
  CapabilityPack,
  CapabilityPackPlan,
  PackRecommendation,
  RouteTrace,
  SkillContract
} from "./types.js";

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

function packMembers(pack: CapabilityPack): string[] {
  return [...pack.atoms, ...(pack.specialSkills ?? [])];
}

export function compilePackPlan(pack: CapabilityPack, contracts: SkillContract[]): CapabilityPackPlan {
  const errors = validatePack(pack, contracts);
  if (errors.length > 0) throw new Error(`Invalid capability pack ${pack.id}: ${errors.join("; ")}`);

  const members = packMembers(pack);
  const remaining = new Set(members);
  const indegree = new Map(members.map((id) => [id, 0]));
  const outgoing = new Map<string, string[]>();
  for (const edge of pack.ordering ?? []) {
    outgoing.set(edge.before, [...(outgoing.get(edge.before) ?? []), edge.after]);
    indegree.set(edge.after, (indegree.get(edge.after) ?? 0) + 1);
  }

  const stages: string[][] = [];
  while (remaining.size > 0) {
    const ready = members.filter((id) => remaining.has(id) && (indegree.get(id) ?? 0) === 0);
    if (ready.length === 0) throw new Error(`Capability pack ${pack.id} contains an ordering cycle`);
    stages.push(ready);
    for (const id of ready) {
      remaining.delete(id);
      for (const target of outgoing.get(id) ?? []) indegree.set(target, (indegree.get(target) ?? 0) - 1);
    }
  }

  return {
    pack: pack.id,
    name: pack.name,
    skills: members,
    stages,
    acceptanceTests: pack.acceptanceTests
  };
}

export function recommendPacks(
  trace: RouteTrace,
  packs: CapabilityPack[],
  contracts: SkillContract[],
  minimumSkillScore = 1
): PackRecommendation[] {
  const candidateScores = new Map(
    [...trace.atoms, ...trace.special].map((candidate) => [candidate.id, candidate.score])
  );

  return packs
    .map((pack): PackRecommendation | undefined => {
      const members = packMembers(pack);
      const matchedSkills = members.filter((id) => (candidateScores.get(id) ?? 0) >= minimumSkillScore);
      const minimumMatches = Math.min(2, members.length);
      if (matchedSkills.length < minimumMatches) return undefined;
      const missingSkills = members.filter((id) => !matchedSkills.includes(id));
      const relevance = matchedSkills.reduce((sum, id) => sum + (candidateScores.get(id) ?? 0), 0) / members.length;
      const coverage = matchedSkills.length / members.length;
      return {
        pack: pack.id,
        score: Number((relevance + coverage * 2).toFixed(4)),
        matchedSkills,
        missingSkills,
        plan: compilePackPlan(pack, contracts)
      };
    })
    .filter((candidate): candidate is PackRecommendation => Boolean(candidate))
    .sort((left, right) => right.score - left.score || left.pack.localeCompare(right.pack));
}
