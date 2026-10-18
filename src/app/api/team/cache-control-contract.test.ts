import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function routeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return routeSources(path);
    return entry.isFile() && entry.name === "route.ts" ? [path] : [];
  });
}

function directResponseFactoryUses(filename: string, code: string): string[] {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
  const nextResponseBindings = new Set<string>();
  const nextServerNamespaces = new Set<string>();

  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "next/server"
    ) {
      continue;
    }

    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    if (clause.name) nextResponseBindings.add(clause.name.text);

    if (!clause.namedBindings) continue;
    if (ts.isNamespaceImport(clause.namedBindings)) {
      nextServerNamespaces.add(clause.namedBindings.name.text);
      continue;
    }

    for (const binding of clause.namedBindings.elements) {
      if (binding.isTypeOnly) continue;
      const imported = binding.propertyName?.text ?? binding.name.text;
      if (imported === "NextResponse") nextResponseBindings.add(binding.name.text);
    }
  }

  const isResponseConstructor = (expression: ts.Expression): boolean => {
    if (ts.isIdentifier(expression)) {
      return expression.text === "Response" || nextResponseBindings.has(expression.text);
    }
    if (!ts.isPropertyAccessExpression(expression)) return false;

    return (
      (ts.isIdentifier(expression.expression) &&
        expression.expression.text === "globalThis" &&
        expression.name.text === "Response") ||
      (ts.isIdentifier(expression.expression) &&
        nextServerNamespaces.has(expression.expression.text) &&
        expression.name.text === "NextResponse")
    );
  };

  const uses: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isNewExpression(node) && isResponseConstructor(node.expression)) {
      uses.push(node.getText(source));
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      if (isResponseConstructor(node.expression.expression)) {
        uses.push(node.getText(source));
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(source);
  return uses;
}

describe("Team API cache-control contract", () => {
  it("routes every explicit Team handler response through the shared no-store boundary", () => {
    const sources = routeSources(join(process.cwd(), "src", "app", "api", "team"));
    expect(sources).not.toHaveLength(0);

    for (const source of sources) {
      const code = readFileSync(source, "utf8");
      expect(code, source).toContain('import { teamJson } from "@/lib/teamApiResponse";');
      expect(directResponseFactoryUses(source, code), source).toEqual([]);
    }
  });

  it("detects native response factories without matching comments or strings", () => {
    const uses = directResponseFactoryUses(
      "fixture.ts",
      [
        'import { NextResponse as TeamResponse } from "next/server";',
        'import * as nextServer from "next/server";',
        'new Response("body");',
        'Response.json({ ok: true });',
        'new TeamResponse("body");',
        'TeamResponse.redirect("/login");',
        'nextServer.NextResponse.rewrite("/login");',
        '// Response.json({ not: "a response" });',
        'const note = "new Response()";',
      ].join("\n"),
    );

    expect(uses).toEqual([
      'new Response("body")',
      "Response.json({ ok: true })",
      'new TeamResponse("body")',
      'TeamResponse.redirect("/login")',
      'nextServer.NextResponse.rewrite("/login")',
    ]);
  });
});
