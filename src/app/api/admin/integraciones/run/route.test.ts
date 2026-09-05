import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  isAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({
  authenticate: mocks.authenticate,
  isAdmin: mocks.isAdmin,
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

function request(method: "GET" | "POST" = "GET"): Request {
  return new Request("https://terminalsync.ai/api/admin/integraciones/run", {
    method,
    headers: { Authorization: "Bearer admin-token" },
  });
}

async function loadRoute(env: { integrationsToken?: string; opsToken?: string } = {}) {
  vi.resetModules();
  delete process.env.INTEGRATIONS_GH_TOKEN;
  delete process.env.OPS_GITHUB_TOKEN;
  if (env.integrationsToken) process.env.INTEGRATIONS_GH_TOKEN = env.integrationsToken;
  if (env.opsToken) process.env.OPS_GITHUB_TOKEN = env.opsToken;
  return import("./route");
}

function workflowResponse() {
  return new Response(
    JSON.stringify({
      id: 343182689,
      name: "connector-loop",
      path: ".github/workflows/connector-loop.yml",
      state: "active",
    }),
    { status: 200 },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
  mocks.getSupabaseAdmin.mockReturnValue(null);
});

afterEach(() => {
  delete process.env.INTEGRATIONS_GH_TOKEN;
  delete process.env.OPS_GITHUB_TOKEN;
  vi.unstubAllGlobals();
});

describe("/api/admin/integraciones/run", () => {
  it("normalizes a GitHub workflow 404 into actionable setup state on GET", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/actions/workflows#create-a-workflow-dispatch-event",
          }),
          { status: 404 },
        ),
      ),
    );

    const { GET } = await loadRoute({ opsToken: "ops-read-only" });
    const res = await GET(request("GET"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.run).toBeNull();
    expect(body.workflowMissing).toBe(true);
    expect(body.setupError).toMatchObject({
      code: "github_workflow_unavailable",
      tokenSource: "OPS_GITHUB_TOKEN",
      workflow: "connector-loop.yml",
      repo: "jmggaravito-sudo/terminal-sync",
      ref: "release/v0.2.18-lab",
    });
    expect(body.setupError.message).toContain("Actions: Read and write");
  });

  it("preflights workflow metadata and dispatches by numeric workflow id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(workflowResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            workflow_run_id: 123,
            html_url: "https://github.com/jmggaravito-sudo/terminal-sync/actions/runs/123",
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRoute({ integrationsToken: "actions-write" });
    const res = await POST(request("POST"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.workflowId).toBe(343182689);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.github.com/repos/jmggaravito-sudo/terminal-sync/actions/workflows/343182689/dispatches",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ref: "release/v0.2.18-lab" }),
      }),
    );
  });

  it("returns 503 with setup details instead of leaking raw GitHub 404 on POST", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "Not Found" }), { status: 404 })),
    );

    const { POST } = await loadRoute({ opsToken: "ops-read-only" });
    const res = await POST(request("POST"));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("Actions: Read and write");
    expect(body.setupError.tokenSource).toBe("OPS_GITHUB_TOKEN");
  });
});
