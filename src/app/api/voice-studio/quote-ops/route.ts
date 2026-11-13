import { NextResponse } from "next/server";
import { quoteAccount, quoteOpsAllowed } from "@/lib/voiceStudioQuoteIntake";
import { uuidPattern } from "@/lib/voiceStudioProduction";

const headers = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
const statuses = ["submitted", "reviewed", "declined"];

export async function GET(req: Request) {
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!quoteOpsAllowed(account.email)) return fail("You do not have production access.", 403);
    const search = new URL(req.url).searchParams;
    const status = search.get("status") ?? "submitted";
    const page = Number(search.get("page") ?? 0);
    if (!statuses.includes(status) || !Number.isInteger(page) || page < 0 || page > 1000) return fail("Invalid filters.", 400);
    const list = await account.db.from("voice_studio_quote_requests")
      .select("id,email,items,estimated_cents,status,created_at,agreement_version")
      .eq("status", status).order("created_at", { ascending: true }).order("id").range(page * 25, page * 25 + 25);
    if (list.error) throw list.error;
    return NextResponse.json({ requests: list.data.slice(0, 25), hasMore: list.data.length > 25 }, { headers });
  } catch { return fail("Could not load quote requests.", 503); }
}

export async function PATCH(req: Request) {
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!quoteOpsAllowed(account.email)) return fail("You do not have production access.", 403);
    const body = await req.json().catch(() => null);
    if (typeof body?.id !== "string" || !uuidPattern.test(body.id) ||
        (body.status !== "reviewed" && body.status !== "declined")) return fail("Invalid request.", 400);
    const saved = await account.db.from("voice_studio_quote_requests").update({ status: body.status })
      .eq("id", body.id).eq("status", "submitted").select("id").maybeSingle();
    if (saved.error) throw saved.error;
    if (!saved.data) return fail("That request is no longer awaiting review.", 409);
    return NextResponse.json({ ok: true }, { headers });
  } catch { return fail("Could not save the review.", 503); }
}
