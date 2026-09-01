import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RouteTrace, RoutingExample } from "../types.js";
import type {
  HarnessAdapter,
  HarnessCapabilities,
  HarnessResult,
  HealthReport,
  TaskExample,
  TaskTrace
} from "./types.js";
import { runProcess } from "./process.js";

interface PiOptions {
  provider?: string;
  model?: string;
}

export class PiHarnessAdapter implements HarnessAdapter {
  private readonly cliPath: string;
  private readonly packagePath: string;

  constructor(private readonly root: string, private readonly options: PiOptions = {}) {
    this.packagePath = path.join(root, "node_modules", "@earendil-works", "pi-coding-agent", "package.json");
    this.cliPath = path.join(root, "node_modules", "@earendil-works", "pi-coding-agent", "dist", "bundle", "cli.js");
  }

  private async version(): Promise<string | undefined> {
    try {
      const manifest = JSON.parse(await readFile(this.packagePath, "utf8")) as { version?: string };
      return manifest.version;
    } catch {
      return undefined;
    }
  }

  async discover(): Promise<HarnessCapabilities> {
    const version = await this.version();
    const { loadSkillsFromDir } = await import("@earendil-works/pi-coding-agent");
    const loaded = loadSkillsFromDir({ dir: path.join(this.root, "skills"), source: "self-organizing-skills" });
    if (loaded.diagnostics.some((diagnostic) => diagnostic.type === "error")) {
      throw new Error(`Pi Skill discovery failed: ${JSON.stringify(loaded.diagnostics)}`);
    }
    return {
      name: "pi",
      version: version ?? "unavailable",
      structuredOutput: true,
      taskExecution: true,
      discoveredSkills: loaded.skills.length
    };
  }

  async healthcheck(): Promise<HealthReport> {
    const version = await this.version();
    if (!version) {
      return { name: "pi", installed: false, ready: false, blockers: ["Pinned Pi package is not installed"] };
    }
    const provider = this.options.provider ?? "openai-codex";
    const auth = await runProcess(
      process.execPath,
      [this.cliPath, "auth", "check", "--provider", provider, "--json", "--no-refresh"],
      this.root
    );
    let ready = false;
    try {
      ready = (JSON.parse(auth.stdout) as { status?: string }).status === "ready";
    } catch {
      ready = false;
    }
    return {
      name: "pi",
      installed: true,
      ready,
      version,
      blockers: ready ? [] : ["Pi provider credentials are not configured"]
    };
  }

  private modelArguments(): string[] {
    const args: string[] = [];
    if (this.options.provider) args.push("--provider", this.options.provider);
    if (this.options.model) args.push("--model", this.options.model);
    return args;
  }

  private async invoke(prompt: string): Promise<HarnessResult<string>> {
    const started = performance.now();
    const health = await this.healthcheck();
    if (!health.ready) {
      return { status: "blocked", reason: health.blockers.join("; "), durationMs: performance.now() - started };
    }
    const result = await runProcess(
      process.execPath,
      [
        this.cliPath,
        ...this.modelArguments(),
        "--print",
        "--mode",
        "text",
        "--no-session",
        "--no-tools",
        "--approve",
        "--skill",
        path.join(this.root, "skills"),
        prompt
      ],
      this.root
    );
    const durationMs = performance.now() - started;
    if (result.exitCode !== 0) {
      return { status: "failed", reason: result.stderr.trim() || `Pi exited with ${result.exitCode}`, durationMs };
    }
    return { status: "ok", value: result.stdout.trim(), durationMs };
  }

  async route(example: RoutingExample): Promise<HarnessResult<RouteTrace>> {
    const result = await this.invoke(
      `Route this request using the loaded Skills. Return only JSON matching RouteTrace with categories, atoms, special, locale, prompt, and ambiguous. Request: ${JSON.stringify(example.prompt)}`
    );
    if (result.status !== "ok") return result;
    try {
      return { status: "ok", value: JSON.parse(result.value) as RouteTrace, durationMs: result.durationMs };
    } catch {
      return { status: "failed", reason: "Pi did not return valid RouteTrace JSON", durationMs: result.durationMs };
    }
  }

  async execute(task: TaskExample): Promise<HarnessResult<TaskTrace>> {
    const result = await this.invoke(
      `Use the smallest loaded Skill set to complete this task. Task: ${task.task}\nRubric:\n- ${task.rubric.join("\n- ")}`
    );
    if (result.status !== "ok") return result;
    return {
      status: "ok",
      value: {
        output: result.value,
        rubric: task.rubric.map((criterion) => ({ criterion, passed: false, evidence: "External grading required" }))
      },
      durationMs: result.durationMs
    };
  }
}
