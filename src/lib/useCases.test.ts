import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listConnectors } from "./connectors";
import lockedIds from "./useCases.ids.json";
import {
  getUseCaseJobs,
  getUseCases,
  loadRawUseCases,
} from "./useCases";

const raw = loadRawUseCases();
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

describe("content/use-cases", () => {
  it("has one file per case, named after its id, with unique ids", () => {
    const files = fs
      .readdirSync(path.join(process.cwd(), "content", "use-cases", "cases"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    const ids = raw.cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(files);
  });

  it("never renames or drops an id used by the app history/analytics", () => {
    const ids = new Set(raw.cases.map((c) => c.id));
    const missing = (lockedIds as string[]).filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
    expect(lockedIds).toHaveLength(129);
  });

  it("gives every case non-empty es and en text and a known category", () => {
    const categoryIds = new Set(raw.categories.map((c) => c.id));
    for (const c of raw.cases) {
      expect(categoryIds.has(c.categoryId), `${c.id}: category`).toBe(true);
      expect(nonEmpty(c.recommendedAI), `${c.id}: recommendedAI`).toBe(true);
      expect(nonEmpty(c.level), `${c.id}: level`).toBe(true);
      for (const l of ["es", "en"] as const) {
        const t = c[l];
        expect(nonEmpty(t?.title), `${c.id}.${l}.title`).toBe(true);
        expect(nonEmpty(t?.outcome), `${c.id}.${l}.outcome`).toBe(true);
        expect(nonEmpty(t?.prompt), `${c.id}.${l}.prompt`).toBe(true);
        expect(t.expectedResult.length, `${c.id}.${l}.expectedResult`).toBeGreaterThan(0);
        expect(t.expectedResult.every(nonEmpty), `${c.id}.${l}.expectedResult`).toBe(true);
        expect(t.recommendedFiles.every(nonEmpty), `${c.id}.${l}.recommendedFiles`).toBe(true);
      }
    }
  });

  it("gives every category es and en copy, with unique ids", () => {
    const ids = raw.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of raw.categories) {
      for (const l of ["es", "en"] as const) {
        expect(nonEmpty(c[l]?.title), `${c.id}.${l}.title`).toBe(true);
        expect(nonEmpty(c[l]?.description), `${c.id}.${l}.description`).toBe(true);
      }
    }
  });

  it("only references connectors that exist and are installable for AI", async () => {
    const bySlug = new Map(
      (await listConnectors("en")).map((c) => [c.slug, c] as const),
    );
    for (const c of raw.cases) {
      for (const slug of c.connectors ?? []) {
        const connector = bySlug.get(slug);
        expect(connector, `${c.id}: unknown connector ${slug}`).toBeDefined();
        expect(
          connector?.installableForAi,
          `${c.id}: connector ${slug} is installableForAi:false`,
        ).not.toBe(false);
      }
    }
  });

  it("returns a single language per call", () => {
    const es = getUseCases("es");
    const en = getUseCases("en");
    expect(es.cases).toHaveLength(raw.cases.length);
    expect(es.categories).toHaveLength(raw.categories.length);
    const first = raw.cases[0];
    expect(es.cases[0].title).toBe(first.es.title);
    expect(en.cases[0].title).toBe(first.en.title);
    expect(Object.keys(es.cases[0])).not.toContain("es");
    expect(Object.keys(es.cases[0])).not.toContain("en");
  });

  it("keeps the 12 landing workflows in 6 categories", () => {
    const jobs = getUseCaseJobs("en");
    expect(jobs.jobs).toHaveLength(12);
    expect(jobs.categories).toHaveLength(6);
    const cats = new Set(jobs.categories.map((c) => c.id));
    expect(jobs.jobs.every((j) => cats.has(j.cat))).toBe(true);
  });
});
