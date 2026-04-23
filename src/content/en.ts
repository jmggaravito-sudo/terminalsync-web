import type { Dict } from "./types";

const en: Dict = {
  locale: "en",
  meta: {
    title: "TerminalSync — Take your Claude Code anywhere",
    description:
      "Sync your terminals, files and AI context across computers instantly. One-click Claude Code install.",
    keywords:
      "sync claude code, install claude code easy, terminal sync ai, claude cloud, claude anywhere",
  },
  nav: {
    features: "Features",
    demos: "Demos",
    pricing: "Pricing",
    affiliates: "Affiliates",
    download: "Download",
    signIn: "Sign in",
  },
  hero: {
    eyebrow: "AI Power-Ups · Official with Anthropic",
    titlePre: "Take your ",
    titleHighlight: "Claude Code",
    titlePost: " anywhere.",
    subtitle:
      "Sync your terminals, files and AI context across computers instantly. One-click Claude Code install.",
    ctaPrimary: "Download Free for Desktop",
    ctaSecondary: "See how it works",
    trustLine: "Free forever · No credit card",
    mockup: {
      appName: "Terminal Sync",
      statusOk: "Your files are safe and synced",
      bannerTitle: "Install Claude Code in seconds",
      bannerBody: "We set everything up for you — just start asking.",
      bannerCta: "Install Claude Code",
      session1: "Q2 Sales Project",
      session2: "Grandma's Recipes",
      session3: "Juan's Scripts",
      live: "LIVE",
    },
  },
  demos: {
    title: "Three ‘wow’ moments",
    subtitle:
      "Watch why people ditch their old workflow after 30 seconds with TerminalSync.",
    items: {
      context: {
        kicker: "Demo · Context",
        title: "Close on your Mac, open on your PC. Exactly the same.",
        body: "No re-indexing, no copy-paste, no setup. Your Claude was waiting for you.",
      },
      install: {
        kicker: "Demo · 1-Click Install",
        title: "One click. Claude Code is ready.",
        body: "No NPM, no Node, no docs. One orange button and you're asking questions.",
      },
      shield: {
        kicker: "Demo · The Shield",
        title: "AES-256 before it leaves your computer.",
        body: "Neither Google nor we can see your code. You hold the only key.",
      },
    },
  },
  benefits: {
    title: "Why TerminalSync",
    subtitle: "What no other file sync can do for your AI.",
    items: {
      context: {
        title: "Context Sync",
        body: "You don't just move code — you move your AI's memory. Zero re-indexing, zero lost context.",
      },
      privacy: {
        title: "Zero-Knowledge Privacy",
        body: "Your files are encrypted on your PC before hitting Drive. Neither we nor Google can read your code.",
      },
      autoInstall: {
        title: "Automatic Setup",
        body: "Forget NPM, Node.js and terminal configs. We prepare your environment for you.",
      },
    },
  },
  personas: {
    title: "Is this for you?",
    subtitle: "Three kinds of people who can't live without TerminalSync anymore.",
    items: {
      nomad: {
        title: "The Nomad Developer",
        body: "You switch between the office Mac and home PC. Your work should follow you anywhere — no USB sticks, no emergency GitHub pushes.",
        tag: "Developer",
      },
      beginner: {
        title: "The AI Beginner",
        body: "You want to use Claude Code but the terminal scares you. We install everything for you: one click and you're asking questions.",
        tag: "Explorer",
      },
      agency: {
        title: "The Agency Owner",
        body: "Your team should have the same environment always. Distribute shared terminals and make sure everyone works alike.",
        tag: "Leader",
      },
    },
  },
  pricing: {
    title: "Simple, as it should be",
    subtitle: "Start free. Pay only when your workflow asks for it.",
    perMonth: "/mo",
    free: "Free",
    plans: {
      starter: {
        name: "Starter",
        price: "$0",
        priceNote: "forever",
        features: [
          "1 active terminal",
          "Google Drive sync",
          "Standard AES-256 encryption",
          "1 linked computer",
        ],
        cta: "Download free",
      },
      pro: {
        name: "Pro",
        price: "$19",
        priceNote: "/mo",
        badge: "Most popular",
        features: [
          "Unlimited terminals",
          "AI Auto-Pilot (one-click install)",
          "AI context sync",
          "90-day history",
          "Up to 5 computers",
        ],
        cta: "Try Pro free",
      },
      agency: {
        name: "Agency",
        price: "$49",
        priceNote: "/mo",
        features: [
          "Up to 5 users",
          "Admin panel",
          "Shared terminals",
          "Multi-cloud (Dropbox / iCloud)",
          "VIP support",
        ],
        cta: "Contact sales",
      },
    },
  },
  trust: {
    title: "Your code is yours. Full stop.",
    body: "Your API key never touches our servers. It stays encrypted in your personal cloud. You can audit the code: TerminalSync is open-source.",
    guarantee: "Try it free. No credit card.",
    features: {
      e2ee: "E2E encrypted",
      keychain: "API key in your keychain",
      opensource: "Open source",
      noVendor: "No vendor lock-in",
    },
  },
  affiliates: {
    kicker: "Affiliate Program",
    title: "Are you an AI content creator?",
    body: "Join our program and earn 30% recurring for helping others simplify their AI workflow.",
    cta: "Sign up as Affiliate",
    perks: {
      recurring: "30% recurring",
      lifetime: "Lifetime payouts",
      assets: "Ready-to-use assets",
    },
  },
  footer: {
    product: "Product",
    company: "Company",
    legal: "Legal",
    links: {
      features: "Features",
      demos: "Demos",
      pricing: "Pricing",
      download: "Download",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      affiliates: "Affiliates",
      privacy: "Privacy",
      terms: "Terms",
      security: "Security",
    },
    tagline: "Separate your work from your machine.",
    copyright: "© {{year}} TerminalSync. All rights reserved.",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  agent: {
    open: "Open assistant",
    name: "TerminalSync Assistant",
    tagline: "Sales & support · Online",
    close: "Close",
    greeting:
      "Hi! I'm your TerminalSync assistant. Can I help you set up Claude Code or answer a technical question?",
    placeholder: "Type your message…",
    send: "Send",
    you: "You",
    typing: "typing…",
    quickReplies: [
      { id: "install", label: "How do I install Claude Code?" },
      { id: "pricing", label: "Pricing" },
      { id: "security", label: "How secure is it?" },
    ],
    replies: {
      install:
        "Super easy! Download TerminalSync, in the dashboard you'll see the \"AI Power-Ups\" card → click \"Install Claude Code\" → paste your Anthropic API key and you're done. Takes ~30 seconds and we set up everything for you.",
      pricing:
        "3 plans: Starter ($0 free), Pro ($19/mo with AI Auto-Pilot + unlimited terminals) and Agency ($49/mo for teams). You can try Pro free — no credit card. Want the download link?",
      security:
        "Your code and API key are encrypted with AES-256 on your computer BEFORE uploading to Drive. Zero-Knowledge: neither we nor Google can read your content. You hold the master key in your local keychain.",
      fallback:
        "Thanks for your message. A human on the team will reach out shortly. In the meantime, want to check our FAQ or download the app?",
    },
  },
  video: {
    title: "How it works in 60 seconds",
    close: "Close video",
    comingSoon: "Video in production",
    comingSoonBody:
      "We're finishing the demo recording. Meanwhile, download the app and try it — takes 2 minutes.",
    ctaMeanwhile: "Download free",
  },
};

export default en;
