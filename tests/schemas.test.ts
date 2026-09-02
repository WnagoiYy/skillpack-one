import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { ValidateFunction } from "ajv";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
interface AjvLike {
  compile(schema: object): ValidateFunction;
}
const Ajv2020 = (require("ajv/dist/2020").default ?? require("ajv/dist/2020")) as new (
  options: object
) => AjvLike;
const addFormats = (require("ajv-formats").default ?? require("ajv-formats")) as (
  ajv: AjvLike
) => AjvLike;

async function validator(name: string): Promise<ValidateFunction> {
  const schema = JSON.parse(
    await readFile(path.join(root, "schemas", `${name}.schema.json`), "utf8")
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

describe("public schemas", () => {
  it("accepts an atomic capability contract and rejects a broad one", async () => {
    const validate = await validator("skill-contract");
    const valid = {
      schemaVersion: 1,
      id: "atom-render-pdf-pages",
      kind: "atom",
      version: "0.1.0",
      name: { en: "Render PDF pages", "zh-CN": "渲染 PDF 页面" },
      summary: { en: "Render selected PDF pages to images." },
      outcomes: ["Rendered page images"],
      artifacts: ["image"],
      inputs: [{ name: "pdf", type: "file", required: true }],
      outputs: [{ name: "pages", type: "image[]", required: true }],
      preconditions: ["The input is a readable PDF"],
      failures: ["The PDF is encrypted"],
      sideEffects: ["filesystem-read", "filesystem-write"],
      permissions: {
        network: "none",
        filesystem: "workspace-write",
        shell: "allowlisted",
        secrets: "none",
        externalCommunication: "none"
      },
      taxonomy: {
        primaryCategory: "documents-communication",
        lifecycle: ["transform"],
        modalities: ["document", "image"],
        dependencies: ["cli-backed"],
        risk: "reversible-write"
      },
      routing: {
        positiveTriggers: { en: ["render PDF pages"] },
        negativeTriggers: { en: ["edit PDF text"] },
        confusableWith: []
      },
      provenance: { origin: "local", license: "Apache-2.0" },
      evaluations: ["routing-bootstrap"]
    };

    expect(validate(valid), JSON.stringify(validate.errors)).toBe(true);
    expect(validate({ ...valid, outcomes: [] })).toBe(false);
  });

  it("validates immutable catalog provenance", async () => {
    const validate = await validator("catalog-entry");
    const entry = {
      schemaVersion: 1,
      id: "github-com-example-skills-pdf",
      type: "skill",
      name: "pdf",
      summary: "PDF inspection and creation workflows.",
      author: "Example",
      source: {
        repository: "https://github.com/example/skills",
        revision: "0123456789abcdef0123456789abcdef01234567",
        path: "skills/pdf",
        url: "https://github.com/example/skills/tree/0123456789abcdef0123456789abcdef01234567/skills/pdf"
      },
      license: { status: "declared", spdx: "MIT" },
      verifiedAt: "2026-09-02T00:00:00Z",
      capabilities: ["pdf"],
      security: { status: "unreviewed", executesUpstreamCode: false }
    };

    expect(validate(entry), JSON.stringify(validate.errors)).toBe(true);
    expect(validate({ ...entry, source: { ...entry.source, revision: "main" } })).toBe(false);
  });

  it.each([
    ["taxonomy", { schemaVersion: 1, version: "0.2.0", maxDepth: 3, nodes: [{ id: "software-engineering", label: { en: "Software engineering" }, includes: ["software artifacts"], excludes: ["general research"] }] }],
    ["capability-pack", { schemaVersion: 1, id: "software-delivery", version: "0.1.0", name: { en: "Software delivery" }, atoms: ["atom-plan-change"], optionalMcps: [], acceptanceTests: ["software-delivery-smoke"], runtimeState: { stateSchema: "runtime/schemas/software-delivery.state.schema.json", initialState: "runtime/initial/software-delivery.state.json", patchSemantics: "json-merge-patch", historyPolicy: "external-audit-log" } }],
    ["eval-dataset", { schemaVersion: 1, id: "routing-bootstrap", split: "dev", locale: "en", examples: [{ id: "route-1", prompt: "Plan a code change", expectedCategory: "software-engineering", expectedAtoms: ["atom-plan-change"], mustNotRoute: [] }] }],
    ["eval-run", { schemaVersion: 1, id: "run-20260902", dataset: "routing-bootstrap", datasetDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", harness: { name: "mock", version: "0.1.0" }, startedAt: "2026-09-02T00:00:00Z", completedAt: "2026-09-02T00:00:01Z", metrics: { categoryHit1: 1, atomHit1: 1 }, passed: true }]
    ,
    ["evolution-proposal", { schemaVersion: 1, id: "proposal-one", createdAt: "2026-09-02T00:00:00Z", targetSkill: "atom-plan-code-change", baseRevision: "1111111111111111111111111111111111111111", candidateRevision: "2222222222222222222222222222222222222222", rollbackRevision: "1111111111111111111111111111111111111111", observation: "A routing boundary failed.", authorship: { mode: "model-assisted", author: "maintainer", generator: "codex" }, allowedFiles: ["skill-src/atom-plan-code-change/SKILL.md"], changedFiles: ["skill-src/atom-plan-code-change/SKILL.md"], generationDatasets: ["routing-bootstrap"], evaluationDatasets: ["routing-en-test"], permissionBefore: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" }, permissionAfter: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" }, approvals: [] }],
    ["evolution-pattern", { schemaVersion: 1, id: "repeated-failure", status: "active", summary: "A failure repeats.", problem: "The same task fails repeatedly.", rootCause: "Prior evidence is scattered.", response: "Consolidate evidence before proposing another change.", confidence: "observed", scope: { skills: ["meta-skill-governor"], packs: ["safe-skill-evolution"], harnesses: [] }, evidence: [{ kind: "paper", ref: "https://arxiv.org/pdf/2608.27454", digest: "sha256:65afc6e12f6f707483fe1b79a97ab67c03abf4b4992f82fde03eb7b8d9ad4a69", note: "Persistent knowledge improved evolution in the cited study." }], supersedes: [], createdAt: "2026-09-02T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z" }],
    ["skill-effect", { schemaVersion: 1, dataset: "task-effect", harness: { name: "pi", version: "0.84.4" }, baseline: "without-skill", candidate: "with-skill", certifiable: true, metrics: { taskCompletionLift: 0.2, rubricPassLift: 0.1, blockedRateChange: 0 }, passed: true, failures: [] }]
    ,
    ["evolution-attempt", { schemaVersion: 1, id: "attempt-one", proposal: "proposal-one", createdAt: "2026-09-02T00:00:00Z", baseRevision: "1111111111111111111111111111111111111111", candidateRevision: "2222222222222222222222222222222222222222", editBudget: 1, edits: [{ operation: "add", path: "/routing/positiveTriggers/en/-", after: "bounded routing", rationale: "Observed miss" }], acceptanceRule: "strict-improvement", selection: { dataset: "routing-bootstrap", before: 0.8, after: 0.9 }, protectedRegressions: [], decision: { status: "accepted", reasons: [] } }],
    ["lifecycle-security-review", { schemaVersion: 1, id: "review-one", subject: { id: "atom-example", type: "skill", version: "0.1.0" }, reviewedAt: "2026-09-02T00:00:00Z", reviewer: "reviewer", stages: ["authoring", "storage", "retrieval", "selection", "execution", "evolution"].map((stage) => ({ stage, status: "pass", threats: [`${stage}-threat`], evidence: [`evidence/${stage}`], residualRisk: "Documented" })) }],
    ["skill-relation-graph", { schemaVersion: 1, nodes: [{ id: "atom-a", kind: "atom" }, { id: "pack-a", kind: "pack" }], edges: [{ from: "atom-a", to: "pack-a", type: "packaged-in", evidence: ["pack:pack-a"] }] }]
  ])("validates %s documents", async (schema, document) => {
    const validate = await validator(schema);
    expect(validate(document), JSON.stringify(validate.errors)).toBe(true);
  });
});
