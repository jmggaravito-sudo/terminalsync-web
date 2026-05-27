import { GoogleDrivePickerShell, metadata } from "../../picker/page";

export { metadata };

export default async function LocalizedGoogleDrivePickerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <GoogleDrivePickerShell lang={lang === "es" ? "es" : "en"} />;
}
