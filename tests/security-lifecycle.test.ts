import { describe, expect, it } from "vitest";
import {
  LIFECYCLE_STAGES,
  evaluateLifecycleSecurityReview,
  type LifecycleSecurityReview
} from "../src/security/lifecycle.js";

function review(overrides: Partial<LifecycleSecurityReview> = {}): LifecycleSecurityReview {
  return {
    schemaVersion: 1,
    id: "review-atom-example-1",
    subject: { id: "atom-example", type: "skill", version: "0.1.0" },
    reviewedAt: "2026-09-02T00:00:00Z",
    reviewer: "reviewer@example.com",
    stages: LIFECYCLE_STAGES.map((stage) => ({
      stage,
      status: "pass" as const,
      threats: [`${stage}-threat`],
      evidence: [`evidence/${stage}.json`],
      residualRisk: "Residual risk is documented and accepted for this candidate."
    })),
    ...overrides
  };
}

describe("lifecycle Skill security", () => {
  it("passes only when every lifecycle trust boundary has evidence", () => {
    expect(evaluateLifecycleSecurityReview(review())).toEqual({ passed: true, failures: [] });
  });

  it("fails missing, duplicated, failed, or unjustified not-applicable stages", () => {
    expect(evaluateLifecycleSecurityReview(review({ stages: review().stages.slice(1) })).failures)
      .toContain("missing lifecycle stage: authoring");
    expect(evaluateLifecycleSecurityReview(review({ stages: [...review().stages, review().stages[0]!] })).failures)
      .toContain("duplicate lifecycle stage: authoring");
    expect(evaluateLifecycleSecurityReview(review({ stages: review().stages.map((item) => item.stage === "retrieval" ? { ...item, status: "fail" as const } : item) })).failures)
      .toContain("retrieval: review failed");
    expect(evaluateLifecycleSecurityReview(review({ stages: review().stages.map((item) => item.stage === "execution" ? { ...item, status: "not-applicable" as const } : item) })).failures)
      .toContain("execution: not-applicable requires a rationale");
  });
});
