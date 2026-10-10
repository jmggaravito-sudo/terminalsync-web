#!/usr/bin/env node
/**
 * One-off exporter: app repo (src/data/useCases.ts + es/en translation.json)
 * -> content/use-cases/{categories.json,cases/<id>.json} (jobs.json is edited by hand).
 *
 * From the migration on, content/use-cases/ is the single source of truth
 * (landing + desktop app via /api/marketplace/catalog). Keep this script only
 * for audit/re-import; edit the JSON files directly day to day.
 *
 * Usage: node scripts/export-use-cases.mjs [--app-repo <dir>] [--ref <git-ref>]
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}
const APP_DIR = opt("--app-repo", "/Users/jm/projects/terminal-sync-onboarding-back-buttons");
const REF = opt("--ref", "origin/release/v0.2.18-lab");
const OUT = path.resolve("content/use-cases");

function show(file) {
  return execFileSync("git", ["-C", APP_DIR, "show", `${REF}:${file}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function parse(name, text) {
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function findVariable(sf, name) {
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === name) return d.initializer;
    }
  }
  throw new Error(`Could not find ${name}`);
}

// Top-level `const X = "literal"` and `const X = { a: "literal", ... }` maps.
function readConstants(sf) {
  const values = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name) || !d.initializer) continue;
      let init = d.initializer;
      if (ts.isAsExpression(init)) init = init.expression;
      if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        values.set(d.name.text, init.text);
      } else if (ts.isObjectLiteralExpression(init)) {
        const obj = {};
        for (const p of init.properties) {
          if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && ts.isStringLiteral(p.initializer)) {
            obj[p.name.text] = p.initializer.text;
          }
        }
        values.set(d.name.text, obj);
      }
    }
  }
  return values;
}

function literal(node, scope) {
  if (ts.isAsExpression(node)) return literal(node.expression, scope);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node)) {
    if (scope.has(node.text)) return scope.get(node.text);
    throw new Error(`Unresolved identifier ${node.text}`);
  }
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
    const obj = scope.get(node.expression.text);
    if (obj && typeof obj === "object" && node.name.text in obj) return obj[node.name.text];
    throw new Error(`Unresolved ${node.getText()}`);
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((e) => literal(e, scope));
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) throw new Error(`Unsupported ${p.getText()}`);
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null;
      if (!key) throw new Error(`Unsupported key ${p.name.getText()}`);
      out[key] = literal(p.initializer, scope);
    }
    return out;
  }
  throw new Error(`Unsupported value: ${node.getText().slice(0, 80)}`);
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const appFile = parse("useCases.ts", show("src/data/useCases.ts"));
const searchFile = parse("searchCapabilities.ts", show("src/lib/searchCapabilities.ts"));
const scope = readConstants(appFile);
for (const [k, v] of readConstants(searchFile)) scope.set(k, v);

const tr = {
  es: JSON.parse(show("public/locales/es/translation.json")).useCases,
  en: JSON.parse(show("public/locales/en/translation.json")).useCases,
};

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const nonEmptyList = (v) => Array.isArray(v) && v.length > 0 && v.every(nonEmpty);

function pick(locale, id, field, fallback, isList) {
  const tv = tr[locale].items?.[id]?.[field];
  const ok = isList ? nonEmptyList : nonEmpty;
  if (ok(tv)) return tv;
  if (locale === "en") throw new Error(`Missing English ${field} for ${id}`);
  if (ok(fallback)) return fallback;
  throw new Error(`Missing Spanish ${field} for ${id}`);
}

// Categories
const categories = findVariable(appFile, "USE_CASE_CATEGORIES").elements.map((n) => {
  const c = literal(n, scope);
  const out = { id: c.id, icon: c.icon, accent: c.accent };
  for (const locale of ["es", "en"]) {
    const t = tr[locale].categories?.[c.id] ?? {};
    const title = nonEmpty(t.title) ? t.title : locale === "es" ? c.title : null;
    const description = nonEmpty(t.description) ? t.description : locale === "es" ? c.description : null;
    if (!title || !description) throw new Error(`Missing ${locale} category copy for ${c.id}`);
    out[locale] = { title, description };
  }
  return out;
});
const categoryIds = new Set(categories.map((c) => c.id));

// Cases
rmSync(path.join(OUT, "cases"), { recursive: true, force: true });
const raw = findVariable(appFile, "USE_CASES").elements.map((n) => literal(n, scope));
const seen = new Set();
for (const [index, c] of raw.entries()) {
  if (seen.has(c.id)) throw new Error(`Duplicate id ${c.id}`);
  seen.add(c.id);
  if (!categoryIds.has(c.categoryId)) throw new Error(`${c.id}: unknown category ${c.categoryId}`);
  const out = { id: c.id, categoryId: c.categoryId, recommendedAI: c.recommendedAI, level: c.level, order: index + 1 };
  if (c.popular) out.popular = true;
  if (c.isNew) out.isNew = true;
  if (c.requiredSearchTools?.length) out.requiredSearchTools = c.requiredSearchTools;
  for (const locale of ["es", "en"]) {
    out[locale] = {
      title: pick(locale, c.id, "title", c.title),
      outcome: pick(locale, c.id, "outcome", c.outcome),
      prompt: pick(locale, c.id, "prompt", c.prompt),
      recommendedFiles: pick(locale, c.id, "recommendedFiles", c.recommendedFiles, true),
      expectedResult: pick(locale, c.id, "expectedResult", c.expectedResult, true),
    };
  }
  writeJson(path.join(OUT, "cases", `${c.id}.json`), out);
}

// Workflows (jobs) were hand-written in src/content/useCases.ts and now live
// only in content/use-cases/jobs.json (edit that file directly).

writeJson(path.join(OUT, "categories.json"), categories);
console.log(`Exported ${raw.length} cases and ${categories.length} categories from ${REF}.`);
