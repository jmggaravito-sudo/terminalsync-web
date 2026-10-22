import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  teamMetadataRpc: vi.fn(),
}));

vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamFeature", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamFeature")>(),
  isTeamFeatureEnabled: vi.fn(() => process.env.TEAM_FEATURE_ENABLED === "1"),
}));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamMetadata")>(),
  teamMetadataRpc,
}));

import { GET, POST } from "./route";

const spaceId = "00000000-0000-0000-0000-000000000001";
const ownerId = "00000000-0000-0000-0000-000000000002";
const rawSpace = {
  id: spaceId,
  owner_user_id: ownerId,
  name: "Finanzas de Álex",
  description: "FY26 planning",
  external_ref: "private-crm-reference",
  legacy_name: "private legacy name",
  created_at: "2026-10-18T00:00:00.000Z",
  updated_at: "2026-10-18T00:00:00.000Z",
};

const authed = (body?: BodyInit) => new Request("https://example.test/api/team/spaces", {
  method: body === undefined ? "GET" : "POST",
  headers: { authorization: "Bearer valid", ...(body === undefined ? {} : { "content-type": "application/json" }) },
  body,
});

describe("Team shared-spaces API boundary", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", "00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "valid"
      ? { data: { user: { id: "00000000-0000-4000-8000-000000000001" } }, error: null }
      : { data: { user: null }, error: { status: 401 } }) } });
    teamMetadataRpc.mockResolvedValue([rawSpace]);
  });

  it("keeps shared-space auth and RPCs closed while Team is off", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");
    expect((await GET(authed())).status).toBe(503);
    expect((await POST(authed(JSON.stringify({ name: "Finanzas" })))).status).toBe(503);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects anonymous list and registration before touching metadata RPCs", async () => {
    expect((await GET(new Request("https://example.test/api/team/spaces"))).status).toBe(401);
    expect((await POST(new Request("https://example.test/api/team/spaces", { method: "POST", body: "{}" }))).status).toBe(401);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("fails closed before metadata RPCs for a verified account outside the two-account smoke allowlist", async () => {
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({
      data: { user: { id: "00000000-0000-4000-8000-000000000003" } },
      error: null,
    })) } });

    expect((await GET(authed())).status).toBe(503);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects malformed or unsafe display names before it can register a space", async () => {
    const malformedJson = await POST(authed("{"));
    const oversizedName = await POST(authed(JSON.stringify({ name: "x".repeat(121) })));
    const unsafeNames = [
      "https://private.example/space",
      "/Users/private/space",
      "Equipo\nprivado",
      "Equipo_private",
      "Equipo: privado",
    ];
    expect(malformedJson.status).toBe(400);
    expect(oversizedName.status).toBe(400);
    for (const name of unsafeNames) {
      expect((await POST(authed(JSON.stringify({ name })))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects legacy description/externalRef and arbitrary fields rather than silently dropping them", async () => {
    for (const body of [
      { name: "Equipo de Alex", description: "free text" },
      { name: "Equipo de Alex", externalRef: "/private/ref" },
      { name: "Equipo de Alex", description: null },
      { name: "Equipo de Alex", externalRef: null },
      { name: "Equipo de Alex", userId: "attacker" },
    ]) {
      expect((await POST(authed(JSON.stringify(body)))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("projects only safe display data and never exposes owner IDs or legacy fields", async () => {
    const list = await GET(authed());
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([{
      id: spaceId,
      name: "Finanzas de Álex",
      created_at: "2026-10-18T00:00:00.000Z",
    }]);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_spaces", { p_user_id: "00000000-0000-4000-8000-000000000001" });

    const created = await POST(authed(JSON.stringify({ name: "  Finanzas de Álex  " })));
    const body = await created.json();
    expect(created.status).toBe(201);
    expect(body).toEqual([{
      id: spaceId,
      name: "Finanzas de Álex",
      created_at: "2026-10-18T00:00:00.000Z",
    }]);
    for (const privateValue of [ownerId, "FY26 planning", "private-crm-reference", "private legacy name"]) {
      expect(JSON.stringify(body)).not.toContain(privateValue);
    }
    expect(teamMetadataRpc).toHaveBeenLastCalledWith("register_team_space", {
      p_user_id: "00000000-0000-4000-8000-000000000001",
      p_name: "Finanzas de Álex",
      p_description: null,
      p_external_ref: null,
    });
  });

  it("fails closed instead of serializing an unexpected or unsafe table-shaped result", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...rawSpace, created_at: "not-a-date" }]);
    expect((await GET(authed())).status).toBe(503);
    teamMetadataRpc.mockResolvedValueOnce([{ ...rawSpace, name: "https://private.example/space" }]);
    const response = await GET(authed());
    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).not.toContain(ownerId);
    expect(body).not.toContain("private-crm-reference");
  });

  it("fails closed when registration does not return exactly one new space", async () => {
    for (const result of [[], [rawSpace, { ...rawSpace, id: "00000000-0000-0000-0000-000000000003" }]]) {
      teamMetadataRpc.mockResolvedValueOnce(result);
      const response = await POST(authed(JSON.stringify({ name: "Finanzas de Álex" })));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "Could not register space" });
    }
  });
});
