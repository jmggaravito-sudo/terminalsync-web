import { isMarketCode, type MarketCode } from "@/lib/markets";

export interface PipelineResearch {
  verdict?: string;
  reason?: string;
  markets?: { codes?: string[]; evidence?: string[] };
  official?: { exists?: boolean };
}

export interface PipelineSupervision {
  outcome?: "catalog_blocked" | "needs_app_smoke" | "missing_catalog_file";
  country?: string;
  checks?: { marketListed?: boolean; statusAvailable?: boolean; declaredInstallable?: boolean; probeReason?: string };
  appSmoke?: "not_run";
}

export function pipelineAnswer(research: PipelineResearch, country: MarketCode, supervision?: PipelineSupervision | null) {
  const codes = research.markets?.codes ?? [];
  const supported = codes.includes(country) || codes.includes("GLOBAL");
  const evidence = (research.markets?.evidence ?? []).filter((item) => /^https:\/\//.test(item)).slice(0, 3);
  if (research.verdict === "ship_official" && research.official?.exists && supported) {
    return { outcome: "can_build" as const, reason: research.reason ?? "", evidence };
  }
  if (research.verdict === "ship_official" && !supported) {
    return { outcome: "country_unverified" as const, reason: research.reason ?? "", evidence };
  }
  if (research.verdict === "exists") {
    return { outcome: supervision?.outcome === "catalog_blocked" ? "catalog_blocked" as const : "already_cataloged" as const,
      reason: research.reason ?? "", evidence, supervision: supervision ?? null };
  }
  if (research.verdict === "needs_own_build") {
    return { outcome: "needs_build" as const, reason: research.reason ?? "", evidence };
  }
  return { outcome: "cannot_build" as const, reason: research.reason ?? "", evidence };
}

export function validPipelineCountry(value: unknown): value is MarketCode {
  return isMarketCode(value) && value !== "GLOBAL";
}
