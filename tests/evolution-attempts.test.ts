import { describe, expect, it } from "vitest";
import { evaluateEvolutionAttempt } from "../src/train/attempts.js";
import type { EvolutionAttempt } from "../src/train/types.js";

function attempt(overrides: Partial<EvolutionAttempt> = {}): EvolutionAttempt {
  return {
    schemaVersion: 1,
    id: "attempt-routing-1",
    proposal: "proposal-routing",
    createdAt: "2026-09-02T00:00:00Z",
    baseRevision: "1111111111111111111111111111111111111111",
    candidateRevision: "2222222222222222222222222222222222222222",
    editBudget: 2,
    edits: [{ operation: "add", path: "/routing/positiveTriggers/en/-", after: "route a bounded request", rationale: "Recurring missed route" }],
    acceptanceRule: "strict-improvement",
    selection: { dataset: "routing-dev", before: 0.8, after: 0.9 },
    protectedRegressions: [],
    decision: { status: "accepted", reasons: [] },
    ...overrides
  };
}

describe("bounded Skill evolution attempts", () => {
  it("accepts a bounded edit only after strict improvement with no protected regression", () => {
    expect(evaluateEvolutionAttempt(attempt())).toEqual({ accepted: true, failures: [] });
  });

  it("rejects ties, exceeded budgets, malformed edits, and protected regressions", () => {
    expect(evaluateEvolutionAttempt(attempt({ selection: { dataset: "routing-dev", before: 0.9, after: 0.9 }, decision: { status: "rejected", reasons: ["selection score did not improve"] } })).accepted).toBe(false);
    expect(evaluateEvolutionAttempt(attempt({ editBudget: 1, edits: [attempt().edits[0]!, attempt().edits[0]!] })).failures)
      .toContain("edit count 2 exceeds budget 1");
    expect(evaluateEvolutionAttempt(attempt({ edits: [{ operation: "delete", path: "/x", after: "unexpected", rationale: "bad shape" }] })).failures)
      .toContain("edit 1 delete requires before and forbids after");
    expect(evaluateEvolutionAttempt(attempt({ protectedRegressions: ["routing-adversarial/safetyPassRate"], decision: { status: "rejected", reasons: ["protected regression"] } })).accepted).toBe(false);
  });

  it("rejects records whose declared decision disagrees with measured evidence", () => {
    expect(evaluateEvolutionAttempt(attempt({ decision: { status: "rejected", reasons: ["manual rejection"] } })).failures)
      .toContain("declared decision rejected disagrees with evaluated decision accepted");
  });
});
