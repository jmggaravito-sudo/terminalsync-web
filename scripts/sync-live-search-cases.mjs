#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const APP_REPO = "jmggaravito-sudo/terminal-sync";
const DEFAULT_REF = "3c7d784fdb2432dc14cdcd475da41680ff02035d";
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
  if (!node || !ts.isObjectLiteralExpression(node)) return undefined;
  return node.properties.find((entry) => {
    if (!ts.isPropertyAssignment(entry)) return false;
    const key = ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)
      ? entry.name.text
      : "";
    return key === name;
  });
}

function readStringConstants(sourceFile) {
  const values = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = declaration.initializer;
      if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
        values.set(declaration.name.text, initializer.text);
      }
    }
  }
  return values;
}

function stringValue(node, constants = new Map()) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isIdentifier(node)) return constants.get(node.text);
  return undefined;
}

function stringProperty(node, name, constants) {
  const entry = property(node, name);
  return entry && ts.isPropertyAssignment(entry)
    ? stringValue(entry.initializer, constants)
    : undefined;
}

function stringArrayProperty(node, name) {
  const entry = property(node, name);
  if (!entry || !ts.isPropertyAssignment(entry) || !ts.isArrayLiteralExpression(entry.initializer)) {
    return [];
  }
  return entry.initializer.elements.map((item) => {
    if (!ts.isStringLiteral(item) && !ts.isNoSubstitutionTemplateLiteral(item)) {
      throw new Error(`Expected a string array for ${name}, received ${item.getText()}`);
    }
    return item.text;
  });
}

function readObjectArray(sourceFile, name) {
  const initializer = findVariable(sourceFile, name);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error(`${name} must remain a literal array for reliable export.`);
  }
  return initializer.elements;
}

function localizedText(item, field, fallback, id, locale) {
  const value = item?.[field];
  if (typeof value === "string" && value.trim()) return value;
  if (locale === "en") {
    throw new Error(`Missing English ${field} for app case ${id}; translate it before syncing.`);
  }
  if (typeof fallback === "string" && fallback.trim()) return fallback;
  throw new Error(`Missing Spanish ${field} for app case ${id}.`);
}

function publicCopyFor(useCase, locale, translations) {
  const sourceItem = translations[locale]?.useCases?.items?.[useCase.id];
  const copy = {
    t: localizedText(sourceItem, "title", useCase.title, useCase.id, locale),
    d: localizedText(sourceItem, "outcome", useCase.outcome, useCase.id, locale),
    p: localizedText(sourceItem, "prompt", useCase.prompt, useCase.id, locale),
  };

  return copy;
}

const localSource = readFileSync(LOCAL_DATA_PATH, "utf8");
const localFile = ts.createSourceFile(
  LOCAL_DATA_PATH,
  localSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
// Preserve the existing workflow content and data contract used by the page.
const jobsInitializer = findVariable(localFile, "JOBS");
if (!ts.isArrayLiteralExpression(jobsInitializer)) {
  throw new Error("JOBS must remain a literal array for reliable export.");
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
  throw new Error(`Unsupported non-literal workflow value: ${node.getText()}`);
}
const workflowJobs = jobsInitializer.elements.map(literalValue).map(({ id, cat, es, en }) => ({ id, cat, es, en }));
if (workflowJobs.length !== 12) {
  throw new Error("The existing landing workflows changed; review before syncing.");
}
const workflowCategories = literalValue(findVariable(localFile, "JOB_CATS"))
  .filter((category) => category.id !== "todos")
  .map(({ id, es, en }) => ({ id, es, en }));

const sourceCommit = ghApi([
  "--method", "GET", `repos/${APP_REPO}/commits`, "-f", `sha=${sourceRef}`,
  "-f", "per_page=1", "--jq", ".[0].sha",
]);
if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) {
  throw new Error(`Could not resolve app source ref: ${sourceRef}`);
}

const appSource = fetchRaw(APP_DATA_PATH, sourceCommit);
const appFile = ts.createSourceFile(APP_DATA_PATH, appSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const constants = readStringConstants(appFile);
const translations = {};
for (const locale of ["es", "en"]) {
  translations[locale] = JSON.parse(fetchRaw(LOCALE_PATH(locale), sourceCommit));
}

const appCategories = readObjectArray(appFile, "USE_CASE_CATEGORIES").map((node) => {
  const id = stringProperty(node, "id", constants);
  if (!id) throw new Error(`Could not resolve a category ID: ${node.getText()}`);
  const sourceTitle = stringProperty(node, "title", constants);
  const title = Object.fromEntries(["es", "en"].map((locale) => {
    const translated = translations[locale]?.useCases?.categories?.[id]?.title;
    if (typeof translated !== "string" || !translated.trim()) {
      if (locale === "es" && sourceTitle) return [locale, sourceTitle];
      throw new Error(`Missing ${locale} category title for ${id}.`);
    }
    return [locale, translated];
  }));
  return { id, es: title.es, en: title.en };
});
const categoryIds = new Set(appCategories.map((category) => category.id));

const appCases = readObjectArray(appFile, "USE_CASES").map((node) => {
  const id = stringProperty(node, "id", constants);
  const area = stringProperty(node, "categoryId", constants);
  const title = stringProperty(node, "title", constants);
  const outcome = stringProperty(node, "outcome", constants);
  const prompt = stringProperty(node, "prompt", constants);
  if (![id, area, title, outcome, prompt].every((value) => typeof value === "string" && value.length > 0)) {
    throw new Error(`App case missing public source data: ${node.getText().slice(0, 200)}`);
  }
  if (!categoryIds.has(area)) throw new Error(`App case ${id} references unknown category ${area}.`);
  return { id, area, title, outcome, prompt };
});
if (appCases.length === 0 || new Set(appCases.map((item) => item.id)).size !== appCases.length) {
  throw new Error("The app catalog is empty or contains duplicate case IDs.");
}

const cases = appCases.map((item) => ({
  id: item.id,
  area: item.area,
  es: publicCopyFor(item, "es", translations),
  en: publicCopyFor(item, "en", translations),
}));

const payload = {
  source: {
    application: {
      repository: APP_REPO,
      ref: sourceRef,
      commit: sourceCommit,
      dataFile: APP_DATA_PATH,
    },
  },
  categories: appCategories,
  cases,
  jobCategories: workflowCategories,
  jobs: workflowJobs,
};

function assertPublicSchema(value) {
  if (Array.isArray(value)) return value.forEach(assertPublicSchema);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (["ai", "level", "recommendedAI", "requiredSearchTools", "expectedResult", "recommendedFiles"].includes(key)) {
      throw new Error(`Internal field unexpectedly included in public landing data: ${key}`);
    }
    assertPublicSchema(child);
  }
}
assertPublicSchema(payload);
const serializedPayload = JSON.stringify(payload);
const publicCopyLowercase = serializedPayload.toLocaleLowerCase("en");
for (const provider of ["Claude", "Codex", "Gemini", "ChatGPT", "OpenAI", "GPT-4", "GPT-5", "GLM", "Grok", "DeepSeek", "Perplexity"]) {
  if (publicCopyLowercase.includes(provider.toLocaleLowerCase("en"))) {
    throw new Error(`An AI provider/model name unexpectedly appears in public copy: ${provider}`);
  }
}
if (/asistentes de IA|AI assistants/i.test(serializedPayload)) {
  throw new Error("Plural AI-assistant copy remains in the public landing export.");
}

const output =
  `/* Generated from ${APP_REPO}@${sourceCommit}; do not edit by hand. */\n` +
  `export const LANDING_USE_CASES = ${serializedPayload} as const;\n`;

if (checkOnly) {
  const current = readFileSync(OUTPUT_PATH, "utf8");
  if (current !== output) throw new Error(`${OUTPUT_PATH} is stale; run npm run sync:live-search-cases -- ${sourceRef}.`);
  console.log(`App mirror is current: ${appCases.length} cases, ${appCategories.length} categories, ${workflowJobs.length} separate workflows.`);
} else {
  writeFileSync(OUTPUT_PATH, output);
  console.log(`Wrote ${OUTPUT_PATH}: ${appCases.length} app cases across ${appCategories.length} categories; kept ${workflowJobs.length} separate web workflows.`);
}
