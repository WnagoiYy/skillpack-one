import { describe, expect, it } from "vitest";
import type { SkillContract, Taxonomy } from "../src/types.js";
import { routeRequest } from "../src/router.js";

const taxonomy: Taxonomy = {
  schemaVersion: 1,
  version: "0.1.0",
  nodes: [
    {
      id: "software-engineering",
      label: { en: "Software engineering", "zh-CN": "软件工程" },
      includes: ["creating or changing software artifacts"],
      excludes: ["writing a general research report"],
      keywords: {
        en: ["code", "software", "bug", "test", "refactor"],
        "zh-CN": ["代码", "软件", "修复", "测试", "重构"]
      }
    },
    {
      id: "documents-communication",
      label: { en: "Documents and communication", "zh-CN": "文档与沟通" },
      includes: ["creating or transforming human-readable documents"],
      excludes: ["changing executable source code"],
      keywords: {
        en: ["document", "pdf", "translate", "memo", "report"],
        "zh-CN": ["文档", "翻译", "报告", "备忘录"]
      }
    },
    {
      id: "security-trust",
      label: { en: "Security and trust", "zh-CN": "安全与信任" },
      includes: ["finding or reducing security risk"],
      excludes: ["ordinary functional debugging"],
      keywords: {
        en: ["security", "vulnerability", "threat", "audit"],
        "zh-CN": ["安全", "漏洞", "威胁", "审计"]
      }
    }
  ]
};

function atom(overrides: Partial<SkillContract> & Pick<SkillContract, "id">): SkillContract {
  const { id, ...rest } = overrides;
  return {
    schemaVersion: 1,
    id,
    kind: "atom",
    version: "0.1.0",
    name: { en: overrides.id },
    summary: { en: overrides.id },
    outcomes: ["one result"],
    artifacts: ["artifact"],
    inputs: [],
    outputs: [],
    preconditions: [],
    failures: [],
    sideEffects: ["none"],
    permissions: {
      network: "none",
      filesystem: "none",
      shell: "none",
      secrets: "none",
      externalCommunication: "none"
    },
    taxonomy: {
      primaryCategory: "software-engineering",
      lifecycle: ["plan"],
      modalities: ["code"],
      dependencies: ["tool-agnostic"],
      risk: "read-only"
    },
    routing: {
      positiveTriggers: { en: ["plan a code change"] },
      negativeTriggers: { en: ["implement the change"] },
      confusableWith: []
    },
    provenance: { origin: "local", license: "Apache-2.0" },
    evaluations: ["routing-bootstrap"],
    ...rest
  };
}

const atoms: SkillContract[] = [
  atom({ id: "atom-plan-code-change" }),
  atom({
    id: "atom-implement-code-change",
    routing: {
      positiveTriggers: { en: ["implement the code change"], "zh-CN": ["实现代码修改"] },
      negativeTriggers: { en: ["plan only"], "zh-CN": ["只做计划"] },
      confusableWith: ["atom-plan-code-change"]
    },
    taxonomy: {
      primaryCategory: "software-engineering",
      lifecycle: ["create"],
      modalities: ["code"],
      dependencies: ["harness-backed"],
      risk: "reversible-write"
    }
  }),
  atom({
    id: "atom-translate-document",
    name: { en: "Translate a document", "zh-CN": "翻译文档" },
    summary: { en: "Translate one document while preserving meaning." },
    routing: {
      positiveTriggers: { en: ["translate document"], "zh-CN": ["翻译文档"] },
      negativeTriggers: { en: ["translate source code"] },
      confusableWith: []
    },
    taxonomy: {
      primaryCategory: "documents-communication",
      lifecycle: ["transform"],
      modalities: ["document", "text"],
      dependencies: ["tool-agnostic"],
      risk: "read-only"
    }
  }),
  atom({
    id: "atom-audit-source-security",
    routing: {
      positiveTriggers: { en: ["audit source code for vulnerabilities"], "zh-CN": ["审计代码漏洞"] },
      negativeTriggers: { en: ["fix a normal bug"] },
      confusableWith: []
    },
    taxonomy: {
      primaryCategory: "security-trust",
      lifecycle: ["verify"],
      modalities: ["code"],
      dependencies: ["tool-agnostic"],
      risk: "read-only"
    }
  }),
  {
    ...atom({ id: "meta-skill-governor" }),
    kind: "meta",
    taxonomy: {
      primaryCategory: "software-engineering",
      lifecycle: ["govern"],
      modalities: ["system-state"],
      dependencies: ["harness-backed"],
      risk: "reversible-write"
    },
    routing: {
      positiveTriggers: { en: ["optimize skills"], "zh-CN": ["优化 Skill"] },
      negativeTriggers: { en: ["use a skill normally"] },
      confusableWith: []
    }
  }
];

describe("two-stage routing", () => {
  it("routes by user outcome and then chooses an atom", () => {
    const trace = routeRequest("Plan a code change for this software bug", taxonomy, atoms);

    expect(trace.categories[0]?.id).toBe("software-engineering");
    expect(trace.atoms[0]?.id).toBe("atom-plan-code-change");
    expect(trace.atoms[0]?.matched.length).toBeGreaterThan(0);
    expect(trace.ambiguous).toBe(false);
  });

  it("uses localized triggers without losing the stable atom identity", () => {
    const trace = routeRequest("请实现代码修改并补充测试", taxonomy, atoms, { locale: "zh-CN" });

    expect(trace.locale).toBe("zh-CN");
    expect(trace.categories[0]?.id).toBe("software-engineering");
    expect(trace.atoms[0]?.id).toBe("atom-implement-code-change");
  });

  it("applies negative boundaries to confusable atoms", () => {
    const trace = routeRequest("Implement the code change; do not plan only", taxonomy, atoms);
    const plan = trace.atoms.find((candidate) => candidate.id === "atom-plan-code-change");
    const implement = trace.atoms.find((candidate) => candidate.id === "atom-implement-code-change");

    expect(implement?.score).toBeGreaterThan(plan?.score ?? 0);
    expect(implement?.penalties).toContain("negative:plan only");
  });

  it("marks a cross-domain request as ambiguous while retaining ranked candidates", () => {
    const trace = routeRequest("Audit and translate this report", taxonomy, atoms);

    expect(trace.categories.slice(0, 2).map((candidate) => candidate.id)).toEqual([
      "documents-communication",
      "security-trust"
    ]);
    expect(trace.ambiguous).toBe(true);
  });

  it("returns meta Skills separately from atomic execution candidates", () => {
    const trace = routeRequest("优化 Skill 的路由", taxonomy, atoms, { locale: "zh-CN" });
    expect(trace.special[0]?.id).toBe("meta-skill-governor");
    expect(trace.atoms.some((candidate) => candidate.id === "meta-skill-governor")).toBe(false);
  });
});
