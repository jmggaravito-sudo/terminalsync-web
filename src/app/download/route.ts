import { NextResponse } from "next/server";

// /download → /api/download.
//
// External links (campaigns, social, README) that point at
// terminalsync.ai/download were 404'ing because the middleware
// rewrote them to /es/download which doesn't exist. The navbar's
// own button already targets /api/download (the version-aware 302
// to the DMG), so just preserve that path here for direct hits.
export function GET() {
  return NextResponse.redirect("https://terminalsync.ai/api/download", 302);
}
