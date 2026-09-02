import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { EvolutionProposal } from "./types.js";

const execFileAsync = promisify(execFile);

function normalized(file: string): string {
  return file.replaceAll("\\", "/").replace(/^\.\//u, "");
}

function isGeneratedProjection(file: string): boolean {
  const value = normalized(file);
  return value.startsWith("skills/") || value.startsWith(".agents/skills/");
}

async function git(root: string, args: string[]): Promise<string> {
  const result = await execFileAsync("git", args, { cwd: root, encoding: "utf8" });
  return result.stdout.trim();
}

export function canonicalRevisionDiffFailures(declaredFiles: string[], gitDiffFiles: string[]): string[] {
  const declared = new Set(declaredFiles.map(normalized));
  const actual = new Set(gitDiffFiles.map(normalized).filter((file) => file && !isGeneratedProjection(file)));
  const failures: string[] = [];
  for (const file of actual) {
    if (!declared.has(file)) failures.push(`candidate Git diff is missing from changedFiles: ${file}`);
  }
  for (const file of declared) {
    if (!actual.has(file)) failures.push(`changedFiles is not present in candidate Git diff: ${file}`);
  }
  return failures.sort();
}

export async function currentRevision(root: string): Promise<string> {
  return resolveRevision(root, "HEAD");
}

export async function resolveRevision(root: string, revision: string): Promise<string> {
  return git(root, ["rev-parse", `${revision}^{commit}`]);
}

export async function parentRevision(root: string, revision: string): Promise<string> {
  return git(root, ["rev-parse", `${revision}^`]);
}

export async function revisionChangedFiles(root: string, baseRevision: string, candidateRevision: string): Promise<string[]> {
  const output = await git(root, ["diff", "--name-only", "--diff-filter=ACDMRTUXB", baseRevision, candidateRevision]);
  return output.split(/\r?\n/u).map(normalized).filter((file) => file && !isGeneratedProjection(file)).sort();
}

export async function validateProposalRevisionEvidence(
  root: string,
  proposal: EvolutionProposal,
  proposalPath?: string
): Promise<string[]> {
  const failures: string[] = [];
  let base = "";
  let candidate = "";
  try {
    [base, candidate] = await Promise.all([
      git(root, ["rev-parse", `${proposal.baseRevision}^{commit}`]),
      git(root, ["rev-parse", `${proposal.candidateRevision}^{commit}`])
    ]);
  } catch {
    return ["base or candidate revision does not resolve to a Git commit"];
  }
  if (base !== proposal.baseRevision) failures.push("baseRevision is not the exact resolved commit");
  if (candidate !== proposal.candidateRevision) failures.push("candidateRevision is not the exact resolved commit");

  try {
    await git(root, ["merge-base", "--is-ancestor", base, candidate]);
  } catch {
    failures.push("candidateRevision is not a descendant of baseRevision");
  }

  try {
    failures.push(...canonicalRevisionDiffFailures(proposal.changedFiles, await revisionChangedFiles(root, base, candidate)));
  } catch {
    failures.push("candidate Git diff could not be read");
  }

  try {
    if ((await currentRevision(root)) !== candidate) failures.push("working tree HEAD does not equal candidateRevision");
    await git(root, ["diff", "--quiet"]);
    await git(root, ["diff", "--cached", "--quiet"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("diff --quiet") && !message.includes("diff --cached --quiet")) {
      failures.push("tracked working tree state could not be verified");
    } else {
      failures.push("tracked working tree differs from candidateRevision");
    }
  }

  try {
    const untracked = (await git(root, ["ls-files", "--others", "--exclude-standard", "-z"]))
      .split("\0")
      .map(normalized)
      .filter(Boolean);
    const allowedProposal = proposalPath ? normalized(path.relative(root, proposalPath)) : `.skill-system/proposals/${proposal.id}.yaml`;
    for (const file of untracked) {
      if (file !== allowedProposal) failures.push(`untracked file could affect candidate evaluation: ${file}`);
    }
  } catch {
    failures.push("untracked working tree state could not be verified");
  }
  return [...new Set(failures)].sort();
}
