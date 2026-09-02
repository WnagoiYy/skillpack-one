import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import type { EvolutionProposal } from "../src/train/types.js";
import { protectedRegressionFailures, recordPromotion, validateProposal } from "../src/train/governance.js";
import type { RoutingEvaluationResult } from "../src/types.js";
import { buildProposalDraft } from "../src/train/propose.js";
import { canonicalRevisionDiffFailures } from "../src/train/revisions.js";
import { buildProgram } from "../src/cli.js";

function proposal(overrides: Partial<EvolutionProposal> = {}): EvolutionProposal {
  return {
    schemaVersion: 1,
    id: "proposal-routing-boundary",
    createdAt: "2026-09-02T00:00:00Z",
    targetSkill: "atom-plan-code-change",
    baseRevision: "1111111111111111111111111111111111111111",
    candidateRevision: "2222222222222222222222222222222222222222",
    rollbackRevision: "1111111111111111111111111111111111111111",
    observation: "A negative boundary is missed.",
    allowedFiles: ["skill-src/atom-plan-code-change/SKILL.md"],
    changedFiles: ["skill-src/atom-plan-code-change/SKILL.md"],
    generationDatasets: ["routing-train"],
    evaluationDatasets: ["routing-en-test", "routing-adversarial"],
    permissionBefore: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" },
    permissionAfter: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" },
    approvals: [],
    ...overrides
  };
}

describe("governed Skill evolution", () => {
  it("exposes proposal scaffolding as a first-class CLI command", () => {
    const train = buildProgram().commands.find((command) => command.name() === "train");
    expect(train?.commands.map((command) => command.name())).toContain("propose");
  });

  it("builds a least-authority proposal draft from an exact candidate diff", () => {
    const draft = buildProposalDraft({
      id: "proposal-new-boundary",
      createdAt: "2026-09-02T00:00:00Z",
      targetSkill: "atom-plan-code-change",
      observation: "A boundary failed.",
      baseRevision: "1111111111111111111111111111111111111111",
      candidateRevision: "2222222222222222222222222222222222222222",
      changedFiles: ["tests/router.test.ts", "skill-src/atom-plan-code-change/SKILL.md"]
    });
    expect(draft.allowedFiles).toEqual([
      "skill-src/atom-plan-code-change/SKILL.md",
      "tests/router.test.ts"
    ]);
    expect(draft.permissionAfter).toEqual(draft.permissionBefore);
    expect(draft.rollbackRevision).toBe(draft.baseRevision);
  });

  it("preserves an existing target permission envelope in a proposal draft", () => {
    const permissions = {
      network: "read" as const,
      filesystem: "workspace-write" as const,
      shell: "allowlisted" as const,
      secrets: "none" as const,
      externalCommunication: "none" as const
    };
    const draft = buildProposalDraft({
      id: "proposal-meta-wording",
      createdAt: "2026-09-02T00:00:00Z",
      targetSkill: "meta-skill-governor",
      observation: "A wording boundary failed.",
      baseRevision: "1111111111111111111111111111111111111111",
      candidateRevision: "2222222222222222222222222222222222222222",
      changedFiles: ["skill-src/meta-skill-governor/SKILL.md"],
      permissionBefore: permissions,
      permissionAfter: permissions
    });
    expect(draft.permissionBefore).toEqual(permissions);
    expect(draft.permissionAfter).toEqual(permissions);
  });

  it("binds declared changes to the canonical Git diff while ignoring generated projections", () => {
    expect(canonicalRevisionDiffFailures(
      ["scripts/generate-skill-projections.ts", "tests/skill-layout.test.ts"],
      [".agents/skills/category-one/references/index.zh.md", "scripts/generate-skill-projections.ts", "skills/category-one/references/index.zh.md", "tests/skill-layout.test.ts"]
    )).toEqual([]);
    expect(canonicalRevisionDiffFailures(["src/router.ts"], ["src/router.ts", "tests/router.test.ts"]))
      .toContain("candidate Git diff is missing from changedFiles: tests/router.test.ts");
  });

  it("protects held-out data, bounded diffs, permissions, and the meta gate", () => {
    expect(validateProposal(proposal(), { "routing-train": "train", "routing-en-test": "test", "routing-adversarial": "adversarial" })).toEqual([]);

    expect(validateProposal(proposal({ generationDatasets: ["routing-en-test"] }), { "routing-en-test": "test" }))
      .toContain("generation dataset routing-en-test has protected split test");
    expect(validateProposal(proposal({ changedFiles: ["src/router.ts"] }), { "routing-train": "train" }))
      .toContain("changed file is outside the bounded proposal: src/router.ts");
    expect(validateProposal(proposal({ permissionAfter: { network: "write", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" } }), { "routing-train": "train" }))
      .toContain("permission expansion requires explicit permission-expansion approval: network none -> write");
    expect(validateProposal(proposal({ targetSkill: "meta-skill-governor", allowedFiles: ["skill-src/meta-skill-governor/SKILL.md", "evals/gates.yaml"], changedFiles: ["skill-src/meta-skill-governor/SKILL.md", "evals/gates.yaml"] }), { "routing-train": "train" }))
      .toContain("a meta Skill proposal must not weaken or change its own gate");
    expect(validateProposal(proposal({ allowedFiles: ["evals/datasets/routing-adversarial.yaml"], changedFiles: ["evals/datasets/routing-adversarial.yaml"] }), { "routing-train": "train", "routing-adversarial": "adversarial" }))
      .toContain("proposal must not change protected evaluation dataset: routing-adversarial");
    expect(validateProposal(proposal({ allowedFiles: ["evals/gates.yaml"], changedFiles: ["evals/gates.yaml"] }), { "routing-train": "train" }))
      .toContain("proposal must not change its release gate");
  });

  it("rejects any protected metric regression independently", () => {
    const baseline: RoutingEvaluationResult = {
      dataset: "routing-adversarial",
      split: "adversarial",
      locale: "en",
      protected: true,
      examples: 10,
      metrics: { categoryHit1: 1, categoryHit3: 1, atomHit1: 1, atomHit3: 1, atomMrr: 1, nonInvocationAccuracy: 1, safetyPassRate: 1 },
      failures: []
    };
    const candidate = { ...baseline, metrics: { ...baseline.metrics, atomHit1: 0.9, safetyPassRate: 0.8 } };
    expect(protectedRegressionFailures([candidate], [baseline], 0)).toEqual([
      "routing-adversarial/atomHit1 regressed by 0.1000",
      "routing-adversarial/safetyPassRate regressed by 0.2000"
    ]);
  });

  it("records an append-only promotion with a rollback pointer", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "skillpack-trainer-test-"));
    const file = await recordPromotion(root, proposal(), { passed: true, failures: [] }, "reviewer@example.com");
    const decision = parse(await readFile(file, "utf8")) as { rollbackRevision?: string; action?: string };
    expect(decision.action).toBe("promote");
    expect(decision.rollbackRevision).toBe("1111111111111111111111111111111111111111");
    await expect(recordPromotion(root, proposal(), { passed: true, failures: [] }, "reviewer@example.com")).rejects.toThrow();
  });
});
