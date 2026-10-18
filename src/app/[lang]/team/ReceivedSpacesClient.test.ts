import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/[lang]/team/ReceivedSpacesClient.tsx"), "utf8");

describe("Team trial UI contract", () => {
  it("loads status with GET and only claims from the explicit button action", () => {
    expect(source).toContain('authedFetch("/api/team/trial")');
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
});
