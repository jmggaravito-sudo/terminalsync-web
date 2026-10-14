import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authenticate: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@/lib/marketplace/auth", () => ({
  authenticate: mocks.authenticate,
  isAdmin: mocks.isAdmin,
}));

import { GET } from "./route";

const req = () =>
  new Request("https://terminalsync.ai/api/admin/integraciones/por-pais", {
    headers: { Authorization: "Bearer t" },
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "a", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
});

describe("GET /api/admin/integraciones/por-pais", () => {
  it("401 sin sesión, 403 sin ser admin", async () => {
    mocks.authenticate.mockResolvedValue(null);
    expect((await GET(req())).status).toBe(401);
    mocks.authenticate.mockResolvedValue({ id: "a" });
    mocks.isAdmin.mockReturnValue(false);
    expect((await GET(req())).status).toBe(403);
  });

  it("devuelve filas con países y estado para el admin", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: { slug: string; markets: string[]; status: string }[] };
    const siigo = body.rows.find((r) => r.slug === "siigo");
    expect(siigo?.markets).toContain("CO");
    // Alegra was pulled back (status soon): hidden until re-verified.
    expect(body.rows.find((r) => r.slug === "alegra")).toBeUndefined();
    expect(alegra?.status).toBe("login-pending");
    expect(body.rows.find((r) => r.slug === "pipedream")).toBeUndefined(); // hidden
  });
});
