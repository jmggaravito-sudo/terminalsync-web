import { NextResponse } from "next/server";

// /api/download → 302 to the current DMG.
//
// Reads the auto-updater manifest at releases.terminalsync.ai/latest-darwin-aarch64.json
// (the same source the running app polls every 6h) and redirects to the DMG
// for whatever version is current. This avoids hardcoding the version in
// the landing — when JM ships a new release, the landing's download button
// follows automatically without a redeploy.
//
// Cache: 5 min at the edge. Within 5 minutes of a new release the landing
// could still serve the old version, but Vercel's revalidation will pick
// up the new manifest on the next request after the TTL.
//
// Fallback: if the manifest is unreachable (network blip, R2 outage), we
// redirect to the known-good v0.2.1 DMG so the button never 404s.

const MANIFEST_URL =
  "https://releases.terminalsync.ai/latest-darwin-aarch64.json";
const FALLBACK_DMG =
  "https://releases.terminalsync.ai/Terminal-Sync_0.2.1_aarch64.dmg";

interface Manifest {
  version: string;
  pub_date?: string;
  platforms?: {
    "darwin-aarch64"?: { url?: string };
  };
}

export const revalidate = 300; // 5 minutes

export async function GET() {
  let dmgUrl = FALLBACK_DMG;

  try {
    const res = await fetch(MANIFEST_URL, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = (await res.json()) as Manifest;
      const version = data.version;
      if (version) {
        // Manifest only points at the .app.tar.gz (used by the in-app
        // updater for differential updates). For first-time download we
        // want the .dmg with the same version, served from the same
        // bucket via the documented filename pattern.
        dmgUrl = `https://releases.terminalsync.ai/Terminal-Sync_${version}_aarch64.dmg`;
      }
    }
  } catch {
    // Fall through to FALLBACK_DMG.
  }

  return NextResponse.redirect(dmgUrl, 302);
}
