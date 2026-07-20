import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { buildRawSkillPayload } from "./rawSkill";
import { listSkillSlugs } from "@/lib/skills";

/**
 * Skills-loop DELIVERY GATE.
 *
 * A skill is not "done" when its content + evals exist — it is done when the
 * app can actually put it on disk. The delivery path is:
 *   catalog tile → desktop `ensure_skill_installed(slug)` → GET /raw → SKILL.md
 * If `/raw` can't serve a published skill, a fresh user's install fails silently
 * ("la skill no está en Drive"). This gate asserts every catalog-ready skill
 * produces a valid `/raw` payload, so nothing goes public that the app can't
 * deliver. It runs against `buildRawSkillPayload` — the exact function the
 * route uses — so endpoint and gate never drift.
 */
describe("skills delivery gate — every catalog-ready skill is servable via /raw", () => {
  it("serves a valid, checksum-consistent payload for each public skill", async () => {
    const slugs = await listSkillSlugs();
    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      const result = await buildRawSkillPayload(slug);
      expect(result.ok, `${slug} must be servable via /raw`).toBe(true);
      if (!result.ok) continue;
      const p = result.payload;

      // Non-empty SKILL.md.
      expect(p.skill_md.trim().length, `${slug} SKILL.md not empty`).toBeGreaterThan(0);

      // Checksum is sha256 of the exact bytes the client writes to SKILL.md —
      // this equality is what lets the client no-op. If it breaks, the client
      // would rewrite on every launch.
      const expected =
        "sha256:" +
        crypto.createHash("sha256").update(p.skill_md, "utf8").digest("hex");
      expect(p.checksum, `${slug} checksum matches skill_md`).toBe(expected);

      // At least one deliverable vendor, all within {claude, codex} (the only
      // two the desktop writes to).
      expect(p.vendors.length, `${slug} declares a deliverable vendor`).toBeGreaterThan(0);
      for (const v of p.vendors) {
        expect(["claude", "codex"], `${slug} vendor ${v} is deliverable`).toContain(v);
      }

      // Extras must be safe relative paths (no traversal) and valid base64.
      for (const extra of p.extras) {
        expect(extra.path.startsWith("/"), `${slug} extra ${extra.path} not absolute`).toBe(false);
        expect(extra.path.includes(".."), `${slug} extra ${extra.path} no traversal`).toBe(false);
        expect(
          () => Buffer.from(extra.content_b64, "base64"),
          `${slug} extra ${extra.path} valid base64`,
        ).not.toThrow();
      }
    }
  });

  it("404s an unknown slug (also blocks path traversal)", async () => {
    for (const bad of ["does-not-exist", "../secrets", "../../etc/passwd"]) {
      const result = await buildRawSkillPayload(bad);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    }
  });

  it("does NOT serve staged (catalogReady:false) skills — undeliverable until published", async () => {
    // The 8 CRM skills are staged. They must 404 on /raw until JM flips
    // catalogReady, at which point this gate's first test starts covering them.
    for (const staged of ["rfm-segmentation", "ltv-cohorts", "referral-program"]) {
      const result = await buildRawSkillPayload(staged);
      expect(result.ok, `${staged} is staged, must not be servable yet`).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    }
  });
});
