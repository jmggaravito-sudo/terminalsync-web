import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

/**
 * El catálogo en español habla neutral (tú), nunca voseo — el mercado es
 * inglés y español por igual, y el voseo achica el español a un solo país.
 *
 * **Esto es un trinquete, no un barrido.** Hoy 130 de 131 archivos `es/`
 * están en rioplatense: el catálogo entero se escribió así. Reescribirlo es
 * un proyecto de copy, no un parche — y en la app el mismo barrido hecho a
 * mano falló TRES veces, cada una de forma invisible a la revisión humana
 * ("está"→"esta" en 114 archivos; "aprobás"→"aprobas", que no existe;
 * "archivos"→"architú" al reemplazar "vos" sin límite de palabra).
 *
 * Así que lo existente queda grandfathered y explícito acá abajo, y lo que
 * se bloquea es lo NUEVO: cada conector, skill, kit o plugin que publiquen
 * los loops de acá en adelante nace en español neutral. La lista sólo se
 * achica — sacar un archivo de acá significa que ya se reescribió.
 */
const VOSEO =
  /(?<![\wáéíóúñ])(vos|sos|podés|Podés|querés|Querés|tenés|Tenés|necesitás|sabés|debés|hacés|ponés|decís|escribís|elegís|seguís|Seguís|aprobás|aprobas|revisás|conectás|configurás|perdés|cambiás|activás|trabajás|Trabajás|entrás|esperás|olvidás|recordás|recuperás|Elegí|Abrí|Escribí|Seguí|Reabrí|probá|revisá|guardá|conectá|activá|marcá|tocá|pegá|dejá|buscá|cambiá|instalá|esperá|mandá|mirá|entrá|intentá|agregá|apretá|arrastrá|completá|confirmá|generá|iniciá|navegá|preguntá|reintentá|verificá|empezá|cerrá|volvé|hacé|poné|mantené|andá|corré|armá|detectá|ejecutá|enviá|prepará|retomá|seleccioná|visitá|copiá|descargá|cargá|aceptá|anotá|firmá|considerá|respondé|recorré|Probá|Revisá|Guardá|Conectá|Activá|Marcá|Tocá|Pegá|Dejá|Buscá|Cambiá|Instalá|Esperá|Mandá|Mirá|Entrá|Intentá|Agregá|Apretá|Arrastrá|Completá|Confirmá|Generá|Iniciá|Navegá|Preguntá|Reintentá|Verificá|Empezá|Cerrá|Volvé|Hacé|Poné|Mantené|Andá|Corré|Armá|Detectá|Ejecutá|Enviá|Prepará|Retomá|Seleccioná|Visitá|Copiá|Descargá|Cargá|Aceptá|Anotá|Firmá|Considerá|Respondé|Recorré)(?![\wáéíóúñ])/;

/** Archivos que ya estaban en voseo cuando se puso el trinquete (9 ago 2026).
 *  No se agrega nada acá: si un archivo nuevo aparece en esta lista, el
 *  trinquete no sirvió para nada. */
const DEUDA = new Set([
  "content/blog/es/2026-07-06-que-es-espacio-trabajo-ia.md",
  "content/blog/es/2026-07-07-deja-de-subir-archivos.md",
  "content/cli-tools/es/github-cli.md",
  "content/cli-tools/es/stripe-cli.md",
  "content/cli-tools/es/supabase-cli.md",
  "content/cli-tools/es/vercel-cli.md",
  "content/cli-tools/es/wrangler.md",
  "content/connectors/es/ahrefs.md",
  "content/connectors/es/airtable.md",
  "content/connectors/es/asana.md",
  "content/connectors/es/brave-search.md",
  "content/connectors/es/calendly.md",
  "content/connectors/es/canva.md",
  "content/connectors/es/clickup.md",
  "content/connectors/es/context7.md",
  "content/connectors/es/dropbox.md",
  "content/connectors/es/elasticsearch.md",
  "content/connectors/es/exa.md",
  "content/connectors/es/filesystem.md",
  "content/connectors/es/firecrawl.md",
  "content/connectors/es/gdrive.md",
  "content/connectors/es/github.md",
  "content/connectors/es/gitlab.md",
  "content/connectors/es/gmail.md",
  "content/connectors/es/google-business.md",
  "content/connectors/es/google-calendar.md",
  "content/connectors/es/google-maps.md",
  "content/connectors/es/google-sheets.md",
  "content/connectors/es/gusto.md",
  "content/connectors/es/higgsfield.md",
  "content/connectors/es/hubspot.md",
  "content/connectors/es/ideogram.md",
  "content/connectors/es/intercom.md",
  "content/connectors/es/kit.md",
  "content/connectors/es/klaviyo.md",
  "content/connectors/es/map.md",
  "content/connectors/es/memory.md",
  "content/connectors/es/meta-ads.md",
  "content/connectors/es/meta-social.md",
  "content/connectors/es/monday.md",
  "content/connectors/es/mongodb.md",
  "content/connectors/es/neon.md",
  "content/connectors/es/notion.md",
  "content/connectors/es/pdf.md",
  "content/connectors/es/pinecone.md",
  "content/connectors/es/pipedream.md",
  "content/connectors/es/postgres.md",
  "content/connectors/es/posthog.md",
  "content/connectors/es/puppeteer.md",
  "content/connectors/es/sentry.md",
  "content/connectors/es/sequential-thinking.md",
  "content/connectors/es/shopify.md",
  "content/connectors/es/slack.md",
  "content/connectors/es/square.md",
  "content/connectors/es/stripe.md",
  "content/connectors/es/supabase.md",
  "content/connectors/es/threejs.md",
  "content/connectors/es/todoist.md",
  "content/connectors/es/twitter.md",
  "content/connectors/es/vercel.md",
  "content/connectors/es/webflow.md",
  "content/connectors/es/whatsapp.md",
  "content/connectors/es/wordpress.md",
  "content/connectors/es/xero.md",
  "content/connectors/es/zapier.md",
  "content/connectors/es/zoom.md",
  "content/kits/es/b2b-sales-pipeline.md",
  "content/kits/es/bookkeeping-tax-handoff.md",
  "content/kits/es/business-owner.md",
  "content/kits/es/database-insights.md",
  "content/kits/es/dev-code-review.md",
  "content/kits/es/docs-and-team-comms.md",
  "content/kits/es/ecommerce-storefront.md",
  "content/kits/es/marketing-campaign-seo.md",
  "content/kits/es/seo-content.md",
  "content/kits/es/ship-supabase-app.md",
  "content/kits/es/small-business-finance.md",
  "content/kits/es/social-ad-creative-studio.md",
  "content/kits/es/team-operations.md",
  "content/kits/es/web-research-brief.md",
  "content/plugins/es/gdrive.md",
  "content/plugins/es/github.md",
  "content/plugins/es/gmail.md",
  "content/plugins/es/google-business.md",
  "content/plugins/es/higgsfield.md",
  "content/plugins/es/hubspot.md",
  "content/plugins/es/ideogram.md",
  "content/plugins/es/meta-ads.md",
  "content/plugins/es/notion.md",
  "content/plugins/es/seo-audit.md",
  "content/plugins/es/shopify.md",
  "content/plugins/es/slack.md",
  "content/plugins/es/stripe.md",
  "content/plugins/es/xero.md",
  "content/skills/es/1099-w9-organizer.md",
  "content/skills/es/brand-guidelines.md",
  "content/skills/es/brand-voice.md",
  "content/skills/es/carrito-abandonado.md",
  "content/skills/es/code-reviewer.md",
  "content/skills/es/contenido-social.md",
  "content/skills/es/copywriter.md",
  "content/skills/es/cotizaciones.md",
  "content/skills/es/deep-research.md",
  "content/skills/es/doc-coauthoring.md",
  "content/skills/es/docx.md",
  "content/skills/es/email-drafter.md",
  "content/skills/es/higgsfield-video-director.md",
  "content/skills/es/ideogram-creative-director.md",
  "content/skills/es/internal-comms.md",
  "content/skills/es/learn.md",
  "content/skills/es/lifecycle-email.md",
  "content/skills/es/ltv-cohortes.md",
  "content/skills/es/mcp-builder.md",
  "content/skills/es/meeting-notes.md",
  "content/skills/es/meta-ads-creator.md",
  "content/skills/es/notebooklm-source-architect.md",
  "content/skills/es/pdf.md",
  "content/skills/es/pedir-resenas.md",
  "content/skills/es/pptx.md",
  "content/skills/es/promos-cupones.md",
  "content/skills/es/quarterly-tax-estimate-prep.md",
  "content/skills/es/referral-program.md",
  "content/skills/es/rfm-segmentacion.md",
  "content/skills/es/seo-auditor.md",
  "content/skills/es/skill-creator.md",
  "content/skills/es/slack-summarizer.md",
  "content/skills/es/tax-prep-checklist.md",
  "content/skills/es/winback-dormidos.md",
  "content/skills/es/xlsx.md",
  "content/skills/es/zapier-automation-blueprint.md",
]);

describe("el catálogo en español habla neutral", () => {
  it("ningún archivo NUEVO entra en voseo", () => {
    const nuevos: string[] = [];
    for (const p of globSync("content/*/es/*.md").sort()) {
      if (DEUDA.has(p)) continue;
      const txt = readFileSync(p, "utf8");
      const m = VOSEO.exec(txt);
      if (m) nuevos.push(`${p} «${m[0]}»`);
    }
    expect(
      nuevos,
      `Estos archivos son nuevos y están en voseo. El catálogo habla neutral (tú):\n  ` +
        nuevos.join("\n  "),
    ).toEqual([]);
  });

  it("la lista de deuda no crece: todo lo que está listado existe", () => {
    // Si alguien renombra un archivo y deja el viejo en la lista, la deuda
    // parece más grande de lo que es y nadie lo nota.
    const vivos = new Set(globSync("content/*/es/*.md"));
    const fantasmas = [...DEUDA].filter((d) => !vivos.has(d));
    expect(fantasmas, `Listados pero ya no existen:\n  ${fantasmas.join("\n  ")}`).toEqual([]);
  });
});
