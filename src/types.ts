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
  ordering?: Array<{ before: string; after: string }>;
  acceptanceTests: string[];
}

export interface RoutingExample {
  id: string;
  prompt: string;
  expectedCategory: string;
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
