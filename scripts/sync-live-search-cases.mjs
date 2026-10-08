#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const APP_REPO = "jmggaravito-sudo/terminal-sync";
const DEFAULT_REF = "release/v0.2.18-lab";
const APP_DATA_PATH = "src/data/useCases.ts";
const LOCALE_PATH = (locale) => `public/locales/${locale}/translation.json`;
const OUTPUT_PATH = path.resolve("public/landing-b/use-cases-data.js");
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
  throw new Error(`Could not find ${variableName} in ${APP_DATA_PATH}`);
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

function requiredSearchToolsArePresent(node) {
  const entry = property(node, "requiredSearchTools");
  return Boolean(
    entry &&
      ts.isPropertyAssignment(entry) &&
      ts.isArrayLiteralExpression(entry.initializer) &&
      entry.initializer.elements.length > 0,
  );
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
    prompt = replaceRequired(
      prompt,
      "házselas también a los asistentes de IA que tengas disponibles",
      "pregúntaselas también a la IA de TerminalSync",
      useCaseId,
      locale,
    );
    prompt = replaceRequired(
      prompt,
      "qué responden los asistentes de IA y si me mencionan",
      "qué responde la IA de TerminalSync y si me menciona",
      useCaseId,
      locale,
    );
  }

  if (useCaseId === "market-007" && locale === "en") {
    outcome = "Checks how you show up on Google and what TerminalSync's AI says when someone asks about your business or industry.";
    prompt = replaceRequired(
      prompt,
      "also ask them to the AI assistants you have available",
      "also ask TerminalSync's AI",
      useCaseId,
      locale,
    );
    prompt = replaceRequired(
      prompt,
      "what the AI assistants answer and whether they mention me",
      "what TerminalSync's AI answers and whether it mentions me",
      useCaseId,
      locale,
    );
  }

  return { t: title, d: outcome, p: prompt };
}

const sourceCommit = ghApi([
  "--method",
  "GET",
  `repos/${APP_REPO}/commits`,
  "-f",
  `sha=${sourceRef}`,
  "-f",
  "per_page=1",
  "--jq",
  ".[0].sha",
]);
if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) {
  throw new Error(`Could not resolve app source ref: ${sourceRef}`);
}

const sourceText = fetchRaw(APP_DATA_PATH, sourceCommit);
const sourceFile = ts.createSourceFile(
  APP_DATA_PATH,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const categoryId = (() => {
  const value = findVariable(sourceFile, "LIVE_SEARCH_CATEGORY_ID");
  if (!value || !ts.isStringLiteral(value)) {
    throw new Error("LIVE_SEARCH_CATEGORY_ID must remain a string literal.");
  }
  return value.text;
})();
const casesInitializer = findVariable(sourceFile, "USE_CASES");
if (!casesInitializer || !ts.isArrayLiteralExpression(casesInitializer)) {
  throw new Error("USE_CASES must remain a literal array for reliable export.");
}

const liveCases = casesInitializer.elements.filter((node) => {
  if (!ts.isObjectLiteralExpression(node)) return false;
  const id = stringProperty(node, "id");
  const categoryEntry = property(node, "categoryId");
  const categoryInitializer = categoryEntry?.initializer;
  const isLiveCategory = Boolean(
    categoryInitializer &&
      ((ts.isIdentifier(categoryInitializer) && categoryInitializer.text === "LIVE_SEARCH_CATEGORY_ID") ||
        (ts.isStringLiteral(categoryInitializer) && categoryInitializer.text === categoryId)),
  );
  return Boolean(
    id &&
      id.startsWith(`${categoryId}-`) &&
      isLiveCategory &&
      requiredSearchToolsArePresent(node),
  );
});
if (liveCases.length === 0) throw new Error("No capability-gated live-search cases found.");

const translations = {};
for (const locale of ["es", "en"]) {
  translations[locale] = JSON.parse(fetchRaw(LOCALE_PATH(locale), sourceCommit));
}
const categories = ["es", "en"].map((locale) => {
  const category = translations[locale]?.useCases?.categories?.[categoryId];
  if (typeof category?.title !== "string" || !category.title) {
    throw new Error(`Missing ${locale} title for category ${categoryId}.`);
  }
  return [locale, category.title];
});
const categoryNames = Object.fromEntries(categories);

const exportedCases = liveCases.map((node) => {
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
    repository: APP_REPO,
    ref: sourceRef,
    commit: sourceCommit,
    dataFile: APP_DATA_PATH,
  },
  categories: [
    {
      id: categoryId,
      es: categoryNames.es,
      en: categoryNames.en,
      areas: [categoryId],
    },
  ],
  cases: exportedCases,
};

const serializedPayload = JSON.stringify(payload);
for (const forbidden of ["recommendedAI", "level", "requiredSearchTools", "Claude", "Codex", "Gemini"]) {
  if (serializedPayload.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`Internal field/provider unexpectedly included: ${forbidden}`);
  }
}
if (/asistentes de IA|AI assistants/i.test(serializedPayload)) {
  throw new Error("Plural AI-assistant copy remains in the public landing export.");
}

const output =
  `/* Generated from ${APP_REPO}@${sourceCommit}; do not edit by hand. */\n` +
  `window.TS_LIVE_SEARCH_CASES = ${serializedPayload};\n`;

if (checkOnly) {
  const current = readFileSync(OUTPUT_PATH, "utf8");
  if (current !== output) {
    throw new Error(`${OUTPUT_PATH} is stale; run npm run sync:live-search-cases -- ${sourceRef}.`);
  }
  console.log(`Live-search landing data is current at ${sourceCommit} (${exportedCases.length} cases).`);
} else {
  writeFileSync(OUTPUT_PATH, output);
  console.log(`Wrote ${OUTPUT_PATH} from ${APP_REPO}@${sourceCommit} (${exportedCases.length} cases).`);
}
