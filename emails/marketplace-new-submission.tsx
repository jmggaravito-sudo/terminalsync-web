import { EmailShell, H1, P, PrimaryButton, Callout, Signoff } from "./_layout";

interface Props {
  listingName: string;
  listingSlug: string;
  category: string;
  pricing: string;
  publisherName: string;
  publisherEmail: string;
  unsubscribeUrl: string;
}

export function MarketplaceNewSubmissionEmail(props: Props) {
  const { listingName, listingSlug, category, pricing, publisherName, publisherEmail, unsubscribeUrl } = props;
  const reviewUrl = "https://terminalsync.ai/es/admin/marketplace";
  return (
    <EmailShell
      preheader={`${publisherName} sometió "${listingName}" — review pendiente.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <H1>Nueva submission al marketplace</H1>
      <P>Tenés un listing pendiente de review:</P>
      <Callout variant="warn">
        <strong>{listingName}</strong>
        <br />
        {category} · {pricing} · slug: <code>{listingSlug}</code>
        <br />
        Publisher: {publisherName} ({publisherEmail})
      </Callout>
      <P>SLA público: 48h. Aprobá solo lo que probaste localmente.</P>
      <PrimaryButton href={reviewUrl}>Abrir review queue</PrimaryButton>
      <Signoff />
    </EmailShell>
  );
}
