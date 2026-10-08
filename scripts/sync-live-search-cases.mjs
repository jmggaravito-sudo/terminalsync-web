#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const APP_REPO = "jmggaravito-sudo/terminal-sync";
const DEFAULT_REF = "e04d25d9d63414452fcaa2760e483266e8231ebd";
const APP_DATA_PATH = "src/data/useCases.ts";
const LOCALE_PATH = (locale) => `public/locales/${locale}/translation.json`;
const LOCAL_DATA_PATH = path.resolve("src/content/useCases.ts");
const OUTPUT_PATH = path.resolve("src/content/landingUseCases.generated.ts");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const sourceRef = args.find((arg) => arg !== "--check") || DEFAULT_REF;

if (args.includes("--help")) {
  console.log("Usage: npm run sync:live-search-cases -- [app-ref] [--check]");
  console.log(`Default app ref: ${DEFAULT_REF}`);
  process.exit(0);
}

function ghApi(apiArgs) {
  return execFileSync("gh", ["api", ...apiArgs], {
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

function fetchRaw(repositoryPath, commit) {
  return execFileSync(
    "gh",
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${APP_REPO}/contents/${repositoryPath}?ref=${commit}`,
    ],
    {
      encoding: "utf8",
      maxBuffer: 12 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
}

function findVariable(sourceFile, variableName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
        return declaration.initializer;
      }
    }
  }
  throw new Error(`Could not find ${variableName}`);
}

function property(node, name) {
  if (!ts.isObjectLiteralExpression(node)) return undefined;
  return node.properties.find((entry) => {
    if (!ts.isPropertyAssignment(entry)) return false;
    const key = ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)
      ? entry.name.text
      : "";
    return key === name;
  });
}

function stringProperty(node, name) {
  const entry = property(node, name);
  if (!entry || !ts.isPropertyAssignment(entry)) return undefined;
  const initializer = entry.initializer;
  return ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)
    ? initializer.text
    : undefined;
}

function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalValue);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.flatMap((entry) => {
      if (!ts.isPropertyAssignment(entry)) return [];
      const key = ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)
        ? entry.name.text
        : null;
      return key ? [[key, literalValue(entry.initializer)]] : [];
    }));
  }
  throw new Error(`Unsupported non-literal value in source catalog: ${node.getText()}`);
}

function readLiteralArray(sourceFile, name) {
  const initializer = findVariable(sourceFile, name);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error(`${name} must remain a literal array for reliable export.`);
  }
  return initializer.elements.map(literalValue);
}

function replaceRequired(text, from, to, caseId, locale) {
  if (!text.includes(from)) {
    throw new Error(`Expected copy fragment missing for ${caseId} (${locale}); review the source before syncing.`);
  }
  return text.replace(from, to);
}

function publicCopyFor(useCaseId, locale, sourceItem) {
  const title = sourceItem?.title;
  let outcome = sourceItem?.outcome;
  let prompt = sourceItem?.prompt;
  if (![title, outcome, prompt].every((value) => typeof value === "string" && value.length > 0)) {
    throw new Error(`Missing localized title/outcome/prompt for ${useCaseId} (${locale}).`);
  }

  if (useCaseId === "market-007" && locale === "es") {
    outcome = "Revisa cómo apareces en Google y qué responde la IA cuando alguien pregunta por tu negocio o tu rubro.";
    prompt = replaceRequired(prompt,
      "házselas también a los asistentes de IA que tengas disponibles",
      "pregúntaselas también a la IA de TerminalSync", useCaseId, locale);
    prompt = replaceRequired(prompt,
      "qué responden los asistentes de IA y si me mencionan",
      "qué responde la IA de TerminalSync y si me menciona", useCaseId, locale);
  }

  if (useCaseId === "market-007" && locale === "en") {
    outcome = "Checks how you show up on Google and what TerminalSync's AI says when someone asks about your business or industry.";
    prompt = replaceRequired(prompt,
      "also ask them to the AI assistants you have available",
      "also ask TerminalSync's AI", useCaseId, locale);
    prompt = replaceRequired(prompt,
      "what the AI assistants answer and whether they mention me",
      "what TerminalSync's AI answers and whether it mentions me", useCaseId, locale);
  }

  return { t: title, d: outcome, p: prompt };
}

const localSource = readFileSync(LOCAL_DATA_PATH, "utf8");
const localFile = ts.createSourceFile(
  LOCAL_DATA_PATH,
  localSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const legacyAreas = readLiteralArray(localFile, "AREAS")
  .filter((area) => !["usados", "todas"].includes(area.id))
  .map(({ id, es, en }) => ({ id, es, en }));
const legacyCases = readLiteralArray(localFile, "CASES").map(({ id, area, es, en }) => {
  if (id === "cambiar-ia") {
    return {
      id,
      area,
      es: {
        t: "Retomar un proyecto sin repetir contexto",
        d: "Conserva los avances, decisiones y próximos pasos para volver al trabajo con claridad.",
        p: "Estoy trabajando en: [proyecto o tarea].\n\nAyúdame a mantener un resumen actualizado con el objetivo, los avances, las decisiones tomadas y los próximos pasos. Cuando retome el trabajo, usa este contexto y pregúntame si falta algún dato. No cambies las decisiones registradas sin consultarme.",
      },
      en: {
        t: "Resume a project so you can pick it back up",
        d: "Keep progress, decisions, and next steps clear for when you return to the work.",
        p: "I'm working on: [project or task].\n\nHelp me keep an up-to-date summary of the goal, progress, decisions made, and next steps. When I return to the work, use this context and ask me if anything is missing. Don't change recorded decisions without checking with me.",
      },
    };
  }
  return { id, area, es, en };
});
const legacyJobs = readLiteralArray(localFile, "JOBS").map(({ id, cat, es, en }) => ({
  id,
  cat,
  es,
  en,
}));
const jobCategories = readLiteralArray(localFile, "JOB_CATS")
  .filter((category) => category.id !== "todos")
  .map(({ id, es, en }) => ({ id, es, en }));

if (legacyCases.length !== 29 || legacyJobs.length !== 12) {
  throw new Error(`Legacy source changed: expected 29 cases and 12 jobs, found ${legacyCases.length} and ${legacyJobs.length}. Review before syncing.`);
}

const sourceCommit = ghApi([
  "--method", "GET", `repos/${APP_REPO}/commits`, "-f", `sha=${sourceRef}`,
  "-f", "per_page=1", "--jq", ".[0].sha",
]);
if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) {
  throw new Error(`Could not resolve app source ref: ${sourceRef}`);
}

const appSource = fetchRaw(APP_DATA_PATH, sourceCommit);
const appFile = ts.createSourceFile(APP_DATA_PATH, appSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const categoryIdNode = findVariable(appFile, "LIVE_SEARCH_CATEGORY_ID");
if (!categoryIdNode || !ts.isStringLiteral(categoryIdNode)) {
  throw new Error("LIVE_SEARCH_CATEGORY_ID must remain a string literal.");
}
const categoryId = categoryIdNode.text;
const casesInitializer = findVariable(appFile, "USE_CASES");
if (!casesInitializer || !ts.isArrayLiteralExpression(casesInitializer)) {
  throw new Error("USE_CASES must remain a literal array for reliable export.");
}

const liveCases = casesInitializer.elements.filter((node) => {
  if (!ts.isObjectLiteralExpression(node)) return false;
  const id = stringProperty(node, "id");
  const categoryInitializer = property(node, "categoryId")?.initializer;
  const isLiveCategory = Boolean(
    categoryInitializer &&
      ((ts.isIdentifier(categoryInitializer) && categoryInitializer.text === "LIVE_SEARCH_CATEGORY_ID") ||
        (ts.isStringLiteral(categoryInitializer) && categoryInitializer.text === categoryId)),
  );
  const toolsEntry = property(node, "requiredSearchTools");
  const gated = Boolean(toolsEntry && ts.isPropertyAssignment(toolsEntry) &&
    ts.isArrayLiteralExpression(toolsEntry.initializer) && toolsEntry.initializer.elements.length > 0);
  return Boolean(id && id.startsWith(`${categoryId}-`) && isLiveCategory && gated);
});
if (liveCases.length === 0) throw new Error("No capability-gated live-search cases found.");

const translations = {};
for (const locale of ["es", "en"]) {
  translations[locale] = JSON.parse(fetchRaw(LOCALE_PATH(locale), sourceCommit));
}
const categoryNames = Object.fromEntries(["es", "en"].map((locale) => {
  const title = translations[locale]?.useCases?.categories?.[categoryId]?.title;
  if (typeof title !== "string" || !title) throw new Error(`Missing ${locale} title for category ${categoryId}.`);
  return [locale, title];
}));
const liveCategory = { id: categoryId, es: categoryNames.es, en: categoryNames.en };
const newCases = liveCases.map((node) => {
  const id = stringProperty(node, "id");
  if (!id) throw new Error("A live-search case has no string id.");
  return {
    id,
    area: categoryId,
    es: publicCopyFor(id, "es", translations.es?.useCases?.items?.[id]),
    en: publicCopyFor(id, "en", translations.en?.useCases?.items?.[id]),
  };
});

const payload = {
  source: {
    legacy: "terminalsync-web/src/content/useCases.ts (existing landing catalog)",
    liveSearch: {
      repository: APP_REPO,
      ref: sourceRef,
      commit: sourceCommit,
      dataFile: APP_DATA_PATH,
    },
  },
  categories: [...legacyAreas, liveCategory],
  cases: [...legacyCases, ...newCases],
  jobCategories,
  jobs: legacyJobs,
};

if (payload.cases.length !== legacyCases.length + newCases.length) {
  throw new Error("Combined catalog case count is inconsistent.");
}
const serializedPayload = JSON.stringify(payload);
for (const forbidden of ["Claude", "Codex", "Gemini"]) {
  if (serializedPayload.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`AI provider unexpectedly included in public copy: ${forbidden}`);
  }
}
function assertNoInternalFields(value) {
  if (Array.isArray(value)) return value.forEach(assertNoInternalFields);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (["ai", "level", "recommendedAI", "requiredSearchTools"].includes(key)) {
      throw new Error(`Internal field unexpectedly included: ${key}`);
    }
    assertNoInternalFields(child);
  }
}
assertNoInternalFields(payload);
if (/asistentes de IA|AI assistants/i.test(serializedPayload)) {
  throw new Error("Plural AI-assistant copy remains in the public landing export.");
}

const output =
  `/* Generated from the existing landing catalog plus ${APP_REPO}@${sourceCommit}; do not edit by hand. */\n` +
  `export const LANDING_USE_CASES = ${serializedPayload} as const;\n`;

if (checkOnly) {
  const current = readFileSync(OUTPUT_PATH, "utf8");
  if (current !== output) throw new Error(`${OUTPUT_PATH} is stale; run npm run sync:live-search-cases -- ${sourceRef}.`);
  console.log(`Landing catalog is current: ${legacyCases.length} existing + ${newCases.length} live-search cases; ${legacyJobs.length} workflows; ${payload.categories.length} use-case categories.`);
} else {
  writeFileSync(OUTPUT_PATH, output);
  console.log(`Wrote ${OUTPUT_PATH}: ${legacyCases.length} existing + ${newCases.length} live-search cases; ${legacyJobs.length} workflows; ${payload.categories.length} use-case categories.`);
}
