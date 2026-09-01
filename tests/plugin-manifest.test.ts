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
    };

    expect(manifest.name).toBe("self-organizing-skills");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/u);
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.repository).toBe("https://github.com/WnagoiYy/self-organizing-skills");
  });
});
