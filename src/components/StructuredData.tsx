import type { Dict, Locale } from "@/content";

interface Props {
  dict: Dict;
  lang: Locale;
}

// JSON-LD structured data for search engines. We emit three graphs:
//  - Organization: who we are
//  - WebSite: name + potential search action
//  - SoftwareApplication × 3: one per pricing plan (Starter / Pro / Agency)
//
// All inline in a single <script type="application/ld+json"> so there's
// a single network request and Google can parse the @graph as one unit.
export function StructuredData({ dict, lang }: Props) {
  const BASE = "https://terminalsync.ai";
  const url = `${BASE}/${lang}`;

  const org = {
    "@type": "Organization",
    "@id": `${BASE}#organization`,
    name: "TerminalSync",
    url: BASE,
    logo: `${BASE}/brand/logo-square.svg`,
    sameAs: [
      "https://github.com/jmggaravito-sudo/terminalsync-web",
      "https://www.instagram.com/terminalsync_ai",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@terminalsync.ai",
        availableLanguage: ["es", "en"],
      },
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${BASE}#website`,
    url: BASE,
    name: "TerminalSync",
    description: dict.meta.description,
    inLanguage: lang === "es" ? "es-ES" : "en-US",
    publisher: { "@id": `${BASE}#organization` },
  };

  // Plans mapped to SoftwareApplication offers so rich snippets can surface.
  const plans = [
    { id: "starter", price: "0" },
    { id: "pro", price: "19" },
    { id: "dev", price: "39" },
    { id: "team", price: "49" },
  ] as const;

  const software = {
    "@type": "SoftwareApplication",
    "@id": `${BASE}#software`,
    name: "TerminalSync",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    description: dict.meta.description,
    offers: plans.map((p) => {
      const plan = dict.pricing.plans[p.id];
      return {
        "@type": "Offer",
        name: plan.name,
        price: p.price,
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: p.price,
          priceCurrency: "USD",
          billingDuration: p.id === "starter" ? undefined : "P1M",
          unitText: p.id === "starter" ? undefined : "MONTH",
        },
        url: `${url}#pricing`,
      };
    }),
    // Conservative aggregate — safe until real reviews land.
    // Once you have >5 real reviews, swap this with AggregateRating.
  };

  const json = {
    "@context": "https://schema.org",
    "@graph": [org, website, software],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify with no spaces — serialize size matters for LCP.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
