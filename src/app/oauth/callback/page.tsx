import type { Metadata } from "next";
import { CallbackClient } from "./CallbackClient";

// This route is the Google OAuth redirect target for the Tauri app's "Web
// application" OAuth client. Google sends the user here with ?code=...&state=...;
// we render a branded page and then deep-link to terminalsync:// so the
// native app picks up the code and completes the token exchange.

export const metadata: Metadata = {
  title: "Terminal Sync — conectando",
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

export default async function OAuthCallback({ searchParams }: Props) {
  const params = await searchParams;
  return <CallbackClient params={params} />;
}
