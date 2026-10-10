/**
 * Use-cases ("casos de uso") loader. Single source of truth for the landing
 * (/casos-de-uso) and the desktop app (/api/marketplace/catalog `useCases`).
 *
 * Data lives in `content/use-cases/`:
 *   categories.json     category list (order = display order)
 *   cases/<id>.json     one case per file, es + en text inside the case
 *   jobs.json           landing-only "workflows" (not part of the app catalog)
 *
 * Server-side only (reads the filesystem). Every call returns one language.
 * Case ids are used by app history/analytics: never rename them.
 */

import fs from "node:fs";
import path from "node:path";

export type UseCaseLang = "es" | "en";
export type UseCaseLevel = "Básico" | "Intermedio" | "Avanzado";

interface RawCaseText {
  title: string;
  outcome: string;
  prompt: string;
  recommendedFiles: string[];
  expectedResult: string[];
}

export interface RawUseCase {
  id: string;
  categoryId: string;
  recommendedAI: string;
  level: UseCaseLevel;
  /** Display order inside its category (ascending); missing sorts last. */
  order?: number;
  popular?: boolean;
  isNew?: boolean;
  requiredSearchTools?: string[];
  /** Connector slugs (content/connectors) this case relies on. */
  connectors?: string[];
  es: RawCaseText;
  en: RawCaseText;
}

export interface RawUseCaseCategory {
  id: string;
  icon: string;
  accent: string;
  es: { title: string; description: string };
  en: { title: string; description: string };
}

export interface UseCaseCategory {
  id: string;
  icon: string;
  accent: string;
  title: string;
  description: string;
}

export interface UseCase extends RawCaseText {
  id: string;
  categoryId: string;
  recommendedAI: string;
  level: UseCaseLevel;
  order?: number;
  popular?: boolean;
  isNew?: boolean;
  requiredSearchTools?: string[];
  connectors?: string[];
}

export interface UseCasesCatalog {
  categories: UseCaseCategory[];
  cases: UseCase[];
}

export interface LocalizedLabel {
  id: string;
  label: string;
}

export interface UseCaseJob {
  id: string;
  cat: string;
  t: string;
  d: string;
  steps: string[];
  cad: string;
  rep: string;
}

export interface UseCaseJobsCatalog {
  categories: LocalizedLabel[];
  jobs: UseCaseJob[];
}

const USE_CASES_DIR = path.join(process.cwd(), "content", "use-cases");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

let rawCache: { categories: RawUseCaseCategory[]; cases: RawUseCase[] } | null =
  null;

/** Raw bilingual data, categories in file order and cases ordered by category,
 *  then `order`, then id. Exported for tests and tooling; consumers use `getUseCases`. */
export function loadRawUseCases(): {
  categories: RawUseCaseCategory[];
  cases: RawUseCase[];
} {
  if (rawCache) return rawCache;
  const categories = readJson<RawUseCaseCategory[]>(
    path.join(USE_CASES_DIR, "categories.json"),
  );
  const order = new Map(categories.map((c, i) => [c.id, i] as const));
  const casesDir = path.join(USE_CASES_DIR, "cases");
  const cases = fs
    .readdirSync(casesDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson<RawUseCase>(path.join(casesDir, f)))
    .sort(
      (a, b) =>
        (order.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER) ||
        (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  rawCache = { categories, cases };
  return rawCache;
}

export function getUseCases(lang: string): UseCasesCatalog {
  const l: UseCaseLang = lang === "es" ? "es" : "en";
  const raw = loadRawUseCases();
  return {
    categories: raw.categories.map((c) => ({
      id: c.id,
      icon: c.icon,
      accent: c.accent,
      ...c[l],
    })),
    cases: raw.cases.map((c) => {
      const { es: _es, en: _en, ...meta } = c;
      return { ...meta, ...c[l] };
    }),
  };
}

/** Cases that declare the given connector slug (for connector detail pages). */
export function getUseCasesForConnector(slug: string, lang: string): UseCase[] {
  return getUseCases(lang).cases.filter((c) => c.connectors?.includes(slug));
}

/** Landing-only workflows ("Flujos de trabajo"). */
export function getUseCaseJobs(lang: string): UseCaseJobsCatalog {
  const l: UseCaseLang = lang === "es" ? "es" : "en";
  const raw = readJson<{
    categories: { id: string; es: string; en: string }[];
    jobs: {
      id: string;
      cat: string;
      es: Omit<UseCaseJob, "id" | "cat">;
      en: Omit<UseCaseJob, "id" | "cat">;
    }[];
  }>(path.join(USE_CASES_DIR, "jobs.json"));
  return {
    categories: raw.categories.map((c) => ({ id: c.id, label: c[l] })),
    jobs: raw.jobs.map((j) => ({ id: j.id, cat: j.cat, ...j[l] })),
  };
}
