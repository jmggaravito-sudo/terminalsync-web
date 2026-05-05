import { EmailShell, H1, P, PrimaryButton, Callout, Signoff } from "./_layout";

interface Props {
  publisherName: string;
  listingName: string;
  reviewNotes: string;
  unsubscribeUrl: string;
}

export function MarketplaceListingRejectedEmail(props: Props) {
  const { publisherName, listingName, reviewNotes, unsubscribeUrl } = props;
  const submitUrl = "https://terminalsync.ai/es/publishers/listings/new";
  return (
    <EmailShell
      preheader={`Tu listing "${listingName}" no pudo aprobarse esta vez.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>Tu listing necesita ajustes</H1>
      <P>Hola {publisherName},</P>
      <P>
        No pudimos aprobar <strong>{listingName}</strong> en este intento. Acá el feedback
        del review:
      </P>
      <Callout variant="warn">{reviewNotes || "Sin notas adicionales."}</Callout>
      <P>
        Cuando ajustes lo señalado, podés volver a someter el listing — el form recuerda
        los datos por slug.
      </P>
      <PrimaryButton href={submitUrl}>Editar y reenviar</PrimaryButton>
      <Signoff />
    </EmailShell>
  );
}
