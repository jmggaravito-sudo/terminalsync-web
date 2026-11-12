import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { estimateCart } from "@/components/voice-studio/cartPricing";
import { quoteAccount, parseQuoteItems, voiceStudioAgreement } from "@/lib/voiceStudioQuoteIntake";
import { verifyVoiceStudioQuoteVideo } from "@/lib/voiceStudioQuoteVideo";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
const requestUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const agreement = voiceStudioAgreement();
  if (!agreement) return fail("Requests are not open yet.", 503);
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    const saved = await account.db.from("voice_studio_service_acceptances").select("agreement_url")
      .eq("account_id", account.id).eq("agreement_version", agreement.version).maybeSingle();
    if (saved.error || (saved.data && saved.data.agreement_url !== agreement.url)) {
      return fail("The agreement is temporarily unavailable.", 503);
    }
    return NextResponse.json({ ...agreement, accepted: !!saved.data }, { headers });
  } catch { return fail("The agreement is temporarily unavailable.", 503); }
}

export async function POST(req: Request) {
  const agreement = voiceStudioAgreement();
  if (!agreement) return fail("Requests are not open yet.", 503);
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    const body = await req.json().catch(() => null);
    const items = parseQuoteItems(body?.items);
    const requestId = body?.requestId;
    const expectedTotal = body?.expectedTotal;
    if (!items || typeof requestId !== "string" || !requestUuid.test(requestId) ||
        !Number.isSafeInteger(expectedTotal) || expectedTotal <= 0 || body.rightsConfirmed !== true) {
      return fail("Check your videos and confirm you have permission to process them.", 400);
    }
    const { db, id, email } = account;
    const fingerprint = createHash("sha256").update(JSON.stringify({ items, expectedTotal })).digest("hex");
    const existing = await db.from("voice_studio_quote_requests").select("id,request_fingerprint")
      .eq("account_id", id).eq("request_id", requestId).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return existing.data.request_fingerprint === fingerprint
      ? NextResponse.json({ id: existing.data.id }, { headers })
      : fail("This request was already used for a different cart.", 409);
    const lookup = () => db.from("voice_studio_service_acceptances").select("agreement_url")
      .eq("account_id", id).eq("agreement_version", agreement.version).maybeSingle();
    let acceptance = await lookup();
    if (acceptance.error) throw acceptance.error;
    if (acceptance.data && acceptance.data.agreement_url !== agreement.url) throw new Error("Agreement version was reused");
    if (!acceptance.data && body.acceptedVersion !== agreement.version) {
      return fail("Read and accept the current service agreement before sending a request.", 412);
    }
    const videos = await Promise.all(items.map(async (item) => {
      const verified = await verifyVoiceStudioQuoteVideo(`https://www.youtube.com/watch?v=${item.id.slice(8)}`);
      if ("error" in verified || verified.id !== item.id || item.shorts.some((seconds) => seconds > verified.seconds)) {
        return null;
      }
      return { ...verified, service: item.service, shorts: item.shorts };
    }));
    if (videos.some((video) => video === null)) return fail("A video could not be reverified. Please check the links and Shorts.", 422);
    const verified = videos.filter((video) => video !== null);
    if (estimateCart(verified).total !== expectedTotal) {
      return fail("The estimate changed. Recheck the links and review the updated prices.", 409);
    }
    if (!acceptance.data) {
      const saved = await db.from("voice_studio_service_acceptances").upsert({
        account_id: id, agreement_version: agreement.version, agreement_url: agreement.url,
      }, { onConflict: "account_id,agreement_version", ignoreDuplicates: true });
      if (saved.error) throw saved.error;
      acceptance = await lookup();
      if (acceptance.error || acceptance.data?.agreement_url !== agreement.url) throw new Error("Agreement unavailable");
    }
    const saved = await db.from("voice_studio_quote_requests").insert({
      account_id: id, email, request_id: requestId, request_fingerprint: fingerprint,
      agreement_version: agreement.version, rights_confirmed: true, items: verified, estimated_cents: expectedTotal,
    }).select("id").single();
    if (saved.error?.code === "23505") {
      const retry = await db.from("voice_studio_quote_requests").select("id,request_fingerprint")
        .eq("account_id", id).eq("request_id", requestId).single();
      if (retry.error) throw retry.error;
      return retry.data.request_fingerprint === fingerprint
        ? NextResponse.json({ id: retry.data.id }, { headers })
        : fail("This request was already used for a different cart.", 409);
    }
    if (saved.error) throw saved.error;
    return NextResponse.json({ id: saved.data.id }, { status: 201, headers });
  } catch { return fail("Your request could not be saved. Please try again.", 503); }
}
