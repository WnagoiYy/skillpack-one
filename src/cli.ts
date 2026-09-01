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
