import { describe, expect, it } from "vitest";
import { scrubQuotedText, detectSecretLike } from "./scrub";

describe("scrubQuotedText", () => {
  it("redacts email addresses", () => {
    const out = scrubQuotedText("Escribime a juan.perez+test@empresa.com.ar por favor");
    expect(out).not.toContain("juan.perez");
    expect(out).toContain("[email redactado]");
  });

  it("redacts phone numbers with common separators", () => {
    expect(scrubQuotedText("Llamame al +54 9 11 2345-6789")).toContain("[teléfono redactado]");
    expect(scrubQuotedText("mi numero es 555-123-4567")).toContain("[teléfono redactado]");
    expect(scrubQuotedText("(011) 4555-1234 es mi tel")).toContain("[teléfono redactado]");
  });

  it("does not redact short numbers (prices, counts, years)", () => {
    const out = scrubQuotedText("El plan Pro cuesta 19 dólares, tengo 3 workspaces desde 2024");
    expect(out).toContain("19 dólares");
    expect(out).toContain("3 workspaces");
    expect(out).toContain("2024");
    expect(out).not.toContain("redactado");
  });

  it("redacts URLs that carry a querystring", () => {
    const out = scrubQuotedText("Mirá este link: https://app.terminalsync.ai/reset?token=abc123&uid=42 gracias");
    expect(out).not.toContain("token=abc123");
    expect(out).toContain("[url redactada]");
  });

  it("leaves bare URLs (no querystring) untouched", () => {
    const out = scrubQuotedText("Documentación acá: https://terminalsync.ai/docs/install");
    expect(out).toContain("https://terminalsync.ai/docs/install");
  });

  it("redacts multiple occurrences and leaves the rest of the text intact", () => {
    const out = scrubQuotedText("Contactame en juan@x.com o en maria@y.com, gracias por la ayuda");
    expect(out).not.toContain("juan@x.com");
    expect(out).not.toContain("maria@y.com");
    expect(out).toContain("gracias por la ayuda");
    expect(out.match(/\[email redactado\]/g)?.length).toBe(2);
  });

  it("is a no-op on empty/plain text", () => {
    expect(scrubQuotedText("")).toBe("");
    expect(scrubQuotedText("¿Cómo cancelo mi suscripción?")).toBe("¿Cómo cancelo mi suscripción?");
  });
});

describe("detectSecretLike", () => {
  it("flags an OpenAI/Anthropic-style sk- key", () => {
    const m = detectSecretLike("mi clave es sk-proj-aaaaaaaaaaaaaaaaaaaaaaaa1234567890 no funciona");
    expect(m?.kind).toBe("openai_style_key");
  });

  it("flags a GitHub token", () => {
    const m = detectSecretLike("token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    expect(m?.kind).toBe("github_token");
  });

  it("flags a Google API key (AIza…)", () => {
    const m = detectSecretLike("AIzaSyD-abcdefghijklmnopqrstuvwxyz0123456");
    expect(m?.kind).toBe("google_api_key");
  });

  it("flags a PEM private key block", () => {
    const m = detectSecretLike("-----BEGIN PRIVATE KEY-----\nMIIB...\n-----END PRIVATE KEY-----");
    expect(m?.kind).toBe("private_key_block");
  });

  it("flags a long base64-looking blob", () => {
    const blob = "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU2Nzg5QUJDREVGR0g=";
    const m = detectSecretLike(`acá está el secreto: ${blob}`);
    expect(m?.kind).toBe("long_base64_blob");
  });

  it("returns null for ordinary customer prose", () => {
    expect(detectSecretLike("¿Cómo cancelo mi suscripción de Terminal Sync?")).toBeNull();
    expect(detectSecretLike("El plan Pro cuesta 19 dólares por mes")).toBeNull();
  });

  it("returns null for empty text", () => {
    expect(detectSecretLike("")).toBeNull();
  });
});
