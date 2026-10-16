import "server-only";

const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const HASH = /^[a-f0-9]{64}$/i;
const MAX_RESPONSE_BYTES = 4096;

export interface VideoCheckoutTerms {
  quoteId: string;
  jobId: string;
  requestHash: string;
  workspaceId: string;
  amountMicros: number;
  amountCents: number;
  currency: "USD";
  expiresAtMs: number;
}

function fixedGatewayOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.origin !== value || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.ok || response.redirected ||
      response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    await response.body?.cancel();
    throw new Error("quote_authority_unavailable");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("quote_authority_unavailable");
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) throw new Error("quote_authority_unavailable");
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", {fatal: true}).decode(bytes)); }
  catch { throw new Error("quote_authority_unavailable"); }
}

/** Reads only the already-issued quote. It cannot approve, fund, reserve or start a Video job. */
export async function readVideoCheckoutTerms(input: {
  authorization: string | null;
  quoteId: string;
  requestHash: string;
  gatewayUrl?: string;
  fetcher?: typeof fetch;
}): Promise<VideoCheckoutTerms> {
  if (!ID.test(input.quoteId) || !HASH.test(input.requestHash) || !input.authorization?.startsWith("Bearer ")) {
    throw new Error("quote_authority_unavailable");
  }
  const origin = fixedGatewayOrigin(input.gatewayUrl ?? process.env.VIDEO_EXECUTION_GATEWAY_URL);
  if (!origin) throw new Error("quote_authority_unavailable");
  const response = await (input.fetcher ?? fetch)(`${origin}/v1/video/checkout-intent`, {
    method: "POST", redirect: "manual",
    headers: {authorization: input.authorization, "content-type": "application/json", accept: "application/json"},
    body: JSON.stringify({quoteId: input.quoteId, requestHash: input.requestHash}),
  });
  const payload = await boundedJson(response) as {ok?: unknown; checkout?: Record<string, unknown>};
  const quote = payload.checkout;
  if (payload.ok !== true || !quote || quote.quoteId !== input.quoteId || quote.requestHash !== input.requestHash ||
      !ID.test(String(quote.jobId ?? "")) || !ID.test(String(quote.workspaceId ?? "")) || quote.currency !== "USD" ||
      !Number.isSafeInteger(quote.amountMicros) || Number(quote.amountMicros) < 500_000 || Number(quote.amountMicros) % 10_000 !== 0 ||
      !Number.isSafeInteger(quote.expiresAtMs) || Number(quote.expiresAtMs) <= Date.now()) {
    throw new Error("quote_authority_unavailable");
  }
  return {quoteId: input.quoteId, jobId: quote.jobId as string, requestHash: input.requestHash,
    workspaceId: quote.workspaceId as string, amountMicros: quote.amountMicros as number,
    amountCents: Number(quote.amountMicros) / 10_000, currency: "USD", expiresAtMs: quote.expiresAtMs as number};
}
