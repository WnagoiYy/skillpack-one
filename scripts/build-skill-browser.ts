import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { writeSkillBrowserData } from "../src/web/catalog.js";

const root = process.cwd();
const source = path.join(root, "web");
const output = path.join(root, "build");

if (path.dirname(output) !== root || path.basename(output) !== "build") {
  throw new Error("Refusing to replace an unexpected build directory");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all([
  cp(path.join(source, "index.html"), path.join(output, "index.html")),
  cp(path.join(source, "styles.css"), path.join(output, "styles.css")),
  cp(path.join(source, "app.js"), path.join(output, "app.js")),
  cp(path.join(source, "og.png"), path.join(output, "og.png"))
]);
const data = await writeSkillBrowserData(root, path.join(output, "data", "skills.json"));
process.stdout.write(`Built Skill Browser with ${data.stats.total} Skills in ${output}.\n`);
