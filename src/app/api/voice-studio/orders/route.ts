import { NextResponse } from "next/server";
import { emailFromClientRequest } from "@/lib/voiceStudioAuth";
import { licenseUrl } from "@/lib/voiceStudioLicense";
import { createOrderToDos, listClientOrders } from "@/lib/voiceStudioCrm";

export const runtime = "nodejs";

interface SubmitBody {
  token: string;
  /** YouTube URLs, one per line (textarea input). */
  links: string;
  notes?: string;
}

const MAX_LINKS = 16;
const URL_RE = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+$/i;

// Client-facing production orders. GET returns the client's orders (open =
// queued, closed = delivered) for the dashboard; POST submits new video
// links — one Frappe ToDo per link on the client's deal (landing → CRM,
// allowed direction). Token = HMAC vs-orders, minted for one email.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const email = await emailFromClientRequest(req, token);
  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired link." },
      { status: 400 },
    );
  }
  const orders = await listClientOrders(email);
  if (!orders) {
    return NextResponse.json({ error: "CRM unreachable" }, { status: 503 });
  }
  // The license link carries a signed HMAC token — minted HERE (server-side
  // secret); the browser can never sign one itself.
  return NextResponse.json({ ok: true, email, orders, licenseUrl: licenseUrl(email) });
}

export async function POST(req: Request) {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = await emailFromClientRequest(req, body.token);
  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired link." },
      { status: 400 },
    );
  }

  const links = (body.links ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (links.length === 0) {
    return NextResponse.json(
      { error: "Paste at least one YouTube link." },
      { status: 400 },
    );
  }
  if (links.length > MAX_LINKS) {
    return NextResponse.json(
      { error: `Max ${MAX_LINKS} links per submission.` },
      { status: 400 },
    );
  }
  const bad = links.find((l) => !URL_RE.test(l));
  if (bad) {
    return NextResponse.json(
      { error: `This doesn't look like a YouTube link: "${bad.slice(0, 60)}"` },
      { status: 400 },
    );
  }
  const notes = body.notes?.trim().slice(0, 2000) ?? "";

  const result = await createOrderToDos(email, links, notes);
  if (!result) {
    return NextResponse.json(
      { error: "Could not record the order right now — try again shortly." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, created: result.created });
}
