import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../src/catalog/catalog.js";
import { clusterDuplicates, compareCatalogEntries } from "../src/deduplicate.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("catalog deduplication", () => {
  it("explains independent similarity components", async () => {
    const catalog = await loadCatalog(root);
    const xlsx = catalog.filter((entry) => entry.type === "skill" && entry.name === "xlsx");
    expect(xlsx).toHaveLength(2);
    const comparison = compareCatalogEntries(xlsx[0]!, xlsx[1]!);
    expect(comparison.name).toBe(1);
    expect(comparison.capabilities).toBe(1);
    expect(comparison.total).toBeGreaterThanOrEqual(0.8);
  });

  it("creates candidate clusters without deleting or merging entries", async () => {
    const catalog = await loadCatalog(root);
    const clusters = clusterDuplicates(catalog, 0.82);
    const xlsxCluster = clusters.find((cluster) =>
      cluster.entries.every((id) => catalog.find((entry) => entry.id === id)?.name === "xlsx")
    );
    expect(xlsxCluster?.entries).toHaveLength(2);
    expect(catalog).toHaveLength(658);
  });
});
