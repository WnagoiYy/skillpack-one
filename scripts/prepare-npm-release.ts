import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { planNpmRelease } from "../src/release.js";

interface PackageJson {
  name?: string;
  version?: string;
  repository?: string | { url?: string };
}

const [releaseTag, prereleaseValue] = process.argv.slice(2);
if (!releaseTag || !prereleaseValue || !["true", "false"].includes(prereleaseValue)) {
  throw new Error("usage: npm run release:plan -- <vVERSION> <true|false>");
}

const githubRepository = process.env.GITHUB_REPOSITORY;
if (!githubRepository) throw new Error("GITHUB_REPOSITORY is required");

const packageJson = JSON.parse(
  await readFile(path.resolve("package.json"), "utf8")
) as PackageJson;
const repositoryUrl = typeof packageJson.repository === "string"
  ? packageJson.repository
  : packageJson.repository?.url;
if (!packageJson.name || !packageJson.version || !repositoryUrl) {
  throw new Error("package.json requires name, version, and repository.url");
}

const plan = planNpmRelease({
  packageName: packageJson.name,
  version: packageJson.version,
  repositoryUrl,
  githubRepository,
  releaseTag,
  githubPrerelease: prereleaseValue === "true"
});

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `package-name=${plan.packageName}\nversion=${plan.version}\nnpm-tag=${plan.npmTag}\n`,
    "utf8"
  );
}
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);

