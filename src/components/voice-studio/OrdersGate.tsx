"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { OrdersForm, type OrderPlanOption } from "@/components/voice-studio/OrdersForm";
import { VsLoginButtons } from "@/components/voice-studio/VsLoginButtons";

export interface ClientOrder {
  name: string;
  url: string;
  status: string;
  notes?: string;
  created?: string;
}

type Entitlement = {
  id: string;
  sku: "trial" | "single" | "pack4" | "pack8";
  starts_at: string;
  ends_at: string | null;
  video_total: number;
  video_used: number;
  short_total: number;
  short_used: number;
};

type ProductionOrder = {
  id: string;
  source_url: string;
  notes: string;
  short_mode: "none" | "best_moment" | "timestamp";
  short_timestamp: string | null;
  status: "queued" | "in_progress" | "delivered";
  video_url: string | null;
  short_url: string | null;
  created_at: string;
};

type DashboardData = {
  email: string;
  licenseUrl?: string | null;
  entitlements: Entitlement[];
  orders: ProductionOrder[];
  legacyOrders: ClientOrder[];
  legacyOrdersAvailable?: boolean;
};

type LoadState =
  | { kind: "loading" | "anonymous" | "unconfigured" | "invalid-link" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: DashboardData; refreshError?: string };

const PLAN_NAMES: Record<Entitlement["sku"], string> = {
  trial: "First video",
  single: "Single video",
  pack4: "4-video monthly pack",
  pack8: "8-video monthly pack",
};

const SECTIONS = [
  { id: "plan", label: "Plan & credits" },
  { id: "submit", label: "Submit videos" },
  { id: "queue", label: "Production queue" },
  { id: "deliveries", label: "Deliveries" },
];

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});

function formatDate(value: string) {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? dateFormat.format(ms) : "";
}

function safeDownload(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** The API is authoritative; this only determines which plan options to offer. */
function activePlans(entitlements: Entitlement[], now: number) {
  return entitlements
    .filter((plan) => Date.parse(plan.starts_at) <= now &&
      (plan.ends_at === null || Date.parse(plan.ends_at) > now))
    .sort((a, b) =>
      (a.ends_at ? Date.parse(a.ends_at) : Infinity) -
      (b.ends_at ? Date.parse(b.ends_at) : Infinity));
}

function availableOption(plan: Entitlement): OrderPlanOption {
  return {
    id: plan.id,
    label: plan.ends_at ? `${PLAN_NAMES[plan.sku]} (ends ${formatDate(plan.ends_at)})` : PLAN_NAMES[plan.sku],
    includesShort: plan.sku === "pack4" || plan.sku === "pack8",
    availableVideos: Math.max(0, plan.video_total - plan.video_used),
    availableShorts: Math.max(0, plan.short_total - plan.short_used),
  };
}

function QueueList({ orders, legacy, delivered }: {
  orders: ProductionOrder[];
  legacy: ClientOrder[];
  delivered: boolean;
}) {
  if (orders.length + legacy.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-500">
        {delivered ? "Your first delivery will show up here." : "Nothing in the queue yet."}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {orders.map((order) => {
        const video = safeDownload(order.video_url);
        const short = safeDownload(order.short_url);
        const status = delivered ? "Delivered" : order.status === "in_progress" ? "In production" : "Queued";
        const submitted = formatDate(order.created_at);
        return (
          <li key={order.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${delivered ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                {status}
              </span>
              {submitted && <span className="text-xs text-zinc-500">Submitted {submitted}</span>}
            </div>
            <p className="mt-2 break-all font-medium text-zinc-900">{order.source_url}</p>
            {order.notes && <p className="mt-1 whitespace-pre-wrap break-words text-zinc-600">{order.notes}</p>}
            {order.short_mode !== "none" && (
              <p className="mt-1 text-zinc-600">
                Short/Reel: {order.short_mode === "timestamp"
                  ? `Start at ${order.short_timestamp}`
                  : "Production team selects the best moment"}
              </p>
            )}
            {delivered && (
              <div className="mt-3 flex flex-wrap gap-2">
                {video && (
                  <a href={video} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-950 px-3 py-1.5 font-semibold text-white">
                    Download dubbed video
                  </a>
                )}
                {short && (
                  <a href={short} target="_blank" rel="noopener noreferrer" className="rounded-full border border-zinc-300 px-3 py-1.5 font-semibold text-zinc-900">
                    Download Short/Reel
                  </a>
                )}
                {!video && !short && <span className="text-zinc-500">No download links are available yet.</span>}
              </div>
            )}
          </li>
        );
      })}
      {legacy.map((order) => (
        <li key={`legacy-${order.name}`} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
            {delivered ? "Delivered" : order.status === "Cancelled" ? "Cancelled" : "Queued"} · Previous system
          </span>
          <p className="mt-2 break-all font-medium text-zinc-900">{order.url}</p>
          {order.notes && <p className="mt-1 whitespace-pre-wrap break-words text-zinc-600">{order.notes}</p>}
          {delivered && <p className="mt-1 text-zinc-500">For files from this delivery, reply to your Voice Studio email.</p>}
        </li>
      ))}
    </ul>
  );
}

export function OrdersGate({ token }: { token?: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const requestVersion = useRef(0);

  const fetchDashboard = useCallback(async (jwt?: string) => {
    const version = ++requestVersion.current;
    try {
      const path = token ? `/api/voice-studio/orders?t=${encodeURIComponent(token)}` : "/api/voice-studio/orders";
      const response = await fetch(path, {
        cache: "no-store",
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });
      const body = (await response.json().catch(() => null)) as
        (DashboardData & { ok?: boolean; error?: string }) | null;
      if (version !== requestVersion.current) return;
      if (response.status === 401) {
        setState({ kind: token ? "invalid-link" : "anonymous" });
        return;
      }
      if (!response.ok || !body?.ok || !Array.isArray(body.entitlements) ||
          !Array.isArray(body.orders) || !Array.isArray(body.legacyOrders)) {
        throw new Error(body?.error ?? "Could not load your dashboard.");
      }
      setState({ kind: "ready", data: body });
    } catch (error) {
      if (version !== requestVersion.current) return;
      const message = error instanceof Error ? error.message : "Could not load your dashboard.";
      setState((current) => current.kind === "ready"
        ? { ...current, refreshError: message }
        : { kind: "error", message });
    }
  }, [token]);

  const refresh = useCallback(async () => {
    if (token) return fetchDashboard();
    const sb = getSupabaseBrowser();
    if (!sb) {
      setState({ kind: "unconfigured" });
      return;
    }
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        ++requestVersion.current;
        setState({ kind: "anonymous" });
        return;
      }
      await fetchDashboard(data.session.access_token);
    } catch {
      ++requestVersion.current;
      setState({ kind: "error", message: "Could not check your sign-in. Please try again." });
    }
  }, [fetchDashboard, token]);

  useEffect(() => {
    if (token) {
      void fetchDashboard();
      return () => { ++requestVersion.current; };
    }
    const sb = getSupabaseBrowser();
    if (!sb) {
      setState({ kind: "unconfigured" });
      return;
    }
    // Initial session is included in this listener. Pass the session's bearer
    // directly rather than calling another Supabase auth method in the callback.
    let sessionUser: string | undefined;
    const { data: subscription } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session?.access_token) {
        sessionUser = undefined;
        ++requestVersion.current;
        setState({ kind: "anonymous" });
        return;
      }
      if (session.user.id !== sessionUser) {
        sessionUser = session.user.id;
        setState({ kind: "loading" });
      }
      void fetchDashboard(session.access_token);
    });
    return () => {
      ++requestVersion.current;
      subscription.subscription.unsubscribe();
    };
  }, [fetchDashboard, token]);

  if (state.kind === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center text-zinc-500">
        <p role="status">Loading your dashboard…</p>
      </main>
    );
  }

  if (state.kind === "unconfigured") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center text-zinc-600">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard sign-in unavailable</h1>
        <p className="mt-3">Use your emailed dashboard link or reply to your Voice Studio email for help.</p>
      </main>
    );
  }

  if (state.kind === "anonymous" || state.kind === "invalid-link") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <p className="font-mono text-xs tracking-wide text-zinc-500">VOICE STUDIO · PRODUCTION DASHBOARD</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">Sign in to your dashboard</h1>
        {state.kind === "invalid-link" && (
          <p role="alert" className="mt-3 text-sm text-red-700">This dashboard link is no longer valid.</p>
        )}
        <p className="mt-2 max-w-md text-zinc-600">Use the same email you used to purchase your plan.</p>
        <div className="mt-8 flex w-full justify-center"><VsLoginButtons /></div>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Could not load your dashboard</h1>
        <p role="alert" className="mt-3 text-sm text-red-700">{state.message}</p>
        <button type="button" onClick={() => void refresh()} className="mt-4 rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </main>
    );
  }

  if (state.kind !== "ready") return null;
  const { email, licenseUrl, entitlements, orders, legacyOrders, legacyOrdersAvailable } = state.data;
  const plans = activePlans(entitlements, Date.now()).map(availableOption);
  const eligible = plans.filter((plan) => plan.availableVideos > 0 &&
    (!plan.includesShort || plan.availableShorts > 0));
  const queued = orders.filter((order) => order.status !== "delivered");
  const delivered = orders.filter((order) => order.status === "delivered");
  const legacyQueued = legacyOrders.filter((order) => order.status !== "Closed");
  const legacyDelivered = legacyOrders.filter((order) => order.status === "Closed");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-xs tracking-wide text-zinc-500">VOICE STUDIO · PRODUCTION DASHBOARD</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Your Spanish channel</h1>
      <p className="mt-2 break-words text-zinc-600">Signed in as <strong>{email}</strong></p>
      <nav aria-label="Dashboard sections" className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-amber-500">
            {section.label}
          </a>
        ))}
      </nav>

      {state.refreshError && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.refreshError} The data below may be out of date.{" "}
          <button type="button" className="font-semibold underline" onClick={() => void refresh()}>Refresh</button>
        </div>
      )}

      <section id="plan" aria-labelledby="plan-heading" className="mt-8 scroll-mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
        <h2 id="plan-heading" className="text-lg font-semibold text-zinc-900">Plan &amp; credits</h2>
        {plans.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No active production plan is linked to this email.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <li key={plan.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="font-semibold text-zinc-900">{plan.label}</p>
                <p className="mt-1 text-sm text-zinc-600">{plan.availableVideos} video credits left</p>
                {plan.includesShort && <p className="text-sm text-zinc-600">{plan.availableShorts} Shorts/Reels left</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="submit" aria-labelledby="submit-heading" className="mt-6 scroll-mt-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 id="submit-heading" className="text-lg font-semibold text-zinc-900">Send us videos to dub</h2>
        <p className="mt-1 text-sm text-zinc-600">Add a YouTube link and any production instructions for each video.</p>
        <OrdersForm key={email} token={token} plans={eligible} onSubmitted={() => void refresh()} />
      </section>

      {legacyOrdersAvailable === false && (
        <p role="status" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Previous orders are temporarily unavailable. New production requests and deliveries are still shown below.
        </p>
      )}

      <section id="queue" aria-labelledby="queue-heading" className="mt-8 scroll-mt-4">
        <h2 id="queue-heading" className="text-lg font-semibold text-zinc-900">Production queue ({queued.length + legacyQueued.length})</h2>
        <QueueList orders={queued} legacy={legacyQueued} delivered={false} />
      </section>

      <section id="deliveries" aria-labelledby="deliveries-heading" className="mt-8 scroll-mt-4">
        <h2 id="deliveries-heading" className="text-lg font-semibold text-zinc-900">Deliveries ({delivered.length + legacyDelivered.length})</h2>
        <QueueList orders={delivered} legacy={legacyDelivered} delivered />
      </section>

      {licenseUrl && (
        <section className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
          Haven&apos;t signed your voice license yet?{" "}
          <a href={licenseUrl} className="font-medium underline">Sign it here</a>.
        </section>
      )}
    </main>
  );
}
