import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const page = readFileSync('src/app/privacy/page.tsx', 'utf8');
describe('Google verification public disclosures', () => {
  it('identifies the OAuth brand and read-only Gmail scope', () => {
    expect(page).toContain('Terminal Sync (also written TerminalSync or TS)');
    expect(page).toContain('https://www.googleapis.com/auth/gmail.readonly');
    expect(page).toContain('drive.file');
  });
  it('discloses context processing, revocation and provider limitations honestly', () => {
    for (const value of ['Cloudflare', 'Z.ai', 'Provider requirements', 'does not automatically erase', 'not included in AI prompts']) expect(page).toContain(value);
    expect(page).not.toContain('data brokers, or third-party AI');
    expect(page).toContain('before it is eligible to receive Google user data');
    expect(page).not.toContain('do not guarantee');
  });
  it('keeps Gmail disclosures in both localized policies', () => {
    const localized = readFileSync('src/app/[lang]/legal/privacy/page.tsx', 'utf8');
    expect(localized).toContain('Gmail: acceso opcional de solo lectura');
    expect(localized).toContain('Gmail: optional read-only access');
  });
  it('makes product purpose and matching name visible in the homepage', () => {
    const hero = readFileSync('src/components/landing/Hero.tsx', 'utf8');
    expect(hero).toContain('Terminal Sync (TerminalSync or TS)');
    expect(hero).toContain('Gmail in read-only mode');
    expect(hero).toContain('Gmail en modo solo lectura');
  });
});

describe('active standalone homepage', () => {
  it('shows the approved Gmail purpose between the section title and connector cards', () => {
    const html = readFileSync('public/landing-b/index.html', 'utf8');
    const section = html.split('id="integraciones"')[1].split('</section>')[0];
    const purpose = 'Terminal Sync organiza documentos y correos en espacios de trabajo con IA. Conecta Gmail en modo solo lectura y elige qué mensajes usar como contexto.';
    expect(section).toContain(purpose);
    expect(section.indexOf(purpose)).toBeGreaterThan(section.indexOf('</h2>'));
    expect(section.indexOf(purpose)).toBeLessThan(section.indexOf('class="stack-cards"'));
    expect(readFileSync('public/landing-b/i18n.js', 'utf8')).toContain('Terminal Sync organizes documents and emails in AI workspaces.');
  });
});
