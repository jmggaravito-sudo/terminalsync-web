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
vi.mock("@/lib/supabaseAdmin", () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));

function request(method: "GET" | "POST" = "GET", body?: unknown): Request {
  return new Request("https://terminalsync.ai/api/admin/integraciones/run", {
    method,
    headers: { Authorization: "Bearer admin-token" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function loadRoute(
  env: { integrationsToken?: string; opsToken?: string } = {},
) {
  vi.resetModules();
  delete process.env.INTEGRATIONS_GH_TOKEN;
  delete process.env.OPS_GITHUB_TOKEN;
  if (env.integrationsToken)
    process.env.INTEGRATIONS_GH_TOKEN = env.integrationsToken;
  if (env.opsToken) process.env.OPS_GITHUB_TOKEN = env.opsToken;
  return import("./route");
}

function workflowResponse(id = 343182689, name = "connector-loop") {
  return new Response(
    JSON.stringify({
      id,
      name,
      path: `.github/workflows/${name}.yml`,
      state: "active",
    }),
    { status: 200 },
  );
}

function runsResponse() {
  return new Response(JSON.stringify({ workflow_runs: [] }), { status: 200 });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({
    id: "admin-1",
    email: "jm@terminalsync.ai",
  });
  mocks.isAdmin.mockReturnValue(true);
  mocks.getSupabaseAdmin.mockReturnValue(null);
});

afterEach(() => {
  delete process.env.INTEGRATIONS_GH_TOKEN;
  delete process.env.OPS_GITHUB_TOKEN;
  vi.unstubAllGlobals();
});

describe("/api/admin/integraciones/run", () => {
  it("returns all configured integration loops and marks CLI curation as pending", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/runs?")) return runsResponse();
        return workflowResponse();
      }),
    );

    const { GET } = await loadRoute({ integrationsToken: "actions-write" });
    const res = await GET(request("GET"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.loops.map((loop: { id: string }) => loop.id)).toEqual([
      "app-connector-parity",
      "marketplace-supervision",
      "connectors-curation",
      "plugins-curation",
      "skills-curation",
      "kits-curation",
      "cli-curation",
    ]);
    expect(
      body.loops.find((loop: { id: string }) => loop.id === "cli-curation")
        .disabledReason.es,
    ).toContain("No existe un workflow activo");
  });

  it("normalizes a GitHub workflow 404 into actionable setup state on GET", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
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

  it("dispatches a curation loop by numeric workflow id with focus and dry_run input", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(workflowResponse(111, "plugin-curation-loop"))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRoute({ integrationsToken: "actions-write" });
    const res = await POST(
      request("POST", {
        loopId: "plugins-curation",
        focus: "github",
        dryRun: true,
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.loopId).toBe("plugins-curation");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.github.com/repos/jmggaravito-sudo/terminalsync-web/actions/workflows/111/dispatches",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          ref: "main",
          inputs: { focus: "github", dry_run: true },
        }),
      }),
    );
  });

  it("returns 409 for CLI curation until a real workflow exists", async () => {
    const { POST } = await loadRoute({ integrationsToken: "actions-write" });
    const res = await POST(request("POST", { loopId: "cli-curation" }));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain("No existe un workflow activo");
  });
});
