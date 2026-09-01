import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";
import type { PermissionEnvelope } from "../types.js";
import type { EvolutionProposal } from "./types.js";

const LEAST_AUTHORITY: PermissionEnvelope = {
  network: "none",
  filesystem: "read",
  shell: "none",
  secrets: "none",
  externalCommunication: "none"
};

export interface ProposalDraftInput {
  id: string;
  createdAt: string;
  targetSkill: string;
  observation: string;
  baseRevision: string;
  candidateRevision: string;
  changedFiles: string[];
  generationDatasets?: string[];
  evaluationDatasets?: string[];
  permissionBefore?: PermissionEnvelope;
  permissionAfter?: PermissionEnvelope;
}

export function buildProposalDraft(input: ProposalDraftInput): EvolutionProposal {
  const changedFiles = [...new Set(input.changedFiles.map((file) => file.replaceAll("\\", "/")))].sort();
  const before = input.permissionBefore ?? LEAST_AUTHORITY;
  return {
    schemaVersion: 1,
    id: input.id,
    createdAt: input.createdAt,
    targetSkill: input.targetSkill,
    baseRevision: input.baseRevision,
    candidateRevision: input.candidateRevision,
    rollbackRevision: input.baseRevision,
    observation: input.observation,
    allowedFiles: changedFiles,
    changedFiles,
    generationDatasets: input.generationDatasets ?? ["routing-bootstrap"],
    evaluationDatasets: input.evaluationDatasets ?? ["routing-en-test", "routing-zh-cn-test", "routing-adversarial"],
    permissionBefore: { ...before },
    permissionAfter: { ...(input.permissionAfter ?? before) },
    approvals: []
  };
}

export async function writeProposalDraft(root: string, proposal: EvolutionProposal): Promise<string> {
  const proposalsRoot = path.resolve(root, ".skill-system", "proposals");
  const output = path.resolve(proposalsRoot, `${proposal.id}.yaml`);
  if (path.dirname(output) !== proposalsRoot) throw new Error("Proposal output escaped the proposals directory");
  await mkdir(proposalsRoot, { recursive: true });
  await writeFile(output, stringify(proposal), { encoding: "utf8", flag: "wx" });
  return output;
}
