import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
describe('lead capture kit action boundaries', () => {
  for (const lang of ['en', 'es']) {
    it(`${lang} discloses draft-only proposals and action-specific approval`, () => {
      const text = readFileSync(`content/kits/${lang}/lead-capture-followup.md`, 'utf8');
      expect(text).not.toContain(lang === 'en' ? '→ send the proposal →' : '→ enviar la propuesta →');
      expect(text).toContain(lang === 'en' ? 'draft the proposal for your review' : 'redactar la propuesta para tu revisión');
      expect(text).toContain(lang === 'en' ? 'not blanket approval' : 'no autoriza en bloque');
    });
  }
});
