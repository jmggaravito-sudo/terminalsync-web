import { fetchVoiceStudioLeads } from "@/lib/voiceStudioCrm";
import { licenseUrl } from "@/lib/voiceStudioLicense";
import { CopyLicenseLink } from "@/components/voice-studio/CopyLicenseLink";

// Ops view for the Voice Studio business (JM's idea from the CRM handoff
// §6): reads leads + deals straight from Frappe with the VS token — the CRM
// stays the system of record, this page only displays. No auth, consistent
// with /admin/* posture (noindex, read-only, server-held credentials).
export const metadata = { title: "Voice Studio — Ops" };
// Always fresh: this is a live ops dashboard over the CRM, never a
// build-time snapshot.
export const dynamic = "force-dynamic";

const STAGES = ["Nuevo", "Contactado", "Calificado", "Ganado", "Perdido"];

export default async function VoiceStudioOpsPage() {
  const data = await fetchVoiceStudioLeads();

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Voice Studio — Ops</h1>
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          CRM unreachable or FRAPPE_VOICE_* env vars missing. Nothing is
          duplicated here by design — fix the connection and reload.
        </p>
      </main>
    );
  }

  const dealByLead = new Map(
    data.deals.map((d) => [d.lead, d.status] as const),
  );
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<
    string,
    number
  >;
  for (const lead of data.leads) {
    const stage = dealByLead.get(lead.name) ?? lead.status;
    if (stage in counts) counts[stage] += 1;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Voice Studio — Ops</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Live read from the CRM (system of record). Leads with campana=
        {"voice-studio"} ·{" "}
        <a
          href="https://voicestudio.terminalsync.ai/crm"
          className="underline"
        >
          open CRM UI ↗
        </a>
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {STAGES.map((s) => (
          <div
            key={s}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {s}
            </p>
            <p className="mt-1 text-2xl font-semibold">{counts[s]}</p>
          </div>
        ))}
      </div>

      <table className="mt-10 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="py-2 pr-4">Lead</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Lead status</th>
            <th className="py-2 pr-4">Deal</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2">License link (14d)</th>
          </tr>
        </thead>
        <tbody>
          {data.leads.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-zinc-500">
                No leads yet with campana=voice-studio.
              </td>
            </tr>
          )}
          {data.leads.map((lead) => (
            <tr key={lead.name} className="border-b border-zinc-100">
              <td className="py-2 pr-4 font-medium">{lead.first_name}</td>
              <td className="py-2 pr-4 text-zinc-600">{lead.email}</td>
              <td className="py-2 pr-4">{lead.status}</td>
              <td className="py-2 pr-4">
                {dealByLead.get(lead.name) ?? "—"}
              </td>
              <td className="py-2 pr-4 text-zinc-500">
                {lead.creation?.slice(0, 10)}
              </td>
              <td className="py-2">
                <CopyLicenseLink url={licenseUrl(lead.email)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
