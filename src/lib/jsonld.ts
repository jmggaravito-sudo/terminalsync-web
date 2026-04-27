// Schema.org JSON-LD generators for marketplace detail pages.
//
// Why SoftwareApplication: Google's rich-results guidance maps best to that
// type for installable AI tooling. We don't include aggregateRating until we
// have real reviews — fake or empty ratings can trigger manual penalties and
// kill the snippet outright.
//
// The shape here is deliberately conservative: name + description + category
// + offers + author + url. Google rewards completeness up to a point, then
// flags overstuffing. These five are the high-leverage fields.

import type { ConnectorMeta } from "./connectors";
import type { SkillMeta } from "./skills";

const BASE = "https://terminalsync.ai";

export interface SoftwareApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  url: string;
  image: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
  author: {
    "@type": "Person" | "Organization";
    name: string;
  };
}

function absoluteImage(logo: string): string {
  if (logo.startsWith("http")) return logo;
  return `${BASE}${logo}`;
}

export function skillJsonLd(skill: SkillMeta, lang: string): SoftwareApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: skill.name,
    description: skill.description || skill.tagline,
    applicationCategory:
      skill.category === "dev" ? "DeveloperApplication" : "BusinessApplication",
    operatingSystem: "macOS, Windows, Linux",
    url: `${BASE}/${lang}/skills/${skill.slug}`,
    image: absoluteImage(skill.logo),
    offers: {
      "@type": "Offer",
      // First-party seeds are free; when paid third-party listings land, the
      // price moves into SkillMeta and this string switches to the cents-
      // converted value (e.g. "9.00").
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": skill.author === "TerminalSync" ? "Organization" : "Person",
      name: skill.author,
    },
  };
}

export function connectorJsonLd(
  connector: ConnectorMeta,
  lang: string,
): SoftwareApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: connector.name,
    description: connector.tagline,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    url: `${BASE}/${lang}/connectors/${connector.slug}`,
    image: absoluteImage(connector.logo),
    offers: {
      "@type": "Offer",
      price:
        connector.priceCents != null
          ? (connector.priceCents / 100).toFixed(2)
          : "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: connector.publisherDisplayName ?? "TerminalSync",
    },
  };
}
