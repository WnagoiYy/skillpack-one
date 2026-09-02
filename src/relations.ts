import type {
  CapabilityPack,
  SkillContract,
  SkillRelationEdge,
  SkillRelationGraph,
  SkillRelationType
} from "./types.js";

function edgeKey(from: string, to: string, type: SkillRelationType): string {
  return `${type}\u0000${from}\u0000${to}`;
}

export function buildSkillRelationGraph(
  contracts: SkillContract[],
  packs: CapabilityPack[]
): SkillRelationGraph {
  const nodes = [
    ...contracts.map((contract) => ({ id: contract.id, kind: contract.kind })),
    ...packs.map((pack) => ({ id: pack.id, kind: "pack" as const }))
  ].sort((left, right) => left.id.localeCompare(right.id));
  const edgeMap = new Map<string, SkillRelationEdge>();
  const addEdge = (from: string, to: string, type: SkillRelationType, evidence: string) => {
    const key = edgeKey(from, to, type);
    const existing = edgeMap.get(key);
    if (existing) existing.evidence = [...new Set([...existing.evidence, evidence])].sort();
    else edgeMap.set(key, { from, to, type, evidence: [evidence] });
  };

  for (const contract of contracts) {
    for (const target of contract.routing.confusableWith) {
      addEdge(contract.id, target, "confusable-with", `contract:${contract.id}`);
    }
  }

  for (const pack of packs) {
    const members = [...new Set([...pack.atoms, ...(pack.specialSkills ?? [])])].sort();
    for (const member of members) addEdge(member, pack.id, "packaged-in", `pack:${pack.id}`);
    for (let left = 0; left < members.length; left += 1) {
      for (let right = left + 1; right < members.length; right += 1) {
        addEdge(members[left]!, members[right]!, "compose-with", `pack:${pack.id}`);
      }
    }
    for (const order of pack.ordering ?? []) {
      addEdge(order.after, order.before, "depends-on", `pack:${pack.id}`);
    }
  }

  return {
    schemaVersion: 1,
    nodes,
    edges: [...edgeMap.values()].sort(
      (left, right) => left.type.localeCompare(right.type) || left.from.localeCompare(right.from) || left.to.localeCompare(right.to)
    )
  };
}

export function validateSkillRelationGraph(graph: SkillRelationGraph): string[] {
  const failures: string[] = [];
  const nodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) failures.push(`duplicate relation node: ${node.id}`);
    nodeIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    const key = edgeKey(edge.from, edge.to, edge.type);
    if (edgeIds.has(key)) failures.push(`duplicate relation: ${edge.from} ${edge.type} ${edge.to}`);
    edgeIds.add(key);
    if (!nodeIds.has(edge.from)) {
      failures.push(`relation ${edge.from} ${edge.type} ${edge.to} references unknown endpoint ${edge.from}`);
    }
    if (!nodeIds.has(edge.to)) {
      failures.push(`relation ${edge.from} ${edge.type} ${edge.to} references unknown endpoint ${edge.to}`);
    }
    if (edge.from === edge.to) failures.push(`self relation is not allowed: ${edge.from} ${edge.type}`);
    if (edge.evidence.length === 0) failures.push(`relation lacks evidence: ${edge.from} ${edge.type} ${edge.to}`);
  }

  const dependencies = new Map<string, string[]>();
  for (const edge of graph.edges.filter((candidate) => candidate.type === "depends-on")) {
    dependencies.set(edge.from, [...(dependencies.get(edge.from) ?? []), edge.to].sort());
  }
  const complete = new Set<string>();
  const visit = (id: string, path: string[], active: Set<string>) => {
    if (complete.has(id)) return;
    if (active.has(id)) {
      const start = path.indexOf(id);
      failures.push(`depends-on cycle: ${[...path.slice(start), id].join(" -> ")}`);
      return;
    }
    active.add(id);
    path.push(id);
    for (const dependency of dependencies.get(id) ?? []) visit(dependency, path, active);
    path.pop();
    active.delete(id);
    complete.add(id);
  };
  for (const id of [...nodeIds].sort()) visit(id, [], new Set());
  return [...new Set(failures)].sort();
}
