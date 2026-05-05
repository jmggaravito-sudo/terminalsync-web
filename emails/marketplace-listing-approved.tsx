import { EmailShell, H1, P, PrimaryButton, Callout, Signoff } from "./_layout";

interface Props {
  publisherName: string;
  listingName: string;
  listingSlug: string;
  isPaid: boolean;
  unsubscribeUrl: string;
}

export function MarketplaceListingApprovedEmail(props: Props) {
  const { publisherName, listingName, listingSlug, isPaid, unsubscribeUrl } = props;
  const publicUrl = `https://terminalsync.ai/es/connectors/${listingSlug}`;
  return (
    <EmailShell
      preheader={`Tu listing "${listingName}" está aprobado y visible en el marketplace.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>Tu listing fue aprobado</H1>
      <P>Hola {publisherName},</P>
      <P>
        Acabamos de aprobar <strong>{listingName}</strong>. Ya está visible en el
        marketplace.
      </P>
      {isPaid ? (
        <Callout variant="ok">
          Cuando alguien compre tu connector, Stripe te transfiere el 90% directo a tu
          cuenta Connect — TerminalSync se queda con 10% (0% si entraste a la waiver de
          los primeros 50 publishers).
        </Callout>
      ) : (
        <P>Cualquiera puede instalarlo desde la app TerminalSync con un click.</P>
      )}
      <PrimaryButton href={publicUrl}>Ver mi listing</PrimaryButton>
      <P>
        Si querés actualizar el manifest o la descripción, contactanos por ahora — el
        flujo de versiones self-service llega pronto.
      </P>
      <Signoff />
    </EmailShell>
  );
}
