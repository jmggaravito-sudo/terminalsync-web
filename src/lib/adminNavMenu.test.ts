import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/[lang]/admin/AdminNav.tsx", "utf8");
const file = ts.createSourceFile("AdminNav.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const group = file.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "NavGroup");
if (!group) throw new Error("NavGroup missing");
const attributes: ts.JsxAttribute[] = [];
const calls: ts.CallExpression[] = [];
function visit(node: ts.Node) {
  if (ts.isJsxAttribute(node)) attributes.push(node);
  if (ts.isCallExpression(node)) calls.push(node);
  ts.forEachChild(node, visit);
}
visit(group);

describe("admin dropdown stability (source contracts)", () => {
  it("uses click state without hover handlers that close the portaled menu", () => {
    expect(attributes.some((a) => /onMouse(Enter|Leave)/.test(a.name.getText(file)))).toBe(false);
    expect(attributes.some((a) => a.name.getText(file) === "onClick" && a.initializer?.getText(file) === "{() => setOpen((v) => !v)}")).toBe(true);
    expect(source).toContain("aria-expanded={open}");
  });

  it("repositions rather than dismissing the menu on scroll or resize", () => {
    for (const event of ['"scroll"', '"resize"']) {
      const listeners = calls.filter((c) => c.expression.getText(file) === "window.addEventListener" && c.arguments[0]?.getText(file) === event);
      expect(listeners).toHaveLength(1);
      expect(listeners[0].arguments[1].getText(file)).toBe("updatePosition");
      expect(calls.some((c) => c.expression.getText(file) === "window.removeEventListener" && c.arguments[0]?.getText(file) === event && c.arguments[1]?.getText(file) === "updatePosition")).toBe(true);
    }
  });

  it("keeps selection, Escape, route change and outside-click dismissals", () => {
    expect(source).toContain('if (e.key === "Escape") closeAll();');
    expect(source).toContain("triggerRef.current?.contains(target) || menuRef.current?.contains(target)");
    expect(source).toContain('document.addEventListener("pointerdown", onPointerDown)');
    expect(source).toMatch(/useEffect\(\(\) => \{\s*closeAll\(\);[\s\S]*?\}, \[pathname\]\)/);
    expect(attributes.some((a) => a.name.getText(file) === "onClick" && a.initializer?.getText(file) === "{closeAll}")).toBe(true);
  });
});
