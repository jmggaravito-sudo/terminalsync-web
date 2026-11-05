#!/usr/bin/env node
// Mint a Voice Studio voice-license signing link from the CLI.
// Usage: node --env-file=.env.local scripts/voice-studio-license-link.mjs <email> [days]
// The page at /voice-studio/license?t=... is the ops fallback when the
// /admin/voice-studio view isn't at hand.

import { createHmac } from "node:crypto";

const [email, daysArg] = process.argv.slice(2);
const secret = process.env.STRIPE_WEBHOOK_SECRET;
if (!email || !secret) {
  console.error(
    "Usage: node --env-file=.env.local scripts/voice-studio-license-link.mjs <email> [days]\nRequires STRIPE_WEBHOOK_SECRET in env (same signing key as the app).",
  );
  process.exit(1);
}
const days = Number(daysArg ?? 14);
const sub = `vs-license:${email.trim().toLowerCase()}`;
const payload = {
  sub,
  kind: "vs-license",
  exp: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60,
};
const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
const sig = createHmac("sha256", secret).update(encoded).digest("hex");
console.log(`https://terminalsync.ai/voice-studio/license?t=${encoded}.${sig}`);
