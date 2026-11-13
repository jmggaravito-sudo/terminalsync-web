import { database } from "@/lib/voiceStudioProduction";
import { LICENSE_VERSION } from "@/lib/voiceStudioLicense";

const table = "voice_studio_voice_license_acceptances";
export type VoiceLicenseStatus = "pending" | "signed" | "revoked";

export async function voiceLicenseStatus(email: string): Promise<VoiceLicenseStatus> {
  const { data, error } = await database().from(table)
    .select("revoked_at").eq("email", email).eq("license_version", LICENSE_VERSION).maybeSingle();
  if (error) throw error;
  if (!data) return "pending";
  return data.revoked_at ? "revoked" : "signed";
}

export async function recordVoiceLicense(input: {
  email: string; channel: string; accepted_at: string; ip: string; user_agent: string;
}): Promise<"recorded" | "already_signed" | "revoked"> {
  const { data, error } = await database().from(table).upsert(
    { ...input, license_version: LICENSE_VERSION },
    { onConflict: "email,license_version", ignoreDuplicates: true },
  ).select("email").maybeSingle();
  if (error) throw error;
  if (data) return "recorded";
  const state = await voiceLicenseStatus(input.email);
  if (state === "pending") throw new Error("Voice license acceptance not found");
  return state === "revoked" ? "revoked" : "already_signed";
}
