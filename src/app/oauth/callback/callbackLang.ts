export type CallbackLang = "en" | "es";

export function normalizeCallbackLang(value?: string | null): CallbackLang {
  return value?.toLowerCase().startsWith("en") ? "en" : "es";
}

export function resolveCallbackLang({
  explicitLang,
  state,
  acceptLanguage,
}: {
  explicitLang?: string | null;
  state?: string | null;
  acceptLanguage?: string | null;
}): CallbackLang {
  if (explicitLang) return normalizeCallbackLang(explicitLang);
  const stateLang = resolveLangFromState(state);
  if (stateLang) return stateLang;
  return normalizeCallbackLang(acceptLanguage);
}

function resolveLangFromState(state?: string | null): CallbackLang | null {
  for (const candidate of stateCandidates(state)) {
    const match = candidate.match(/(?:^|:)tslang:(en|es)(?::|$)/i);
    if (match?.[1]) return normalizeCallbackLang(match[1]);
  }
  return null;
}

function stateCandidates(state?: string | null): string[] {
  if (!state) return [];
  const raw = state.toLowerCase();
  const candidates = [raw];
  try {
    const decoded = decodeURIComponent(state).toLowerCase();
    if (decoded !== raw) candidates.push(decoded);
  } catch {
    // Keep the raw state if the browser/framework already decoded it or it is malformed.
  }
  return candidates;
}
