import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/[lang]/team/PaidRosterInvitationPanel.tsx"), "utf8");

describe("paid Team roster invitation UI contract", () => {
  it("creates an opaque owner invitation only after an explicit click and never refetches it", () => {
    expect(source).toContain('authedFetch("/api/team/paid-roster/invitations", {');
    expect(source).toContain('method: "POST"');
    expect(source).toContain('onClick={() => void createInvitation()}');
    expect(source).toContain("setCreatedOnce(true)");
    expect(source).toContain("Copy and hide");
    expect(source).toContain("setCreatedInvitation(null)");
    expect(source).not.toContain('method: "GET"');
    const latch = source.indexOf("setCreatedOnce(true)");
    const request = source.indexOf('authedFetch("/api/team/paid-roster/invitations", {');
    expect(latch).toBeGreaterThan(-1);
    expect(request).toBeGreaterThan(latch);
  });

  it("requires an explicit recipient submission and clears the pasted capability before networking", () => {
    expect(source).toContain('onSubmit={(event) => void acceptInvitation(event)}');
    expect(source).toContain('authedFetch("/api/team/paid-roster/invitations/accept", {');
    expect(source).toContain('body: JSON.stringify({ token })');
    const clear = source.indexOf('setEnteredToken("")');
    const request = source.indexOf('authedFetch("/api/team/paid-roster/invitations/accept", {');
    expect(clear).toBeGreaterThan(-1);
    expect(request).toBeGreaterThan(clear);
  });

  it("keeps the bearer capability out of navigation, browser storage, identifiers, and logs", () => {
    for (const forbidden of ["localStorage", "sessionStorage", "URLSearchParams", "location.search", "referrer:", "console.", "employee_user_id", "type=\"email\"", "alias", "user.id"]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).toContain('referrerPolicy: "no-referrer"');
    expect(source).toContain('cache: "no-store"');
  });
});
