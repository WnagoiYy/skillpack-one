#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { loadContracts, loadTaxonomy } from "./registry.js";
import { routeRequest } from "./router.js";
import { lintTaxonomy, validateRepository } from "./validation.js";

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

  return program;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  await buildProgram().parseAsync(process.argv);
}
