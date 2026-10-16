import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/app/[lang]/support/page.tsx", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

describe("public Store support page", () => {
  it("publishes bilingual canonical support URLs", () => {
    expect(page).toContain("https://terminalsync.ai/es/support");
    expect(page).toContain("https://terminalsync.ai/en/support");
    expect(page).toContain('title="Soporte de Terminal Sync"');
    expect(page).toContain('title="Terminal Sync Support"');
    expect(sitemap).toContain('"support"');
  });

  it("uses established support, privacy, and security channels", () => {
    for (const address of [
      "support@terminalsync.ai",
      "privacy@terminalsync.ai",
      "security@terminalsync.ai",
    ]) {
      expect(page).toContain(address);
    }
  });

  it("warns users not to disclose secrets or verification codes", () => {
    expect(page).toContain("No envíes contraseñas, códigos de verificación");
    expect(page).toContain("Do not send passwords, verification codes");
    expect(page).not.toMatch(/respondemos en|reply within|24 hours|24 horas/i);
  });
});
