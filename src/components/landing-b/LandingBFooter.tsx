import Link from "next/link";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";

export function LandingBFooter({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const year = new Date().getFullYear();
  const linkClass =
    "text-[12px] text-[#666d78] transition-colors hover:text-[#6a48e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6a48e8]";

  return (
    <footer className="border-t border-[#e2e4e9] bg-white/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <span className="shrink-0 text-[12px] font-medium text-[#777d87]">© {year} TS</span>
        <nav
          aria-label={isEs ? "Enlaces del sitio y legales" : "Site and legal links"}
          className="flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          <Link className={linkClass} href={`/${lang}/legal/privacy`}>
            {isEs ? "Privacidad" : "Privacy"}
          </Link>
          <Link className={linkClass} href={`/${lang}/legal/terms`}>
            {isEs ? "Términos" : "Terms"}
          </Link>
          <Link className={linkClass} href={`/${lang}/legal/cookies`}>
            {isEs ? "Cookies" : "Cookies"}
          </Link>
          <CookieSettingsLink
            label={isEs ? "Configurar cookies" : "Cookie settings"}
            className={linkClass}
          />
          <Link className={linkClass} href={`/${lang}/casos-de-uso`}>
            {isEs ? "Casos de uso" : "Use cases"}
          </Link>
          <Link className={linkClass} href={`/${lang}/connectors`}>
            {isEs ? "Integraciones" : "Integrations"}
          </Link>
          <a className={linkClass} href="mailto:hola@terminalsync.ai">
            {isEs ? "Contacto" : "Contact"}
          </a>
        </nav>
      </div>
    </footer>
  );
}
