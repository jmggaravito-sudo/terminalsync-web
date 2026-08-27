import type { Metadata } from "next";
import { headers } from "next/headers";
import { CallbackClient } from "../../callback/CallbackClient";
import { resolveCallbackLang } from "../../callback/callbackLang";

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
    lang?: string;
  }>;
}

export default async function MetaOAuthCallback({ searchParams }: Props) {
  const params = await searchParams;
  const lang = resolveCallbackLang({ explicitLang: params.lang, state: params.state, acceptLanguage: (await headers()).get("accept-language") });
  return (
    <CallbackClient
      params={params}
      providerName="Meta"
      nativePath="/oauth/meta/callback"
      lang={lang}
      successMessage={
        lang === "en"
          ? "Your Meta account is connected to Terminal Sync. Taking you back to the app."
          : "Tu cuenta de Meta está conectada a Terminal Sync. Te llevamos de vuelta a la app."
      }
    />
  );
}
