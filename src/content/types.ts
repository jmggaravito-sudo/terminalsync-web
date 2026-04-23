export type Locale = "es" | "en";

export interface Dict {
  locale: Locale;
  meta: { title: string; description: string; keywords: string };
  nav: {
    features: string;
    demos: string;
    pricing: string;
    affiliates: string;
    download: string;
    signIn: string;
  };
  hero: {
    eyebrow: string;
    titlePre: string;
    titleHighlight: string;
    titlePost: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
    mockup: {
      appName: string;
      statusOk: string;
      bannerTitle: string;
      bannerBody: string;
      bannerCta: string;
      session1: string;
      session2: string;
      session3: string;
      live: string;
    };
  };
  demos: {
    title: string;
    subtitle: string;
    items: {
      context: { kicker: string; title: string; body: string };
      install: { kicker: string; title: string; body: string };
      shield: { kicker: string; title: string; body: string };
    };
  };
  benefits: {
    title: string;
    subtitle: string;
    items: {
      context: { title: string; body: string };
      privacy: { title: string; body: string };
      autoInstall: { title: string; body: string };
    };
  };
  personas: {
    title: string;
    subtitle: string;
    items: {
      nomad: { title: string; body: string; tag: string };
      beginner: { title: string; body: string; tag: string };
      agency: { title: string; body: string; tag: string };
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    perMonth: string;
    free: string;
    plans: {
      starter: Plan;
      pro: Plan & { badge: string };
      agency: Plan;
    };
  };
  trust: {
    title: string;
    body: string;
    guarantee: string;
    features: {
      e2ee: string;
      keychain: string;
      opensource: string;
      noVendor: string;
    };
  };
  affiliates: {
    kicker: string;
    title: string;
    body: string;
    cta: string;
    perks: { recurring: string; lifetime: string; assets: string };
  };
  footer: {
    product: string;
    company: string;
    legal: string;
    links: Record<
      | "features"
      | "demos"
      | "pricing"
      | "download"
      | "about"
      | "blog"
      | "contact"
      | "affiliates"
      | "privacy"
      | "terms"
      | "security",
      string
    >;
    tagline: string;
    copyright: string;
  };
  theme: { light: string; dark: string; system: string };
  agent: {
    open: string;
    name: string;
    tagline: string;
    close: string;
    greeting: string;
    placeholder: string;
    send: string;
    you: string;
    typing: string;
    quickReplies: { id: "install" | "pricing" | "security"; label: string }[];
    replies: {
      install: string;
      pricing: string;
      security: string;
      fallback: string;
    };
  };
  video: {
    title: string;
    close: string;
    comingSoon: string;
    comingSoonBody: string;
    ctaMeanwhile: string;
  };
}

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
}
