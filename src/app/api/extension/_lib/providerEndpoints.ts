// Maps the extension's `provider` + `model` to the upstream URL + auth
// header used by the SSE passthrough in /api/extension/chat. We do NOT
// mirror the request body shape here — the extension already serializes
// the provider-specific body and we forward it byte-for-byte. The proxy
// only owns the URL + auth substitution.

export type ProviderId = "anthropic" | "openai" | "gemini";

export interface UpstreamTarget {
  url: string;
  headers: Record<string, string>;
}

/** Pick the upstream URL + auth header for a `provider` + `model` pair. */
export function upstreamFor(
  provider: ProviderId,
  model: string,
  apiKey: string,
): UpstreamTarget {
  switch (provider) {
    case "anthropic":
      // Anthropic's auth is the `x-api-key` header. Body shape is what
      // the extension's lib/providers/anthropic.ts already sends.
      return {
        url: "https://api.anthropic.com/v1/messages",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      };
    case "openai":
      return {
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
      };
    case "gemini":
      // Gemini puts the key in the query string. Model is part of the
      // URL path, which is why we accept it as a parameter here.
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
        headers: { "content-type": "application/json" },
      };
  }
}

/**
 * Server-side hosted key for a provider. Vercel env vars:
 *   - TERMINALSYNC_HOSTED_ANTHROPIC_KEY
 *   - TERMINALSYNC_HOSTED_OPENAI_KEY
 *   - TERMINALSYNC_HOSTED_GEMINI_KEY
 *
 * The "TERMINALSYNC_HOSTED_" prefix is intentional — it makes obvious
 * in the Vercel UI which keys are the ones we eat the cost on, vs any
 * other provider env JM might add for other workflows.
 */
export function hostedKeyFor(provider: ProviderId): string | null {
  const env = process.env;
  switch (provider) {
    case "anthropic":
      return env.TERMINALSYNC_HOSTED_ANTHROPIC_KEY ?? null;
    case "openai":
      return env.TERMINALSYNC_HOSTED_OPENAI_KEY ?? null;
    case "gemini":
      return env.TERMINALSYNC_HOSTED_GEMINI_KEY ?? null;
  }
}

export function isKnownProvider(p: string): p is ProviderId {
  return p === "anthropic" || p === "openai" || p === "gemini";
}
