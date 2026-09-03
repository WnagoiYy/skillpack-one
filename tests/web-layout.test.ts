import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Skill Browser scrolling", () => {
  it("uses a single viewport-height application shell on desktop", async () => {
    const css = await readFile(path.join(root, "web", "styles.css"), "utf8");
    expect(css).toMatch(/body\s*\{[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/su);
    expect(css).toMatch(/main\s*\{[^}]*min-height:\s*0[^}]*grid-template-rows:\s*auto minmax\(0, 1fr\)/su);
    expect(css).toMatch(/\.browser-shell\s*\{[^}]*min-height:\s*0[^}]*height:\s*100%[^}]*overflow:\s*hidden/su);
    expect(css).toMatch(/\.catalog-panel\s*\{[^}]*position:\s*static/su);
    expect(css).toMatch(/\.detail-panel\s*\{[^}]*overflow-y:\s*auto/su);
  });

  it("restores document scrolling on compact layouts", async () => {
    const css = await readFile(path.join(root, "web", "styles.css"), "utf8");
    expect(css).toMatch(/@media \(max-width:\s*980px\)[\s\S]*body\s*\{[^}]*height:\s*auto[^}]*overflow-y:\s*auto/su);
    expect(css).toMatch(/@media \(max-width:\s*980px\)[\s\S]*\.detail-panel\s*\{[^}]*overflow-y:\s*visible/su);
  });

  it("resets the correct reading surface when a Skill is selected", async () => {
    const script = await readFile(path.join(root, "web", "app.js"), "utf8");
    expect(script).toContain('window.matchMedia("(max-width: 980px)").matches');
    expect(script).toContain('elements.detail.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })');
    expect(script).toContain('elements.detail.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })');
  });
});
