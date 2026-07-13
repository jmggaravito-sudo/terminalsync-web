import type { Metadata } from "next";
import { SupabaseCallbackClient } from "./SupabaseCallbackClient";

// Redirect target for Supabase Auth flows (magic link + Google-via-Supabase +
// Apple-via-Supabase). Supabase always sends the browser back to an https://
// URL; a Tauri app can't be that URL directly because Chrome then has no way
// to know the flow ended and leaves the tab hanging (JM 2026-07-13). We take
// that hit here, deep-link back into `terminalsync-lab://auth/callback` (or
// `terminalsync://auth/callback` for prod), and show a "safe to close" page.
//
// This route intentionally lives NEXT TO — not inside — `/oauth/callback`.
// That older route serves the Rust-managed Drive OAuth flow, which uses
// `code + state` from Google directly and speaks a different scheme
// (`terminalsync://oauth/callback`, note the `oauth/` prefix). Mixing the two
// broke every time we tried; keeping them separate is the sanest hedge.

export const metadata: Metadata = {
  title: "Terminal Sync — conectando",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{
    code?: string;
    state?: string;
    flavor?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
}

export default async function SupabaseCallback({ searchParams }: Props) {
  const params = await searchParams;
  return <SupabaseCallbackClient params={params} />;
}
