import type { SkillEffectResult, TaskEvaluationResult } from "../types.js";

export interface SkillEffectGate {
  minimumTaskCompletionLift: number;
  minimumRubricPassLift: number;
  maximumBlockedRateIncrease: number;
  requirePositiveLift: boolean;
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

export function compareSkillEffect(
  baseline: TaskEvaluationResult,
  candidate: TaskEvaluationResult,
  gate: SkillEffectGate
): SkillEffectResult {
  const failures: string[] = [];
  if (baseline.dataset !== candidate.dataset) failures.push("baseline and candidate datasets differ");
  if (baseline.examples !== candidate.examples) failures.push("baseline and candidate example counts differ");
  if (baseline.harness.name !== candidate.harness.name || baseline.harness.version !== candidate.harness.version) {
    failures.push("baseline and candidate harness identities differ");
  }
  if (baseline.skillMode !== "disabled") failures.push("baseline task run must disable Skills");
  if (candidate.skillMode !== "enabled") failures.push("candidate task run must enable Skills");

  const taskCompletionLift = round(candidate.metrics.taskCompletionRate - baseline.metrics.taskCompletionRate);
  const rubricPassLift = round(candidate.metrics.rubricPassRate - baseline.metrics.rubricPassRate);
  const blockedRateChange = round(candidate.metrics.blockedRate - baseline.metrics.blockedRate);
  const metrics = {
    taskCompletionLift,
    rubricPassLift,
    blockedRateChange,
    ...(baseline.metrics.averageCostUsd !== undefined && candidate.metrics.averageCostUsd !== undefined
      ? { averageCostUsdChange: round(candidate.metrics.averageCostUsd - baseline.metrics.averageCostUsd) }
      : {}),
    ...(baseline.metrics.averageLatencyMs !== undefined && candidate.metrics.averageLatencyMs !== undefined
      ? { averageLatencyMsChange: round(candidate.metrics.averageLatencyMs - baseline.metrics.averageLatencyMs) }
      : {})
  };

  const certifiable = !baseline.synthetic && !candidate.synthetic;
  if (!certifiable) failures.push("synthetic evidence cannot certify Skill effect");
  if (taskCompletionLift < gate.minimumTaskCompletionLift) {
    failures.push(`task completion lift ${taskCompletionLift.toFixed(4)} < ${gate.minimumTaskCompletionLift.toFixed(4)}`);
  }
  if (rubricPassLift < gate.minimumRubricPassLift) {
    failures.push(`rubric pass lift ${rubricPassLift.toFixed(4)} < ${gate.minimumRubricPassLift.toFixed(4)}`);
  }
  if (blockedRateChange > gate.maximumBlockedRateIncrease) {
    failures.push(`blocked rate change ${blockedRateChange.toFixed(4)} > ${gate.maximumBlockedRateIncrease.toFixed(4)}`);
  }
  if (gate.requirePositiveLift && taskCompletionLift <= 0 && rubricPassLift <= 0) {
    failures.push("candidate has no positive completion or rubric lift over the no-Skill baseline");
  }

  return {
    schemaVersion: 1,
    dataset: candidate.dataset,
    harness: candidate.harness,
    baseline: "without-skill",
    candidate: "with-skill",
    certifiable,
    metrics,
    passed: failures.length === 0,
    failures: [...new Set(failures)].sort()
  };
}
