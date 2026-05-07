export type Locale = "es" | "en";

export interface Dict {
  locale: Locale;
  meta: { title: string; description: string };
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
    nextUp: { eyebrow: string; body: string };
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
      uninterrupted: { title: string; body: string };
      anywhere: { title: string; body: string };
      notifications: { title: string; body: string };
    };
  };
  memory: {
    eyebrow: string;
    badge: string;
    title: string;
    subtitle: string;
    /** One-liner under the subtitle introducing the bullets list. */
    recallsLead?: string;
    /** Concrete things the AI recalls — rendered as a clean bulleted
     *  list under the lead. Keep each item short (<60 chars). */
    recalls?: string[];
    /** Two-line closing block: outcome ('it understands you better
     *  than someone new') + reassurance ('local, encrypted, no
     *  setup'). */
    closing?: { outcome: string; reassurance: string };
    pillars: Array<{ title: string; body: string }>;
    timeline: {
      heading: string;
      withoutLabel: string;
      withLabel: string;
      withoutItems: Array<{ when: string; line: string }>;
      withItems: Array<{ when: string; line: string }>;
    };
    cta: {
      heading: string;
      body: string;
      button: string;
    };
  };
  multiAI: {
    eyebrow: string;
    title: string;
    subtitle: string;
    problem: { title: string; items: string[] };
    solution: { title: string; items: string[] };
    useCases: {
      title: string;
      cards: Array<{ tool: string; verb: string; body: string }>;
    };
  };
  toolBreakdown: {
    eyebrow: string;
    title: string;
    subtitle: string;
    upcomingLabel: string;
    tools: {
      claudeCode: {
        name: string;
        tagline: string;
        live: string[];
        upcoming: string[];
      };
      gemini: {
        name: string;
        tagline: string;
        live: string[];
        upcoming: string[];
      };
      codex: {
        name: string;
        tagline: string;
        live: string[];
        upcoming: string[];
      };
    };
  };
  beforeAfter: {
    eyebrow: string;
    title: string;
    subtitle: string;
    before: { heading: string; items: string[] };
    after: { heading: string; items: string[] };
  };
  midCta: {
    eyebrow: string;
    title: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  comparison: {
    eyebrow: string;
    title: string;
    subtitle: string;
    pitch: string;
    columns: {
      feature: string;
      terminalSync: string;
      vercel: string;
      claudeCode: string;
      codex: string;
      gemini: string;
    };
    rows: {
      persistentMemory: string;
      resurrection: string;
      multiModel: string;
      responsiveNotifications: string;
      webMobileMirror: string;
      offlineLocal: string;
      aes256: string;
      secretsVault: string;
      internetImmunity: string;
      aiConversationSync: string;
      replyInjection: string;
      noVendorLockIn: string;
      zeroRuntime: string;
      zeroStorage: string;
      deviceRoaming: string;
      multipleSessions: string;
    };
    legend: { yes: string; no: string; partial: string; soon: string };
    footnote: string;
    /**
     * Inserted here so the calculator sits visually right after the
     * comparison table — same dict block, easier to keep voice consistent.
     */
    calculator?: {
      eyebrow: string;
      title: string;
      subtitle: string;
      inputs: {
        rate: { label: string; help: string };
        hoursPerDay: { label: string; suffix: string };
        daysPerMonth: { label: string; suffix: string };
        taskMix?: {
          label: string;
          help: string;
          lightLabel: string;
          heavyLabel: string;
        };
      };
      results: {
        soloLabel: string;
        soloHint: string;
        withTsLabel: string;
        withTsHint: string;
        savingsLabel: string;
        perYear: string;
        roiLabel: string;
        roiSuffix: string;
      };
      breakdown: {
        heading: string;
        hoursYear: string;
        apiCostSolo: string;
        apiCostMix: string;
        devTimeSolo: string;
        devTimeWithTs: string;
        subscription: string;
        timeSaving: string;
      };
      caveat: string;
      cta: string;
    };
    tooltips: {
      persistentMemory: string;
      resurrection: string;
      multiModel: string;
      responsiveNotifications: string;
      webMobileMirror: string;
      offlineLocal: string;
      aes256: string;
      secretsVault: string;
      internetImmunity: string;
      aiConversationSync: string;
      replyInjection: string;
      noVendorLockIn: string;
      zeroRuntime: string;
      zeroStorage: string;
      deviceRoaming: string;
      multipleSessions: string;
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
    cycleLabel: {
      monthly: string;
      yearly: string;
      savingsBadge: string; // e.g. "Ahorra 17%" / "Save 17%"
      savingsDetail: string; // e.g. "2 meses gratis"
    };
    trial: {
      eyebrow: string; // "7 días gratis"
      explainer: string; // "Ingresas tu tarjeta pero no se cobra nada los primeros 7 días. Cancela cuando quieras."
    };
    quiz: {
      cta: string; // "¿Cuál plan necesito?"
      title: string;
      subtitle: string;
      back: string;
      next: string;
      seePlan: string;
      startOver: string;
      resultTitle: string; // "Te recomendamos {{plan}}"
      resultWhy: string; // "Porque vos:"
      resultCta: string; // "Ir a {{plan}}"
      questions: Array<{
        id: string;
        text: string;
        options: Array<{ value: string; label: string }>;
      }>;
    };
    plans: {
      starter: Plan;
      pro: ProPlan;
      dev: ProPlan;
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
      | "publishers"
      | "marketplace"
      | "connectors"
      | "skills"
      | "affiliateTerms"
      | "privacy"
      | "terms"
      | "security",
      string
    >;
    tagline: string;
    copyright: string;
  };
  // Windows-only early-access banner. Replaces the macOS download CTA
  // when a Windows visitor lands on the page. Linux is not on the
  // roadmap so we don't surface anything to those visitors.
  windowsEarlyAccess: {
    title: string;
    body: string;
    cta: string;
    ctaSubmitting: string;
    emailPlaceholder: string;
    successTitle: string;
    successBody: string;
    privacyNote: string;
    errorPrefix: string;
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
  legal: {
    affiliates: {
      pageTitle: string;
      title: string;
      subtitle: string;
      updated: string;
      intro: string;
      readFullTerms: string;
      back: string;
      acceptance: string;
      sections: {
        commissions: {
          heading: string;
          items: {
            percent: { label: string; body: string };
            recurring: { label: string; body: string };
            threshold: { label: string; body: string };
            cycle: { label: string; body: string };
            hold: { label: string; body: string };
          };
        };
        attribution: {
          heading: string;
          items: {
            duration: { label: string; body: string };
            lastClick: { label: string; body: string };
          };
        };
        material: {
          heading: string;
          items: {
            authorized: { label: string; body: string };
            restriction: { label: string; body: string };
          };
        };
        responsibilities: {
          heading: string;
          items: {
            ethics: { label: string; body: string };
            transparency: { label: string; body: string };
            selfReferral: { label: string; body: string };
          };
        };
        changes: {
          heading: string;
          items: {
            modifications: { label: string; body: string };
            termination: { label: string; body: string };
          };
        };
      };
    };
  };
  checkout: {
    loading: string;
    errorTitle: string;
    success: {
      eyebrow: string;
      title: string;
      body: string;
      ctaDownload: string;
      ctaHome: string;
      receipt: string;
    };
    cancel: {
      eyebrow: string;
      title: string;
      body: string;
      ctaRetry: string;
      ctaContact: string;
    };
  };
}

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
}

// Pro has two recurring prices (monthly/yearly) sharing the same features.
interface ProPlan {
  name: string;
  badge: string;
  priceMonthly: string;
  priceYearly: string;
  priceNoteMonthly: string;
  priceNoteYearly: string;
  yearlyEquivalent: string; // "$15.83/mo billed annually" to anchor comparison
  features: string[];
  cta: string;
}
