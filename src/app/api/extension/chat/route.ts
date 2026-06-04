// Hosted-or-BYOK SSE passthrough for the Chrome extension's popup.
//
// Two modes share one endpoint so the extension's provider clients only
// need a single proxyable URL:
//
//   • `mode: "hosted"` — the extension passes its UUID via X-User-Id.
//     We meter against the per-install trial (TRIAL_DAYS days,
//     DEFAULT_DAILY_CAP prompts/day). On success we substitute one of
//     our TERMINALSYNC_HOSTED_* server keys, forward the request to the
//     real provider, and stream the SSE body back.
//
//   • `mode: "byok"` — the extension already has the user's own key.
//     We do NOT touch the trial counter, just swap in their key and
//     forward. The only reason to go through us in BYOK mode is to keep
//     a single code path on the extension side; some users may prefer
//     it (one network destination) but it's optional.
//
// Either mode pipes the upstream `Response.body` (a ReadableStream)
// straight to the caller. We do not parse SSE chunks — the extension's
// existing readSse() reader already handles all 3 provider dialects.
//
// Errors come back as JSON with a stable shape:
//   { error: "trial_expired" | "cap_reached" | "missing_api_key" |
//            "missing_user_id" | "missing_hosted_key" |
//            "upstream_error" | "bad_request",
//     ...details }
//
// HTTP status:
//   200  — streaming
//   400  — bad_request / missing_api_key / missing_user_id
//   402  — trial_expired
//   429  — cap_reached
//   500  — missing_hosted_key (server misconfig — JM forgot to set env)
//   502  — upstream_error (provider returned non-2xx)

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { extensionCorsHeaders, extensionPreflight } from "../_lib/cors";
import {
  hostedKeyFor,
  isKnownProvider,
  upstreamFor,
  type ProviderId,
} from "../_lib/providerEndpoints";
import {
  claimHostedPrompt,
  statusHeaders,
  type TrialStatus,
} from "../_lib/trial";

export const runtime = "nodejs";
// We don't want Vercel's response buffering to defeat the SSE stream.
export const dynamic = "force-dynamic";

interface RequestBody {
  provider: string;
  model: string;
  /** Caller-built provider body — forwarded byte-for-byte to upstream. */
  providerBody: unknown;
  mode: "hosted" | "byok";
  /** Required when mode=byok. */
  apiKey?: string;
}

export function OPTIONS(req: Request): Response {
  return extensionPreflight(req, "POST, OPTIONS");
}

export async function POST(req: Request): Promise<Response> {
  const cors = extensionCorsHeaders(req.headers.get("origin"));
  const jsonCors: Record<string, string> = {
    ...cors,
    "content-type": "application/json",
  };

  // ── 1. Parse + validate body ────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError(400, "bad_request", "Body must be JSON.", jsonCors);
  }

  if (!body || !isKnownProvider(body.provider)) {
    return jsonError(
      400,
      "bad_request",
      "Unknown provider. Use 'anthropic' | 'openai' | 'gemini'.",
      jsonCors,
    );
  }
  if (typeof body.model !== "string" || body.model.length === 0) {
    return jsonError(400, "bad_request", "Missing `model`.", jsonCors);
  }
  if (body.providerBody === undefined || body.providerBody === null) {
    return jsonError(400, "bad_request", "Missing `providerBody`.", jsonCors);
  }
  if (body.mode !== "hosted" && body.mode !== "byok") {
    return jsonError(
      400,
      "bad_request",
      "Mode must be 'hosted' or 'byok'.",
      jsonCors,
    );
  }

  // ── 2. Resolve API key (and optionally meter the prompt) ────────
  const provider: ProviderId = body.provider;
  let apiKey: string;
  let statusHeadersExtra: Record<string, string> = {};

  if (body.mode === "hosted") {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return jsonError(
        400,
        "missing_user_id",
        "Hosted mode requires X-User-Id header.",
        jsonCors,
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Dev sandbox without Supabase configured. We can still serve BYOK
      // but not hosted. Make the failure explicit.
      return jsonError(
        500,
        "missing_hosted_key",
        "Hosted mode unavailable (Supabase not configured).",
        jsonCors,
      );
    }

    const ip = clientIpOf(req);
    const ua = req.headers.get("user-agent");

    let claim;
    try {
      claim = await claimHostedPrompt(supabase, {
        userId,
        ip,
        ua,
      });
    } catch (err) {
      console.error("[extension/chat] claim failed", err);
      return jsonError(
        500,
        "claim_failed",
        "Could not bookkeep the trial counter.",
        jsonCors,
      );
    }

    if (!claim.ok) {
      const status = claim.reason === "trial_expired" ? 402 : 429;
      return new Response(
        JSON.stringify({
          error: claim.reason,
          trialStatus: serializeStatus(claim.status),
          upgradeUrl: `${siteUrl()}/#pricing`,
        }),
        {
          status,
          headers: {
            ...jsonCors,
            ...statusHeaders(claim.status),
          },
        },
      );
    }

    statusHeadersExtra = statusHeaders(claim.status);

    const hostedKey = hostedKeyFor(provider);
    if (!hostedKey) {
      return jsonError(
        500,
        "missing_hosted_key",
        `Hosted mode for ${provider} is not configured on this deployment.`,
        jsonCors,
      );
    }
    apiKey = hostedKey;
  } else {
    // BYOK
    if (typeof body.apiKey !== "string" || body.apiKey.length === 0) {
      return jsonError(
        400,
        "missing_api_key",
        "BYOK mode requires `apiKey` in the body.",
        jsonCors,
      );
    }
    apiKey = body.apiKey;
  }

  // ── 3. Forward to upstream provider ─────────────────────────────
  const target = upstreamFor(provider, body.model, apiKey);

  let upstream: Response;
  try {
    upstream = await fetch(target.url, {
      method: "POST",
      headers: target.headers,
      body: JSON.stringify(body.providerBody),
      // No timeout — SSE streams can run for tens of seconds. The
      // browser keeps the connection alive.
    });
  } catch (err) {
    console.error("[extension/chat] upstream fetch failed", err);
    return jsonError(
      502,
      "upstream_error",
      `Could not reach ${provider} upstream.`,
      jsonCors,
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: "upstream_error",
        provider,
        upstreamStatus: upstream.status,
        upstreamBody: text.slice(0, 500),
      }),
      {
        status: 502,
        headers: { ...jsonCors, ...statusHeadersExtra },
      },
    );
  }

  if (!upstream.body) {
    return jsonError(
      502,
      "upstream_error",
      `${provider} returned an empty body.`,
      jsonCors,
    );
  }

  // ── 4. Pipe through ─────────────────────────────────────────────
  const passthroughHeaders: Record<string, string> = {
    ...cors,
    ...statusHeadersExtra,
    "content-type":
      upstream.headers.get("content-type") ?? "text/event-stream",
    "cache-control": "no-cache, no-transform",
    "x-accel-buffering": "no",
  };

  return new Response(upstream.body, {
    status: 200,
    headers: passthroughHeaders,
  });
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function jsonError(
  status: number,
  code: string,
  detail: string,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: code, detail }), {
    status,
    headers,
  });
}

function clientIpOf(req: Request): string | null {
  // Vercel: x-forwarded-for is the trustworthy chain. First entry is
  // the real client.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://terminalsync.ai";
}

function serializeStatus(status: TrialStatus) {
  return {
    mode: status.mode,
    daysLeft: status.daysLeft,
    promptsLeftToday:
      status.promptsLeftToday === Number.POSITIVE_INFINITY
        ? null
        : status.promptsLeftToday,
    cap: status.cap,
    expiresAt: status.expiresAt,
    expired: status.expired,
  };
}
