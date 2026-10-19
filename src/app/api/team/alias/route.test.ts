import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));

import { PUT } from "./route";

const request = (body: unknown, token = "good") => new Request("https://x.test", {
  method: "PUT",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("Team alias API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "good"
      ? { data: { user: { id: "verified" } }, error: null }
      : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }) } });
  });

  it("returns only the normalized alias confirmation", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ alias: "alex.team", user_id: "PRIVATE", metadata: { secret: "SECRET" } }]);
    const response = await PUT(request({ alias: "Alex.Team" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ alias: "alex.team" }]);
    expect(teamMetadataRpc).toHaveBeenCalledWith("claim_team_alias", { p_user_id: "verified", p_alias: "Alex.Team" });
  });

  it("fails closed on unexpected RPC cardinality", async () => {
    teamMetadataRpc.mockResolvedValueOnce([]);
    const response = await PUT(request({ alias: "alex.team" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Could not update alias" });
  });

  it("requires verified auth and a string alias", async () => {
    expect((await PUT(new Request("https://x.test", { method: "PUT", body: "{}" }))).status).toBe(401);
    expect((await PUT(request({ alias: 12 }))).status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });
});
