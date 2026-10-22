import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/[lang]/team/ReceivedSpacesClient.tsx"), "utf8");

describe("Team trial UI contract", () => {
  it("loads status with GET and only claims from the explicit button action", () => {
    expect(source).toContain('authedFetch("/api/team/trial", { signal: controller.signal })');
    expect(source).toContain('authedFetch("/api/team/trial", { method: "POST" })');
    expect(source).toContain('onClick={() => void claimTrial()}');
    expect(source).toContain("Team checkout is not available yet");
    expect(source).toContain("El checkout de Team todavía no está disponible");
    expect(source).not.toContain('useEffect(() => { void claimTrial()');
  });

  it("handles started, prior-claim/expired, and unauthorized responses without exposing identifiers", () => {
    expect(source).toContain('body.result === "started"');
    expect(source).toContain('body.entitlement?.eligible');
    expect(source).toContain('response.status === 401');
    expect(source).toContain("one-time trial was already claimed or has expired");
    expect(source).not.toContain("user.id");
  });

  it("treats the server entitlement read as the controlled-smoke admission gate", () => {
    expect(source).toContain("if (entitlementResponse.status === 403 || entitlementResponse.status === 503)");
    expect(source).toContain("Team is not available to this account during this controlled smoke.");
    expect(source).toContain("Complete this server-side access check before issuing any auxiliary");
  });

  it("keeps paid-roster reads and UI behind the separate paid rollout gate", () => {
    expect(source).toContain("paidRosterEnabled = false");
    expect(source).toContain("paidRosterEnabled\n          ? authedFetch(\"/api/team/paid-roster\"");
    expect(source).toContain("if (rosterResponse?.ok)");
    expect(source).toContain("paidRosterEnabled && paidRoster?.has_active_team ? <PaidRosterOwnerPanel");
    expect(source).toContain("paidRosterEnabled && paidRoster?.has_active_team ? <PaidRosterInvitationPanel");
    expect(source).toContain("A 403/503/404 roster response must not make the shared-spaces page fail");
    expect(source).not.toContain("employee_user_id");
  });

  it("adds owner setup and v3 conversations without replacing legacy invitation or approval cards", () => {
    expect(source).toContain('authedFetch("/api/team/spaces", { cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal })');
    expect(source).toContain('<TeamSpaceSetupPanel lang={lang} spaces={ownedSpaces} onChanged={load} onUnauthorized={markUnauthorized} />');
    expect(source).toContain('<TeamConversationPanel lang={lang} ownedSpaces={ownedSpaces} receivedSpaces={collections.received} onUnauthorized={markUnauthorized} />');
    expect(source).toContain('authedFetch("/api/team/requests/respond"');
    expect(source).toContain('id="received-heading"');
  });

  it("renders legacy owner approvals with only kind and optional item count", () => {
    expect(source).toContain("request.itemCount !== null");
    expect(source).not.toContain("request.label");
    expect(source).not.toContain("request.category");
    expect(source).not.toContain("request.metadata");
  });
});
