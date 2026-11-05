import { envId } from "./stripe";

// Voice Studio (standalone dubbing business) SKU → Stripe price mapping.
// Price IDs live in env vars created by scripts/voice-studio-stripe-setup.mjs
// and are read at runtime, following the repo precedent of runtime env
// propagation for serverless routes.
//
// Every checkout session this module feeds carries
// metadata.business = "voice-studio" so the Stripe webhook can route the
// event to the Voice Studio flow instead of TerminalSync fulfillment.

export type VoiceStudioSku =
  | "setup"
  | "trial"
  | "single"
  | "pack4"
  | "pack8";

interface SkuDef {
  sku: VoiceStudioSku;
  /** Human label for webhook notifications. */
  label: string;
  /** Stripe Checkout mode driven by the price shape. */
  mode: "payment" | "subscription";
  /** Recurring packs renew monthly; everything else is one-time. */
  recurring: boolean;
  envVar: string;
}

export const VOICE_STUDIO_SKUS: Record<VoiceStudioSku, SkuDef> = {
  setup: {
    sku: "setup",
    label: "Voice setup ($300, one-time)",
    mode: "payment",
    recurring: false,
    envVar: "VS_PRICE_SETUP",
  },
  trial: {
    sku: "trial",
    label: "First video trial ($99)",
    mode: "payment",
    recurring: false,
    envVar: "VS_PRICE_TRIAL",
  },
  single: {
    sku: "single",
    label: "Single video ($129)",
    mode: "payment",
    recurring: false,
    envVar: "VS_PRICE_SINGLE",
  },
  pack4: {
    sku: "pack4",
    label: "4-video pack ($399/mo)",
    mode: "subscription",
    recurring: true,
    envVar: "VS_PRICE_PACK4_MONTHLY",
  },
  pack8: {
    sku: "pack8",
    label: "8-video pack ($699/mo)",
    mode: "subscription",
    recurring: true,
    envVar: "VS_PRICE_PACK8_MONTHLY",
  },
};

export function voiceStudioPriceId(sku: VoiceStudioSku): string | null {
  return envId(VOICE_STUDIO_SKUS[sku].envVar);
}
