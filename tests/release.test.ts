import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { planNpmRelease } from "../src/release.js";
import { buildProgram } from "../src/cli.js";

const base = {
  packageName: "skillpack-one",
  repositoryUrl: "git+https://github.com/WnagoiYy/skillpack-one.git",
  githubRepository: "WnagoiYy/skillpack-one"
};

describe("npm release planning", () => {
  it("routes SemVer prereleases to next", () => {
    expect(planNpmRelease({
      ...base,
      version: "0.1.0-alpha.10",
      releaseTag: "v0.1.0-alpha.10",
      githubPrerelease: true
    })).toEqual({
      packageName: "skillpack-one",
      version: "0.1.0-alpha.10",
      releaseTag: "v0.1.0-alpha.10",
      npmTag: "next"
    });
  });

  it("routes stable SemVer releases to latest", () => {
    expect(planNpmRelease({
      ...base,
      version: "1.0.0",
      releaseTag: "v1.0.0",
      githubPrerelease: false
    }).npmTag).toBe("latest");
  });

  it("rejects invalid SemVer and a release tag that does not exactly match the package", () => {
    expect(() => planNpmRelease({
      ...base,
      version: "alpha-10",
      releaseTag: "valpha-10",
      githubPrerelease: true
    })).toThrow("valid SemVer");
    expect(() => planNpmRelease({
      ...base,
      version: "0.1.0-alpha.10",
      releaseTag: "v0.1.0-alpha.9",
      githubPrerelease: true
    })).toThrow("must exactly equal v0.1.0-alpha.10");
  });

  it("rejects a GitHub prerelease flag inconsistent with SemVer", () => {
    expect(() => planNpmRelease({
      ...base,
      version: "0.1.0-alpha.10",
      releaseTag: "v0.1.0-alpha.10",
      githubPrerelease: false
    })).toThrow("GitHub prerelease flag false disagrees");
  });

  it("rejects a repository identity inconsistent with package metadata", () => {
    expect(() => planNpmRelease({
      ...base,
      repositoryUrl: "git+https://github.com/example/fork.git",
      version: "0.1.0-alpha.10",
      releaseTag: "v0.1.0-alpha.10",
      githubPrerelease: true
    })).toThrow("repository.url must exactly equal");
  });

  it("keeps the npm workflow tokenless and gated by release identity", async () => {
    const workflowPath = path.resolve(".github", "workflows", "publish-npm.yml");
    const source = await readFile(workflowPath, "utf8");
    const workflow = parse(source) as {
      on: { release: { types: string[] } };
      jobs: { publish: { environment: string; permissions: Record<string, string> } };
    };
    expect(workflow.on.release.types).toEqual(["published"]);
    expect(workflow.jobs.publish.environment).toBe("npm");
    expect(workflow.jobs.publish.permissions).toEqual({ contents: "read", "id-token": "write" });
    expect(source).toContain("npm publish --access public --tag");
    expect(source).not.toContain("NPM_TOKEN");
  });

  it("reports the same CLI version that npm publishes", async () => {
    const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as { version: string };
    expect(buildProgram().version()).toBe(packageJson.version);
  });

  it("publishes a valid CLI entry without compiled test files", async () => {
    const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as {
      bin: Record<string, string>;
      files: string[];
    };
    expect(packageJson.bin.skillpack).toBe("dist/src/cli.js");
    expect(packageJson.files).toContain("dist/src");
    expect(packageJson.files).toContain("dist/scripts");
    expect(packageJson.files).not.toContain("dist");
    expect(packageJson.files).not.toContain("dist/tests");
  });
});
