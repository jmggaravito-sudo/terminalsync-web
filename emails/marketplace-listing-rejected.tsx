import { EmailShell, H1, P, PrimaryButton, Callout, Signoff } from "./_layout";

interface Props {
  lang: "es" | "en";
  publisherName: string;
  listingName: string;
  reviewNotes: string;
  unsubscribeUrl: string;
}

export function MarketplaceListingRejectedEmail(props: Props) {
  const { lang, publisherName, listingName, reviewNotes, unsubscribeUrl } = props;
  const COPY = {
    es: {
      preheaderBefore: `Tu listing "`,
      preheaderAfter: `" no pudo aprobarse esta vez.`,
      heading: "Tu listing necesita ajustes",
      greeting: "Hola",
      introBefore: "No pudimos aprobar ",
      introAfter: " en este intento. Acá el feedback del review:",
      noNotes: "Sin notas adicionales.",
      resubmit:
        "Cuando ajustes lo señalado, podés volver a someter el listing — el form recuerda los datos por slug.",
      button: "Editar y reenviar",
    },
    en: {
      preheaderBefore: `Your listing "`,
      preheaderAfter: `" couldn't be approved this time.`,
      heading: "Your listing needs a few tweaks",
      greeting: "Hi",
      introBefore: "We couldn't approve ",
      introAfter: " on this pass. Here's the feedback from the review:",
      noNotes: "No additional notes.",
      resubmit:
        "Once you've addressed the notes, you can resubmit the listing — the form remembers your details by slug.",
      button: "Edit and resubmit",
    },
  } as const;
  const t = COPY[lang];
  const submitUrl = `https://terminalsync.ai/${lang}/publishers/listings/new`;
  return (
    <EmailShell
      preheader={`${t.preheaderBefore}${listingName}${t.preheaderAfter}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>{t.heading}</H1>
      <P>
        {t.greeting} {publisherName},
      </P>
      <P>
        {t.introBefore}
        <strong>{listingName}</strong>
        {t.introAfter}
      </P>
      <Callout variant="warn">{reviewNotes || t.noNotes}</Callout>
      <P>{t.resubmit}</P>
      <PrimaryButton href={submitUrl}>{t.button}</PrimaryButton>
      <Signoff />
    </EmailShell>
  );
}
