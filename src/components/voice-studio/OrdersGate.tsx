"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { OrdersForm } from "@/components/voice-studio/OrdersForm";
import { VsLoginButtons } from "@/components/voice-studio/VsLoginButtons";

export interface ClientOrder {
  name: string;
  url: string;
  status: string;
  notes?: string;
  created?: string;
}

// Signed-link-free door into the client dashboard. The Supabase session
// (Google or email magic link) resolves the client's email server-side —
// the API accepts the session's access token as Bearer and queries the CRM
// for exactly that email, so a Google account can only ever see its own
// orders. The HMAC `?t=` link path keeps working via the server page.
export function OrdersGate() {
  const [state, setState] = useState<
    "loading" | "anonymous" | "ready" | "unconfigured"
  >("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientOrder[] | null>(null);
  const [licenseHref, setLicenseHref] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const sb = getSupabaseBrowser();
    const { data } = (await sb?.auth.getSession()) ?? {};
    const session = data?.session;
    if (!sb || !session?.user.email) {
      setState(sb ? "anonymous" : "unconfigured");
      return;
    }
    const mail = session.user.email.toLowerCase();
    setEmail(mail);
    setLoadError(null);
    try {
      const res = await fetch("/api/voice-studio/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        orders?: ClientOrder[];
        licenseUrl?: string;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Could not load your orders.");
      }
      setOrders(json.orders ?? []);
      setLicenseHref(json.licenseUrl ?? null);
      setState("ready");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Network error.");
      setState("ready");
    }
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setState("unconfigured");
      return;
    }
    void refresh();
    // A fresh OAuth/magic-link landing sets the session client-side; this
    // listener flips the gate without a manual reload.
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) void refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  if (state === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center text-zinc-500">
        Loading your dashboard…
      </main>
    );
  }

  if (state === "unconfigured") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Dashboard temporarily unavailable
        </h1>
        <p className="mt-3 text-zinc-600">
          Sign-in is not configured right now. Your emailed dashboard link
          still works — or reply to any Voice Studio email and we&apos;ll
          send a fresh one.
        </p>
      </main>
    );
  }

  if (state === "anonymous") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <p className="font-mono text-xs tracking-wide text-zinc-400">
          VOICE STUDIO · PRODUCTION DASHBOARD
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          Sign in to your dashboard
        </h1>
        <p className="mt-2 max-w-md text-zinc-600">
          Use the same email you signed up with — we match your account by
          email, nothing else to remember.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <VsLoginButtons />
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Prefer your emailed link? It still works — book-
          marking <code className="rounded bg-zinc-100 px-1">/voice-studio/orders</code>{" "}
          after signing in is all you need.
        </p>
      </main>
    );
  }

  // ready
  const list = orders ?? [];
  const queued = list.filter((o) => o.status !== "Closed");
  const delivered = list.filter((o) => o.status === "Closed");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-wide text-zinc-400">
        VOICE STUDIO · PRODUCTION DASHBOARD
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Your Spanish channel
      </h1>
      <p className="mt-2 text-zinc-600">
        Signed in as <strong>{email}</strong>
      </p>

      {loadError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Send us videos to dub
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste YouTube links, one per line. They land in our production
          queue immediately.
        </p>
        <div className="mt-4">
          <OrdersForm useSession onSubmitted={refresh} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          In the queue ({queued.length})
        </h2>
        {queued.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Nothing in the queue yet — submit links above.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {queued.map((o) => (
              <li
                key={o.name}
                className="rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-amber-700">
                  QUEUED
                </span>
                <p className="mt-1 break-all font-medium text-zinc-800">
                  {o.url}
                </p>
                {o.notes && (
                  <p className="mt-1 text-xs text-zinc-500">{o.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          Delivered ({delivered.length})
        </h2>
        {delivered.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Your first delivery will show up here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {delivered.map((o) => (
              <li
                key={o.name}
                className="rounded-xl border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-emerald-700">
                  DELIVERED · {o.created?.slice(0, 10)}
                </span>
                <p className="mt-1 break-all font-medium text-zinc-800">
                  {o.url}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-zinc-200 pt-8 text-sm text-zinc-500">
        <p>
          Haven&apos;t signed your voice license yet?
          {licenseHref && (
            <>
              {" "}
              <a href={licenseHref} className="underline">
                Sign it here
              </a>
              .
            </>
          )}
        </p>
      </section>
    </main>
  );
}
