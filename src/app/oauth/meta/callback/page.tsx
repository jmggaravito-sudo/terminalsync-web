import type { Metadata } from "next";
import { CallbackClient } from "../../callback/CallbackClient";

// Meta/Facebook Login redirects here first because Meta requires an HTTPS
// redirect URI. This page immediately deep-links back into the desktop app at
// terminalsync://oauth/meta/callback so the native MetaAuthManager can validate
// state and exchange the code for a long-lived user token.

export const metadata: Metadata = {
  title: "Terminal Sync — conectando Meta",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{
    code?: string;
    state?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  }>;
}

export default async function MetaOAuthCallback({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <CallbackClient
      params={params}
      providerName="Meta"
      nativePath="/oauth/meta/callback"
      successMessage="Tu cuenta de Meta está conectada a Terminal Sync. Te llevamos de vuelta a la app."
    />
  );
}
