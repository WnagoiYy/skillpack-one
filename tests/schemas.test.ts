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
    ["capability-pack", { schemaVersion: 1, id: "software-delivery", version: "0.1.0", name: { en: "Software delivery" }, atoms: ["atom-plan-change"], optionalMcps: [], acceptanceTests: ["software-delivery-smoke"] }],
    ["eval-dataset", { schemaVersion: 1, id: "routing-bootstrap", split: "dev", locale: "en", examples: [{ id: "route-1", prompt: "Plan a code change", expectedCategory: "software-engineering", expectedAtoms: ["atom-plan-change"], mustNotRoute: [] }] }],
    ["eval-run", { schemaVersion: 1, id: "run-20260902", dataset: "routing-bootstrap", datasetDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", harness: { name: "mock", version: "0.1.0" }, startedAt: "2026-09-02T00:00:00Z", completedAt: "2026-09-02T00:00:01Z", metrics: { categoryHit1: 1, atomHit1: 1 }, passed: true }]
    ,
    ["evolution-proposal", { schemaVersion: 1, id: "proposal-one", createdAt: "2026-09-02T00:00:00Z", targetSkill: "atom-plan-code-change", baseRevision: "1111111111111111111111111111111111111111", candidateRevision: "2222222222222222222222222222222222222222", rollbackRevision: "1111111111111111111111111111111111111111", observation: "A routing boundary failed.", allowedFiles: ["skill-src/atom-plan-code-change/SKILL.md"], changedFiles: ["skill-src/atom-plan-code-change/SKILL.md"], generationDatasets: ["routing-bootstrap"], evaluationDatasets: ["routing-en-test"], permissionBefore: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" }, permissionAfter: { network: "none", filesystem: "read", shell: "none", secrets: "none", externalCommunication: "none" }, approvals: [] }]
  ])("validates %s documents", async (schema, document) => {
    const validate = await validator(schema);
    expect(validate(document), JSON.stringify(validate.errors)).toBe(true);
  });
});
