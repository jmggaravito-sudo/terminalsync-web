import { NextResponse } from "next/server";

// /api/download → 302 to the current DMG.
//
// Reads the auto-updater manifest at releases.terminalsync.ai (the same
// source the running app polls every 6h) and redirects to the DMG for
// whatever version is current. This avoids hardcoding the version in
// the landing — when JM ships a new release, the landing's download button
// follows automatically without a redeploy.
//
// Arch: `?arch=x86_64` (alias `intel`) serves the Intel DMG (Macs 2020 y
// anteriores); default is Apple Silicon (aarch64). Each arch has its own
// manifest (`latest-darwin-<arch>.json`) published by the release
// workflow. If the Intel manifest isn't published yet (first release
// cycle after adding the Intel lane), we derive the Intel DMG name from
// the aarch64 manifest's version — both jobs upload to the same bucket
// with the same filename pattern.
//
// Cache: 5 min at the edge. Within 5 minutes of a new release the landing
// could still serve the old version, but Vercel's revalidation will pick
// up the new manifest on the next request after the TTL.
//
// Fallback: if the manifest is unreachable (network blip, R2 outage), we
// redirect to the known-good v0.2.1 DMG so the button never 404s.

const RELEASES_BASE = "https://releases.terminalsync.ai";
const FALLBACK_DMG = `${RELEASES_BASE}/Terminal-Sync_0.2.1_aarch64.dmg`;

type Arch = "aarch64" | "x86_64";

interface Manifest {
  version: string;
  pub_date?: string;
  platforms?: Partial<Record<`darwin-${Arch}`, { url?: string }>>;
}

export const revalidate = 300; // 5 minutes

async function manifestVersion(arch: Arch): Promise<string | null> {
  try {
    const res = await fetch(`${RELEASES_BASE}/latest-darwin-${arch}.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Manifest;
    return data.version ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const archParam = new URL(req.url).searchParams.get("arch");
  const arch: Arch =
    archParam === "x86_64" || archParam === "intel" ? "x86_64" : "aarch64";

  // Manifest only points at the .app.tar.gz (used by the in-app updater
  // for differential updates). For first-time download we want the .dmg
  // with the same version, served from the same bucket via the documented
  // filename pattern.
  let version = await manifestVersion(arch);
  if (!version && arch === "x86_64") {
    // Intel manifest not published yet — derive from the aarch64
    // manifest so both buttons work the moment the release lands.
    version = await manifestVersion("aarch64");
  }

  const dmgUrl = version
    ? `${RELEASES_BASE}/Terminal-Sync_${version}_${arch}.dmg`
    : FALLBACK_DMG;

  return NextResponse.redirect(dmgUrl, 302);
}
