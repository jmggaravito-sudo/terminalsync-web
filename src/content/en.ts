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
    nextUp: {
      eyebrow: "Coming soon",
      body: "Your Codex Desktop, everywhere. Set it up once, open it on any Mac, done. Same engine that already syncs Claude Code and MCP.",
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
