import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Skill Browser scrolling", () => {
  it("uses the document as the detail reading surface", async () => {
    const css = await readFile(path.join(root, "web", "styles.css"), "utf8");
    expect(css).not.toMatch(/\.browser-shell\s*\{[^}]*height:\s*calc\(100vh/su);
    expect(css).not.toMatch(/\.detail-panel\s*\{[^}]*overflow-y:\s*auto/su);
    expect(css).toMatch(/\.catalog-panel\s*\{[^}]*position:\s*sticky/su);
  });

  it("moves the selected detail to the top of the document viewport", async () => {
    const script = await readFile(path.join(root, "web", "app.js"), "utf8");
    expect(script).toContain('elements.detail.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })');
  });
});
