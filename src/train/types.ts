import type { PermissionEnvelope } from "../types.js";

export interface EvolutionApproval {
  type: "permission-expansion" | "promotion" | "destructive-maintenance";
  approvedBy: string;
  approvedAt: string;
  reason: string;
}

export interface EvolutionProposal {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  targetSkill: string;
  baseRevision: string;
  candidateRevision: string;
  rollbackRevision: string;
  observation: string;
  allowedFiles: string[];
  changedFiles: string[];
  generationDatasets: string[];
  evaluationDatasets: string[];
  permissionBefore: PermissionEnvelope;
  permissionAfter: PermissionEnvelope;
  approvals: EvolutionApproval[];
}

export interface EvolutionEvaluation {
  passed: boolean;
  failures: string[];
}
