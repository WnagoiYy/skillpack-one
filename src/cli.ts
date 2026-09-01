#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { loadContracts, loadTaxonomy } from "./registry.js";
import { routeRequest } from "./router.js";
import { lintTaxonomy, validateRepository } from "./validation.js";
import { catalogStats, collectCatalog, loadCatalog } from "./catalog/catalog.js";
import { writeDuplicateClusters } from "./deduplicate.js";
import { loadPacks, validatePack } from "./packs.js";
import { evaluateAllRoutingDatasets, loadEvalDatasets, metricGate } from "./eval/evaluate.js";
import { readYaml } from "./registry.js";
import type { RoutingMetrics } from "./types.js";
import { evaluateTaskDataset, loadTaskDataset } from "./eval/tasks.js";
import { MockHarnessAdapter } from "./harness/mock.js";
import { PiHarnessAdapter } from "./harness/pi.js";
import { DshHarnessAdapter } from "./harness/dsh.js";
import { CodexHarnessAdapter } from "./harness/codex.js";
import type { HarnessAdapter } from "./harness/types.js";
import type { EvolutionProposal } from "./train/types.js";
import { recordPromotion, recordRollback, validateProposal } from "./train/governance.js";
import { buildProposalDraft, writeProposalDraft } from "./train/propose.js";
import { currentRevision, parentRevision, revisionChangedFiles, validateProposalRevisionEvidence } from "./train/revisions.js";

export function buildProgram(): Command {
  const program = new Command()
    .name("sos")
    .description("Self-Organizing Skills registry, router, evaluator, and trainer")
    .version("0.1.0");

  program
    .command("route")
    .description("Explain the category and atomic Skill candidates for a request")
    .argument("<prompt>", "user request to classify")
    .option("--locale <locale>", "locale such as en or zh-CN")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (prompt: string, options: { locale?: string; root: string }) => {
      const root = path.resolve(options.root);
      const [taxonomy, contracts] = await Promise.all([loadTaxonomy(root), loadContracts(root)]);
      const routeOptions = options.locale ? { locale: options.locale } : {};
      const trace = routeRequest(prompt, taxonomy, contracts, routeOptions);
      process.stdout.write(`${JSON.stringify(trace, null, 2)}\n`);
    });

  program
    .command("validate")
    .description("Validate taxonomy and capability contracts")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const report = await validateRepository(path.resolve(options.root));
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      if (report.errors.length > 0) process.exitCode = 1;
    });

  const taxonomy = program.command("taxonomy").description("Inspect and validate the taxonomy");
  taxonomy
    .command("lint")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const document = await loadTaxonomy(path.resolve(options.root));
      const errors = lintTaxonomy(document);
      process.stdout.write(`${JSON.stringify({ errors }, null, 2)}\n`);
      if (errors.length > 0) process.exitCode = 1;
    });

  program
    .command("eval")
    .description("Evaluate routing across independent datasets")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const root = path.resolve(options.root);
      const [taxonomyDocument, contracts] = await Promise.all([loadTaxonomy(root), loadContracts(root)]);
      const results = await evaluateAllRoutingDatasets(root, taxonomyDocument, contracts);
      process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    });

  program
    .command("gate")
    .description("Apply release thresholds without collapsing protected metrics")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const root = path.resolve(options.root);
      const [taxonomyDocument, contracts, gate] = await Promise.all([
        loadTaxonomy(root),
        loadContracts(root),
        readYaml<{ minimum: Partial<RoutingMetrics> }>(path.join(root, "evals", "gates.yaml"))
      ]);
      const results = await evaluateAllRoutingDatasets(root, taxonomyDocument, contracts);
      const failures = results.flatMap((result) =>
        metricGate(result.metrics, gate.minimum).map((failure) => `${result.dataset}: ${failure}`)
      );
      process.stdout.write(`${JSON.stringify({ passed: failures.length === 0, failures, results }, null, 2)}\n`);
      if (failures.length > 0) process.exitCode = 1;
    });

  const harness = program.command("harness").description("Inspect and run agent harness adapters");
  harness
    .command("status")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const root = path.resolve(options.root);
      const adapters: HarnessAdapter[] = [
        new PiHarnessAdapter(root),
        new DshHarnessAdapter(),
        new CodexHarnessAdapter(root)
      ];
      const reports = await Promise.all(adapters.map((adapter) => adapter.healthcheck()));
      process.stdout.write(`${JSON.stringify(reports, null, 2)}\n`);
    });

  harness
    .command("discover")
    .description("Run real Skill discovery through a pinned harness adapter")
    .option("--root <path>", "repository root", process.cwd())
    .option("--adapter <name>", "pi, dsh, or codex", "pi")
    .action(async (options: { root: string; adapter: string }) => {
      const root = path.resolve(options.root);
      let adapter: HarnessAdapter;
      if (options.adapter === "pi") adapter = new PiHarnessAdapter(root);
      else if (options.adapter === "dsh") adapter = new DshHarnessAdapter();
      else if (options.adapter === "codex") adapter = new CodexHarnessAdapter(root);
      else throw new Error(`Unknown discovery adapter: ${options.adapter}`);
      const capabilities = await adapter.discover();
      process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`);
    });

  harness
    .command("tasks")
    .option("--root <path>", "repository root", process.cwd())
    .option("--adapter <name>", "mock, pi, dsh, or codex", "mock")
    .option("--provider <name>", "Pi provider")
    .option("--model <name>", "Pi model")
    .action(async (options: { root: string; adapter: string; provider?: string; model?: string }) => {
      const root = path.resolve(options.root);
      const [dataset, taxonomyDocument, contracts] = await Promise.all([
        loadTaskDataset(root),
        loadTaxonomy(root),
        loadContracts(root)
      ]);
      let adapter: HarnessAdapter;
      let synthetic = false;
      if (options.adapter === "mock") {
        adapter = new MockHarnessAdapter(taxonomyDocument, contracts);
        synthetic = true;
      } else if (options.adapter === "pi") {
        const piOptions = {
          ...(options.provider ? { provider: options.provider } : {}),
          ...(options.model ? { model: options.model } : {})
        };
        adapter = new PiHarnessAdapter(root, piOptions);
      } else if (options.adapter === "dsh") adapter = new DshHarnessAdapter();
      else if (options.adapter === "codex") adapter = new CodexHarnessAdapter(root);
      else throw new Error(`Unknown harness adapter: ${options.adapter}`);
      const result = await evaluateTaskDataset(dataset, adapter, synthetic);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!synthetic && (result.metrics.blockedRate > 0 || result.metrics.taskCompletionRate < 0.8)) {
        process.exitCode = 1;
      }
    });

  const train = program.command("train").description("Validate and govern bounded Skill evolution proposals");
  const evaluateProposal = async (root: string, proposal: EvolutionProposal, proposalPath?: string) => {
    const [datasets, taxonomyDocument, contracts, gate] = await Promise.all([
      loadEvalDatasets(root),
      loadTaxonomy(root),
      loadContracts(root),
      readYaml<{ minimum: Partial<RoutingMetrics> }>(path.join(root, "evals", "gates.yaml"))
    ]);
    const splitMap = Object.fromEntries(datasets.map((dataset) => [dataset.id, dataset.split]));
    const validationFailures = [
      ...validateProposal(proposal, splitMap),
      ...(await validateProposalRevisionEvidence(root, proposal, proposalPath))
    ];
    const routing = await evaluateAllRoutingDatasets(root, taxonomyDocument, contracts);
    const gateFailures = routing.flatMap((result) =>
      metricGate(result.metrics, gate.minimum).map((failure) => `${result.dataset}: ${failure}`)
    );
    const failures = [...validationFailures, ...gateFailures].sort();
    return { passed: failures.length === 0, failures, routing };
  };

  train
    .command("propose")
    .description("Scaffold an append-only bounded proposal from the exact Git candidate diff")
    .requiredOption("--id <id>", "proposal id")
    .requiredOption("--target <skill>", "target Skill id")
    .requiredOption("--observation <text>", "observed failure or improvement evidence")
    .option("--base <revision>", "base Git commit; defaults to the candidate parent")
    .option("--candidate <revision>", "candidate Git commit; defaults to HEAD")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { id: string; target: string; observation: string; base?: string; candidate?: string; root: string }) => {
      const root = path.resolve(options.root);
      const candidate = options.candidate ?? await currentRevision(root);
      const base = options.base ?? await parentRevision(root, candidate);
      const changedFiles = await revisionChangedFiles(root, base, candidate);
      if (changedFiles.length === 0) throw new Error("Candidate revision has no canonical changed files");
      const contracts = await loadContracts(root);
      const targetContract = contracts.find((contract) => contract.id === options.target);
      const proposal = buildProposalDraft({
        id: options.id,
        createdAt: new Date().toISOString(),
        targetSkill: options.target,
        observation: options.observation,
        baseRevision: base,
        candidateRevision: candidate,
        changedFiles,
        ...(targetContract ? {
          permissionBefore: targetContract.permissions,
          permissionAfter: targetContract.permissions
        } : {})
      });
      const datasets = await loadEvalDatasets(root);
      const failures = validateProposal(proposal, Object.fromEntries(datasets.map((dataset) => [dataset.id, dataset.split])));
      if (failures.length > 0) throw new Error(`Proposal draft violates governance: ${failures.join("; ")}`);
      const output = await writeProposalDraft(root, proposal);
      process.stdout.write(`${JSON.stringify({
        proposal: output,
        changedFiles,
        permissionSource: targetContract ? "target-contract" : "least-authority-default"
      }, null, 2)}\n`);
    });

  train
    .command("evaluate")
    .argument("<proposal>", "proposal YAML path")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (proposalPath: string, options: { root: string }) => {
      const root = path.resolve(options.root);
      const proposal = await readYaml<EvolutionProposal>(path.resolve(proposalPath));
      const evaluation = await evaluateProposal(root, proposal, path.resolve(proposalPath));
      process.stdout.write(`${JSON.stringify(evaluation, null, 2)}\n`);
      if (!evaluation.passed) process.exitCode = 1;
    });

  train
    .command("promote")
    .argument("<proposal>", "proposal YAML path")
    .requiredOption("--reviewer <identity>", "reviewer identity")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (proposalPath: string, options: { root: string; reviewer: string }) => {
      const root = path.resolve(options.root);
      const proposal = await readYaml<EvolutionProposal>(path.resolve(proposalPath));
      const evaluation = await evaluateProposal(root, proposal, path.resolve(proposalPath));
      const decision = await recordPromotion(root, proposal, evaluation, options.reviewer);
      process.stdout.write(`${JSON.stringify({ decision }, null, 2)}\n`);
    });

  train
    .command("rollback")
    .argument("<promotion>", "promotion decision YAML path")
    .requiredOption("--reviewer <identity>", "reviewer identity")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (promotionPath: string, options: { root: string; reviewer: string }) => {
      const decision = await recordRollback(path.resolve(options.root), path.resolve(promotionPath), options.reviewer);
      process.stdout.write(`${JSON.stringify({ decision }, null, 2)}\n`);
    });

  const catalog = program.command("catalog").description("Collect and inspect upstream capabilities");
  catalog
    .command("collect")
    .description("Refresh metadata without executing upstream code")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const result = await collectCatalog(path.resolve(options.root));
      process.stdout.write(`${JSON.stringify({ ...catalogStats(result.entries), sources: result.sources }, null, 2)}\n`);
    });
  catalog
    .command("stats")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const entries = await loadCatalog(path.resolve(options.root));
      process.stdout.write(`${JSON.stringify(catalogStats(entries), null, 2)}\n`);
    });
  catalog
    .command("deduplicate")
    .option("--root <path>", "repository root", process.cwd())
    .option("--threshold <number>", "similarity threshold", "0.82")
    .action(async (options: { root: string; threshold: string }) => {
      const clusters = await writeDuplicateClusters(path.resolve(options.root), Number(options.threshold));
      process.stdout.write(`${JSON.stringify({ clusters: clusters.length }, null, 2)}\n`);
    });

  program
    .command("packs")
    .description("Validate composable capability packs")
    .option("--root <path>", "repository root", process.cwd())
    .action(async (options: { root: string }) => {
      const root = path.resolve(options.root);
      const [packs, contracts] = await Promise.all([loadPacks(root), loadContracts(root)]);
      const errors = packs.flatMap((pack) => validatePack(pack, contracts).map((error) => `${pack.id}: ${error}`));
      process.stdout.write(`${JSON.stringify({ packs: packs.length, errors }, null, 2)}\n`);
      if (errors.length > 0) process.exitCode = 1;
    });

  return program;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  await buildProgram().parseAsync(process.argv);
}
