import type { Dict } from "./types";

const en: Dict = {
  locale: "en",
  meta: {
    title: "TerminalSync — Memory, privacy and mobility for your AI",
    description:
      "Your AI agent (Claude/Codex) keeps running even if the internet drops or you switch Macs. AES-256 zero-knowledge encryption. Access from any device.",
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
    eyebrow: "Your AI stack · In your cloud · Across your Macs",
    titlePre: "Your AI environment, ",
    titleHighlight: "truly nomadic",
    titlePost: ".",
    subtitle:
      "Claude, Codex, MCP, .env and local folders — synced between your Macs in your own Drive. Neither Anthropic nor OpenAI sees your files. You hold the only key.",
    ctaPrimary: "Sync my stack — 7-day free trial",
    ctaSecondary: "See how it works",
    trustLine: "No credit card · 2-minute setup · Zero-knowledge privacy · Cancel anytime",
    nextUp: {
      eyebrow: "Coming soon",
      body: "Automatic Cowork sessions sync (manual today) · Cross-vendor Universal Memory (Claude ↔ Codex) · Auto-reinstall of plugins on fresh Mac. Public roadmap on GitHub.",
    },
    mockup: {
      appName: "Terminal Sync",
      statusOk: "Your files are safe and synced",
      bannerTitle: "Install Claude Code in seconds",
      bannerBody: "We set everything up for you — just start asking.",
      bannerCta: "Install Claude Code",
      session1: "Front-end Main Store",
      session2: "Auth-API Service",
      session3: "LangChain-Agent-Local",
      live: "LIVE",
    },
  },
  demos: {
    title: "Three ‘wow’ moments",
    subtitle:
      "Why serious devs ditch their old workflow within 30 seconds of trying it.",
    items: {
      context: {
        kicker: "Demo · Continuity",
        title: "Close on one Mac, open on the other. Exactly the same.",
        body: "Your Claude, your Codex, your Cowork — all waiting with configs, MCPs, sessions and memories intact. Zero re-indexing, zero re-login.",
      },
      install: {
        kicker: "Demo · 2-minute setup",
        title: "One click. Your entire AI stack is ready.",
        body: "Claude Code installed, MCPs configured, .env from your Drive, Cowork sessions downloaded. No NPM, no Node, no docs.",
      },
      shield: {
        kicker: "Demo · The Shield",
        title: "AES-256-GCM before it leaves your Mac.",
        body: "Neither Google, nor Anthropic, nor OpenAI, nor we can see your files. Your cloud, your keys, you own it all.",
      },
    },
  },
  benefits: {
    title: "Your agent is never left alone",
    subtitle:
      "Three guarantees no terminal — and no AI vendor — gives you: real persistence, access from anywhere, and a system that pings you before you have to ask.",
    items: {
      uninterrupted: {
        title: "Uninterrupted Work",
        body: "Your work is bulletproof: if the internet drops, your agent (Claude/Codex) does NOT stop. The terminal keeps running in the background and we notify you the moment connectivity returns or the task finishes.",
      },
      anywhere: {
        title: "Anywhere Access",
        body: "'Mobile' button up top → generates an HTTPS link to open this exact session from your phone or any browser. Same state, same context, no reconfiguring.",
      },
      notifications: {
        title: "Automatic Notifications",
        body: "Pings via Email, WhatsApp or Telegram when your task finishes or the agent needs your input. No more staring at a screen waiting on a Y/n.",
      },
    },
  },
  toolBreakdown: {
    eyebrow: "Per-tool coverage",
    title: "Here's what travels with you",
    subtitle:
      "What's working today and what's still on the public roadmap. No vague promises — all trackable on GitHub.",
    upcomingLabel: "Coming soon",
    tools: {
      claudeCode: {
        name: "Claude Code",
        tagline: "Your AI agent with everything you set up",
        live: [
          "MCP servers (Notion, GitHub, etc) travel with your account",
          "Your personal Claude configuration",
          "Per-project memory (CLAUDE.md and conversations)",
          "Custom skills",
          "Plugins auto-reinstall on any Mac",
          "Conversation alive when you reopen (via session resurrection)",
        ],
        upcoming: [],
      },
      cowork: {
        name: "Claude Cowork",
        tagline: "Your agent sessions across Macs",
        live: [
          "Automatic bidirectional sync",
          "Sessions available on any device",
        ],
        upcoming: [
          "Per-session lock (warning if open on another Mac)",
          "Automatic backup before merging",
        ],
      },
      codex: {
        name: "Codex",
        tagline: "Your OpenAI agent ready on any device",
        live: [
          "Encrypted tokens and authentication",
          "Full Codex configuration",
          "Global state of your sessions",
          "Skills and plugins auto-reinstalled",
          "AI picker — pick Claude or Codex per terminal",
          "Conversation alive when you reopen (via session resurrection)",
        ],
        upcoming: [],
      },
    },
  },
  beforeAfter: {
    eyebrow: "The real change",
    title: "How switching Macs actually feels",
    subtitle:
      "Before: half a morning gone. After: two minutes and you're back where you left off.",
    before: {
      heading: "Without Terminal Sync",
      items: [
        "You hunt for where your .env files ended up",
        "You reconfigure MCP servers one by one",
        "You re-install Claude Code plugins from memory",
        "Cowork has no history — you start from zero",
        "Your setup.sh, custom skills, aliases are missing",
        "30-60 minutes before you can actually work",
      ],
    },
    after: {
      heading: "With Terminal Sync",
      items: [
        "You install the app on the new Mac",
        "Sign in with your account",
        "Folders, MCPs, .env and configs appear from your Drive (encrypted)",
        "Cowork shows your sessions from the other Mac",
        "Claude recognizes your memory for each project",
        "2 minutes and you're back where you left off",
      ],
    },
  },
  midCta: {
    eyebrow: "Try it free",
    title: "Your next Mac switch shouldn't cost you 2 hours.",
    body: "7 days of Pro, no credit card. If it clicks, $19/month. If not, you stop using it. Done.",
    ctaPrimary: "Start free trial",
    ctaSecondary: "See pricing",
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "What people ask first",
    subtitle: "Still got questions? Email support@terminalsync.ai",
    items: [
      {
        q: "Isn't Git enough to sync my code?",
        a: "Git syncs what you track (source code). Terminal Sync moves what Git deliberately doesn't track: your .env with secrets, Claude/Codex/MCP configs, Cowork sessions, project memories, custom skills. Complementary tools — Git for the repo, Terminal Sync for everything else.",
      },
      {
        q: "But doesn't Claude Desktop already sync between Macs?",
        a: "Anthropic syncs cloud features (Projects, Memory web, Styles, Workflows, conversations). What it doesn't sync is the local stuff: your custom MCP servers (Notion, GitHub), your skills, your installed plugins, your Cowork sessions. That's what we cover.",
      },
      {
        q: "Do my files end up on your servers?",
        a: "No. AES-256-GCM encrypted on your Mac before leaving. Uploaded to YOUR Google Drive, not ours. Neither Anthropic, OpenAI, nor we can see your files. You hold the only key.",
      },
      {
        q: "Does it work with just one Mac?",
        a: "Yes, but the value is smaller. You get encrypted backup and you're set up for when you add a second machine. The real magic kicks in from machine #2.",
      },
      {
        q: "What happens if I cancel my subscription?",
        a: "The app keeps running in Free mode (1 terminal). Your files stay in your Drive — you remain the owner. You can export everything anytime.",
      },
      {
        q: "Is it open source?",
        a: "The encryption and sync engine will be auditable. The client app is proprietary for now, but the security core is published so anyone can review it.",
      },
      {
        q: "Does it work with Cursor / Cline / Aider?",
        a: "Today we focus on Claude (Code + Desktop + Cowork) and Codex Desktop. If there's real community demand, we add more tools — the engine is tool-agnostic, only the synced paths change.",
      },
      {
        q: "What if Anthropic eventually syncs everything you do?",
        a: "Good for them, bad for us in that subset. That's why our roadmap (public on GitHub) shifts toward local primitives no vendor will build because it would break their lock-in: cross-vendor unified memory, skills that compile to multiple AIs, project briefs in plain filesystem.",
      },
    ],
  },
  comparison: {
    eyebrow: "The honest comparison",
    title: "What no other AI does for you",
    subtitle:
      "Stacked against the tools you're already using every day. If something is partial or still in progress, the table says so.",
    pitch:
      "Vercel ties you to the cloud and bills you by the minute. Claude Code and Codex in their raw form are powerful but amnesic — every time you close the terminal you lose context, they don't roam between Macs, they don't have a secrets vault, they don't ping you when they get stuck. Terminal Sync is the layer that gives your AI agents memory, privacy, and mobility — without paying for cloud and without handing your code to anyone.",
    columns: {
      feature: "Feature",
      terminalSync: "Terminal Sync",
      vercel: "Vercel",
      claudeCode: "Claude Code alone",
      codex: "Codex alone",
    },
    rows: {
      offlineLocal: "Works offline / local-first",
      aes256: "AES-256 zero-knowledge encryption",
      secretsVault: "Built-in secrets vault",
      resurrection: "Session resurrection (close it all, comes back where you left off)",
      internetImmunity: "Persistence even if the internet drops",
      aiConversationSync: "AI conversation sync between Macs",
      multiModel: "Multi-model (Claude + Codex + others)",
      anywhereAccess: "Anywhere Access (mobile + any browser)",
      stuckNotifications: "Notifications when the agent gets stuck",
      replyInjection: "Reply-injection from your phone",
      noVendorLockIn: "No vendor lock-in (your files in your cloud)",
      zeroRuntime: "$0 runtime cost (runs on your Mac)",
      zeroStorage: "$0 storage cost (uses your own Drive)",
      deviceRoaming: "Roaming between devices",
      multipleSessions: "Multiple simultaneous sessions",
    },
    legend: { yes: "Yes", no: "No", partial: "Partial", soon: "Coming soon" },
    footnote:
      "Comparison based on each tool's public docs as of 2026-05-04. AES-256-GCM encrypted before it leaves your Mac — neither Anthropic, OpenAI, Vercel, nor we can see your files.",
  },
  personas: {
    title: "Is this for you?",
    subtitle:
      "Three profiles who don't get how they lived without Terminal Sync.",
    items: {
      nomad: {
        title: "The Nomad Dev",
        body: "You work on MacBook + Mac mini, or office + home. Switching machines wastes 30 minutes reconfiguring .env, MCPs, skills. With Terminal Sync, you open and pick up where you left off.",
        tag: "Developer",
      },
      beginner: {
        title: "The Multi-AI Power User",
        body: "You pay for Claude Pro + ChatGPT Plus. You have active Cowork sessions, Codex set up, custom MCPs. You want EVERYTHING to travel — not just Claude or just Codex.",
        tag: "AI Power User",
      },
      agency: {
        title: "The Indie Hacker / Founder",
        body: "5+ projects in parallel, each with its own .env, credentials, Claude context. Need it all encrypted and portable, without git-pushing things that don't belong in the repo.",
        tag: "Founder",
      },
    },
  },
  pricing: {
    title: "Simple, as it should be",
    subtitle: "Start free. Pay only when your workflow asks for it.",
    perMonth: "/mo",
    free: "Free",
    cycleLabel: {
      monthly: "Monthly",
      yearly: "Annual",
      savingsBadge: "Save 17%",
      savingsDetail: "2 months free",
    },
    trial: {
      eyebrow: "7-day free trial",
      explainer:
        "You enter your card but nothing is charged for the first 7 days. Cancel before day 7 and you pay nothing.",
    },
    quiz: {
      cta: "Which plan do I need?",
      title: "Let's help you pick",
      subtitle: "Three quick questions and we'll tell you which plan fits you.",
      back: "Back",
      next: "Next",
      seePlan: "See my plan",
      startOver: "Start over",
      resultTitle: "We recommend {{plan}}",
      resultWhy: "Because you told us that:",
      resultCta: "Start with {{plan}}",
      questions: [
        {
          id: "role",
          text: "What do you do most on your computer?",
          options: [
            { value: "creator", label: "Chat with AI, write, research" },
            { value: "developer", label: "Build or code things" },
            { value: "team", label: "Lead a team of several people who code" },
            { value: "idk", label: "Not sure / a bit of everything" },
          ],
        },
        {
          id: "pain",
          text: "If you lost your computer tomorrow, what would hurt the most?",
          options: [
            { value: "chats", label: "My AI chats, notes, and documents" },
            { value: "projects", label: "My code projects (whole folders with all the config)" },
            { value: "shared", label: "What I share with my team" },
            { value: "idk", label: "Not sure" },
          ],
        },
        {
          id: "volume",
          text: "How many computers do you normally work on?",
          options: [
            { value: "one", label: "Just one" },
            { value: "two", label: "Two or three" },
            { value: "many", label: "More than three, or I switch often" },
            { value: "idk", label: "Not sure" },
          ],
        },
      ],
    },
    plans: {
      starter: {
        name: "Free",
        price: "$0",
        priceNote: "forever",
        features: [
          "1 active terminal",
          "Google Drive sync",
          "AES-256 encryption",
          "MCP connectors (Claude Code + Desktop)",
          "1 linked computer",
        ],
        cta: "Start free",
      },
      pro: {
        name: "Pro",
        badge: "Most popular",
        priceMonthly: "$19",
        priceYearly: "$190",
        priceNoteMonthly: "/mo",
        priceNoteYearly: "/yr",
        yearlyEquivalent: "$15.83/mo · billed annually",
        features: [
          "5 active terminals",
          "AI Auto-Pilot (one-click Claude Code install)",
          "Full Claude sync (chats, projects, Cowork)",
          "90-day history",
          "Up to 5 computers",
        ],
        cta: "Start 7-day free trial",
      },
      dev: {
        name: "Dev",
        badge: "For developers",
        priceMonthly: "$39",
        priceYearly: "$390",
        priceNoteMonthly: "/mo",
        priceNoteYearly: "/yr",
        yearlyEquivalent: "$32.50/mo · billed annually",
        features: [
          "Everything in Pro, plus:",
          "20 active terminals",
          "Git-Native Sync (respects .gitignore)",
          "Encrypted .env Vault across machines",
          "Auto setup.sh on any new machine",
        ],
        cta: "Start 7-day free trial",
      },
    },
  },
  trust: {
    title: "Your files are yours. Full stop.",
    body: "Your secrets, configs, sessions — all encrypted on your Mac before leaving. Goes to YOUR Drive, not ours. The encryption engine will be publicly auditable.",
    guarantee: "Try it 7 days free. No credit card.",
    features: {
      e2ee: "AES-256-GCM encrypted",
      keychain: "Keys in your Keychain",
      opensource: "Auditable encryption engine",
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
      marketplace: "Marketplace",
      connectors: "Connectors",
      skills: "Skills",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      affiliates: "Affiliates",
      publishers: "Publish a connector",
      affiliateTerms: "Affiliate terms",
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
        "3 plans: Starter ($0 free, 1 terminal), Pro ($19/mo with Claude Code Power-Ups + 5 terminals) and Dev ($39/mo with Git-Native Sync, .env Vault and 20 terminals). You can try Pro or Dev free for 7 days — no credit card. Want the download link?",
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
  legal: {
    affiliates: {
      pageTitle: "Partner Agreement",
      title: "Partner Agreement",
      subtitle:
        "Terms and conditions for joining the TerminalSync Affiliate Program.",
      updated: "Last updated: April 22, 2026",
      intro:
        "This agreement describes the terms and conditions for joining the TerminalSync Affiliate Program. By signing up, you agree to the following:",
      readFullTerms: "Read full terms",
      back: "Back to Affiliates",
      acceptance:
        "By checking the \"I have read and accept the terms\" box on the signup form, you confirm that you have read, understood and accepted this agreement in full.",
      sections: {
        commissions: {
          heading: "1. Commissions and payouts",
          items: {
            percent: {
              label: "Percentage",
              body: "You'll earn a recurring 30% commission on the net value of every TerminalSync Pro subscription referred through your unique link.",
            },
            recurring: {
              label: "Recurrence",
              body: "Commissions are paid monthly for as long as the referred user keeps their subscription active and in good standing.",
            },
            threshold: {
              label: "Payout threshold",
              body: "Payouts are processed once your accumulated balance reaches $50 USD or more.",
            },
            cycle: {
              label: "Payout cycle",
              body: "Payouts are issued within the first 10 days of each calendar month.",
            },
            hold: {
              label: "Hold period",
              body: "There is a 15-day security period after the customer's payment before a commission is marked as \"Available\", to manage potential refunds or disputes.",
            },
          },
        },
        attribution: {
          heading: "2. Attribution system (cookies)",
          items: {
            duration: {
              label: "Duration",
              body: "We use tracking cookies with a 30-day lifetime.",
            },
            lastClick: {
              label: "Last click",
              body: "Attribution follows the \"Last Click\" model: the last affiliate link the user clicks before purchasing is the one that earns the commission.",
            },
          },
        },
        material: {
          heading: "3. Promotional material and brand",
          items: {
            authorized: {
              label: "Authorized use",
              body: "TerminalSync grants a limited license to use our logos, screenshots and marketing material available in the Affiliate Dashboard exclusively to promote the software.",
            },
            restriction: {
              label: "Brand restriction",
              body: "You may not buy domains containing the word \"TerminalSync\" nor run ad campaigns (Google Ads / Facebook Ads) using the brand name directly to compete with the official site.",
            },
          },
        },
        responsibilities: {
          heading: "4. Partner responsibilities",
          items: {
            ethics: {
              label: "Ethics",
              body: "Spam, misleading advertising or any practice that could damage TerminalSync's reputation is strictly prohibited.",
            },
            transparency: {
              label: "Transparency",
              body: "You must honestly disclose that you are an affiliate and that you receive compensation for recommended sales.",
            },
            selfReferral: {
              label: "Self-referrals",
              body: "Using your own affiliate link to obtain discounts on personal subscriptions is not allowed. Such commissions will be automatically voided.",
            },
          },
        },
        changes: {
          heading: "5. Modifications and termination",
          items: {
            modifications: {
              label: "Changes",
              body: "TerminalSync reserves the right to adjust commission rates or the terms of service by notifying partners 30 days in advance.",
            },
            termination: {
              label: "Termination",
              body: "Either party may end the relationship at any time. In case of proven fraud, the account will be closed and pending commissions forfeited.",
            },
          },
        },
      },
    },
  },
  checkout: {
    loading: "Opening secure checkout…",
    errorTitle: "We couldn't open checkout",
    success: {
      eyebrow: "You're in!",
      title: "Welcome to TerminalSync Pro",
      body: "You've got full access now. We sent you an email with the receipt and instructions to install the app.",
      ctaDownload: "Download the app",
      ctaHome: "Back to home",
      receipt: "Session ID: {{id}}",
    },
    cancel: {
      eyebrow: "Payment canceled",
      title: "No worries, your free plan is still on",
      body: "You canceled the payment — nothing was charged. Try again whenever, or reach out if you need a hand.",
      ctaRetry: "Try again",
      ctaContact: "Talk to the team",
    },
  },
  windowsEarlyAccess: {
    labelWindows: "Windows",
    labelLinux: "Linux",
    title: "Terminal Sync for {platform} — early access",
    body: "We'll email you in 2-3 weeks the moment the signed installer ships. No SmartScreen, no warnings — just install and use.",
    emailPlaceholder: "you@email.com",
    cta: "Notify me",
    ctaSubmitting: "Saving…",
    successTitle: "You're on the list!",
    successBody: "We'll email you the moment Terminal Sync for {platform} is ready. In the meantime, if you have a Mac handy, you can already use it.",
    errorPrefix: "Couldn't save your email:",
    privacyNote: "Launch announcement only. No spam, one-click unsubscribe.",
  },
};

export default en;
