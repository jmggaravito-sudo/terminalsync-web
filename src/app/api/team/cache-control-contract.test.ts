import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function routeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return routeSources(path);
    return entry.isFile() && entry.name === "route.ts" ? [path] : [];
  });
}

describe("Team API cache-control contract", () => {
  it("routes every Team response through the shared no-store boundary", () => {
    const sources = routeSources(join(process.cwd(), "src", "app", "api", "team"));
    expect(sources).not.toHaveLength(0);

    for (const source of sources) {
      const code = readFileSync(source, "utf8");
      expect(code, source).toContain('import { teamJson } from "@/lib/teamApiResponse";');
      expect(code, source).not.toContain("NextResponse.json");
    }
  });
});
