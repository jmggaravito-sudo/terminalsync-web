import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

const source = readFileSync(new URL("../src/app/[lang]/legal/extension-privacy/page.tsx", import.meta.url), "utf8");
const es = source.split("  es: {")[1].split("  en: {")[0];
const en = source.split("  en: {")[1].split("} as const;")[0];

for (const [lang, copy] of [["es", es], ["en", en]]) {
  test(`${lang}: versioned identity, manifest permissions and data categories`, () => {
    for (const term of ["TerminalSync.ai", "fbbeeghjdjopcadipcjiabcjefbpihpb", "0.2.1", "0.3.0", "2026", "Colombia", "http://127.0.0.1", "http://*/*", "https://*/*", "storage", "tabs", "scripting", "sidePanel", "chrome.storage.local", "chrome.storage.sync", "URL", "Desktop"]) {
      assert.ok(copy.includes(term), `${lang} missing ${term}`);
    }
    for (const pattern of (lang === "es" ? [/todavía no publicada/, /texto visible/, /valores de campos/, /Instrucciones y chat/, /autenticación/, /volátiles/, /memoria/, /vencimiento/, /confirmación separada/] : [/not yet published/, /visible text/, /field values/, /Instructions and chat/, /authentication/, /volatile/, /memory/, /expiry/, /separate confirmation/])) assert.match(copy, pattern);
  });
  test(`${lang}: Desktop processing is not represented as offline or provider-direct`, () => {
    const current = copy.split(lang === "es" ? '["Versión anterior publicada' : '["Earlier published version')[0];
    for (const pattern of (lang === "es" ? [/no llama directamente/, /servicios de IA configurados/, /no significa procesamiento íntegramente sin conexión/, /no promete que nadie/, /No se promete borrado remoto/] : [/does not call AI providers directly/, /configured AI services/, /does not mean fully offline/, /does not promise that no one/, /does not promise remote deletion/])) assert.match(current, pattern);
  });
  test(`${lang}: legacy BYOK and hosted processing remain separate, without automatic key deletion`, () => {
    const legacy = copy.split(lang === "es" ? '["Versión anterior publicada' : '["Earlier published version')[1];
    for (const term of ["0.2.1", "BYOK", "Anthropic", "OpenAI", "Google Gemini", "trial", "chrome.storage.local"]) assert.ok(legacy.includes(term));
    for (const pattern of (lang === "es" ? [/pueden permanecer/, /no implica eliminación automática/, /revocarla/, /identificador de instalación/] : [/may remain/, /does not imply automatic deletion/, /revoke it/, /installation identifier/])) assert.match(legacy, pattern);
  });
}

test("metadata, locale gates and shared navigation remain wired without obsolete blanket claims", () => {
  assert.match(source, /if \(!isLocale\(lang\)\) return \{\}/);
  assert.match(source, /if \(!isLocale\(lang\)\) notFound\(\)/);
  assert.match(source, /description: copy.description/);
  assert.match(source, /canonical: `https:\/\/terminalsync.ai\/\$\{lang\}\/legal\/extension-privacy`/);
  assert.match(source, /return \[\{ lang: "es" \}, \{ lang: "en" \}\]/);
  assert.match(source, /<LegalShell lang=\{lang\}/);
  for (const stale of ["May 29, 2026", "29 de mayo de 2026", "We do not run a backend server", "No leemos el contenido", "We do not read the contents", "BYOK, no backend", "BYOK, sin backend", "We do not use your data to train"]) assert.ok(!source.includes(stale), stale);
});
