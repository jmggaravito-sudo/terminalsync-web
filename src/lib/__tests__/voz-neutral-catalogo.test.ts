import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Recorrido manual en vez de `globSync`: ese existe recién en Node 22 y el CI
 *  corre una versión anterior, así que en local pasaba y allá reventaba con
 *  "globSync is not a function". Mismo tipo de trampa local-vs-CI que ya nos
 *  costó el gate del app mirror. */
function archivosEs(): string[] {
  const out: string[] = [];
  const raiz = "content";
  if (!existsSync(raiz)) return out;
  for (const grupo of readdirSync(raiz)) {
    const dir = join(raiz, grupo, "es");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".md")) out.push(join(dir, f));
    }
  }
  return out.sort();
}

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
  /(?<![\wáéíóúñ])(vos|sos|podés|Podés|querés|Querés|tenés|Tenés|necesitás|sabés|debés|hacés|ponés|decís|escribís|elegís|seguís|Seguís|aprobás|aprobas|revisás|conectás|configurás|perdés|cambiás|activás|trabajás|Trabajás|entrás|esperás|olvidás|recordás|recuperás|Elegí|Abrí|Escribí|Seguí|Reabrí|probá|revisá|guardá|conectá|activá|marcá|tocá|pegá|dejá|buscá|cambiá|instalá|esperá|mandá|mirá|entrá|intentá|agregá|apretá|arrastrá|completá|confirmá|generá|iniciá|navegá|preguntá|reintentá|verificá|empezá|cerrá|volvé|hacé|poné|mantené|andá|corré|armá|detectá|ejecutá|enviá|prepará|retomá|seleccioná|visitá|copiá|descargá|cargá|aceptá|anotá|firmá|considerá|respondé|recorré|Probá|Revisá|Guardá|Conectá|Activá|Marcá|Tocá|Pegá|Dejá|Buscá|Cambiá|Instalá|Esperá|Mandá|Mirá|Entrá|Intentá|Agregá|Apretá|Arrastrá|Completá|Confirmá|Generá|Iniciá|Navegá|Preguntá|Reintentá|Verificá|Empezá|Cerrá|Volvé|Hacé|Poné|Mantené|Andá|Corré|Armá|Detectá|Ejecutá|Enviá|Prepará|Retomá|Seleccioná|Visitá|Copiá|Descargá|Cargá|Aceptá|Anotá|Firmá|Considerá|Respondé|Recorré|Auditá|auditá|Ordená|ordená|Creá|creá|Convertí|convertí|Diseñá|diseñá|Encontrá|encontrá|Planificá|planificá|Redactá|redactá|Chequeá|chequeá|Investigá|investigá|Recuperá|recuperá|Traé|traé|Aplicá|aplicá|Registrá|registrá|Agendá|agendá|agendá|Promové|promové|Publicá|publicá|escuchá|consultá|administrá|conciliá|calculá|gestioná|endurecé|recordá|Sabé|sabé|Veá|Forwardeá|armale|avisale|reclamalo|convertila|convertilo|publicalo|guardalo|recuperalo|mandale|contale|pedile)(?![\wáéíóúñ])/;

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
    for (const p of archivosEs()) {
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
    const vivos = new Set(archivosEs());
    const fantasmas = [...DEUDA].filter((d) => !vivos.has(d));
    expect(fantasmas, `Listados pero ya no existen:\n  ${fantasmas.join("\n  ")}`).toEqual([]);
  });

  // Los taglines y subtítulos se reescribieron enteros el 9 ago (46 renglones),
  // así que acá NO hay lista de deuda: es tolerancia cero. Son lo que se ve en
  // la tarjeta del catálogo, o sea el texto que más gente lee y el único que
  // muchos van a leer. El cuerpo del .md sigue grandfathered arriba.
  it("ningún tagline ni subtítulo está en voseo — sin excepciones", () => {
    const malos: string[] = [];
    for (const p of archivosEs()) {
      readFileSync(p, "utf8")
        .split("\n")
        .slice(0, 25)
        .forEach((linea) => {
          if (!/^(tagline|simpleSubtitle|devSubtitle):/.test(linea)) return;
          const m = VOSEO.exec(linea);
          if (m) malos.push(`${p} «${m[0]}» ${linea.trim().slice(0, 70)}`);
        });
    }
    expect(
      malos,
      `Estos taglines están en voseo. Es lo que se ve en la tarjeta:\n  ` +
        malos.join("\n  "),
    ).toEqual([]);
  });
});
