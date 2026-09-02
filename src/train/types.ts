import type { PermissionEnvelope } from "../types.js";

export interface EvolutionApproval {
  type: "permission-expansion" | "promotion" | "destructive-maintenance";
  approvedBy: string;
  approvedAt: string;
  reason: string;
}

export interface EvolutionAuthorship {
  mode: "human" | "model-assisted" | "model-generated";
  author: string;
  generator?: string;
}

export type EvolutionEvidenceKind = "task-run" | "proposal" | "decision" | "paper" | "user-feedback";

export interface EvolutionEvidenceReference {
  kind: EvolutionEvidenceKind;
  ref: string;
  locator?: string;
  digest?: string;
  note: string;
}

export interface EvolutionPattern {
  schemaVersion: 1;
  id: string;
  status: "active" | "superseded" | "archived";
  summary: string;
  problem: string;
  rootCause: string;
  response: string;
  confidence: "hypothesis" | "observed" | "replicated";
  scope: {
    skills: string[];
    packs: string[];
    harnesses: string[];
  };
  evidence: EvolutionEvidenceReference[];
  supersedes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EvolutionPatternMatch {
  id: string;
  score: number;
  matched: string[];
  summary: string;
  confidence: EvolutionPattern["confidence"];
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
  authorship?: EvolutionAuthorship;
  knowledgePatterns?: string[];
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
