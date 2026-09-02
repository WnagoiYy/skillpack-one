export const LIFECYCLE_STAGES = [
  "authoring",
  "storage",
  "retrieval",
  "selection",
  "execution",
  "evolution"
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];
export type LifecycleReviewStatus = "pass" | "fail" | "not-applicable";

export interface LifecycleStageReview {
  stage: LifecycleStage;
  status: LifecycleReviewStatus;
  threats: string[];
  evidence: string[];
  residualRisk: string;
  rationale?: string;
}

export interface LifecycleSecurityReview {
  schemaVersion: 1;
  id: string;
  subject: {
    id: string;
    type: "skill" | "mcp-server" | "plugin" | "harness";
    version: string;
    revision?: string;
  };
  reviewedAt: string;
  reviewer: string;
  stages: LifecycleStageReview[];
}

export function evaluateLifecycleSecurityReview(
  review: LifecycleSecurityReview
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  const counts = new Map<LifecycleStage, number>();
  for (const item of review.stages) counts.set(item.stage, (counts.get(item.stage) ?? 0) + 1);

  for (const stage of LIFECYCLE_STAGES) {
    const count = counts.get(stage) ?? 0;
    if (count === 0) failures.push(`missing lifecycle stage: ${stage}`);
    if (count > 1) failures.push(`duplicate lifecycle stage: ${stage}`);
  }

  for (const item of review.stages) {
    if (item.status === "fail") failures.push(`${item.stage}: review failed`);
    if (item.status === "pass" && item.evidence.length === 0) {
      failures.push(`${item.stage}: passing review requires evidence`);
    }
    if (item.status !== "not-applicable" && item.threats.length === 0) {
      failures.push(`${item.stage}: applicable review requires at least one threat`);
    }
    if (item.status === "not-applicable" && !item.rationale?.trim()) {
      failures.push(`${item.stage}: not-applicable requires a rationale`);
    }
    if (!item.residualRisk.trim()) failures.push(`${item.stage}: residual risk must be documented`);
  }

  return { passed: failures.length === 0, failures: [...new Set(failures)].sort() };
}
