import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ErrorObject, ValidateFunction } from "ajv";
import type { CapabilityPack } from "../types.js";

const require = createRequire(import.meta.url);
interface AjvLike {
  compile(schema: object): ValidateFunction;
}
const Ajv2020 = (require("ajv/dist/2020").default ?? require("ajv/dist/2020")) as new (
  options: object
) => AjvLike;
const addFormats = (require("ajv-formats").default ?? require("ajv-formats")) as (
  ajv: AjvLike
) => AjvLike;

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeRuntimePath(root: string, relative: string): string {
  const normalized = path.posix.normalize(relative.replaceAll("\\", "/"));
  if (
    path.posix.isAbsolute(normalized) ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    !normalized.startsWith("runtime/")
  ) throw new Error(`Runtime state path must remain under runtime/: ${relative}`);
  return path.join(root, ...normalized.split("/"));
}

function formatErrors(errors: ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map((error) => `${error.instancePath || "/"}: ${error.message ?? error.keyword}`);
}

async function profileValidator(root: string, pack: CapabilityPack): Promise<ValidateFunction> {
  if (!pack.runtimeState) throw new Error(`Capability pack ${pack.id} has no runtime state profile`);
  const schema = JSON.parse(await readFile(safeRuntimePath(root, pack.runtimeState.stateSchema), "utf8")) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

export async function validatePackState(root: string, pack: CapabilityPack, state: JsonValue): Promise<string[]> {
  const validate = await profileValidator(root, pack);
  return validate(state) ? [] : formatErrors(validate.errors);
}

export async function initializePackState(root: string, pack: CapabilityPack): Promise<JsonObject> {
  if (!pack.runtimeState) throw new Error(`Capability pack ${pack.id} has no runtime state profile`);
  const initial = JSON.parse(await readFile(safeRuntimePath(root, pack.runtimeState.initialState), "utf8")) as JsonValue;
  if (!isObject(initial)) throw new Error(`Capability pack ${pack.id} initial state must be a JSON object`);
  const errors = await validatePackState(root, pack, initial);
  if (errors.length > 0) throw new Error(`Invalid initial state for ${pack.id}: ${errors.join("; ")}`);
  return structuredClone(initial);
}

function assertSafePatch(value: JsonValue, pointer = ""): void {
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`Forbidden runtime state patch key: ${pointer}/${key}`);
    assertSafePatch(child, `${pointer}/${key}`);
  }
}

export function applyJsonMergePatch(current: JsonObject, patch: JsonObject): JsonObject {
  assertSafePatch(patch);
  const result = structuredClone(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete result[key];
    else if (isObject(value)) {
      const existing = result[key];
      result[key] = applyJsonMergePatch(isObject(existing) ? existing : {}, value);
    } else result[key] = structuredClone(value);
  }
  return result;
}

export async function applyValidatedPackStatePatch(
  root: string,
  pack: CapabilityPack,
  current: JsonValue,
  patch: JsonValue
): Promise<JsonObject> {
  if (!isObject(current)) throw new Error("Current runtime state must be a JSON object");
  if (!isObject(patch)) throw new Error("Runtime state patch must be a JSON object");
  const currentErrors = await validatePackState(root, pack, current);
  if (currentErrors.length > 0) throw new Error(`Current runtime state is invalid: ${currentErrors.join("; ")}`);
  const candidate = applyJsonMergePatch(current, patch);
  const candidateErrors = await validatePackState(root, pack, candidate);
  if (candidateErrors.length > 0) throw new Error(`Runtime state patch rejected: ${candidateErrors.join("; ")}`);
  return candidate;
}

export async function validatePackRuntimeStateProfile(root: string, pack: CapabilityPack): Promise<string[]> {
  if (!pack.runtimeState) return [];
  try {
    await initializePackState(root, pack);
    return [];
  } catch (error) {
    return [`${pack.id}: ${(error as Error).message}`];
  }
}
