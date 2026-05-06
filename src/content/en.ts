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
    eyebrow: "AI Workflow OS · Claude + Codex",
    titlePre: "Your AI tools and environment, ",
    titleHighlight: "synced and secure",
    titlePost: ".",
    subtitle:
      "Your terminal, files, and tools always ready on any computer. Sign in and pick up where you left off.",
    ctaPrimary: "Try it free",
    ctaSecondary: "See how it works",
    trustLine: "No setup · No context loss · Works across any machine · AES-256 zero-knowledge encryption",
    nextUp: {
      eyebrow: "Latest",
      body: "Anywhere Access via Cloudflare Tunnel — open your session from your phone with zero install. Unified multi-AI workflow: Claude and Codex sharing the same context. Per-terminal secrets vault.",
    },
    mockup: {
      appName: "Terminal Sync",
      statusOk: "Everything safe and synced",
      bannerTitle: "Your AI ready in seconds",
      bannerBody: "We set everything up for you — just open and start asking.",
      bannerCta: "Install Claude Code",
      session1: "Market research",
      session2: "Writing assistant",
      session3: "Sales analysis",
      live: "LIVE",
    },
  },
  demos: {
    title: "Three ‘wow’ moments",
    subtitle:
      "Why people who try TerminalSync drop their old tools within 30 seconds.",
    items: {
      context: {
        kicker: "Demo · Persistence",
        title: "Close everything. Your agent keeps working alone.",
        body: "Internet drops, your Mac restarts, you accidentally close the app — your Claude or Codex doesn't stop. When you come back, the conversation is exactly where you left it.",
      },
      install: {
        kicker: "Demo · Any device",
        title: "Generate a link, open your session from your phone.",
        body: "'Mobile' button → unique HTTPS link → your same desktop in your phone, tablet, or any borrowed Mac. Same context, same conversations.",
      },
      shield: {
        kicker: "Demo · Privacy",
        title: "AES-256 encryption before it leaves your Mac.",
        body: "Your files travel encrypted to your own Drive (or iCloud or Dropbox). Neither Google, nor Anthropic, nor OpenAI, nor we see what's inside. The master key lives in your Keychain.",
      },
    },
  },
  memory: {
    eyebrow: "Persistent memory",
    badge: "Coming soon",
    title: "Your AI learns you. And it never forgets.",
    subtitle:
      "Local, encrypted, portable memory that grows with every session. Your agent remembers your preferences, architecture decisions and conventions — by day 30 it knows you better than a new junior.",
    pillars: [
      {
        title: "100% local, 100% private",
        body: "The knowledge base lives in SQLite on your Mac. No servers of ours, no API keys, no vendor lock-in. If you want to sync between machines, we do it AES-256 encrypted to your own cloud.",
      },
      {
        title: "Works with any AI",
        body: "Compatible via MCP with Claude Code, Codex, Cursor, Windsurf and any agent that supports the protocol. One memory, all your agents.",
      },
      {
        title: "Semantic search",
        body: "Your agent finds the relevant context automatically. Ask 'how were we handling auth' and it brings back decisions, patterns, and reasons — not just keyword hits.",
      },
    ],
    timeline: {
      heading: "Without persistent memory vs. with persistent memory",
      withoutLabel: "Without TerminalSync Memory",
      withLabel: "With TerminalSync Memory",
      withoutItems: [
        { when: "Day 1", line: "You explain you prefer TypeScript with strict mode." },
        { when: "Day 3", line: "“What language do you prefer?” — re-explain everything." },
        { when: "Day 14", line: "Again. Starting from zero." },
        { when: "Day 30", line: "You stop explaining and accept generic answers." },
      ],
      withItems: [
        { when: "Day 1", line: "You explain you prefer TypeScript with strict mode." },
        { when: "Day 3", line: "“Since you prefer TypeScript, I'll init with strict.”" },
        { when: "Day 14", line: "“Following your explicit error-types convention…”" },
        { when: "Day 30", line: "Knows your stack better than a fresh-onboard dev." },
      ],
    },
    cta: {
      heading: "Notify me when it ships",
      body: "We email you when persistent memory is available. No spam, no newsletters — just the launch.",
      placeholder: "you@email.com",
      button: "Notify me",
      submitting: "Sending…",
      success: "✓ Done. We'll email you when it's live.",
      errorEmail: "Invalid email",
      errorGeneric: "Couldn't send. Try again in a moment.",
    },
  },
  multiAI: {
    eyebrow: "Unified AI Workflow",
    title: "Stop juggling AI tools",
    subtitle:
      "Right now your flow looks like this: Claude in one terminal, Codex in another, context lost between them. TerminalSync is the layer that brings them together.",
    problem: {
      title: "Without TerminalSync",
      items: [
        "Claude in one window",
        "Codex in another",
        "Context doesn't travel between them",
        "You repeat yourself constantly",
        "Every AI switch = starting from scratch",
        "Your flow breaks all the time",
      ],
    },
    solution: {
      title: "With TerminalSync",
      items: [
        "One environment",
        "Shared context",
        "Your AI tools working together",
        "Project memory travels with you",
        "No repeating, no switching, no friction",
        "Your flow never breaks",
      ],
    },
    useCases: {
      title: "Use the right AI for each moment — without changing setup",
      cards: [
        {
          tool: "Claude",
          verb: "for reasoning",
          body: "Deep analysis, planning, writing. Claude already knows your project.",
        },
        {
          tool: "Codex",
          verb: "for execution",
          body: "Code edits, refactors, automations. Same context, different tool.",
        },
      ],
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
    title: "What it feels like to work with your AI agent",
    subtitle:
      "Before: lost mornings and conversations that start from scratch. After: your agent keeps going where you left off, no matter what.",
    before: {
      heading: "Without Terminal Sync",
      items: [
        "Close the app, lose your AI conversation",
        "Internet drops, your agent stops",
        "Want to keep going from your phone — you can't",
        "Your API keys live in scattered files on your Mac",
        "Switch devices, start everything from zero",
        "Stare at the screen waiting for the AI to reply",
      ],
    },
    after: {
      heading: "With Terminal Sync",
      items: [
        "Close everything, reopen — your AI is still running",
        "Internet drops — your agent works locally anyway",
        "Generate a link, open the session on your phone",
        "AES-256 encrypted vault for your secrets",
        "Your account and config follow you across devices",
        "WhatsApp/Email/Telegram alert when it finishes or needs you",
      ],
    },
  },
  midCta: {
    eyebrow: "Try it free",
    title: "Stop staring at the screen waiting on your AI.",
    body: "7 days of Pro, no credit card. If it clicks, you stay. If not, you stop using it. Done.",
    ctaPrimary: "Download free",
    ctaSecondary: "See pricing",
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "What people ask first",
    subtitle: "Still got questions? Email support@terminalsync.ai",
    items: [
      {
        q: "How is this different from syncing my folder via Drive or iCloud?",
        a: "Drive and iCloud sync files unencrypted — the provider can see the content whenever it wants. Terminal Sync encrypts EVERYTHING with AES-256 before it leaves your Mac. Your files travel to Drive/iCloud/Dropbox as opaque blobs: neither Google, Apple, Anthropic, nor we can open them. The master key lives in your OS keychain.",
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
        q: "Does it work with any AI or just Claude and Codex?",
        a: "Today we have it polished for Claude (Code + Desktop) and Codex. The engine is tool-agnostic — we add others (Cursor, Cline, Aider, etc.) based on real demand. If you want us to support something specific, write us and we'll add it to the public roadmap.",
      },
      {
        q: "How is this different from a cloud IDE like Codespaces or Gitpod?",
        a: "You're not moving to a new environment — YOUR environment follows you. Your Mac, your files, your AI tools configured as you already had them. No compute rental, no per-minute billing, no lock-in. And everything is AES-256 encrypted in your own cloud.",
      },
      {
        q: "How is this different from using Claude or Codex on their own?",
        a: "Claude and Codex on their own don't talk to each other: each has its own context, files, memory. TerminalSync connects them in a single flow. You ask Claude to analyze something and Codex to execute it, without re-explaining anything — they share the same project and the same memory.",
      },
      {
        q: "Do I need to configure anything?",
        a: "No. That's exactly the point. You install, sign in, and everything is ready. First time takes 2 minutes to link your Drive (or iCloud or Dropbox); after that, you open any Mac and everything is in place.",
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
      "Three profiles who don't get how they worked without Terminal Sync.",
    items: {
      nomad: {
        title: "Lives in their AI agent",
        body: "You spend hours with Claude or Codex shipping projects. When the app freezes, internet drops, or you accidentally close it, you lose all the context. With TerminalSync your agent keeps running and you come back exactly where you left off.",
        tag: "AI Power User",
      },
      beginner: {
        title: "Switches devices often",
        body: "MacBook + Mac mini, or office + home, or you're traveling. You even want to keep going from your phone while your agent processes something. Your account and your session follow you wherever you are.",
        tag: "Multi-device",
      },
      agency: {
        title: "Handles sensitive data",
        body: "You work with API keys, client credentials, contracts, private data. You don't want them living in a vendor's cloud that could one day read them. AES-256 encryption before it leaves your Mac — not even we can open them.",
        tag: "Privacy-first",
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
          "1 active terminal with real persistence",
          "AES-256 zero-knowledge encryption",
          "Google Drive sync (your account)",
          "Silence detection for your AI agent",
          "1 linked device",
        ],
        cta: "Download free",
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
          "5 terminals with persistence + resurrection",
          "Anywhere Access (mobile + any browser)",
          "Notifications via Email / WhatsApp / Telegram",
          "Full Claude and Codex sync across devices",
          "90-day history",
          "Up to 5 devices",
        ],
        cta: "Start 7-day free trial",
      },
      dev: {
        name: "Dev",
        badge: "For devs",
        priceMonthly: "$39",
        priceYearly: "$390",
        priceNoteMonthly: "/mo",
        priceNoteYearly: "/yr",
        yearlyEquivalent: "$32.50/mo · billed annually",
        features: [
          "Everything in Pro, plus:",
          "20 active terminals",
          "Per-folder secrets vault",
          "Git-native sync (snapshots + .gitignore)",
          "Auto setup-on-arrival per project",
          "Read-only pair programming",
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
    title: "Recommend privacy and persistence",
    body: "If you produce AI, automation, or productivity content, earn 30% recurring for life every time someone signs up via your link. As long as they pay, you get paid.",
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
};

export default en;
