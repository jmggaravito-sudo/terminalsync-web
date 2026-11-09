import {
  emailFromOrdersToken,
  licenseUrl,
} from "@/lib/voiceStudioLicense";
import { listClientOrders } from "@/lib/voiceStudioCrm";
import { OrdersForm } from "@/components/voice-studio/OrdersForm";
import { OrdersGate } from "@/components/voice-studio/OrdersGate";

// Client production dashboard: past orders (delivered) and future orders
// (queued) plus the submission form. Two doors: (1) the tokenized link
// minted after checkout / sent by the team — server-rendered below, token
// authorizes exactly one email; (2) the Supabase login (Google or magic
// link) — rendered client-side by OrdersGate when there's no valid token.
export const metadata = { title: "Voice Studio — Your dashboard" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const email = emailFromOrdersToken(t);

  if (!email) {
    // No (or expired) link token → the login door: Google / magic link,
    // resolved to an email server-side before any CRM data moves.
    return <OrdersGate />;
  }

  const orders = (await listClientOrders(email)) ?? [];
  const queued = orders.filter((o) => o.status !== "Closed");
  const delivered = orders.filter((o) => o.status === "Closed");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-wide text-zinc-400">
        VOICE STUDIO · PRODUCTION DASHBOARD
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Your Spanish channel
      </h1>
      <p className="mt-2 text-zinc-600">
        Signed in as <strong>{email}</strong> — bookmark this link, it works
        for 30 days.
      </p>

      {/* ---------- Submit new videos ---------- */}
      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Send us videos to dub
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste YouTube links, one per line. They land in our production
          queue immediately.
        </p>
        <div className="mt-4">
          <OrdersForm token={t ?? ""} />
        </div>
      </section>

      {/* ---------- Queued (future) ---------- */}
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

      {/* ---------- Delivered (past) ---------- */}
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

      {/* ---------- License reminder ---------- */}
      <section className="mt-12 border-t border-zinc-200 pt-8 text-sm text-zinc-500">
        <p>
          Haven&apos;t signed your voice license yet?{" "}
          <a href={licenseUrl(email)} className="underline">
            Sign it here
          </a>{" "}
          — no sample is produced before it&apos;s signed. / ¿Aún no firmas tu
          licencia de voz? Firma aquí antes de producción.
        </p>
      </section>
    </main>
  );
}
