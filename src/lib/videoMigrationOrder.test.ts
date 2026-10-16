import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("migration version ordering", () => {
  it("keeps migration versions unique when integrating Video with current main", () => {
    const files = readdirSync(resolve(process.cwd(), "supabase/migrations")).filter(f => f.endsWith(".sql"));
    const versions = files.map(f => f.split("_")[0]);
    expect(versions.filter(v => v === "0034")).toHaveLength(1);
    expect(files).toContain("0033_comp_customer_sentinel_uniqueness.sql");
    expect(files).toContain("0034_video_exclusive_funding.sql");
    expect(versions.filter(v => v === "0035")).toHaveLength(1);
    expect(files).toContain("0035_video_exclusive_checkout_intents.sql");
  });
});
