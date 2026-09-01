import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";
import { parse } from "yaml";
import type { EvalDataset, PermissionEnvelope, RoutingEvaluationResult, RoutingMetrics } from "../types.js";
import type { EvolutionEvaluation, EvolutionProposal } from "./types.js";

const PERMISSION_ORDER = {
  network: ["none", "read", "write"],
  filesystem: ["none", "read", "workspace-write", "unrestricted-write"],
  shell: ["none", "allowlisted", "unrestricted"],
  secrets: ["none", "named-read"],
  externalCommunication: ["none", "draft", "send"]
} as const;

function normalizedRelative(file: string): string | undefined {
  const normalized = path.posix.normalize(file.replaceAll("\\", "/"));
  if (path.posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../")) return undefined;
  return normalized;
}

function permissionExpansions(before: PermissionEnvelope, after: PermissionEnvelope): string[] {
  const expansions: string[] = [];
  for (const key of Object.keys(PERMISSION_ORDER) as Array<keyof PermissionEnvelope>) {
    const order = PERMISSION_ORDER[key] as readonly string[];
    if (order.indexOf(after[key]) > order.indexOf(before[key])) {
      expansions.push(`${key} ${before[key]} -> ${after[key]}`);
    }
  }
  return expansions;
}

export function validateProposal(
  proposal: EvolutionProposal,
  datasetSplits: Record<string, EvalDataset["split"]>
): string[] {
  const errors: string[] = [];
  const allowed = new Set(proposal.allowedFiles.map(normalizedRelative).filter((file): file is string => Boolean(file)));
  for (const file of proposal.changedFiles) {
    const normalized = normalizedRelative(file);
    if (!normalized) errors.push(`invalid changed file path: ${file}`);
    else if (!allowed.has(normalized)) errors.push(`changed file is outside the bounded proposal: ${normalized}`);
    if (normalized?.startsWith("skills/") || normalized?.startsWith(".agents/skills/")) {
      errors.push(`generated Skill projection must not be edited directly: ${normalized}`);
    }
  }

  for (const dataset of proposal.generationDatasets) {
    const split = datasetSplits[dataset];
    if (split === "test" || split === "adversarial" || split === "tasks") {
      errors.push(`generation dataset ${dataset} has protected split ${split}`);
    } else if (!split) errors.push(`generation dataset has unknown split: ${dataset}`);
  }
  for (const dataset of proposal.generationDatasets) {
    if (proposal.evaluationDatasets.includes(dataset)) {
      errors.push(`dataset cannot be both generation and evaluation evidence: ${dataset}`);
    }
  }

  const expansions = permissionExpansions(proposal.permissionBefore, proposal.permissionAfter);
  const permissionApproval = proposal.approvals.some(
    (approval) => approval.type === "permission-expansion" && approval.approvedBy.trim().length > 0
  );
  if (!permissionApproval) {
    for (const expansion of expansions) {
      errors.push(`permission expansion requires explicit permission-expansion approval: ${expansion}`);
    }
  }

  if (
    proposal.targetSkill === "meta-skill-governor" &&
    proposal.changedFiles.some((file) => /(^|\/)(evals\/gates\.yaml|schemas\/evolution-proposal|meta-skill-governor\/references\/evolution-policy)/u.test(file))
  ) {
    errors.push("a meta Skill proposal must not weaken or change its own gate");
  }

  if (proposal.rollbackRevision === proposal.candidateRevision) {
    errors.push("rollback revision must differ from candidate revision");
  }
  return [...new Set(errors)].sort();
}

export function protectedRegressionFailures(
  candidates: RoutingEvaluationResult[],
  baselines: RoutingEvaluationResult[],
  allowedRegression: number
): string[] {
  const baselineByDataset = new Map(baselines.map((baseline) => [baseline.dataset, baseline]));
  const failures: string[] = [];
  for (const candidate of candidates.filter((result) => result.protected)) {
    const baseline = baselineByDataset.get(candidate.dataset);
    if (!baseline) {
      failures.push(`${candidate.dataset} has no protected baseline`);
      continue;
    }
    for (const metric of Object.keys(candidate.metrics) as Array<keyof RoutingMetrics>) {
      const regression = baseline.metrics[metric] - candidate.metrics[metric];
      if (regression > allowedRegression + Number.EPSILON) {
        failures.push(`${candidate.dataset}/${metric} regressed by ${regression.toFixed(4)}`);
      }
    }
  }
  return failures.sort();
}

export async function recordPromotion(
  root: string,
  proposal: EvolutionProposal,
  evaluation: EvolutionEvaluation,
  reviewer: string
): Promise<string> {
  if (!evaluation.passed || evaluation.failures.length > 0) {
    throw new Error("Cannot promote a proposal that failed evaluation");
  }
  if (!reviewer.trim()) throw new Error("Promotion requires a reviewer identity");
  const decisionsRoot = path.join(root, ".skill-system", "decisions");
  await mkdir(decisionsRoot, { recursive: true });
  const decisionPath = path.join(decisionsRoot, `${proposal.id}-promotion.yaml`);
  const proposalDigest = createHash("sha256").update(JSON.stringify(proposal)).digest("hex");
  const decision = {
    schemaVersion: 1,
    id: `${proposal.id}-promotion`,
    action: "promote",
    proposal: proposal.id,
    proposalDigest: `sha256:${proposalDigest}`,
    baseRevision: proposal.baseRevision,
    candidateRevision: proposal.candidateRevision,
    rollbackRevision: proposal.rollbackRevision,
    reviewedBy: reviewer,
    recordedAt: new Date().toISOString(),
    evaluation
  };
  await writeFile(decisionPath, stringify(decision), { encoding: "utf8", flag: "wx" });
  return decisionPath;
}

export async function recordRollback(root: string, promotionPath: string, reviewer: string): Promise<string> {
  if (!reviewer.trim()) throw new Error("Rollback requires a reviewer identity");
  const promotion = parse(await readFile(promotionPath, "utf8")) as {
    action?: string;
    proposal?: string;
    candidateRevision?: string;
    rollbackRevision?: string;
  };
  if (promotion.action !== "promote" || !promotion.proposal || !promotion.rollbackRevision) {
    throw new Error("Rollback input is not a valid promotion decision");
  }
  const decisionsRoot = path.join(root, ".skill-system", "decisions");
  await mkdir(decisionsRoot, { recursive: true });
  const rollbackPath = path.join(decisionsRoot, `${promotion.proposal}-rollback.yaml`);
  await writeFile(
    rollbackPath,
    stringify({
      schemaVersion: 1,
      id: `${promotion.proposal}-rollback`,
      action: "rollback",
      proposal: promotion.proposal,
      fromRevision: promotion.candidateRevision,
      toRevision: promotion.rollbackRevision,
      reviewedBy: reviewer,
      recordedAt: new Date().toISOString()
    }),
    { encoding: "utf8", flag: "wx" }
  );
  return rollbackPath;
}
