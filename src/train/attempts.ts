import type { EvolutionAttempt, EvolutionEdit } from "./types.js";

function editShapeFailure(edit: EvolutionEdit, index: number): string | undefined {
  const number = index + 1;
  if (!edit.path.startsWith("/")) return `edit ${number} path must be an absolute document pointer`;
  if (!edit.rationale.trim()) return `edit ${number} requires a rationale`;
  if (edit.operation === "add" && (edit.after === undefined || edit.before !== undefined)) {
    return `edit ${number} add requires after and forbids before`;
  }
  if (edit.operation === "delete" && (edit.before === undefined || edit.after !== undefined)) {
    return `edit ${number} delete requires before and forbids after`;
  }
  if (edit.operation === "replace" && (edit.before === undefined || edit.after === undefined)) {
    return `edit ${number} replace requires before and after`;
  }
  return undefined;
}

export function evaluateEvolutionAttempt(attempt: EvolutionAttempt): { accepted: boolean; failures: string[] } {
  const failures: string[] = [];
  if (attempt.editBudget < 1) failures.push("edit budget must be at least 1");
  if (attempt.edits.length === 0) failures.push("an evolution attempt requires at least one edit");
  if (attempt.edits.length > attempt.editBudget) {
    failures.push(`edit count ${attempt.edits.length} exceeds budget ${attempt.editBudget}`);
  }
  attempt.edits.forEach((edit, index) => {
    const failure = editShapeFailure(edit, index);
    if (failure) failures.push(failure);
  });
  if (attempt.baseRevision === attempt.candidateRevision) {
    failures.push("candidate revision must differ from base revision");
  }
  if (!(attempt.selection.after > attempt.selection.before)) {
    failures.push("selection score did not strictly improve");
  }
  if (attempt.protectedRegressions.length > 0) {
    failures.push(`protected regressions: ${attempt.protectedRegressions.join(", ")}`);
  }

  const evidenceAccepted = failures.length === 0;
  const declaredAccepted = attempt.decision.status === "accepted";
  if (evidenceAccepted !== declaredAccepted) {
    failures.push(
      `declared decision ${attempt.decision.status} disagrees with evaluated decision ${evidenceAccepted ? "accepted" : "rejected"}`
    );
  }
  if (!declaredAccepted && attempt.decision.reasons.length === 0) {
    failures.push("a rejected attempt requires at least one recorded reason");
  }
  return { accepted: evidenceAccepted && declaredAccepted, failures: [...new Set(failures)].sort() };
}
