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

// ── Fake Supabase client ────────────────────────────────────────────────
// Just enough of the query builder chain that route.ts actually calls:
//   .from(T).insert(x).select("id").single()
//   .from(T).update(x).eq("id", id)
//   .from(T).select("*").order(...).limit(50)
interface FakeSupabaseOpts {
  insertResult?: { data: { id: string } | null; error: { message: string } | null };
  listResult?: { data: unknown[] | null; error: { message: string } | null };
}

function createFakeSupabase(opts: FakeSupabaseOpts = {}) {
  const insertResult = opts.insertResult ?? { data: { id: "corr-1" }, error: null };
  const listResult = opts.listResult ?? { data: [], error: null };
  const updateCalls: Array<{ fields: Record<string, unknown>; id: string }> = [];
  const insertCalls: Array<Record<string, unknown>> = [];

  const from = vi.fn((_table: string) => ({
    insert: vi.fn((row: Record<string, unknown>) => {
      insertCalls.push(row);
      return {
        select: vi.fn(() => ({
          single: vi.fn(async () => insertResult),
        })),
      };
    }),
    update: vi.fn((fields: Record<string, unknown>) => ({
      eq: vi.fn(async (_col: string, id: string) => {
        updateCalls.push({ fields, id });
        return { data: null, error: null };
      }),
    })),
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(async () => listResult),
      })),
    })),
  }));

  return { from, updateCalls, insertCalls };
}

function adminRequest(body?: unknown, method: string = "POST"): Request {
  return new Request("https://terminalsync.ai/api/admin/soporte/corrections", {
    method,
    headers: { Authorization: "Bearer admin-token", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

const VALID_BODY = {
  conversation_id: "conv-1",
  question: "¿Cómo cancelo mi suscripción?",
  bad_answer: "No sé, contactá a soporte.",
  corrected_answer_es: "Podés cancelar desde Configuración → Facturación.",
  corrected_answer_en: "You can cancel from Settings → Billing.",
  locale: "es",
};

/** GitHub happy-path fetch mock: base sha → create ref → get file (200,
 *  existing content) → put file → create PR. Routed by URL substring +
 *  method so call order doesn't matter for matching. */
function mockGithubHappyPath() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();

    if (url.includes("/git/ref/heads/release/v0.2.18-lab") && method === "GET") {
      return new Response(JSON.stringify({ object: { sha: "base-sha-123" } }), { status: 200 });
    }
    if (url.endsWith("/git/refs") && method === "POST") {
      return new Response(JSON.stringify({ ref: "refs/heads/x", object: { sha: "base-sha-123" } }), { status: 201 });
    }
    if (url.includes("/contents/docs/sync-bot-knowledge.md?ref=") && method === "GET") {
      const existing = Buffer.from("## Output\n- Plain prose by default.\n", "utf8").toString("base64");
      return new Response(JSON.stringify({ content: existing, encoding: "base64", sha: "file-sha-1" }), { status: 200 });
    }
    if (url.endsWith("/contents/docs/sync-bot-knowledge.md") && method === "PUT") {
      return new Response(JSON.stringify({ content: { sha: "file-sha-2" } }), { status: 200 });
    }
    if (url.endsWith("/pulls") && method === "POST") {
      return new Response(JSON.stringify({ html_url: "https://github.com/jmggaravito-sudo/terminal-sync/pull/9999", number: 9999 }), { status: 201 });
    }
    throw new Error(`unexpected fetch: ${method} ${url}`);
  });
}

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
  delete process.env.TS_CORRECTIONS_GITHUB_TOKEN;
});

afterEach(() => {
  delete process.env.TS_CORRECTIONS_GITHUB_TOKEN;
  vi.unstubAllGlobals();
});

describe("POST /api/admin/soporte/corrections", () => {
  it("rejects unauthenticated requests without touching Supabase or GitHub", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const { POST } = await loadRoute();

    const res = await POST(adminRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(fake.insertCalls).toHaveLength(0);
  });

  it("rejects non-admin requests", async () => {
    mocks.isAdmin.mockReturnValue(false);
    const { POST } = await loadRoute();
    const res = await POST(adminRequest(VALID_BODY));
    expect(res.status).toBe(403);
  });

  it("rejects invalid JSON bodies", async () => {
    const { POST } = await loadRoute();
    const req = new Request("https://terminalsync.ai/api/admin/soporte/corrections", {
      method: "POST",
      headers: { Authorization: "Bearer admin-token", "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects an empty corrected_answer_es without inserting a row", async () => {
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const { POST } = await loadRoute();

    const res = await POST(adminRequest({ ...VALID_BODY, corrected_answer_es: "" }));
    expect(res.status).toBe(400);
    expect(fake.insertCalls).toHaveLength(0);
  });

  it("rejects a secret-looking correction (400) before persisting anything", async () => {
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const { POST } = await loadRoute();

    const res = await POST(
      adminRequest({ ...VALID_BODY, corrected_answer_es: "Usá esta clave: sk-proj-aaaaaaaaaaaaaaaaaaaaaaaa1234567890" }),
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(fake.insertCalls).toHaveLength(0);
  });

  it("returns 503 when Supabase isn't configured", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const { POST } = await loadRoute();
    const res = await POST(adminRequest(VALID_BODY));
    expect(res.status).toBe(503);
  });

  it("inserts a pending row, then flips it to error (503) when TS_CORRECTIONS_GITHUB_TOKEN is missing", async () => {
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const { POST } = await loadRoute();

    const res = await POST(adminRequest(VALID_BODY));
    const json = await res.json();

    expect(fake.insertCalls).toHaveLength(1);
    expect(res.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.id).toBe("corr-1");
    expect(json.status).toBe("error");
    expect(json.error).toContain("TS_CORRECTIONS_GITHUB_TOKEN");

    expect(fake.updateCalls).toHaveLength(1);
    expect(fake.updateCalls[0].id).toBe("corr-1");
    expect(fake.updateCalls[0].fields.status).toBe("error");
  });

  it("scrubs the question/bad_answer before they reach GitHub, opens a draft PR, and marks the row pr_opened", async () => {
    process.env.TS_CORRECTIONS_GITHUB_TOKEN = "fine-grained-token";
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const fetchMock = mockGithubHappyPath();
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRoute();
    const res = await POST(
      adminRequest({
        ...VALID_BODY,
        question: "Mi pregunta, contactame a juan@cliente.com por las dudas",
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.status).toBe("pr_opened");
    expect(json.pr_number).toBe(9999);
    expect(json.pr_url).toContain("/pull/9999");
    expect(json.branch).toMatch(/^correccion-bot\/\d{8}-/);

    // Supabase insert kept the RAW text (private table) — scrubbing only
    // applies to what's sent to GitHub, not to what's persisted.
    expect(fake.insertCalls[0].question).toContain("juan@cliente.com");

    // The GitHub PUT body must NOT contain the raw email.
    const putCall = fetchMock.mock.calls.find(
      ([url, init]) => String(url).endsWith("/contents/docs/sync-bot-knowledge.md") && (init as RequestInit)?.method === "PUT",
    );
    expect(putCall).toBeDefined();
    const putBody = JSON.parse(String((putCall![1] as RequestInit).body));
    const decoded = Buffer.from(putBody.content, "base64").toString("utf8");
    expect(decoded).not.toContain("juan@cliente.com");
    expect(decoded).toContain("[email redactado]");
    expect(decoded).toContain("## Correcciones del equipo");
    expect(decoded).toContain("Podés cancelar desde Configuración");

    // The PR body itself carries the corrected answer verbatim.
    const prCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/pulls"));
    const prReqBody = JSON.parse(String((prCall![1] as RequestInit).body));
    expect(prReqBody.draft).toBe(true);
    expect(prReqBody.base).toBe("release/v0.2.18-lab");
    expect(prReqBody.body).toContain("Podés cancelar desde Configuración → Facturación.");

    // Final Supabase update reflects success.
    const finalUpdate = fake.updateCalls[fake.updateCalls.length - 1];
    expect(finalUpdate.fields.status).toBe("pr_opened");
    expect(finalUpdate.fields.pr_number).toBe(9999);
  });

  it("marks the row 'error' (502) and reports it, without losing the insert, when GitHub fails mid-flow", async () => {
    process.env.TS_CORRECTIONS_GITHUB_TOKEN = "fine-grained-token";
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = (init?.method ?? "GET").toUpperCase();
        if (url.includes("/git/ref/heads/release/v0.2.18-lab") && method === "GET") {
          return new Response(JSON.stringify({ object: { sha: "base-sha-123" } }), { status: 200 });
        }
        if (url.endsWith("/git/refs") && method === "POST") {
          return new Response("nope", { status: 403 });
        }
        throw new Error(`unexpected fetch: ${method} ${url}`);
      }),
    );

    const { POST } = await loadRoute();
    const res = await POST(adminRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.ok).toBe(false);
    expect(json.id).toBe("corr-1");
    expect(json.status).toBe("error");

    const finalUpdate = fake.updateCalls[fake.updateCalls.length - 1];
    expect(finalUpdate.fields.status).toBe("error");
    expect(typeof finalUpdate.fields.error_message).toBe("string");
  });

  it("retries once with a suffixed branch name when the branch already exists (422)", async () => {
    process.env.TS_CORRECTIONS_GITHUB_TOKEN = "fine-grained-token";
    const fake = createFakeSupabase();
    mocks.getSupabaseAdmin.mockReturnValue(fake);

    let refsCallCount = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();

      if (url.includes("/git/ref/heads/release/v0.2.18-lab") && method === "GET") {
        return new Response(JSON.stringify({ object: { sha: "base-sha-123" } }), { status: 200 });
      }
      if (url.endsWith("/git/refs") && method === "POST") {
        refsCallCount += 1;
        if (refsCallCount === 1) return new Response("already exists", { status: 422 });
        return new Response(JSON.stringify({ ref: "refs/heads/x", object: { sha: "base-sha-123" } }), { status: 201 });
      }
      if (url.includes("/contents/docs/sync-bot-knowledge.md?ref=") && method === "GET") {
        return new Response("not found", { status: 404 });
      }
      if (url.endsWith("/contents/docs/sync-bot-knowledge.md") && method === "PUT") {
        return new Response(JSON.stringify({ content: { sha: "file-sha-2" } }), { status: 200 });
      }
      if (url.endsWith("/pulls") && method === "POST") {
        return new Response(JSON.stringify({ html_url: "https://github.com/x/y/pull/1", number: 1 }), { status: 201 });
      }
      throw new Error(`unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await loadRoute();
    const res = await POST(adminRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(refsCallCount).toBe(2);
  });
});

describe("GET /api/admin/soporte/corrections", () => {
  it("rejects non-admin requests", async () => {
    mocks.isAdmin.mockReturnValue(false);
    const { GET } = await loadRoute();
    const res = await GET(adminRequest(undefined, "GET"));
    expect(res.status).toBe(403);
  });

  it("returns items ordered as Supabase gives them, most-recent-first by construction", async () => {
    const rows = [
      { id: "1", status: "pr_opened", question: "q1", corrected_answer_es: "a1", created_at: "2026-09-04T00:00:00Z" },
      { id: "2", status: "pending", question: "q2", corrected_answer_es: "a2", created_at: "2026-09-03T00:00:00Z" },
    ];
    const fake = createFakeSupabase({ listResult: { data: rows, error: null } });
    mocks.getSupabaseAdmin.mockReturnValue(fake);
    const { GET } = await loadRoute();

    const res = await GET(adminRequest(undefined, "GET"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(2);
    expect(json.items[0].id).toBe("1");
  });

  it("reports setupNeeded when Supabase isn't configured, without erroring", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const { GET } = await loadRoute();
    const res = await GET(adminRequest(undefined, "GET"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.setupNeeded).toBe(true);
    expect(json.items).toEqual([]);
  });
});
