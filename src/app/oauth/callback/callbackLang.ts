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
  const normalizedState = state?.toLowerCase() ?? "";
  if (normalizedState.startsWith("tslang:en:")) return "en";
  if (normalizedState.startsWith("tslang:es:")) return "es";
  return normalizeCallbackLang(acceptLanguage);
}
