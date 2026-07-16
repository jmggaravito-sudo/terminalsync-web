import { EmailShell, H1, P, PrimaryButton, Callout, Signoff } from "./_layout";

interface Props {
  publisherName: string;
  listingName: string;
  listingSlug: string;
  isPaid: boolean;
  unsubscribeUrl: string;
  lang: "es" | "en";
}

export function MarketplaceListingApprovedEmail(props: Props) {
  const { publisherName, listingName, listingSlug, isPaid, unsubscribeUrl, lang } = props;

  const COPY = {
    es: {
      preheaderPrefix: "Tu listing “",
      preheaderSuffix: "” está aprobado y visible en el marketplace.",
      heading: "Tu listing fue aprobado",
      greeting: "Hola ",
      approvedBefore: "Acabamos de aprobar ",
      approvedAfter: ". Ya está visible en el marketplace.",
      paidCallout:
        "Cuando alguien compre tu connector, Stripe te transfiere el 90% directo a tu cuenta Connect — TerminalSync se queda con 10% (0% si entraste a la waiver de los primeros 50 publishers).",
      freeCopy: "Cualquiera puede instalarlo desde la app TerminalSync con un click.",
      cta: "Ver mi listing",
      updateCopy:
        "Si querés actualizar el manifest o la descripción, contactanos por ahora — el flujo de versiones self-service llega pronto.",
    },
    en: {
      preheaderPrefix: "Your listing “",
      preheaderSuffix: "” is approved and live in the marketplace.",
      heading: "Your listing was approved",
      greeting: "Hi ",
      approvedBefore: "We just approved ",
      approvedAfter: ". It’s now live in the marketplace.",
      paidCallout:
        "When someone buys your connector, Stripe transfers 90% straight to your Connect account — TerminalSync keeps 10% (0% if you made it into the first-50-publishers waiver).",
      freeCopy: "Anyone can install it from the TerminalSync app with one click.",
      cta: "View my listing",
      updateCopy:
        "If you want to update the manifest or description, reach out to us for now — self-service versioning is coming soon.",
    },
  } as const;
  const t = COPY[lang];

  const publicUrl = `https://terminalsync.ai/${lang}/connectors/${listingSlug}`;
  return (
    <EmailShell
      preheader={`${t.preheaderPrefix}${listingName}${t.preheaderSuffix}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>{t.heading}</H1>
      <P>
        {t.greeting}
        {publisherName},
      </P>
      <P>
        {t.approvedBefore}
        <strong>{listingName}</strong>
        {t.approvedAfter}
      </P>
      {isPaid ? (
        <Callout variant="ok">{t.paidCallout}</Callout>
      ) : (
        <P>{t.freeCopy}</P>
      )}
      <PrimaryButton href={publicUrl}>{t.cta}</PrimaryButton>
      <P>{t.updateCopy}</P>
      <Signoff />
    </EmailShell>
  );
}
