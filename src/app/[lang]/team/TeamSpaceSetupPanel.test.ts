import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/[lang]/team/TeamSpaceSetupPanel.tsx"), "utf8");

describe("Team shared-space setup UI contract", () => {
  it("uses explicit no-store alias, space, and invitation actions without refs or token storage", () => {
    expect(source).toContain('authedFetch("/api/team/alias"');
    expect(source).toContain('authedFetch("/api/team/spaces"');
    expect(source).toContain('authedFetch("/api/team/invitations"');
    expect(source).toContain('cache: "no-store"');
    expect(source).toContain('referrerPolicy: "no-referrer"');
    expect(source).not.toContain("externalRef");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("type=\"file\"");
    expect(source).not.toContain("<textarea");
    expect(source).not.toContain("spaceDescription");
    expect(source).toContain("body: JSON.stringify({ name })");
  });

  it("keeps raw space IDs inside closures rather than visible fields or URLs", () => {
    expect(source).toContain("spaceId: space.id");
    expect(source).not.toContain("href=");
    expect(source).not.toContain("<code>");
  });
});

