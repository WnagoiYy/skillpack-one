import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";

async function files(root: string, relative = ""): Promise<string[]> {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push(...await files(root, child));
    else result.push(child);
  }
  return result.sort();
}

async function directoryDigest(root: string): Promise<string | undefined> {
  try {
    const hash = createHash("sha256");
    for (const file of await files(root)) {
      hash.update(file.replace(/\\/gu, "/"));
      hash.update(await readFile(path.join(root, file)));
    }
    return hash.digest("hex");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export interface InstallResult {
  target: string;
  installed: string[];
  updated: string[];
  skipped: string[];
  conflicts: string[];
}

export async function installSkillPack(packageRoot: string, targetRoot: string, force = false): Promise<InstallResult> {
  const sourceRoot = path.resolve(packageRoot, ".agents", "skills");
  const target = path.resolve(targetRoot);
  const parsed = path.parse(target);
  if (target === parsed.root) throw new Error(`Refusing to install Skills into filesystem root: ${target}`);
  const sourceDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  await mkdir(target, { recursive: true });
  const result: InstallResult = { target, installed: [], updated: [], skipped: [], conflicts: [] };
  for (const name of sourceDirectories) {
    const source = path.join(sourceRoot, name);
    const destination = path.resolve(target, name);
    if (path.dirname(destination) !== target) throw new Error(`Unsafe Skill destination: ${destination}`);
    const [sourceDigest, destinationDigest] = await Promise.all([directoryDigest(source), directoryDigest(destination)]);
    if (destinationDigest === sourceDigest) {
      result.skipped.push(name);
      continue;
    }
    if (destinationDigest && !force) {
      result.conflicts.push(name);
      continue;
    }
    if (destinationDigest) {
      await rm(destination, { recursive: true, force: true });
      result.updated.push(name);
    } else result.installed.push(name);
    await cp(source, destination, { recursive: true, force: false, errorOnExist: true });
  }
  return result;
}
