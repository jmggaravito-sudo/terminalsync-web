import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { AdminNav } from "./AdminNav";

/**
 * Shared shell for every /[lang]/admin page. Adds one consistent top nav so
 * the admin sections (metrics, trends, discovery, marketplace, comp,
 * mercadopago, ops) stop being disconnected islands. Each page keeps its own
 * <main>; this only prepends the nav. Auth stays where it already lives — the
 * middleware gates /admin (signed-in), and each /api/admin route enforces the
 * ADMIN_EMAILS allowlist.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AdminNav lang={lang} />
      {children}
    </div>
  );
}
