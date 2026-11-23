import {
  PICKER_LAUNCH_MAX_BODY,
  PICKER_LAUNCH_PROBE,
  isAllowedPickerLaunchOrigin,
  parsePickerLaunchForm,
  renderPickerLaunchPage,
} from "@/lib/pickerLaunch";

// See src/lib/pickerLaunch.ts. The request body carries a Google access token:
// never log it, never store it, never echo it outside the inline hand-off.

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

function plain(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Capability probe for the desktop app: this deploy understands the hand-off. */
export async function GET(): Promise<Response> {
  return plain(200, PICKER_LAUNCH_PROBE);
}

const RETRY_MESSAGE =
  "Return to Terminal Sync and open Google Drive again. / Vuelve a Terminal Sync y abre Google Drive otra vez.";

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedPickerLaunchOrigin(req.headers.get("origin"))) {
    return plain(403, RETRY_MESSAGE);
  }
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
    return plain(415, RETRY_MESSAGE);
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > PICKER_LAUNCH_MAX_BODY) {
    return plain(413, RETRY_MESSAGE);
  }
  const body = await req.text();
  if (body.length > PICKER_LAUNCH_MAX_BODY) {
    return plain(413, RETRY_MESSAGE);
  }
  const parsed = parsePickerLaunchForm(new URLSearchParams(body));
  if (!parsed.ok) {
    return plain(400, RETRY_MESSAGE);
  }
  return new Response(renderPickerLaunchPage(parsed.value), {
    status: 200,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  });
}
