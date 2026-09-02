import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Codex plugin manifest", () => {
  it("points to the generated portable Skill projection", async () => {
    const manifest = JSON.parse(await readFile(path.join(root, ".codex-plugin", "plugin.json"), "utf8")) as {
      name?: string;
      version?: string;
      skills?: string;
      repository?: string;
      interface?: { displayName?: string };
    };

    expect(manifest.name).toBe("skillpack-one");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/u);
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.repository).toBe("https://github.com/WnagoiYy/skillpack-one");
    expect(manifest.interface?.displayName).toBe("SkillPack One");
  });

  it("publishes the SkillPack One package and CLI names", async () => {
    const packageDocument = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as {
      name?: string;
      bin?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    expect(packageDocument.name).toBe("skillpack-one");
    expect(packageDocument.bin).toEqual({ skillpack: "./dist/src/cli.js" });
    expect(packageDocument.scripts?.skillpack).toBe("tsx src/cli.ts");
  });
});
