export type Locale = "en" | "zh" | "zh-CN" | (string & {});
export type Localized<T> = { en: T; [locale: string]: T };

export type SkillKind = "atom" | "category" | "meta";
export type Risk =
  | "read-only"
  | "reversible-write"
  | "external-communication"
  | "high-stakes"
  | "destructive"
  | "privileged";

export interface CapabilityPort {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface PermissionEnvelope {
  network: "none" | "read" | "write";
  filesystem: "none" | "read" | "workspace-write" | "unrestricted-write";
  shell: "none" | "allowlisted" | "unrestricted";
  secrets: "none" | "named-read";
  externalCommunication: "none" | "draft" | "send";
}

export interface SkillContract {
  schemaVersion: 1;
  id: string;
  kind: SkillKind;
  version: string;
  name: Localized<string>;
  summary: Localized<string>;
  outcomes: string[];
  artifacts: string[];
  inputs: CapabilityPort[];
  outputs: CapabilityPort[];
  preconditions: string[];
  failures: string[];
  sideEffects: string[];
  permissions: PermissionEnvelope;
  taxonomy: {
    primaryCategory: string;
    secondaryCategories?: string[];
    lifecycle: string[];
    modalities: string[];
    dependencies: string[];
    risk: Risk;
  };
  routing: {
    positiveTriggers: Localized<string[]>;
    negativeTriggers: Localized<string[]>;
    confusableWith: string[];
  };
  provenance: {
    origin: string;
    license: string;
    derivedFrom?: string[];
  };
  evaluations: string[];
}

export interface CatalogEntry {
  schemaVersion: 1;
  id: string;
  type: "skill" | "mcp-server" | "plugin" | "harness";
  name: string;
  summary: string;
  author: string;
  source: {
    repository: string;
    revision: string;
    path: string;
    url: string;
  };
  license: {
    status: "declared" | "detected" | "unknown" | "conflicting";
    spdx?: string;
  };
  verifiedAt: string;
  capabilities: string[];
  security: {
    status: "unreviewed" | "metadata-reviewed" | "statically-reviewed" | "sandbox-tested" | "rejected";
    executesUpstreamCode: boolean;
    notes?: string;
  };
  fingerprint?: string;
  duplicateCluster?: string;
  freshness?: "current" | "stale" | "archived" | "unknown";
}

export interface TaxonomyNode {
  id: string;
  parent?: string;
  label: Localized<string>;
  description?: Localized<string>;
  includes: string[];
  excludes: string[];
  boundaryExamples?: string[];
  keywords?: Localized<string[]>;
}

export interface Taxonomy {
  schemaVersion: 1;
  version: string;
  maxDepth?: number;
  nodes: TaxonomyNode[];
}

export interface CapabilityPack {
  schemaVersion: 1;
  id: string;
  version: string;
  name: Localized<string>;
  description?: Localized<string>;
  atoms: string[];
  optionalMcps: string[];
  specialSkills?: string[];
  ordering?: Array<{ before: string; after: string }>;
  acceptanceTests: string[];
  runtimeState?: CapabilityPackRuntimeState;
}

export interface CapabilityPackRuntimeState {
  stateSchema: string;
  initialState: string;
  patchSemantics: "json-merge-patch";
  historyPolicy: "external-audit-log";
}

export interface CapabilityPackPlan {
  pack: string;
  name: Localized<string>;
  skills: string[];
  stages: string[][];
  acceptanceTests: string[];
  runtimeState?: CapabilityPackRuntimeState;
}

export interface PackRecommendation {
  pack: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  plan: CapabilityPackPlan;
}

export interface RoutingExample {
  id: string;
  prompt: string;
  expectedCategory: string | null;
  expectedAtoms: string[];
  mustNotRoute: string[];
  task?: string;
  rubric?: string[];
  tags?: string[];
}

export interface EvalDataset {
  schemaVersion: 1;
  id: string;
  split: "train" | "dev" | "test" | "adversarial" | "tasks";
  locale: string;
  protected?: boolean;
  examples: RoutingExample[];
}

export interface RoutingMetrics {
  categoryHit1: number;
  categoryHit3: number;
  atomHit1: number;
  atomHit3: number;
  atomMrr: number;
  nonInvocationAccuracy: number;
  safetyPassRate: number;
}

export interface RoutingEvaluationResult {
  dataset: string;
  split: EvalDataset["split"];
  locale: string;
  protected: boolean;
  examples: number;
  metrics: RoutingMetrics;
  failures: Array<{ exampleId: string; reason: string }>;
}

export interface CompletionMetrics {
  taskCompletionRate: number;
  rubricPassRate: number;
  blockedRate: number;
  averageCostUsd?: number;
  averageLatencyMs?: number;
}

export interface TaskEvaluationResult {
  dataset: string;
  harness: { name: string; version: string };
  skillMode: "enabled" | "disabled";
  synthetic: boolean;
  examples: number;
  metrics: CompletionMetrics;
  failures: Array<{ exampleId: string; reason: string }>;
}

export interface SkillEffectMetrics {
  taskCompletionLift: number;
  rubricPassLift: number;
  blockedRateChange: number;
  averageCostUsdChange?: number;
  averageLatencyMsChange?: number;
}

export interface SkillEffectResult {
  schemaVersion: 1;
  dataset: string;
  harness: { name: string; version: string };
  baseline: "without-skill";
  candidate: "with-skill";
  certifiable: boolean;
  metrics: SkillEffectMetrics;
  passed: boolean;
  failures: string[];
}

export interface RouteCandidate {
  id: string;
  score: number;
  matched: string[];
  penalties: string[];
}

export interface RouteTrace {
  prompt: string;
  locale: string;
  categories: RouteCandidate[];
  atoms: RouteCandidate[];
  special: RouteCandidate[];
  ambiguous: boolean;
}
