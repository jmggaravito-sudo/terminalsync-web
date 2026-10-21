import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));

vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));

import { TeamMetadataError, verifiedTeamUser } from "./teamMetadata";

const smokeUserA = "00000000-0000-4000-8000-000000000001";
const smokeUserB = "00000000-0000-4000-8000-000000000002";

function request(token = "verified-token") {
  return new Request("https://example.test/api/team/spaces", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe("verifiedTeamUser smoke allowlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", `${smokeUserA},${smokeUserB}`);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("keeps Team disabled before reading either allowlist or bearer identity", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");

    await expect(verifiedTeamUser(request())).rejects.toBeInstanceOf(TeamMetadataError);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("fails closed before Auth when the two-account allowlist is absent or malformed", async () => {
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", "");
    await expect(verifiedTeamUser(request())).rejects.toBeInstanceOf(TeamMetadataError);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();

    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", `${smokeUserA},${smokeUserA}`);
    await expect(verifiedTeamUser(request())).rejects.toBeInstanceOf(TeamMetadataError);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("returns only an allowlisted identity obtained from verified bearer auth", async () => {
    const getUser = vi.fn(async (token: string) => token === "verified-token"
      ? { data: { user: { id: smokeUserA } }, error: null }
      : { data: { user: null }, error: { status: 401 } });
    getSupabaseAdmin.mockReturnValue({ auth: { getUser } });

    await expect(verifiedTeamUser(request())).resolves.toMatchObject({ id: smokeUserA });
    expect(getUser).toHaveBeenCalledWith("verified-token");
  });

  it("denies a verified identity that is not one of the two configured smoke users", async () => {
    const getUser = vi.fn(async () => ({
      data: { user: { id: "00000000-0000-4000-8000-000000000003" } },
      error: null,
    }));
    getSupabaseAdmin.mockReturnValue({ auth: { getUser } });

    await expect(verifiedTeamUser(request())).rejects.toBeInstanceOf(TeamMetadataError);
    expect(getUser).toHaveBeenCalledOnce();
  });

  it("keeps a missing or invalid bearer distinct from a permitted identity", async () => {
    const getUser = vi.fn(async () => ({ data: { user: null }, error: { status: 401 } }));
    getSupabaseAdmin.mockReturnValue({ auth: { getUser } });

    await expect(verifiedTeamUser(request(""))).resolves.toBeNull();
    await expect(verifiedTeamUser(request("invalid-token"))).resolves.toBeNull();
  });
});
