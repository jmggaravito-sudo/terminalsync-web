import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ authenticate: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@/lib/marketplace/auth", () => auth);
import { GET } from "./route";
const req = () => new Request("https://terminalsync.ai/api/admin/diagnostics/stripe-config");
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-16T01:00:00Z"));
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("VERCEL_PROJECT_ID", "prj_eIfBcNc88PvnSGJW8ruLq1EangyG");
  auth.authenticate.mockResolvedValue({ id: "admin", email: "admin@example.invalid" });
  auth.isAdmin.mockReturnValue(true);
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "private-live-fixture");
  vi.stubEnv("STRIPE_TEST_WEBHOOK_SECRET", "private-test-fixture");
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
describe("temporary private Stripe diagnostic", () => {
  it.each([401, 403])("denies %s without configuration disclosure", async status => {
    if (status === 401) auth.authenticate.mockResolvedValue(null);
    else auth.isAdmin.mockReturnValue(false);
    const r = await GET(req());
    expect(r.status).toBe(status);
    expect(await r.json()).toEqual({});
    expect(r.headers.get("cache-control")).toContain("no-store");
  });
  it("returns exactly three booleans, never secret values or derivatives", async () => {
    const r = await GET(req());
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ livePresent: true, testPresent: true, secretsDistinct: true });
    expect(r.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(r.headers.get("vary")).toBe("Authorization");
  });
  it.each(["preview", "development", ""])("denies environment %s", async env => {
    vi.stubEnv("VERCEL_ENV", env);
    const r = await GET(req());
    expect(r.status).toBe(404);
    expect(await r.json()).toEqual({});
    expect(auth.authenticate).not.toHaveBeenCalled();
  });
  it("denies the secondary project", async () => {
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_34jo1TY4JNidePBQoeZaJjlHeTEH");
    expect((await GET(req())).status).toBe(404);
    expect(auth.authenticate).not.toHaveBeenCalled();
  });
  it("expires on immutable older deployments too", async () => {
    vi.setSystemTime(new Date("2026-10-16T04:00:00Z"));
    expect((await GET(req())).status).toBe(404);
    expect(auth.authenticate).not.toHaveBeenCalled();
  });
  it("detects equal secrets", async () => {
    vi.stubEnv("STRIPE_TEST_WEBHOOK_SECRET", "private-live-fixture");
    expect(await (await GET(req())).json()).toEqual({ livePresent: true, testPresent: true, secretsDistinct: false });
  });
  it.each(["STRIPE_WEBHOOK_SECRET", "STRIPE_TEST_WEBHOOK_SECRET"])("fails distinct check for missing %s", async key => {
    vi.stubEnv(key, "");
    const body = await (await GET(req())).json();
    expect(body.secretsDistinct).toBe(false);
    expect(body[key === "STRIPE_WEBHOOK_SECRET" ? "livePresent" : "testPresent"]).toBe(false);
  });
  it("hides provider failures without logging them", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.authenticate.mockRejectedValue(new Error("private-live-fixture"));
    const r = await GET(req());
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({});
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
